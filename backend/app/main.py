from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .database import Base, engine
from .routers import itineraries as itineraries_router
from .routers import users as users_router
from app.routers import cities
from .routers import nearby

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TripCraft AI Backend")

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ai-trip-planner-seven-inky.vercel.app",
]

origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", ",".join(default_origins)).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(itineraries_router.router)

app.include_router(users_router.router)

app.include_router(cities.router)

app.include_router(nearby.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
