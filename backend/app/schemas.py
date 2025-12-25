from typing import List, Optional
from pydantic import BaseModel
from pydantic import EmailStr


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


# ---------- Itinerary ----------
class ItineraryBase(BaseModel):
    traveler_name: str
    traveler_email: Optional[str] = None
    city_id: int
    days: int
    budget: Optional[float] = None
    notes: Optional[str] = None


class ItineraryCreate(ItineraryBase):
    # client can optionally send custom day plans;
    # if omitted, backend will auto-generate simple ones
    day_plans: Optional[List[ItineraryDayCreate]] = None


class ItineraryOut(ItineraryBase):
    id: int
    city: CityOut
    day_plans: List[ItineraryDayOut] = []

    class Config:
        from_attributes = True

#-----------User------------------

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


from pydantic import BaseModel
from typing import List


class ItineraryDay(BaseModel):
    day: int
    title: str
    activities: List[str]
    approx_cost: int


class ItineraryCreate(BaseModel):
    city: str
    days: int
    budget: int
    travelStyle: str
    accommodation: str
    pace: str
    transportMode: str
    interests: List[str]


class ItineraryResponse(BaseModel):
    city: str
    days: int
    budget: int
    daily_budget: int
    plan: List[ItineraryDay]


