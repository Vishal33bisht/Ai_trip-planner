from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import random

from ..database import get_db
from pydantic import BaseModel

# Import Gemini
from google import genai

router = APIRouter(prefix="/api", tags=["Nearby"])

# Configure Gemini client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = None
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)


# ✅ REQUEST SCHEMA
class NearbyRequest(BaseModel):
    city: str
    latitude: float
    longitude: float
    budget: str  # budget, mid-range, luxury
    radius: int  # km
    preferences: List[str]  # restaurants, hotels, attractions, shopping, cafes


# ✅ RESPONSE SCHEMA
class Place(BaseModel):
    name: str
    type: str
    category: str
    description: str
    price_range: str
    distance: float
    rating: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class NearbyResponse(BaseModel):
    places: List[Place]
    itinerary: str


# ✅ FALLBACK DATA FOR MAJOR INDIAN CITIES
CITY_DATA = {
    "delhi": {
        "restaurants": [
            {"name": "Karim's", "category": "Mughlai Restaurant", "desc": "Historic restaurant famous for Mughlai cuisine since 1913", "price": "₹400-₹800", "rating": "4.3/5", "addr": "Gali Kababian, Jama Masjid"},
            {"name": "Paranthe Wali Gali", "category": "Street Food", "desc": "Famous lane known for delicious stuffed paranthas", "price": "₹100-₹300", "rating": "4.5/5", "addr": "Chandni Chowk"},
            {"name": "Indian Accent", "category": "Fine Dining", "desc": "Award-winning contemporary Indian cuisine", "price": "₹3000-₹5000", "rating": "4.8/5", "addr": "The Lodhi Hotel, Lodhi Road"},
            {"name": "Saravana Bhavan", "category": "South Indian", "desc": "Popular chain serving authentic South Indian food", "price": "₹300-₹600", "rating": "4.2/5", "addr": "Multiple locations"},
        ],
        "hotels": [
            {"name": "Hotel Tara Palace", "category": "Budget Hotel", "desc": "Clean and comfortable budget accommodation near Chandni Chowk", "price": "₹800-₹1500", "rating": "4.0/5", "addr": "Chandni Chowk"},
            {"name": "The Claridges", "category": "Luxury Hotel", "desc": "5-star heritage hotel with colonial charm", "price": "₹8000-₹15000", "rating": "4.7/5", "addr": "APJ Abdul Kalam Road"},
            {"name": "Zostel Delhi", "category": "Hostel", "desc": "Popular backpacker hostel with modern amenities", "price": "₹500-₹1000", "rating": "4.3/5", "addr": "Hauz Khas Village"},
        ],
        "attractions": [
            {"name": "Red Fort", "category": "Historical Monument", "desc": "UNESCO World Heritage Site, 17th century Mughal fort", "price": "₹50-₹500", "rating": "4.5/5", "addr": "Netaji Subhash Marg"},
            {"name": "India Gate", "category": "War Memorial", "desc": "Iconic 42m high war memorial, popular picnic spot", "price": "Free", "rating": "4.6/5", "addr": "Rajpath"},
            {"name": "Qutub Minar", "category": "Historical Tower", "desc": "73m tall UNESCO World Heritage minaret", "price": "₹35-₹500", "rating": "4.5/5", "addr": "Mehrauli"},
            {"name": "Lotus Temple", "category": "Architectural Wonder", "desc": "Stunning flower-shaped Baháʼí House of Worship", "price": "Free", "rating": "4.7/5", "addr": "Bahapur"},
        ],
        "shopping": [
            {"name": "Chandni Chowk Market", "category": "Traditional Market", "desc": "Bustling old Delhi market for textiles, jewelry, and street food", "price": "Budget-friendly", "rating": "4.3/5", "addr": "Chandni Chowk"},
            {"name": "Sarojini Nagar Market", "category": "Shopping Market", "desc": "Famous for affordable clothing and accessories", "price": "₹100-₹2000", "rating": "4.2/5", "addr": "Sarojini Nagar"},
            {"name": "Dilli Haat", "category": "Handicraft Market", "desc": "Open-air market showcasing Indian handicrafts and cuisine", "price": "₹30 entry + shopping", "rating": "4.4/5", "addr": "INA, Multiple locations"},
        ],
        "cafes": [
            {"name": "Indian Coffee House", "category": "Classic Café", "desc": "Iconic café with old-world charm and filter coffee", "price": "₹100-₹300", "rating": "4.1/5", "addr": "Connaught Place"},
            {"name": "Café Lota", "category": "Museum Café", "desc": "Contemporary café at National Crafts Museum", "price": "₹300-₹600", "rating": "4.5/5", "addr": "Pragati Maidan"},
            {"name": "Kunzum Travel Café", "category": "Travel Café", "desc": "Unique pay-as-you-wish café for travelers", "price": "Pay what you wish", "rating": "4.6/5", "addr": "Hauz Khas Village"},
        ]
    },
    "mumbai": {
        "restaurants": [
            {"name": "Trishna", "category": "Seafood Restaurant", "desc": "Famous for butter garlic crab and seafood", "price": "₹800-₹1500", "rating": "4.4/5", "addr": "Kala Ghoda, Fort"},
            {"name": "Bademiya", "category": "Street Food", "desc": "Legendary street food stall serving kebabs since 1946", "price": "₹200-₹500", "rating": "4.2/5", "addr": "Colaba"},
            {"name": "Leopold Café", "category": "Cafe & Bar", "desc": "Historic café popular with tourists and locals", "price": "₹400-₹900", "rating": "4.0/5", "addr": "Colaba Causeway"},
        ],
        "hotels": [
            {"name": "Hotel Suba Palace", "category": "Budget Hotel", "desc": "Affordable hotel near Gateway of India", "price": "₹1200-₹2500", "rating": "3.9/5", "addr": "Colaba"},
            {"name": "The Taj Mahal Palace", "category": "Luxury Hotel", "desc": "Iconic 5-star heritage hotel", "price": "₹15000-₹40000", "rating": "4.8/5", "addr": "Apollo Bunder"},
        ],
        "attractions": [
            {"name": "Gateway of India", "category": "Monument", "desc": "Iconic arch monument overlooking Arabian Sea", "price": "Free", "rating": "4.5/5", "addr": "Apollo Bunder"},
            {"name": "Marine Drive", "category": "Promenade", "desc": "Famous 3.6km seafront boulevard", "price": "Free", "rating": "4.6/5", "addr": "Nariman Point to Babulnath"},
            {"name": "Elephanta Caves", "category": "UNESCO Site", "desc": "Ancient rock-cut cave temples on island", "price": "₹40 + ferry ₹200", "rating": "4.3/5", "addr": "Elephanta Island"},
        ],
        "shopping": [
            {"name": "Colaba Causeway", "category": "Street Market", "desc": "Bustling street market for clothes, accessories", "price": "₹100-₹3000", "rating": "4.2/5", "addr": "Colaba"},
            {"name": "Crawford Market", "category": "Traditional Market", "desc": "Historic market for fruits, vegetables, and goods", "price": "Varies", "rating": "4.0/5", "addr": "DN Road, Mumbai CST"},
        ],
        "cafes": [
            {"name": "Café Mondegar", "category": "Retro Café", "desc": "Iconic café with Mario Miranda cartoons", "price": "₹300-₹600", "rating": "4.3/5", "addr": "Colaba"},
            {"name": "Irani Café Kyani & Co", "category": "Irani Café", "desc": "Heritage Irani café serving bun maska and chai", "price": "₹50-₹200", "rating": "4.4/5", "addr": "Dhobi Talao"},
        ]
    },
    # Add more cities as needed
}

