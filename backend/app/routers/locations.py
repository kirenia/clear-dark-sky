"""
Locations API Router
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json
import re

from ..database import get_db, LocationDB
from ..models import Location, LocationCreate

router = APIRouter()


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text


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


@router.get("/", response_model=List[Location])
async def list_locations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all locations"""
    locations = db.query(LocationDB).offset(skip).limit(limit).all()
    return [db_to_location(loc) for loc in locations]


@router.get("/{location_id}", response_model=Location)
async def get_location(
    location_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific location"""
    location = db.query(LocationDB).filter(LocationDB.id == location_id).first()
    
    if not location:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found")
    
    return db_to_location(location)


@router.post("/", response_model=Location)
async def create_location(
    location: LocationCreate,
    db: Session = Depends(get_db)
):
    """Create a new location"""
    # Generate slug if not provided
    slug = location.slug or slugify(location.name)
    
    # Check if slug exists
    existing = db.query(LocationDB).filter(LocationDB.id == slug).first()
    if existing:
        raise HTTPException(
            status_code=400, 
            detail=f"Location with ID '{slug}' already exists"
        )
    
    # Create new location
    db_location = LocationDB(
        id=slug,
        name=location.name,
        latitude=location.latitude,
        longitude=location.longitude,
        elevation=location.elevation,
        timezone_offset=location.timezone_offset,
        created_at=datetime.utcnow()
    )
    
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    
    return db_to_location(db_location)


@router.delete("/{location_id}")
async def delete_location(
    location_id: str,
    db: Session = Depends(get_db)
):
    """Delete a location"""
    location = db.query(LocationDB).filter(LocationDB.id == location_id).first()
    
    if not location:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found")
    
    db.delete(location)
    db.commit()
    
    return {"message": f"Location '{location_id}' deleted"}


@router.get("/search/nearby")
async def search_nearby(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(50, ge=1, le=500),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Find locations near a point
    
    Uses simple Euclidean distance (good enough for nearby searches)
    """
    import math
    
    # Get all locations (could be optimized with spatial indexing)
    all_locations = db.query(LocationDB).all()
    
    # Calculate distances
    results = []
    for loc in all_locations:
        # Approximate distance in km
        lat_diff = (loc.latitude - lat) * 111  # ~111 km per degree
        lon_diff = (loc.longitude - lon) * 111 * math.cos(math.radians(lat))
        distance = math.sqrt(lat_diff**2 + lon_diff**2)
        
        if distance <= radius_km:
            results.append({
                "location": db_to_location(loc),
                "distance_km": round(distance, 1)
            })
    
    # Sort by distance
    results.sort(key=lambda x: x["distance_km"])
    
    return results[:limit]
