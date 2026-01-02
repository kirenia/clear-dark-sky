#!/usr/bin/env python3
"""
Seed locations from JSON data file into the database.
Run: python seed_locations.py
"""

import json
import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal, engine, Base, LocationDB

def load_locations_json():
    """Load locations from JSON file."""
    json_path = Path(__file__).parent / "data" / "locations.json"
    with open(json_path, "r") as f:
        return json.load(f)

def seed_locations():
    """Seed all locations from JSON into database."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Load data
    data = load_locations_json()
    locations = data["locations"]
    
    db = SessionLocal()
    try:
        added = 0
        updated = 0
        
        for loc in locations:
            # Check if exists
            existing = db.query(LocationDB).filter(
                LocationDB.key == loc["key"]
            ).first()
            
            if existing:
                # Update
                existing.name = loc["name"]
                existing.latitude = loc["latitude"]
                existing.longitude = loc["longitude"]
                existing.country = loc["country"]
                existing.region = loc["region"]
                existing.category = loc.get("category")
                existing.description = loc.get("description")
                existing.timezone = loc.get("timezone", "America/New_York")
                updated += 1
            else:
                # Insert
                db_loc = LocationDB(
                    key=loc["key"],
                    name=loc["name"],
                    latitude=loc["latitude"],
                    longitude=loc["longitude"],
                    country=loc["country"],
                    region=loc["region"],
                    category=loc.get("category"),
                    description=loc.get("description"),
                    timezone=loc.get("timezone", "America/New_York"),
                    is_active=True
                )
                db.add(db_loc)
                added += 1
        
        db.commit()
        
        # Print summary
        total = db.query(LocationDB).count()
        print(f"Seeding complete:")
        print(f"  Added: {added}")
        print(f"  Updated: {updated}")
        print(f"  Total in DB: {total}")
        
        # Print progress
        meta = data["metadata"]
        print(f"\nProgress: {total}/{meta['total_expected']} locations")
        print(f"  Bahamas: {meta['progress']['bahamas']}")
        print(f"  Canada: {meta['progress']['canada']}")
        print(f"  Mexico: {meta['progress']['mexico']}")
        print(f"  USA: {meta['progress']['usa']}")
        
    finally:
        db.close()

def list_locations():
    """List all locations in database."""
    db = SessionLocal()
    try:
        locations = db.query(LocationDB).order_by(
            LocationDB.country, LocationDB.region, LocationDB.name
        ).all()
        
        current_country = None
        for loc in locations:
            if loc.country != current_country:
                current_country = loc.country
                print(f"\n{current_country}:")
            print(f"  [{loc.key}] {loc.name} ({loc.latitude:.3f}, {loc.longitude:.3f})")
        
        print(f"\nTotal: {len(locations)} locations")
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Manage Clear Dark Sky locations")
    parser.add_argument("command", choices=["seed", "list"], help="Command to run")
    
    args = parser.parse_args()
    
    if args.command == "seed":
        seed_locations()
    elif args.command == "list":
        list_locations()