# Generic fallback for cities not in database
GENERIC_PLACES = {
    "restaurants": [
        {"name": "Local Restaurant", "category": "Multi-Cuisine", "desc": "Popular local eatery serving delicious meals", "price": "₹300-₹800"},
        {"name": "Street Food Stall", "category": "Street Food", "desc": "Famous street food vendors with local specialties", "price": "₹50-₹200"},
    ],
    "hotels": [
        {"name": "City Hotel", "category": "Budget Hotel", "desc": "Comfortable budget accommodation in city center", "price": "₹800-₹2000"},
        {"name": "Luxury Stay", "category": "Premium Hotel", "desc": "High-end hotel with modern amenities", "price": "₹5000-₹12000"},
    ],
    "attractions": [
        {"name": "City Museum", "category": "Museum", "desc": "Local museum showcasing history and culture", "price": "₹50-₹200"},
        {"name": "City Park", "category": "Park", "desc": "Beautiful green space perfect for relaxation", "price": "Free"},
    ],
    "shopping": [
        {"name": "Local Market", "category": "Shopping Market", "desc": "Bustling market with local goods and souvenirs", "price": "Varies"},
    ],
    "cafes": [
        {"name": "City Café", "category": "Café", "desc": "Cozy café serving coffee and snacks", "price": "₹100-₹400"},
    ]
}


