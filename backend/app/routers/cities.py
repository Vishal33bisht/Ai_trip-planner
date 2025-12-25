from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import CityResponse
from app import crud

router = APIRouter(prefix="/api/cities", tags=["Cities"])

@router.get("/", response_model=list[CityResponse])
def fetch_cities(db: Session = Depends(get_db)):
    return crud.get_cities(db)
