"""
CMC Data Fetcher Service
Downloads and parses GRIB2 data from Canadian Meteorological Centre

CMC Astronomy Data Source:
- https://dd.alpha.meteo.gc.ca/model_gem_regional/astronomy/grib2/{HH}/
- Variables: SEEI (seeing 1-5), TRSP (transparency %)
- Files: CMC_reg_{VAR}_SFC_0_ps10km_YYYYMMDDHH_P{hhh}.grib2
"""

import os
import asyncio
import aiohttp
import numpy as np
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
import json
import logging
import re

from ..config import settings

logger = logging.getLogger(__name__)


class CMCDataFetcher:
    """
    Fetches astronomy forecast data from CMC Datamart
    
    Data sources:
    - Astronomy (alpha): https://dd.alpha.meteo.gc.ca/model_gem_regional/astronomy/grib2/{HH}
    - RDPS (production): https://dd.weather.gc.ca/model_gem_regional/10km/grib2/{HH}/{hhh}
    
    Model runs: 00, 06, 12, 18 UTC
    Forecast hours: 001-084 (3.5 days)
    """
    
    # CMC model run times (UTC)
    MODEL_RUNS = ["00", "06", "12", "18"]
    
    # Base URLs
    ASTRONOMY_BASE = "https://dd.alpha.meteo.gc.ca/model_gem_regional/astronomy/grib2"
    RDPS_BASE = "https://dd.weather.gc.ca/model_gem_regional/10km/grib2"
    
    # Astronomy variables from CMC
    ASTRONOMY_VARS = {
        "SEEI": "seeing",           # Astronomical seeing index (1-5)
        "TRSP": "transparency",     # Sky transparency (%)
    }
    
    # RDPS variables for ground conditions
    RDPS_VARS = {
        "TCDC_SFC_0": "cloud_cover",      # Total cloud cover %
        "TMP_TGL_2": "temperature",        # Temperature at 2m
        "RH_TGL_2": "humidity",            # Relative humidity at 2m
        "WIND_TGL_10": "wind_speed",       # Wind speed at 10m
        "WDIR_TGL_10": "wind_direction",   # Wind direction at 10m
    }
    
    def __init__(self):
        self.data_dir = Path(settings.DATA_DIR)
        self.cache_dir = Path(settings.CACHE_DIR)
        self._pygrib = None  # Set before _check_grib_support
        self._grib_available = self._check_grib_support()
        
        # Create directories
        (self.data_dir / "astronomy").mkdir(parents=True, exist_ok=True)
        (self.data_dir / "rdps").mkdir(parents=True, exist_ok=True)
        (self.cache_dir / "forecasts").mkdir(parents=True, exist_ok=True)
    
    def _check_grib_support(self) -> bool:
        """Check if GRIB parsing libraries are available"""
        try:
            import pygrib
            self._pygrib = pygrib
            logger.info("pygrib available for GRIB2 parsing")
            return True
        except ImportError:
            try:
                import cfgrib
                logger.info("cfgrib available for GRIB2 parsing")
                return True
            except ImportError:
                logger.warning("No GRIB library available. Install pygrib or cfgrib.")
                return False
    
    def get_latest_model_run(self) -> Tuple[str, datetime]:
        """
        Determine the most recent available model run
        
        Returns: (run_hour, run_datetime)
        """
        now_utc = datetime.now(timezone.utc)
        hour = now_utc.hour
        
        # Model runs are typically available ~4 hours after run time
        available_hour = hour - 4
        
        run_hour = "18"  # Default to previous day's 18Z
        run_date = now_utc.date()
        
        for run in reversed(self.MODEL_RUNS):
            if int(run) <= available_hour:
                run_hour = run
                break
        else:
            # Before 04:00 UTC, use previous day's 18:00 run
            run_date = (now_utc - timedelta(days=1)).date()
        
        run_datetime = datetime.combine(run_date, datetime.min.time().replace(hour=int(run_hour)))
        run_datetime = run_datetime.replace(tzinfo=timezone.utc)
        
        return run_hour, run_datetime
    
    async def fetch_file(self, url: str, dest_path: Path, session: aiohttp.ClientSession = None) -> bool:
        """Download a single file"""
        close_session = False
        if session is None:
            session = aiohttp.ClientSession()
            close_session = True
        
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=120)) as response:
                if response.status == 200:
                    dest_path.parent.mkdir(parents=True, exist_ok=True)
                    content = await response.read()
                    with open(dest_path, 'wb') as f:
                        f.write(content)
                    logger.debug(f"Downloaded: {dest_path.name}")
                    return True
                else:
                    logger.warning(f"Failed to fetch {url}: {response.status}")
                    return False
        except asyncio.TimeoutError:
            logger.error(f"Timeout fetching {url}")
            return False
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return False
        finally:
            if close_session:
                await session.close()
    
    async def list_available_files(self, base_url: str) -> List[str]:
        """List available GRIB2 files at a URL"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(base_url, timeout=aiohttp.ClientTimeout(total=30)) as response:
                    if response.status == 200:
                        html = await response.text()
                        # Parse file links from directory listing
                        files = re.findall(r'href="([^"]+\.grib2)"', html)
                        return files
                    else:
                        logger.warning(f"Failed to list {base_url}: {response.status}")
                        return []
        except Exception as e:
            logger.error(f"Error listing files at {base_url}: {e}")
            return []
    
    async def fetch_astronomy_data(self, model_run: str = None) -> Dict[str, Any]:
        """
        Fetch astronomy-specific data (seeing, transparency) from CMC alpha
        
        Files are named: CMC_reg_{VAR}_SFC_0_ps10km_YYYYMMDDHH_P{hhh}.grib2
        Where VAR is SEEI or TRSP, hhh is forecast hour 001-084
        """
        if model_run is None:
            model_run, run_datetime = self.get_latest_model_run()
        else:
            run_datetime = datetime.now(timezone.utc).replace(hour=int(model_run), minute=0, second=0, microsecond=0)
        
        base_url = f"{self.ASTRONOMY_BASE}/{model_run}"
        run_str = run_datetime.strftime("%Y%m%d") + model_run
        
        logger.info(f"Fetching astronomy data for model run {run_str}")
        
        # List available files
        files = await self.list_available_files(base_url)
        
        if not files:
            logger.warning(f"No astronomy files found for run {model_run}")
            return {
                "model_run": run_str,
                "run_datetime": run_datetime.isoformat(),
                "data": {},
                "available": False
            }
        
        # Filter for SEEI and TRSP files
        seeing_files = sorted([f for f in files if "_SEEI_" in f])
        transp_files = sorted([f for f in files if "_TRSP_" in f])
        
        logger.info(f"Found {len(seeing_files)} seeing files, {len(transp_files)} transparency files")
        
        # Download files sequentially with rate limiting to avoid server disconnects
        downloaded = {"seeing": [], "transparency": []}
        
        async with aiohttp.ClientSession() as session:
            # Download seeing files
            for i, filename in enumerate(seeing_files):
                url = f"{base_url}/{filename}"
                dest = self.data_dir / "astronomy" / model_run / filename
                if dest.exists():
                    downloaded["seeing"].append(dest)
                else:
                    if await self.fetch_file(url, dest, session):
                        downloaded["seeing"].append(dest)
                    # Rate limit: pause every 5 downloads
                    if (i + 1) % 5 == 0:
                        await asyncio.sleep(0.5)
            
            # Small pause between variable types
            await asyncio.sleep(1)
            
            # Download transparency files
            for i, filename in enumerate(transp_files):
                url = f"{base_url}/{filename}"
                dest = self.data_dir / "astronomy" / model_run / filename
                if dest.exists():
                    downloaded["transparency"].append(dest)
                else:
                    if await self.fetch_file(url, dest, session):
                        downloaded["transparency"].append(dest)
                    # Rate limit: pause every 5 downloads
                    if (i + 1) % 5 == 0:
                        await asyncio.sleep(0.5)
        
        logger.info(f"Downloaded {len(downloaded['seeing'])} seeing, {len(downloaded['transparency'])} transparency files")
        
        return {
            "model_run": run_str,
            "run_datetime": run_datetime.isoformat(),
            "files": {
                "seeing": [str(f) for f in downloaded["seeing"]],
                "transparency": [str(f) for f in downloaded["transparency"]]
            },
            "available": len(downloaded["seeing"]) > 0 or len(downloaded["transparency"]) > 0
        }
    
    async def _download_task(self, session, url, dest, var_type, downloaded_dict):
        """Helper for parallel downloads"""
        if await self.fetch_file(url, dest, session):
            downloaded_dict[var_type].append(dest)
    
    async def fetch_rdps_cloud_data(self, model_run: str = None) -> Dict[str, Any]:
        """
        Fetch RDPS cloud cover data from CMC production
        
        Files at: /model_gem_regional/10km/grib2/{HH}/{hhh}/
        Named: CMC_reg_TCDC_SFC_0_ps10km_YYYYMMDDHH_P{hhh}.grib2
        """
        if model_run is None:
            model_run, run_datetime = self.get_latest_model_run()
        else:
            run_datetime = datetime.now(timezone.utc).replace(hour=int(model_run), minute=0, second=0, microsecond=0)
        
        run_str = run_datetime.strftime("%Y%m%d") + model_run
        logger.info(f"Fetching RDPS cloud data for model run {run_str}")
        
        downloaded = []
        
        async with aiohttp.ClientSession() as session:
            # Fetch hours 001-084
            for hour in range(1, 85):
                hour_str = f"{hour:03d}"
                # RDPS URL structure
                url_base = f"{self.RDPS_BASE}/{model_run}/{hour_str}"
                
                # List files in this hour directory
                files = await self.list_available_files(url_base)
                
                # Find cloud cover file
                cloud_files = [f for f in files if "TCDC_SFC" in f]
                
                for filename in cloud_files:
                    url = f"{url_base}/{filename}"
                    dest = self.data_dir / "rdps" / model_run / filename
                    if not dest.exists():
                        if await self.fetch_file(url, dest, session):
                            downloaded.append(dest)
                    else:
                        downloaded.append(dest)
        
        logger.info(f"Downloaded {len(downloaded)} RDPS cloud files")
        
        return {
            "model_run": run_str,
            "run_datetime": run_datetime.isoformat(),
            "files": [str(f) for f in downloaded],
            "available": len(downloaded) > 0
        }
    
    def extract_point_forecast(self, lat: float, lon: float, 
                                model_run: str = None) -> Dict[str, List[Dict]]:
        """
        Extract full forecast time series for a specific lat/lon point
        
        Returns dict with hourly forecasts for each variable
        """
        if not self._grib_available:
            logger.warning("GRIB library not available, cannot extract point data")
            return {"seeing": [], "transparency": [], "cloud_cover": []}
        
        if model_run is None:
            model_run, _ = self.get_latest_model_run()
        
        result = {
            "seeing": [],
            "transparency": [],
            "cloud_cover": []
        }
        
        # Process astronomy files
        astro_dir = self.data_dir / "astronomy" / model_run
        if astro_dir.exists():
            # Seeing files - pattern: *_SEEI_*.grib2
            for grib_file in sorted(astro_dir.glob("*_SEEI_*.grib2")):
                value, forecast_hour = self._extract_point_value(grib_file, lat, lon)
                if value is not None:
                    result["seeing"].append({
                        "forecast_hour": forecast_hour,
                        "value": value
                    })
            
            # Transparency files - pattern: *_TRSP_*.grib2
            for grib_file in sorted(astro_dir.glob("*_TRSP_*.grib2")):
                value, forecast_hour = self._extract_point_value(grib_file, lat, lon)
                if value is not None:
                    result["transparency"].append({
                        "forecast_hour": forecast_hour,
                        "value": value
                    })
        
        # Process RDPS cloud files
        rdps_dir = self.data_dir / "rdps" / model_run
        if rdps_dir.exists():
            for grib_file in sorted(rdps_dir.glob("*_TCDC_*.grib2")):
                value, forecast_hour = self._extract_point_value(grib_file, lat, lon)
                if value is not None:
                    result["cloud_cover"].append({
                        "forecast_hour": forecast_hour,
                        "value": value
                    })
        
        return result
    
    def _extract_point_value(self, grib_file: Path, lat: float, lon: float) -> Tuple[Optional[float], Optional[int]]:
        """
        Extract forecast value at specific lat/lon from GRIB2 file
        
        Returns: (value, forecast_hour)
        """
        try:
            # Extract forecast hour from filename
            # Pattern: 20251103T18Z_MSC_RDPS_SEEI_EATM_PS35km_PT10H.grib2
            match = re.search(r'_PT(\d+)H\.grib2', str(grib_file))
            forecast_hour = int(match.group(1)) if match else None
            
            if self._pygrib:
                import pygrib
                
                grbs = pygrib.open(str(grib_file))
                grb = grbs[1]  # First message
                
                # Get grid info
                lats, lons = grb.latlons()
                data = grb.values
                
                # Handle masked arrays
                if hasattr(data, 'mask'):
                    data = data.filled(np.nan)
                
                # Find nearest grid point using bilinear interpolation
                value = self._bilinear_interpolate(data, lats, lons, lat, lon)
                
                grbs.close()
                return value, forecast_hour
            else:
                # Try cfgrib
                import xarray as xr
                
                ds = xr.open_dataset(str(grib_file), engine='cfgrib')
                
                # Get first data variable
                var_name = list(ds.data_vars)[0]
                
                # Handle different coordinate names
                if 'latitude' in ds.coords:
                    value = float(ds[var_name].sel(latitude=lat, longitude=lon, method='nearest').values)
                else:
                    # May need to handle projected coordinates
                    value = float(ds[var_name].values.flat[0])
                
                ds.close()
                return value, forecast_hour
                
        except Exception as e:
            logger.error(f"Error extracting from {grib_file.name}: {e}")
            return None, None
    
    def _bilinear_interpolate(self, data: np.ndarray, lats: np.ndarray, lons: np.ndarray,
                               target_lat: float, target_lon: float) -> Optional[float]:
        """
        Bilinear interpolation for polar stereographic grid
        """
        try:
            # Normalize longitude to match grid (CMC uses 0-360)
            if target_lon < 0:
                target_lon_360 = target_lon + 360
            else:
                target_lon_360 = target_lon
            
            # Also handle if grid is in -180 to 180
            if np.min(lons) < 0:
                target_lon_use = target_lon
            else:
                target_lon_use = target_lon_360
            
            # Calculate distance to all points
            dist = np.sqrt((lats - target_lat)**2 + (lons - target_lon_use)**2)
            
            # Find nearest point
            min_idx = np.unravel_index(np.argmin(dist), dist.shape)
            
            # Simple nearest neighbor for now
            # TODO: Implement proper bilinear interpolation
            value = data[min_idx[0], min_idx[1]]
            
            if np.isnan(value):
                return None
            
            return float(value)
            
        except Exception as e:
            logger.error(f"Interpolation error: {e}")
            return None
    
    def get_cached_forecast(self, location_key: str, model_run: str) -> Optional[Dict]:
        """Load cached forecast from disk"""
        cache_file = self.cache_dir / "forecasts" / f"{location_key}_{model_run}.json"
        if cache_file.exists():
            try:
                with open(cache_file) as f:
                    return json.load(f)
            except:
                pass
        return None
    
    def save_cached_forecast(self, location_key: str, model_run: str, data: Dict):
        """Save forecast to disk cache"""
        cache_file = self.cache_dir / "forecasts" / f"{location_key}_{model_run}.json"
        cache_file.parent.mkdir(parents=True, exist_ok=True)
        with open(cache_file, 'w') as f:
            json.dump(data, f)
    
    def convert_seeing_value(self, raw_value: float) -> str:
        """
        Convert CMC seeing index (1-5) to category
        
        CMC SEEI scale: 1 = worst, 5 = best
        1 = Bad (> 4.0 arcsec)
        2 = Poor (2.0-4.0 arcsec)
        3 = Average (1.0-2.0 arcsec)
        4 = Good (0.5-1.0 arcsec)
        5 = Excellent (< 0.5 arcsec)
        """
        if raw_value is None:
            return "too_cloudy"
        
        if raw_value >= 4.5:
            return "excellent"
        elif raw_value >= 3.5:
            return "good"
        elif raw_value >= 2.5:
            return "average"
        elif raw_value >= 1.5:
            return "poor"
        else:
            return "bad"
    
    def convert_transparency_value(self, raw_value: float, cloud_cover: float = None) -> str:
        """
        Convert CMC transparency value to category
        
        Higher value = more transparent
        """
        if raw_value is None or (cloud_cover is not None and cloud_cover > 80):
            return "too_cloudy"
        
        if raw_value >= 80:
            return "transparent"
        elif raw_value >= 60:
            return "above_avg"
        elif raw_value >= 40:
            return "average"
        elif raw_value >= 20:
            return "below_avg"
        else:
            return "poor"


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
