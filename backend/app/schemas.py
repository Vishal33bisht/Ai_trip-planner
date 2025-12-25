from typing import List, Optional
from pydantic import BaseModel, EmailStr

# ---------- City ----------
class CityBase(BaseModel):
    name: str
    country: Optional[str] = None

class CityResponse(CityBase):
    id: int
    class Config:
        from_attributes = True 

class CityCreate(CityBase):
    pass

class CityOut(CityBase):
    id: int
    class Config:
        from_attributes = True

# ---------- Itinerary Day ----------
class ItineraryDayBase(BaseModel):
    day_number: int
    morning: Optional[str] = None
    afternoon: Optional[str] = None
    evening: Optional[str] = None

class ItineraryDayCreate(ItineraryDayBase):
    pass

class ItineraryDayOut(ItineraryDayBase):
    id: int
    class Config:
        from_attributes = True

# ---------- User ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# ---------- Itinerary Request (Matches Frontend Form) ----------
class ItineraryRequest(BaseModel):
    city: str  # Frontend sends name, not ID
    days: int
    budget: int
    travelStyle: str
    accommodation: str
    pace: str
    transportMode: str
    interests: List[str]

class ItineraryOut(BaseModel):
    id: int
    city: str
    days: int
    budget: int
    plan: List[ItineraryDayOut] = []

    class Config:
        from_attributes = True