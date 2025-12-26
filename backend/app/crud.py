from typing import List, Optional
from sqlalchemy.orm import Session
from .auth import hash_password, verify_password, create_access_token
from .models import User
from fastapi import HTTPException
import os
import json
from . import models, schemas

# NEW: Import google.genai
from google import genai

# Configure client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = None

if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)


# -------- City --------
def get_cities(db: Session) -> List[models.City]:
    return db.query(models.City).order_by(models.City.name).all()


def get_city(db: Session, city_id: int) -> Optional[models.City]:
    return db.query(models.City).filter(models.City.id == city_id).first()


def get_city_by_name(db: Session, name: str) -> Optional[models.City]:
    return db.query(models.City).filter(models.City.name == name).first()


def create_city(db: Session, city: schemas.CityCreate) -> models.City:
    db_city = models.City(name=city.name, country=city.country)
    db.add(db_city)
    db.commit()
    db.refresh(db_city)
    return db_city


# -------- Itinerary --------
def create_itinerary(db: Session, itinerary_in: schemas.ItineraryRequest, user_id: int):
    """Create a budget-aware itinerary using Gemini AI"""
    
    # 1. Find City
    city = db.query(models.City).filter(models.City.name == itinerary_in.city).first()
    if not city:
        raise HTTPException(
            status_code=404, 
            detail=f"City '{itinerary_in.city}' not found."
        )

    # 2. Calculate Budget
    total_budget = itinerary_in.budget
    days = itinerary_in.days
    daily_budget = total_budget // days if days > 0 else total_budget
    
    budget_multipliers = {
        "budget": {"accommodation": 0.25, "food": 0.30, "activities": 0.30, "transport": 0.15},
        "mid-range": {"accommodation": 0.35, "food": 0.25, "activities": 0.25, "transport": 0.15},
        "luxury": {"accommodation": 0.45, "food": 0.25, "activities": 0.20, "transport": 0.10},
    }
    
    style = (itinerary_in.travelStyle or "mid-range").lower()
    allocation = budget_multipliers.get(style, budget_multipliers["mid-range"])
    
    daily_food = int(daily_budget * allocation["food"])
    daily_activities = int(daily_budget * allocation["activities"])
    daily_transport = int(daily_budget * allocation["transport"])

    interests_str = ", ".join(itinerary_in.interests) if itinerary_in.interests else "general sightseeing"

    # 3. Try Gemini AI
    ai_data = None
    
    if gemini_client:
        ai_data = call_gemini_ai(
            city_name=city.name,
            days=days,
            total_budget=total_budget,
            daily_budget=daily_budget,
            daily_food=daily_food,
            daily_activities=daily_activities,
            daily_transport=daily_transport,
            travel_style=itinerary_in.travelStyle or "mid-range",
            interests_str=interests_str,
            transport_mode=itinerary_in.transportMode or "public transport"
        )

    # 4. Use fallback if AI failed
    if not ai_data:
        print("⚠️ Using enhanced fallback")
        ai_data = get_city_specific_fallback(
            city_name=city.name,
            days=days,
            daily_budget=daily_budget,
            daily_food=daily_food,
            daily_activities=daily_activities,
            daily_transport=daily_transport,
            interests=itinerary_in.interests or ["sightseeing"],
            transport_mode=itinerary_in.transportMode or "Metro"
        )

    # 5. Save to Database
    db_itinerary = models.Itinerary(
        user_id=user_id,
        city=city.name,
        days=days,
        budget=total_budget,
        travel_style=itinerary_in.travelStyle,
        accommodation=itinerary_in.accommodation,
        pace=itinerary_in.pace,
        transport_mode=itinerary_in.transportMode,
        interests=itinerary_in.interests or [],
        plan=ai_data
    )
    db.add(db_itinerary)
    db.commit()
    db.refresh(db_itinerary)

    # 6. Save Days
    for day in ai_data:
        db.add(models.ItineraryDay(
            itinerary_id=db_itinerary.id,
            day_number=day.get('day', 1),
            morning=day.get('morning', ''),
            afternoon=day.get('afternoon', ''),
            evening=day.get('evening', '')
        ))
    
    db.commit()
    db.refresh(db_itinerary)
    return db_itinerary


