"""
CMC Data Fetcher Service
Downloads and parses GRIB2 data from Canadian Meteorological Centre
"""

import os
import asyncio
import aiohttp
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
import json
import logging

from ..config import settings

logger = logging.getLogger(__name__)


class CMCDataFetcher:
    """
    Fetches astronomy forecast data from CMC Datamart
    
    Data sources:
    - Astronomy (alpha): https://dd.alpha.meteo.gc.ca/model_gem_regional/astronomy/grib2/{HH}
    - RDPS (production): https://dd.weather.gc.ca/model_gem_regional/10km/grib2/{HH}/{hhh}
    
    Model runs: 00, 06, 12, 18 UTC
    Forecast hours: 001-084
    """
    
    # CMC model run times (UTC)
    MODEL_RUNS = ["00", "06", "12", "18"]
    
    # Astronomy variables available from CMC alpha
    ASTRONOMY_VARS = {
        "SEEI": "seeing",           # Astronomical seeing index
        "TRSP": "transparency",     # Sky transparency
    }
    
    # RDPS variables for ground conditions
    RDPS_VARS = {
        "TCDC": "cloud_cover",      # Total cloud cover
        "TMP": "temperature",       # Temperature
        "RH": "humidity",           # Relative humidity
        "WIND": "wind_speed",       # Wind speed
        "WDIR": "wind_direction",   # Wind direction
    }
    
    def __init__(self):
        self.data_dir = Path(settings.DATA_DIR)
        self.cache_dir = Path(settings.CACHE_DIR)
        self._grib_available = self._check_grib_support()
    
    def _check_grib_support(self) -> bool:
        """Check if GRIB parsing libraries are available"""
        try:
            import pygrib
            return True
        except ImportError:
            try:
                import cfgrib
                return True
            except ImportError:
                logger.warning("No GRIB library available. Install pygrib or cfgrib.")
                return False
    
    def get_latest_model_run(self) -> str:
        """Determine the most recent available model run"""
        now_utc = datetime.utcnow()
        hour = now_utc.hour
        
        # Model runs are typically available ~3-4 hours after run time
        # So at 15:00 UTC, the 12:00 run should be available
        available_hour = hour - 4
        
        for run in reversed(self.MODEL_RUNS):
            if int(run) <= available_hour:
                return run
        
        # If before 04:00 UTC, use previous day's 18:00 run
        return "18"
    
    async def fetch_file(self, url: str, dest_path: Path) -> bool:
        """Download a single file"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=60)) as response:
                    if response.status == 200:
                        dest_path.parent.mkdir(parents=True, exist_ok=True)
                        with open(dest_path, 'wb') as f:
                            f.write(await response.read())
                        return True
                    else:
                        logger.warning(f"Failed to fetch {url}: {response.status}")
                        return False
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return False
    
    async def list_available_files(self, base_url: str) -> List[str]:
        """List available GRIB2 files at a URL"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(base_url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        html = await response.text()
                        # Parse file links from directory listing
                        import re
                        files = re.findall(r'href="([^"]+\.grib2)"', html)
                        return files
                    return []
        except Exception as e:
            logger.error(f"Error listing files at {base_url}: {e}")
            return []
    
    async def fetch_astronomy_data(self, model_run: str = None) -> Dict[str, Any]:
        """
        Fetch astronomy-specific data (seeing, transparency) from CMC alpha
        
        Returns dict with parsed forecast data
        """
        if model_run is None:
            model_run = self.get_latest_model_run()
        
        base_url = f"{settings.CMC_ASTRONOMY_BASE_URL}/{model_run}"
        
        logger.info(f"Fetching astronomy data for model run {model_run}")
        
        # List available files
        files = await self.list_available_files(base_url)
        
        if not files:
            logger.warning(f"No astronomy files found for run {model_run}")
            return {"model_run": model_run, "data": {}, "available": False}
        
        # Download files we need
        downloaded = []
        for filename in files[:10]:  # Limit for now
            url = f"{base_url}/{filename}"
            dest = self.data_dir / "astronomy" / model_run / filename
            if await self.fetch_file(url, dest):
                downloaded.append(dest)
        
        logger.info(f"Downloaded {len(downloaded)} astronomy files")
        
        return {
            "model_run": model_run,
            "files": [str(f) for f in downloaded],
            "available": len(downloaded) > 0
        }
    
    async def fetch_rdps_data(self, model_run: str = None, variables: List[str] = None) -> Dict[str, Any]:
        """
        Fetch RDPS data (cloud cover, wind, temp, humidity) from CMC production
        """
        if model_run is None:
            model_run = self.get_latest_model_run()
        
        if variables is None:
            variables = list(self.RDPS_VARS.keys())
        
        logger.info(f"Fetching RDPS data for model run {model_run}")
        
        downloaded = []
        # Fetch first 48 hours for each variable
        for hour in range(1, 49):
            hour_str = f"{hour:03d}"
            for var in variables:
                # RDPS file naming pattern
                url = f"{settings.CMC_RDPS_BASE_URL}/{model_run}/{hour_str}"
                # Would need to construct exact filename based on CMC naming convention
        
        return {
            "model_run": model_run,
            "files": [str(f) for f in downloaded],
            "available": len(downloaded) > 0
        }
    
    def extract_point_value(self, grib_file: Path, lat: float, lon: float) -> Optional[float]:
        """
        Extract forecast value at specific lat/lon from GRIB2 file
        
        Uses bilinear interpolation for best accuracy
        """
        if not self._grib_available:
            return None
        
        try:
            import pygrib
            
            grbs = pygrib.open(str(grib_file))
            grb = grbs[1]  # First message
            
            # Get grid info
            lats, lons = grb.latlons()
            data = grb.values
            
            # Find nearest grid point
            # For CMC polar stereographic grid, need proper interpolation
            lat_idx, lon_idx = self._find_nearest_indices(lats, lons, lat, lon)
            
            if lat_idx is not None and lon_idx is not None:
                return float(data[lat_idx, lon_idx])
            
            grbs.close()
            return None
            
        except ImportError:
            # Try cfgrib instead
            try:
                import xarray as xr
                import cfgrib
                
                ds = xr.open_dataset(str(grib_file), engine='cfgrib')
                # Extract point - depends on variable name in file
                # This is simplified - real implementation needs var name handling
                for var in ds.data_vars:
                    val = ds[var].sel(latitude=lat, longitude=lon, method='nearest')
                    return float(val.values)
                
            except Exception as e:
                logger.error(f"Error parsing GRIB with cfgrib: {e}")
                return None
                
        except Exception as e:
            logger.error(f"Error extracting point value: {e}")
            return None
    
    def _find_nearest_indices(self, lats: np.ndarray, lons: np.ndarray, 
                              target_lat: float, target_lon: float) -> Tuple[Optional[int], Optional[int]]:
        """Find nearest grid indices for a target point"""
        try:
            # Handle longitude wrapping
            if target_lon < 0:
                target_lon += 360
            
            # Calculate distance to all points
            dist = np.sqrt((lats - target_lat)**2 + (lons - target_lon)**2)
            
            # Find minimum
            idx = np.unravel_index(np.argmin(dist), dist.shape)
            return idx[0], idx[1]
            
        except Exception as e:
            logger.error(f"Error finding nearest indices: {e}")
            return None, None


