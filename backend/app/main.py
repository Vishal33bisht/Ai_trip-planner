from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import itineraries as itineraries_router
from .routers import users as users_router
from app.routers import cities


# create tables (simple approach; for production use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TripCraft AI Backend")

# adjust this origin to your Vite dev URL
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(itineraries_router.router)

app.include_router(users_router.router)

app.include_router(cities.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
