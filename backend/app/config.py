"""
Application configuration
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://localhost:5173",
        "https://cds-frontend-production.up.railway.app",
        "https://cleardarksky.app"
        ]
    
    # CMC Data Sources
    CMC_ASTRONOMY_BASE_URL: str = "https://dd.alpha.meteo.gc.ca/model_gem_regional/astronomy/grib2"
    CMC_RDPS_BASE_URL: str = "https://dd.weather.gc.ca/model_gem_regional/10km/grib2"
    
    # Open-Meteo for ECMWF comparison data
    OPEN_METEO_URL: str = "https://api.open-meteo.com/v1/forecast"
    
    # Data storage
    DATA_DIR: str = os.path.join(os.path.dirname(__file__), "..", "data")
    CACHE_DIR: str = os.path.join(os.path.dirname(__file__), "..", "cache")
    
    # Database
    DATABASE_URL: str = "sqlite:///./cleardarksky.db"
    
    # Update intervals (in minutes)
    DATA_UPDATE_INTERVAL: int = 60  # Check for new data every hour
    
    # Default timezone offset for display (can be overridden per location)
    DEFAULT_TZ_OFFSET: int = -7  # Mountain Time
    
    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()

# Ensure directories exist
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.CACHE_DIR, exist_ok=True)
