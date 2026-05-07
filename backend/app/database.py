import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine_options = {
    "echo": False,
    "pool_pre_ping": True,
    "pool_recycle": 300,
}

database_url = make_url(DATABASE_URL)
if database_url.drivername.startswith("postgresql"):
    host = database_url.host or ""
    is_remote_postgres = host not in {"localhost", "127.0.0.1", ""}
    has_sslmode = "sslmode" in database_url.query

    if is_remote_postgres and not has_sslmode:
        engine_options["connect_args"] = {"sslmode": "require"}

engine = create_engine(DATABASE_URL, **engine_options)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
