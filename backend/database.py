from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from models.base import Base

# Fallback to sqlite if postgres is not available (due to Docker missing)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./crm_loteamento.db")

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

