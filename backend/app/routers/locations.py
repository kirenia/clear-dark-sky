"""
Locations API Router
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import math

from ..database import get_db, LocationDB
from ..models import Location, LocationCreate, LocationSummary

router = APIRouter()


def db_to_location(db_loc: LocationDB) -> Location:
    """Convert database model to Pydantic model"""
    return Location(
        id=db_loc.id,
        key=db_loc.key,
        name=db_loc.name,
        latitude=db_loc.latitude,
        longitude=db_loc.longitude,
        country=db_loc.country,
        region=db_loc.region,
        category=db_loc.category,
        description=db_loc.description,
        timezone=db_loc.timezone,
        elevation=db_loc.elevation,
        is_active=bool(db_loc.is_active),
        created_at=db_loc.created_at
    )


def db_to_summary(db_loc: LocationDB) -> LocationSummary:
    """Convert database model to lightweight summary"""
    return LocationSummary(
        key=db_loc.key,
        name=db_loc.name,
        country=db_loc.country,
        region=db_loc.region,
        category=db_loc.category,
        latitude=db_loc.latitude,
        longitude=db_loc.longitude
    )


@router.get("/", response_model=List[LocationSummary])
async def list_locations(
    country: Optional[str] = None,
    region: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all locations with optional filters"""
    query = db.query(LocationDB).filter(LocationDB.is_active == 1)
    
    if country:
        query = query.filter(LocationDB.country == country)
    if region:
        query = query.filter(LocationDB.region == region)
    if category:
        query = query.filter(LocationDB.category == category)
    
    locations = query.offset(skip).limit(limit).all()
    return [db_to_summary(loc) for loc in locations]


@router.get("/countries")
async def list_countries(db: Session = Depends(get_db)):
    """List all countries with location counts"""
    results = db.query(
        LocationDB.country,
    ).filter(LocationDB.is_active == 1).group_by(LocationDB.country).all()
    
    countries = []
    for (country,) in results:
        count = db.query(LocationDB).filter(
            LocationDB.country == country,
            LocationDB.is_active == 1
        ).count()
        countries.append({"country": country, "count": count})
    
    return sorted(countries, key=lambda x: x["country"])


@router.get("/regions/{country}")
async def list_regions(country: str, db: Session = Depends(get_db)):
    """List regions for a country"""
    results = db.query(LocationDB.region).filter(
        LocationDB.country == country,
        LocationDB.is_active == 1,
        LocationDB.region.isnot(None)
    ).distinct().all()
    
    regions = []
    for (region,) in results:
        count = db.query(LocationDB).filter(
            LocationDB.country == country,
            LocationDB.region == region,
            LocationDB.is_active == 1
        ).count()
        regions.append({"region": region, "count": count})
    
    return sorted(regions, key=lambda x: x["region"])


@router.get("/categories")
async def list_categories(db: Session = Depends(get_db)):
    """List all categories with counts"""
    results = db.query(LocationDB.category).filter(
        LocationDB.is_active == 1,
        LocationDB.category.isnot(None)
    ).distinct().all()
    
    categories = []
    for (category,) in results:
        count = db.query(LocationDB).filter(
            LocationDB.category == category,
            LocationDB.is_active == 1
        ).count()
        categories.append({"category": category, "count": count})
    
    return sorted(categories, key=lambda x: x["category"])


@router.get("/search")
async def search_locations(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search locations by name"""
    locations = db.query(LocationDB).filter(
        LocationDB.is_active == 1,
        LocationDB.name.ilike(f"%{q}%")
    ).limit(limit).all()
    
    return [db_to_summary(loc) for loc in locations]


@router.get("/nearby")
async def search_nearby(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(50, ge=1, le=500),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Find locations near a point"""
    all_locations = db.query(LocationDB).filter(LocationDB.is_active == 1).all()
    
    results = []
    for loc in all_locations:
        lat_diff = (loc.latitude - lat) * 111
        lon_diff = (loc.longitude - lon) * 111 * math.cos(math.radians(lat))
        distance = math.sqrt(lat_diff**2 + lon_diff**2)
        
        if distance <= radius_km:
            results.append({
                "location": db_to_summary(loc),
                "distance_km": round(distance, 1)
            })
    
    results.sort(key=lambda x: x["distance_km"])
    return results[:limit]


@router.get("/{key}", response_model=Location)
async def get_location(
    key: str,
    db: Session = Depends(get_db)
):
    """Get a specific location by key"""
    location = db.query(LocationDB).filter(
        LocationDB.key == key,
        LocationDB.is_active == 1
    ).first()
    
    if not location:
        raise HTTPException(status_code=404, detail=f"Location '{key}' not found")
    
    return db_to_location(location)


@router.post("/", response_model=Location)
async def create_location(
    location: LocationCreate,
    db: Session = Depends(get_db)
):
    """Create a new location"""
    existing = db.query(LocationDB).filter(LocationDB.key == location.key).first()
    if existing:
        raise HTTPException(
            status_code=400, 
            detail=f"Location with key '{location.key}' already exists"
        )
    
    db_location = LocationDB(
        key=location.key,
        name=location.name,
        latitude=location.latitude,
        longitude=location.longitude,
        country=location.country,
        region=location.region,
        category=location.category,
        description=location.description,
        timezone=location.timezone,
        elevation=location.elevation,
        is_active=1,
        created_at=datetime.utcnow()
    )
    
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    
    return db_to_location(db_location)


@router.delete("/{key}")
async def delete_location(
    key: str,
    db: Session = Depends(get_db)
):
    """Soft delete a location"""
    location = db.query(LocationDB).filter(LocationDB.key == key).first()
    
    if not location:
        raise HTTPException(status_code=404, detail=f"Location '{key}' not found")
    
    location.is_active = 0
    db.commit()
    
    return {"message": f"Location '{key}' deleted"}
