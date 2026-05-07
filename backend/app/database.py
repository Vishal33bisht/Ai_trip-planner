import os
import time
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.exc import OperationalError
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

    if is_remote_postgres:
        connect_args = {
            "connect_timeout": 10,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5,
        }

        if "sslmode" not in database_url.query:
            connect_args["sslmode"] = "require"

        engine_options["connect_args"] = connect_args

engine = create_engine(DATABASE_URL, **engine_options)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db(retries=5, delay=3):
    for attempt in range(1, retries + 1):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError:
            engine.dispose()
            if attempt == retries:
                raise
            time.sleep(delay)


# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
