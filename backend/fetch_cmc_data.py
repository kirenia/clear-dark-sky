#!/usr/bin/env python3
"""
CLI script to fetch CMC astronomy data

Usage:
    python fetch_cmc_data.py                    # Fetch latest model run
    python fetch_cmc_data.py --run 12           # Fetch specific model run (00, 06, 12, 18)
    python fetch_cmc_data.py --list             # List available files
"""

import asyncio
import argparse
import logging
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import after path setup
import sys
sys.path.insert(0, '.')

from app.services.cmc_fetcher import cmc_fetcher


async def list_files(model_run: str = None):
    """List available CMC files"""
    if model_run is None:
        model_run, run_dt = cmc_fetcher.get_latest_model_run()
    
    base_url = f"{cmc_fetcher.ASTRONOMY_BASE}/{model_run}"
    print(f"\nListing files at: {base_url}")
    
    files = await cmc_fetcher.list_available_files(base_url)
    
    if files:
        print(f"\nFound {len(files)} files:")
        for f in sorted(files)[:20]:
            print(f"  {f}")
        if len(files) > 20:
            print(f"  ... and {len(files) - 20} more")
    else:
        print("No files found or unable to access URL")


async def fetch_astronomy(model_run: str = None):
    """Fetch astronomy GRIB2 files"""
    print("\n=== Fetching CMC Astronomy Data ===")
    print(f"GRIB library available: {cmc_fetcher._grib_available}")
    
    if model_run is None:
        model_run, run_dt = cmc_fetcher.get_latest_model_run()
        print(f"Using latest model run: {model_run}Z from {run_dt.date()}")
    else:
        print(f"Using specified model run: {model_run}Z")
    
    result = await cmc_fetcher.fetch_astronomy_data(model_run)
    
    print(f"\nResult:")
    print(f"  Model run: {result.get('model_run')}")
    print(f"  Available: {result.get('available')}")
    
    if result.get('files'):
        seeing_files = result['files'].get('seeing', [])
        transp_files = result['files'].get('transparency', [])
        print(f"  Seeing files: {len(seeing_files)}")
        print(f"  Transparency files: {len(transp_files)}")
    
    return result


async def test_extraction(lat: float, lon: float, model_run: str = None):
    """Test extracting data for a point"""
    print(f"\n=== Extracting data for ({lat}, {lon}) ===")
    
    if not cmc_fetcher._grib_available:
        print("ERROR: GRIB library not available. Install pygrib:")
        print("  brew install eccodes")
        print("  pip install pygrib")
        return
    
    if model_run is None:
        model_run, _ = cmc_fetcher.get_latest_model_run()
    
    result = cmc_fetcher.extract_point_forecast(lat, lon, model_run)
    
    print(f"\nExtracted data:")
    print(f"  Seeing values: {len(result.get('seeing', []))}")
    print(f"  Transparency values: {len(result.get('transparency', []))}")
    print(f"  Cloud cover values: {len(result.get('cloud_cover', []))}")
    
    # Show first few values
    if result.get('seeing'):
        print("\n  First 5 seeing values:")
        for item in result['seeing'][:5]:
            print(f"    Hour {item['forecast_hour']}: {item['value']}")
    
    if result.get('transparency'):
        print("\n  First 5 transparency values:")
        for item in result['transparency'][:5]:
            print(f"    Hour {item['forecast_hour']}: {item['value']}")


def main():
    parser = argparse.ArgumentParser(description='Fetch CMC astronomy data')
    parser.add_argument('--run', type=str, choices=['00', '06', '12', '18'],
                        help='Model run hour (default: latest available)')
    parser.add_argument('--list', action='store_true',
                        help='List available files only')
    parser.add_argument('--test-lat', type=float, default=25.0443,
                        help='Latitude for test extraction (default: Nassau)')
    parser.add_argument('--test-lon', type=float, default=-77.3504,
                        help='Longitude for test extraction (default: Nassau)')
    parser.add_argument('--extract', action='store_true',
                        help='Test data extraction for a point')
    
    args = parser.parse_args()
    
    if args.list:
        asyncio.run(list_files(args.run))
    elif args.extract:
        # First fetch, then extract
        asyncio.run(fetch_astronomy(args.run))
        asyncio.run(test_extraction(args.test_lat, args.test_lon, args.run))
    else:
        asyncio.run(fetch_astronomy(args.run))


if __name__ == '__main__':
    main()
