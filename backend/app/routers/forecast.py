"""
Forecast API Router
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
import pytz

from ..database import get_db, LocationDB
from ..models import LocationSummary, ForecastResponse
from ..services.forecast_builder import forecast_builder

router = APIRouter()


def get_timezone_offset(tz_name: str) -> int:
    """Get timezone offset in hours from UTC"""
    try:
        tz = pytz.timezone(tz_name)
        now = datetime.now(tz)
        offset = now.utcoffset()
        if offset:
            return int(offset.total_seconds() / 3600)
    except:
        pass
    return -5  # Default to EST


def db_to_summary(db_loc: LocationDB) -> LocationSummary:
    """Convert database model to summary"""
    return LocationSummary(
        key=db_loc.key,
        name=db_loc.name,
        country=db_loc.country,
        region=db_loc.region,
        category=db_loc.category,
        latitude=db_loc.latitude,
        longitude=db_loc.longitude
    )


class ForecastLocation:
    """Adapter for forecast builder"""
    def __init__(self, db_loc: LocationDB):
        self.id = db_loc.key
        self.name = db_loc.name
        self.latitude = db_loc.latitude
        self.longitude = db_loc.longitude
        self.elevation = db_loc.elevation
        self.tz_offset = get_timezone_offset(db_loc.timezone)
        self.created_at = db_loc.created_at


@router.get("/{key}", response_model=ForecastResponse)
async def get_forecast(
    key: str,
    db: Session = Depends(get_db)
):
    """
    Get forecast for a specific location by key
    
    Returns complete forecast data including:
    - Cloud cover
    - Transparency
    - Seeing
    - Darkness/moon phases
    - Wind, humidity, temperature
    """
    db_location = db.query(LocationDB).filter(
        LocationDB.key == key,
        LocationDB.is_active == 1
    ).first()
    
    if not db_location:
        raise HTTPException(status_code=404, detail=f"Location '{key}' not found")
    
    # Create adapter for forecast builder
    location = ForecastLocation(db_location)
    
    # Build forecast
    forecast = await forecast_builder.build_forecast(location)
    
    # Update location in response to use summary format
    forecast.location = db_to_summary(db_location)
    
    return forecast


@router.get("/coords/")
async def get_forecast_by_coords(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    name: Optional[str] = Query(None, description="Location name"),
    tz: str = Query("America/New_York", description="Timezone")
):
    """
    Get forecast for arbitrary coordinates
    
    Use this for locations not in the database.
    """
    class TempLocation:
        def __init__(self):
            self.id = f"custom-{lat:.4f}-{lon:.4f}"
            self.name = name or f"Custom Location ({lat:.2f}, {lon:.2f})"
            self.latitude = lat
            self.longitude = lon
            self.elevation = None
            self.tz_offset = get_timezone_offset(tz)
            self.created_at = datetime.utcnow()
    
    location = TempLocation()
    forecast = await forecast_builder.build_forecast(location)
    
    # Create summary
    forecast.location = LocationSummary(
        key=location.id,
        name=location.name,
        country="Custom",
        region=None,
        category=None,
        latitude=lat,
        longitude=lon
    )
    
    return forecast
