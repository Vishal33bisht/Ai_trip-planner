from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from ..database import get_db
from ..auth import get_current_user
from .. import models
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


# ✅ NEARBY RECOMMENDATIONS ENDPOINT
@router.post("/nearby-recommendations", response_model=NearbyResponse)
async def get_nearby_recommendations(
    request: NearbyRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Generate nearby recommendations based on user's current location
    """
    
    # Budget ranges
    budget_ranges = {
        "budget": "₹500-₹2000 per person/meal",
        "mid-range": "₹2000-₹5000 per person/meal",
        "luxury": "₹5000+ per person/meal"
    }
    
    budget_desc = budget_ranges.get(request.budget, budget_ranges["mid-range"])
    
    # Build preferences string
    prefs_str = ", ".join(request.preferences)
    
    # ✅ CALL GEMINI AI
    prompt = f"""
You are a local travel expert for {request.city}, India. A traveler is currently at coordinates ({request.latitude}, {request.longitude}) and needs recommendations.

TRAVELER PREFERENCES:
- Budget: {budget_desc}
- Looking for: {prefs_str}
- Search radius: {request.radius} km

TASK:
Generate a JSON response with nearby recommendations. Include REAL places in {request.city} that match the budget and preferences.

IMPORTANT:
1. Suggest 6-8 places total across all categories
2. Include realistic distances (0.5 - {request.radius} km)
3. Use actual restaurant/hotel/attraction names in {request.city}
4. Include price ranges that match the budget
5. Add a short mini-itinerary suggestion at the end

OUTPUT FORMAT (VALID JSON ONLY):
{{
  "places": [
    {{
      "name": "Place Name",
      "type": "restaurant/hotel/attraction/shopping/cafe",
      "category": "Brief category like 'North Indian Restaurant'",
      "description": "2-3 sentence description",
      "price_range": "₹X - ₹Y",
      "distance": 1.2,
      "rating": "4.5/5",
      "address": "Full address",
      "latitude": {request.latitude + 0.01},
      "longitude": {request.longitude + 0.01}
    }}
  ],
  "itinerary": "Suggested 4-5 hour mini itinerary based on the recommended places"
}}
"""
    try:
        if not gemini_client:
            raise HTTPException(status_code=500, detail="AI service not configured")
        
        # Try available models
        models_to_try = [
            'gemini-2.0-flash-exp',
            'gemini-2.0-flash-lite',
            'gemini-flash-lite-latest'
        ]
        
        response_data = None
        
        for model_name in models_to_try:
            try:
                response = gemini_client.models.generate_content(
                    model=model_name,
                    contents=prompt
                )
                
                clean_text = response.text.strip()
                
                # Remove markdown formatting - FIXED
                if "```json" in clean_text:
                    clean_text = clean_text.split("```json")[1].split("```")[0]
                elif "```" in clean_text:
                    clean_text = clean_text.split("```")[1].split("```")[0]
                
                import json
                response_data = json.loads(clean_text.strip())
                
                if "places" in response_data and "itinerary" in response_data:
                    break
                    
            except Exception as e:
                print(f"Model {model_name} failed: {str(e)}")
                continue
        
        if not response_data:
            raise HTTPException(status_code=500, detail="Failed to generate recommendations")
        
        return response_data
        
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))