from typing import List, Optional,Any
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


# ---------- Itinerary Request (Input from Frontend) ----------
class ItineraryRequest(BaseModel):
    city: str
    days: int
    budget: int
    travelStyle: Optional[str] = "mid-range"
    accommodation: Optional[str] = "hotel"
    pace: Optional[str] = "moderate"
    transportMode: Optional[str] = "public transport"
    interests: Optional[List[str]] = []


# ---------- Itinerary Response (Full details) ----------
class ItineraryOut(BaseModel):
    id: int
    city: str
    days: int
    budget: int
    travel_style: Optional[str] = None
    accommodation: Optional[str] = None
    pace: Optional[str] = None
    transport_mode: Optional[str] = None
    interests: Optional[List[str]] = []
    plan: Optional[Any] = None          # Raw AI JSON
    day_plans: List[ItineraryDayOut] = []  # Structured days from relationship
    
    class Config:
        from_attributes = True


# ---------- Itinerary List (For listing - lighter response) ----------
class ItineraryListOut(BaseModel):
    id: int
    city: str
    days: int
    budget: int
    travel_style: Optional[str] = None
    accommodation: Optional[str] = None
    
    class Config:
        from_attributes = True