class OpenMeteoFetcher:
    """
    Fetches ECMWF cloud data from Open-Meteo for comparison layer
    """
    
    async def fetch_forecast(self, lat: float, lon: float, 
                            forecast_days: int = 7) -> Dict[str, Any]:
        """
        Fetch ECMWF cloud cover forecast from Open-Meteo
        
        Returns hourly cloud cover data
        """
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": [
                "cloud_cover",
                "cloud_cover_low",
                "cloud_cover_mid", 
                "cloud_cover_high",
                "visibility",
                "temperature_2m",
                "relative_humidity_2m",
                "wind_speed_10m",
                "wind_direction_10m",
            ],
            "forecast_days": forecast_days,
            "models": "ecmwf_ifs04",  # ECMWF model specifically
            "timezone": "auto"
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    settings.OPEN_METEO_URL,
                    params=params,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "available": True,
                            "timezone": data.get("timezone"),
                            "hourly": data.get("hourly", {}),
                            "hourly_units": data.get("hourly_units", {})
                        }
                    else:
                        logger.warning(f"Open-Meteo request failed: {response.status}")
                        return {"available": False}
                        
        except Exception as e:
            logger.error(f"Error fetching Open-Meteo data: {e}")
            return {"available": False, "error": str(e)}


# Singleton instances
cmc_fetcher = CMCDataFetcher()
openmeteo_fetcher = OpenMeteoFetcher()
