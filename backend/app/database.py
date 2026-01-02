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
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String, unique=True, index=True, nullable=False)  # ClearDarkSky key e.g. "CtsldBH"
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    country = Column(String, nullable=False)  # "Bahamas", "Canada", "USA", etc.
    region = Column(String, nullable=True)  # State/province/island
    category = Column(String, nullable=True)  # "observatory", "dark-sky", "state-park", etc.
    description = Column(Text, nullable=True)
    timezone = Column(String, default="America/New_York")
    elevation = Column(Float, nullable=True)  # meters
    is_active = Column(Integer, default=1)  # SQLite doesn't have boolean
    created_at = Column(DateTime, default=datetime.utcnow)
    metadata_json = Column(Text, nullable=True)  # For additional info


class ForecastCacheDB(Base):
    """Cached forecast data"""
    __tablename__ = "forecast_cache"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    location_key = Column(String, index=True, nullable=False)
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