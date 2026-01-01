"""
Forecast API Router
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import json

from ..database import get_db, LocationDB
from ..models import Location, ForecastResponse
from ..services.forecast_builder import forecast_builder

router = APIRouter()


def db_to_location(db_loc: LocationDB) -> Location:
    """Convert database model to Pydantic model"""
    return Location(
        id=db_loc.id,
        name=db_loc.name,
        latitude=db_loc.latitude,
        longitude=db_loc.longitude,
        elevation=db_loc.elevation,
        timezone_offset=db_loc.timezone_offset,
        created_at=db_loc.created_at
    )


@router.get("/{location_id}", response_model=ForecastResponse)
async def get_forecast(
    location_id: str,
    db: Session = Depends(get_db)
):
    """
    Get forecast for a specific location
    
    Returns complete forecast data including:
    - CMC cloud cover
    - ECMWF cloud cover (comparison)
    - Transparency
    - Seeing
    - Darkness/moon phases
    - Wind, humidity, temperature
    """
    # Get location from database
    db_location = db.query(LocationDB).filter(LocationDB.id == location_id).first()
    
    if not db_location:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found")
    
    location = db_to_location(db_location)
    
    # Build forecast
    forecast = await forecast_builder.build_forecast(location)
    
    return forecast


@router.get("/coords/", response_model=ForecastResponse)
async def get_forecast_by_coords(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
    name: Optional[str] = Query(None, description="Location name"),
    tz_offset: int = Query(-7, description="Timezone offset from UTC")
):
    """
    Get forecast for arbitrary coordinates
    
    Use this for locations not in the database.
    For better accuracy, add the location to the database.
    """
    from datetime import datetime
    
    # Create temporary location object
    location = Location(
        id=f"custom-{lat:.4f}-{lon:.4f}",
        name=name or f"Custom Location ({lat:.2f}, {lon:.2f})",
        latitude=lat,
        longitude=lon,
        elevation=None,
        timezone_offset=tz_offset,
        created_at=datetime.utcnow()
    )
    
    # Build forecast
    forecast = await forecast_builder.build_forecast(location)
    
    return forecast
