from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud, models
from ..auth import get_current_user

router = APIRouter(prefix="/api/itineraries", tags=["Itineraries"])


# -------- Cities --------
@router.get("/cities", response_model=List[schemas.CityOut])
def get_cities(db: Session = Depends(get_db)):
    cities = crud.get_cities(db)
    return cities


@router.post("/cities", response_model=schemas.CityOut, status_code=status.HTTP_201_CREATED)
def create_city(city: schemas.CityCreate, db: Session = Depends(get_db)):
    existing = crud.get_city_by_name(db, city.name)
    if existing:
        raise HTTPException(status_code=400, detail="City already exists")
    return crud.create_city(db, city)


# -------- Itineraries --------

@router.post("/", response_model=schemas.ItineraryOut)
def create_itinerary(
    itinerary_in: schemas.ItineraryRequest, 
    db: Session = Depends(get_db),
    # For now, we'll use a hardcoded user_id if you haven't built the 'get_current_user' dependency yet.
    # If you have JWT auth ready, replace 1 with the actual user ID.
    user_id: int = 1 
):
    return crud.create_itinerary(db, itinerary_in, user_id)
