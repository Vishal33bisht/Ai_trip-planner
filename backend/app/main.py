from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import itineraries as itineraries_router
from .routers import users as users_router
from app.routers import cities
from .routers import nearby

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TripCraft AI Backend")

origins =["https://ai-trip-planner-seven-inky.vercel.app"]

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
