from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy import JSON



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    password = Column(String, nullable=False)

    itineraries = relationship("Itinerary", back_populates="user", cascade="all, delete-orphan")


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    country = Column(String, nullable=True)



class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    city = Column(String, nullable=False)
    days = Column(Integer, nullable=False)
    budget = Column(Integer, nullable=False)

    travel_style = Column(String, nullable=True)
    accommodation = Column(String, nullable=True)
    pace = Column(String, nullable=True)
    transport_mode = Column(String, nullable=True)
    interests = Column(JSON, nullable=True)

    plan = Column(JSON, nullable=False)

    user = relationship("User", back_populates="itineraries", lazy="joined")
    
    day_plans = relationship("ItineraryDay", back_populates="itinerary", cascade="all, delete-orphan")

class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("itineraries.id"))
    
    day_number = Column(Integer)
    morning = Column(String)
    afternoon = Column(String)
    evening = Column(String)
    
    itinerary = relationship("Itinerary", back_populates="day_plans")

