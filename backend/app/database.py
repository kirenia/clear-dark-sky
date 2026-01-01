"""
Database setup and models
"""

from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json

from .config import settings

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False}  # SQLite specific
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class LocationDB(Base):
    """Location database model"""
    __tablename__ = "locations"
    
    id = Column(String, primary_key=True, index=True)  # slug
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Float, nullable=True)
    timezone_offset = Column(Integer, default=-7)
    created_at = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(Text, nullable=True)  # For additional info


class ForecastCacheDB(Base):
    """Cached forecast data"""
    __tablename__ = "forecast_cache"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    location_id = Column(String, index=True, nullable=False)
    model_run = Column(String, nullable=False)  # e.g., "2024-01-15T12:00:00Z"
    fetched_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    forecast_data = Column(Text, nullable=False)  # JSON blob


class DataUpdateLog(Base):
    """Log of data updates from CMC"""
    __tablename__ = "data_update_log"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String, nullable=False)  # "cmc_astronomy", "cmc_rdps", "ecmwf"
    model_run = Column(String, nullable=False)
    files_downloaded = Column(Integer, default=0)
    status = Column(String, default="pending")
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for getting DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Initialize on import
init_db()


# Seed default locations
def seed_default_locations():
    """Add default locations if they don't exist"""
    db = SessionLocal()
    try:
        # Check if Idaho Falls exists
        existing = db.query(LocationDB).filter(LocationDB.id == "idaho-falls").first()
        if not existing:
            idaho_falls = LocationDB(
                id="idaho-falls",
                name="Idaho Falls",
                latitude=43.4917,
                longitude=-112.0339,
                elevation=1432,  # meters
                timezone_offset=-7,
                metadata_json=json.dumps({
                    "state": "Idaho",
                    "country": "US",
                    "bortle_class": 5
                })
            )
            db.add(idaho_falls)
            db.commit()
            print("Added Idaho Falls as default location")
    finally:
        db.close()


seed_default_locations()
