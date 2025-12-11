from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud, models

router = APIRouter(prefix="/api", tags=["itineraries"])


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
@router.post("/itineraries", response_model=schemas.ItineraryOut, status_code=status.HTTP_201_CREATED)
def create_itinerary(itinerary_in: schemas.ItineraryCreate, db: Session = Depends(get_db)):
    city = crud.get_city(db, itinerary_in.city_id)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")

    itinerary = crud.create_itinerary(db, itinerary_in)
    return itinerary


@router.get("/itineraries/{itinerary_id}", response_model=schemas.ItineraryOut)
def get_itinerary(itinerary_id: int, db: Session = Depends(get_db)):
    itinerary = crud.get_itinerary(db, itinerary_id)
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    return itinerary


@router.get("/itineraries", response_model=List[schemas.ItineraryOut])
def list_itineraries(
    traveler_email: Optional[str] = None,
    db: Session = Depends(get_db),
):
    return crud.list_itineraries(db, traveler_email=traveler_email)