def generate_fallback_recommendations(city: str, latitude: float, longitude: float, 
                                     budget: str, radius: int, preferences: List[str]) -> dict:
    """Generate fallback recommendations when AI is unavailable"""
    
    city_lower = city.lower()
    city_data = CITY_DATA.get(city_lower, None)
    
    places = []
    
    # Budget price ranges
    budget_ranges = {
        "budget": (50, 800),
        "mid-range": (500, 3000),
        "luxury": (2000, 50000)
    }
    min_price, max_price = budget_ranges.get(budget, (500, 3000))
    
    for pref in preferences:
        pref_lower = pref.lower()
        
        # Get places from city data or generic
        source_data = city_data[pref_lower] if city_data and pref_lower in city_data else GENERIC_PLACES.get(pref_lower, [])
        
        for place_data in source_data[:2]:  # Max 2 per category
            # Generate random distance within radius
            distance = round(random.uniform(0.3, min(radius, 5)), 1)
            
            # Calculate approximate coordinates
            lat_offset = random.uniform(-0.02, 0.02)
            lon_offset = random.uniform(-0.02, 0.02)
            
            place = {
                "name": place_data["name"],
                "type": pref_lower,
                "category": place_data["category"],
                "description": place_data["desc"],
                "price_range": place_data["price"],
                "distance": distance,
                "rating": place_data.get("rating", "4.2/5"),
                "address": place_data.get("addr", f"{city}"),
                "latitude": latitude + lat_offset,
                "longitude": longitude + lon_offset
            }
            places.append(place)
    
    # Generate itinerary
    itinerary = f"""Here's a suggested itinerary for exploring {city}:

Morning (9 AM - 12 PM): Start your day by visiting nearby {preferences[0] if preferences else 'attractions'}. Explore the local culture and take photos.

Afternoon (12 PM - 3 PM): Have lunch at a recommended restaurant. Try local specialties and enjoy the ambiance.

Evening (3 PM - 6 PM): Continue exploring other nearby places based on your interests. Visit markets or cafes for a relaxing break.

Night (6 PM onwards): End your day with dinner at a highly-rated restaurant. Enjoy the local nightlife if interested.

Total estimated budget for the day: ₹{min_price * 3}-₹{max_price * 2}"""
    
    return {
        "places": places,
        "itinerary": itinerary
    }


# ✅ NEARBY RECOMMENDATIONS ENDPOINT
@router.post("/nearby-recommendations", response_model=NearbyResponse)
async def get_nearby_recommendations(
    request: NearbyRequest,
    db: Session = Depends(get_db)
):
    """
    Generate nearby recommendations based on user's current location.
    PUBLIC ENDPOINT - No authentication required.
    """
    
    print(f"✅ Received request for {request.city} at ({request.latitude}, {request.longitude})")
    print(f"   Budget: {request.budget}, Radius: {request.radius}km")
    print(f"   Preferences: {request.preferences}")
    
    # ✅ TRY GEMINI AI FIRST (if available and quota not exhausted)
    if gemini_client:
        try:
            budget_ranges = {
                "budget": "₹500-₹2000 per person/meal",
                "mid-range": "₹2000-₹5000 per person/meal",
                "luxury": "₹5000+ per person/meal"
            }
            
            budget_desc = budget_ranges.get(request.budget, budget_ranges["mid-range"])
            prefs_str = ", ".join(request.preferences)
            
            prompt = f"""Generate JSON with nearby places in {request.city}, India.
Budget: {budget_desc}, Preferences: {prefs_str}, Radius: {request.radius}km

Format:
{{"places":[{{"name":"Place","type":"restaurant","category":"Type","description":"Desc","price_range":"₹X-Y","distance":1.2,"rating":"4.5/5","address":"Addr","latitude":{request.latitude},"longitude":{request.longitude}}}],"itinerary":"Suggested itinerary"}}"""

            # Try models with correct names
            models_to_try = ['gemini-2.0-flash-lite', 'gemini-1.5-flash-latest']
            
            for model_name in models_to_try:
                try:
                    print(f"🔄 Trying AI model: {model_name}")
                    response = gemini_client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                    
                    clean_text = response.text.strip()
                    if "```json" in clean_text:
                        clean_text = clean_text.split("```json").split("```")[0]
                    elif "```" in clean_text:
                        clean_text = clean_text.split("``````")[0]
                    
                    import json
                    response_data = json.loads(clean_text.strip())
                    
                    if "places" in response_data and "itinerary" in response_data:
                        print(f"✅ AI Success! Generated {len(response_data['places'])} places")
                        return response_data
                        
                except Exception as e:
                    print(f"❌ Model {model_name} failed: {str(e)[:100]}")
                    continue
                    
        except Exception as e:
            print(f"⚠️ AI failed, using fallback: {str(e)[:100]}")
    
    # ✅ USE FALLBACK DATA
    print(f"📋 Using fallback recommendations for {request.city}")
    response_data = generate_fallback_recommendations(
        request.city,
        request.latitude,
        request.longitude,
        request.budget,
        request.radius,
        request.preferences
    )
    
    print(f"✅ Fallback generated {len(response_data['places'])} places")
    return response_data
