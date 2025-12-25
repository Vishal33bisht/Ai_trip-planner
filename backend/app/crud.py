from typing import List, Optional
from sqlalchemy.orm import Session
from .auth import hash_password, verify_password, create_access_token
from .models import User
from fastapi import HTTPException

from . import models, schemas


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
    # 1. Find the City ID from the Name
    city = db.query(models.City).filter(models.City.name == itinerary_in.city).first()
    if not city:
        raise HTTPException(status_code=404, detail="City not found in database. Please seed cities first.")

    # 2. Create the Itinerary Record
    # We map Frontend "camelCase" -> Backend "snake_case"
    db_itinerary = models.Itinerary(
        user_id=user_id,
        city=city.name, # Storing name for easier display, or use city_id if you prefer relation
        days=itinerary_in.days,
        budget=itinerary_in.budget,
        travel_style=itinerary_in.travelStyle,
        accommodation=itinerary_in.accommodation,
        pace=itinerary_in.pace,
        transport_mode=itinerary_in.transportMode,
        interests=itinerary_in.interests,
        plan=[] # Placeholder for now
    )
    db.add(db_itinerary)
    db.commit()
    db.refresh(db_itinerary)

    # 3. GENERATE DUMMY PLAN (AI integration comes next)
    # We create simple entries so the frontend has something to show immediately
    for day_num in range(1, itinerary_in.days + 1):
        day_plan = models.ItineraryDay(
            itinerary_id=db_itinerary.id,
            day_number=day_num,
            morning=f"Visit {city.name} City Center & Breakfast",
            afternoon=f"Explore museums and {itinerary_in.travelStyle} activities",
            evening=f"Dinner at a local restaurant and {itinerary_in.accommodation} relaxation"
        )
        db.add(day_plan)
    
    db.commit()
    db.refresh(db_itinerary)
    return db_itinerary


def get_itinerary(db: Session, itinerary_id: int) -> Optional[models.Itinerary]:
    return (
        db.query(models.Itinerary)
        .filter(models.Itinerary.id == itinerary_id)
        .first()
    )


def list_itineraries(db: Session, traveler_email: Optional[str] = None) -> List[models.Itinerary]:
    query = db.query(models.Itinerary)
    if traveler_email:
        query = query.filter(models.Itinerary.traveler_email == traveler_email)
    return query.order_by(models.Itinerary.id.desc()).all()


#----------------create user-------------------------

def create_user(db: Session, user: schemas.UserCreate):
    hashed = hash_password(user.password)

    db_user = User(name=user.name, email=user.email, password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


#----------------authentivate-----------------

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password):
        return None
    return user

#===================login_user--------------------

def login_user(db: Session, email: str, password: str):
    user = authenticate_user(db, email, password)
    if not user:
        return None
    
    token = create_access_token({"sub": str(user.id)})
    return token

