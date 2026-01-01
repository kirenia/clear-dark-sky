#!/usr/bin/env python3
"""
Clear Dark Sky Location Management CLI

Add, list, and manage observation locations.
Usage:
    python manage_locations.py add "Location Name" LAT LON [--elevation M] [--tz OFFSET]
    python manage_locations.py list
    python manage_locations.py delete location-id
"""

import argparse
import sys
import re
from datetime import datetime

# Add parent to path for imports
sys.path.insert(0, '.')

from app.database import SessionLocal, LocationDB, init_db


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text


def add_location(name: str, lat: float, lon: float, 
                 elevation: float = None, tz_offset: int = -7,
                 slug: str = None):
    """Add a new location"""
    db = SessionLocal()
    try:
        location_id = slug or slugify(name)
        
        # Check if exists
        existing = db.query(LocationDB).filter(LocationDB.id == location_id).first()
        if existing:
            print(f"Error: Location '{location_id}' already exists")
            return False
        
        location = LocationDB(
            id=location_id,
            name=name,
            latitude=lat,
            longitude=lon,
            elevation=elevation,
            timezone_offset=tz_offset,
            created_at=datetime.utcnow()
        )
        
        db.add(location)
        db.commit()
        
        print(f"✓ Added location: {name}")
        print(f"  ID: {location_id}")
        print(f"  Coords: {lat}°N, {lon}°W")
        if elevation:
            print(f"  Elevation: {elevation}m")
        print(f"  Timezone: UTC{tz_offset:+d}")
        return True
        
    finally:
        db.close()


def list_locations():
    """List all locations"""
    db = SessionLocal()
    try:
        locations = db.query(LocationDB).all()
        
        if not locations:
            print("No locations configured.")
            return
        
        print(f"\n{'ID':<25} {'Name':<30} {'Coordinates':<25} {'TZ'}")
        print("-" * 90)
        
        for loc in locations:
            coords = f"{loc.latitude:.4f}°N, {abs(loc.longitude):.4f}°W"
            tz = f"UTC{loc.timezone_offset:+d}"
            print(f"{loc.id:<25} {loc.name:<30} {coords:<25} {tz}")
        
        print(f"\nTotal: {len(locations)} locations")
        
    finally:
        db.close()


def delete_location(location_id: str):
    """Delete a location"""
    db = SessionLocal()
    try:
        location = db.query(LocationDB).filter(LocationDB.id == location_id).first()
        
        if not location:
            print(f"Error: Location '{location_id}' not found")
            return False
        
        db.delete(location)
        db.commit()
        print(f"✓ Deleted location: {location.name} ({location_id})")
        return True
        
    finally:
        db.close()


def seed_sample_locations():
    """Add some sample locations for testing"""
    locations = [
        # Idaho Falls (default)
        ("Idaho Falls", 43.4917, -112.0339, 1432, -7),
        # Other sample locations
        ("Salt Lake City", 40.7608, -111.8910, 1288, -7),
        ("Denver", 39.7392, -104.9903, 1609, -7),
        ("Tucson", 32.2226, -110.9747, 728, -7),
        ("Flagstaff", 35.1983, -111.6513, 2106, -7),
    ]
    
    print("Seeding sample locations...")
    for name, lat, lon, elev, tz in locations:
        add_location(name, lat, lon, elev, tz)


def main():
    parser = argparse.ArgumentParser(description="Manage Clear Dark Sky locations")
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Add command
    add_parser = subparsers.add_parser("add", help="Add a new location")
    add_parser.add_argument("name", help="Location name")
    add_parser.add_argument("latitude", type=float, help="Latitude (positive = N)")
    add_parser.add_argument("longitude", type=float, help="Longitude (negative = W)")
    add_parser.add_argument("--elevation", "-e", type=float, help="Elevation in meters")
    add_parser.add_argument("--tz", type=int, default=-7, help="Timezone offset from UTC (default: -7)")
    add_parser.add_argument("--slug", "-s", help="Custom URL slug")
    
    # List command
    subparsers.add_parser("list", help="List all locations")
    
    # Delete command
    delete_parser = subparsers.add_parser("delete", help="Delete a location")
    delete_parser.add_argument("location_id", help="Location ID to delete")
    
    # Seed command
    subparsers.add_parser("seed", help="Add sample locations")
    
    args = parser.parse_args()
    
    # Initialize database
    init_db()
    
    if args.command == "add":
        add_location(
            args.name, 
            args.latitude, 
            args.longitude,
            args.elevation,
            args.tz,
            args.slug
        )
    elif args.command == "list":
        list_locations()
    elif args.command == "delete":
        delete_location(args.location_id)
    elif args.command == "seed":
        seed_sample_locations()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
