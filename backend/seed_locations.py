#!/usr/bin/env python3
"""
Seed locations from JSON data file into the database.
Run: python seed_locations.py seed
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal, engine, Base, LocationDB


def tz_offset_to_timezone(offset, region=None, country=None):
    """Convert numeric offset to IANA timezone."""
    if region == "Arizona":
        return "America/Phoenix"
    if region == "Hawaii":
        return "Pacific/Honolulu"
    if country == "Bahamas":
        return "America/Nassau"
    if country == "Mexico":
        return "America/Mexico_City"
    
    offset_map = {
        -10: "Pacific/Honolulu",
        -9: "America/Anchorage",
        -8: "America/Los_Angeles",
        -7: "America/Denver",
        -6: "America/Chicago",
        -5: "America/New_York",
        -4: "America/Halifax",
        -3.5: "America/St_Johns",
        -3: "America/Sao_Paulo",
        0: "Europe/London",
    }
    return offset_map.get(offset, "America/New_York")


def load_locations_json():
    json_path = Path(__file__).parent / "data" / "locations.json"
    with open(json_path, "r") as f:
        return json.load(f)


def seed_locations():
    Base.metadata.create_all(bind=engine)
    data = load_locations_json()
    locations = data if isinstance(data, list) else data["locations"]
    
    db = SessionLocal()
    try:
        added = 0
        updated = 0
        
        for loc in locations:
            if not loc.get("latitude") or not loc.get("longitude"):
                print(f"Skipping {loc.get('name', 'unknown')} - missing coords")
                continue
            
            timezone = loc.get("timezone") or tz_offset_to_timezone(
                loc.get("tz_offset"),
                loc.get("region"),
                loc.get("country")
            )
            
            existing = db.query(LocationDB).filter(
                LocationDB.key == loc["chart_key"]
            ).first()
            
            if existing:
                existing.name = loc["name"]
                existing.latitude = loc["latitude"]
                existing.longitude = loc["longitude"]
                existing.country = loc["country"]
                existing.region = loc["region"]
                existing.category = loc.get("category")
                existing.description = loc.get("description")
                existing.timezone = timezone
                updated += 1
            else:
                db_loc = LocationDB(
                    key=loc["chart_key"],
                    name=loc["name"],
                    latitude=loc["latitude"],
                    longitude=loc["longitude"],
                    country=loc["country"],
                    region=loc["region"],
                    category=loc.get("category"),
                    description=loc.get("description"),
                    timezone=timezone,
                    is_active=True
                )
                db.add(db_loc)
                added += 1
        
        db.commit()
        total = db.query(LocationDB).count()
        print(f"Seeding complete: Added {added}, Updated {updated}, Total {total}")
        
    finally:
        db.close()


def list_locations():
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
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["seed", "list"])
    args = parser.parse_args()
    
    if args.command == "seed":
        seed_locations()
    elif args.command == "list":
        list_locations()