def call_gemini_ai(
    city_name: str,
    days: int,
    total_budget: int,
    daily_budget: int,
    daily_food: int,
    daily_activities: int,
    daily_transport: int,
    travel_style: str,
    interests_str: str,
    transport_mode: str
) -> Optional[list]:
    """Call Gemini AI using available models"""
    
    if not gemini_client:
        print("❌ Gemini client not initialized")
        return None
    
    # UPDATED: Use models that are actually available
    models_to_try = [
        'gemini-2.5-flash',           # Newest
        'gemini-2.0-flash-lite',      # Lighter quota
        'gemini-2.5-flash-lite',      # Even lighter
        'gemini-flash-lite-latest',   # Fallback
        'gemini-2.0-flash',           # Try last (quota issues)
    ]
    
    prompt = f"""
You are an expert travel planner for India. Create a {days}-day trip to {city_name}.

BUDGET (STRICTLY FOLLOW):
- Total: ₹{total_budget}
- Per Day: ₹{daily_budget}
- Food/day: ₹{daily_food}
- Activities/day: ₹{daily_activities}
- Transport/day: ₹{daily_transport}

PREFERENCES:
- Style: {travel_style}
- Interests: {interests_str}
- Transport: {transport_mode}

RULES:
1. Use REAL places in {city_name} (real restaurants, real monuments)
2. Include ₹ cost for EVERY activity and meal
3. Stay within daily budget of ₹{daily_budget}
4. {"Suggest street food, free attractions, budget stays" if daily_budget < 1000 else "Suggest affordable restaurants, popular spots" if daily_budget < 3000 else "Suggest good restaurants, premium experiences"}

OUTPUT: Return ONLY valid JSON array, no markdown:
[
  {{"day": 1, "morning": "8 AM - Breakfast at [Place] (₹XX) → 10 AM - Visit [Place] (₹XX) | Travel: ₹XX", "afternoon": "1 PM - Lunch at [Place] (₹XX) → 3 PM - [Activity] (₹XX) | Travel: ₹XX", "evening": "7 PM - Dinner at [Place] (₹XX) → [Activity] | Travel: ₹XX"}}
]

Generate exactly {days} days.
"""

    for model_name in models_to_try:
        try:
            print(f"🔄 Trying {model_name}...")
            
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            
            clean_text = response.text.strip()
            
            # Remove markdown
            if "```json" in clean_text:
                clean_text = clean_text.split("```json")[1].split("```")[0]
            elif "```" in clean_text:
                clean_text = clean_text.split("```")[1].split("```")[0]
            
            ai_data = json.loads(clean_text.strip())
            
            if isinstance(ai_data, list) and len(ai_data) > 0:
                print(f"✅ AI generated {len(ai_data)} days using {model_name}")
                return ai_data
                
        except json.JSONDecodeError as e:
            print(f"❌ {model_name} - JSON Error: {e}")
            continue
        except Exception as e:
            error_msg = str(e)
            if "429" in error_msg:
                print(f"⚠️ {model_name} - Quota exhausted, trying next...")
            elif "404" in error_msg:
                print(f"❌ {model_name} - Not found, trying next...")
            else:
                print(f"❌ {model_name} - Error: {error_msg[:60]}")
            continue
    
    print("❌ All Gemini models failed")
    return None


def get_city_specific_fallback(
    city_name: str,
    days: int,
    daily_budget: int,
    daily_food: int,
    daily_activities: int,
    daily_transport: int,
    interests: List[str],
    transport_mode: str
) -> list:
    """Enhanced fallback with real places for major Indian cities"""
    
    city_places = {
        "Delhi": {
            "attractions": [
                ("Red Fort", 50), ("Qutub Minar", 40), ("India Gate", 0),
                ("Humayun's Tomb", 40), ("Lotus Temple", 0), ("Akshardham", 0),
                ("Jama Masjid", 0), ("Chandni Chowk", 0), ("Connaught Place", 0),
                ("National Museum", 20), ("Lodhi Garden", 0), ("Hauz Khas Village", 0)
            ],
            "food_budget": [
                ("Paranthe Wali Gali", 100), ("Street food Chandni Chowk", 80),
                ("Haldiram's", 150), ("Andhra Bhawan Canteen", 100)
            ],
            "food_mid": [
                ("Karim's", 300), ("Moti Mahal", 400), ("Sagar Ratna", 250),
                ("Rajdhani Thali", 350), ("Saravana Bhavan", 200)
            ]
        },
        "Mumbai": {
            "attractions": [
                ("Gateway of India", 0), ("Marine Drive", 0), ("Elephanta Caves", 60),
                ("Siddhivinayak Temple", 0), ("Juhu Beach", 0), ("Haji Ali", 0),
                ("CST Station", 0), ("Colaba Causeway", 0)
            ],
            "food_budget": [
                ("Street food Juhu Beach", 100), ("Cafe Madras", 150),
                ("Ram Ashraya", 120), ("Swati Snacks", 200)
            ],
            "food_mid": [
                ("Bademiya", 300), ("Britannia & Co", 400), ("Leopold Cafe", 350)
            ]
        },
        "Jaipur": {
            "attractions": [
                ("Hawa Mahal", 50), ("Amber Fort", 200), ("City Palace", 150),
                ("Jantar Mantar", 50), ("Nahargarh Fort", 50), ("Jal Mahal", 0)
            ],
            "food_budget": [
                ("LMB", 120), ("Rawat Kachori", 80), ("Street food Johari Bazaar", 100)
            ],
            "food_mid": [
                ("Chokhi Dhani", 600), ("Niros", 400), ("Handi Restaurant", 350)
            ]
        },
        "Bangalore": {
            "attractions": [
                ("Lalbagh Garden", 20), ("Cubbon Park", 0), ("ISKCON Temple", 0),
                ("Bangalore Palace", 250), ("Commercial Street", 0)
            ],
            "food_budget": [
                ("Vidyarthi Bhavan", 100), ("MTR", 150), ("Brahmin's Coffee Bar", 80)
            ],
            "food_mid": [
                ("Nagarjuna", 300), ("Empire Restaurant", 350), ("Truffles", 400)
            ]
        },
        "Goa": {
            "attractions": [
                ("Baga Beach", 0), ("Calangute Beach", 0), ("Aguada Fort", 50),
                ("Basilica of Bom Jesus", 0), ("Anjuna Market", 0)
            ],
            "food_budget": [
                ("Beach shacks", 200), ("Ritz Classic", 180)
            ],
            "food_mid": [
                ("Curlies", 400), ("Britto's", 500)
            ]
        }
    }
    
    city_data = city_places.get(city_name, None)
    fallback = []
    
    for i in range(1, days + 1):
        breakfast_cost = daily_food // 4
        lunch_cost = daily_food // 3
        dinner_cost = daily_food // 2
        per_transport = daily_transport // 3
        
        if city_data:
            attractions = city_data["attractions"]
            foods = city_data["food_budget"] if daily_budget < 1500 else city_data.get("food_mid", city_data["food_budget"])
            
            attr1 = attractions[(i * 2 - 2) % len(attractions)]
            attr2 = attractions[(i * 2 - 1) % len(attractions)]
            food_place = foods[(i - 1) % len(foods)]
            
            fallback.append({
                "day": i,
                "morning": f"8 AM - Breakfast at local cafe (₹{breakfast_cost}) → 10 AM - Visit {attr1[0]} (Entry: ₹{attr1[1]}) | {transport_mode}: ₹{per_transport}",
                "afternoon": f"1 PM - Lunch at {food_place[0]} (₹{min(lunch_cost, food_place[1])}) → 3 PM - Explore {attr2[0]} (₹{attr2[1]}) | {transport_mode}: ₹{per_transport}",
                "evening": f"7 PM - Dinner at local restaurant (₹{dinner_cost}) → Evening walk & shopping | {transport_mode}: ₹{per_transport}"
            })
        else:
            fallback.append({
                "day": i,
                "morning": f"8 AM - Breakfast (₹{breakfast_cost}) → 10 AM - Explore {city_name} attractions (₹{daily_activities//2}) | {transport_mode}: ₹{per_transport}",
                "afternoon": f"1 PM - Lunch at local restaurant (₹{lunch_cost}) → 3 PM - Visit local markets | {transport_mode}: ₹{per_transport}",
                "evening": f"7 PM - Dinner (₹{dinner_cost}) → Evening stroll | {transport_mode}: ₹{per_transport}"
            })
    
    return fallback


def get_itinerary(db: Session, itinerary_id: int) -> Optional[models.Itinerary]:
    return db.query(models.Itinerary).filter(models.Itinerary.id == itinerary_id).first()


def get_user_itineraries(db: Session, user_id: int) -> List[models.Itinerary]:
    return db.query(models.Itinerary).filter(
        models.Itinerary.user_id == user_id
    ).order_by(models.Itinerary.id.desc()).all()


def list_itineraries(db: Session, user_id: Optional[int] = None) -> List[models.Itinerary]:
    query = db.query(models.Itinerary)
    if user_id:
        query = query.filter(models.Itinerary.user_id == user_id)
    return query.order_by(models.Itinerary.id.desc()).all()


def delete_itinerary(db: Session, itinerary_id: int, user_id: int) -> bool:
    itinerary = db.query(models.Itinerary).filter(
        models.Itinerary.id == itinerary_id,
        models.Itinerary.user_id == user_id
    ).first()
    if not itinerary:
        return False
    db.delete(itinerary)
    db.commit()
    return True


# -------- User Functions --------
def create_user(db: Session, user: schemas.UserCreate):
    hashed = hash_password(user.password)
    db_user = User(name=user.name, email=user.email, password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password):
        return None
    return user


def login_user(db: Session, email: str, password: str):
    user = authenticate_user(db, email, password)
    if not user:
        return None
    return create_access_token({"sub": str(user.id)})