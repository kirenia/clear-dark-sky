"""
Forecast Builder Service
Combines CMC astronomy data, RDPS data, Open-Meteo ECMWF data,
and astronomical calculations into a unified forecast
"""

from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any
import json
import logging

from ..models import (
    Location, HourlyForecast, DayForecast, ForecastResponse, get_timezone_offset
)
from .cmc_fetcher import cmc_fetcher, openmeteo_fetcher
from .astro_calculator import create_calculator

logger = logging.getLogger(__name__)


# Color scales matching Clear Sky Chart (cleardarksky.com)
COLOR_SCALES = {
    "cloud_cover": {
        "colors": [
            {"max": 5, "color": "#003e7e", "label": "Clear"},
            {"max": 15, "color": "#135393", "label": "10% covered"},
            {"max": 25, "color": "#2666a6", "label": "20% covered"},
            {"max": 35, "color": "#4e8ece", "label": "30% covered"},
            {"max": 45, "color": "#62a2e2", "label": "40% covered"},
            {"max": 55, "color": "#76b6f6", "label": "50% covered"},
            {"max": 65, "color": "#99d9d9", "label": "60% covered"},
            {"max": 75, "color": "#adeded", "label": "70% covered"},
            {"max": 85, "color": "#c1c1c1", "label": "80% covered"},
            {"max": 95, "color": "#e9e9e9", "label": "90% covered"},
            {"max": 100, "color": "#fafafa", "label": "Overcast"},
        ]
    },
    "transparency": {
        "colors": [
            {"value": "too_cloudy", "color": "#f9f9f9", "label": "Too cloudy"},
            {"value": "poor", "color": "#c7c7c7", "label": "Poor"},
            {"value": "below_avg", "color": "#95d5d5", "label": "Below Average"},
            {"value": "average", "color": "#63a3e3", "label": "Average"},
            {"value": "above_avg", "color": "#2c6cac", "label": "Above Average"},
            {"value": "transparent", "color": "#003f7f", "label": "Transparent"},
        ]
    },
    "seeing": {
        "colors": [
            {"value": "too_cloudy", "color": "#f9f9f9", "label": "Too cloudy"},
            {"value": "bad", "color": "#c7c7c7", "label": "Bad 1/5"},
            {"value": "poor", "color": "#95d5d5", "label": "Poor 2/5"},
            {"value": "average", "color": "#63a3e3", "label": "Average 3/5"},
            {"value": "good", "color": "#2c6cac", "label": "Good 4/5"},
            {"value": "excellent", "color": "#003f7f", "label": "Excellent 5/5"},
        ]
    },
    "darkness": {
        "colors": [
            {"max": -3.5, "color": "#ffffff", "label": "Daylight"},
            {"max": -2.5, "color": "#fff1d8", "label": "Bright"},
            {"max": -1.5, "color": "#ffe3b1", "label": "Bright"},
            {"max": -0.5, "color": "#ffd58a", "label": "Dusk"},
            {"max": 0.5, "color": "#ffc662", "label": "Dusk"},
            {"max": 1.5, "color": "#ffb83b", "label": "Twilight"},
            {"max": 2.5, "color": "#ffaa14", "label": "Twilight"},
            {"max": 3.25, "color": "#00ffff", "label": "Bright Moon"},
            {"max": 3.75, "color": "#00cbff", "label": "Bright Moon"},
            {"max": 4.25, "color": "#0096ff", "label": "Partial Moon"},
            {"max": 4.75, "color": "#0064e4", "label": "Partial Moon"},
            {"max": 5.25, "color": "#0032ca", "label": "Dim Moon"},
            {"max": 5.75, "color": "#0000af", "label": "Dim Moon"},
            {"max": 6.25, "color": "#000042", "label": "Dark Sky"},
            {"max": 7, "color": "#00004b", "label": "Dark Sky"},
        ]
    },
    "wind": {
        "colors": [
            {"max": 5, "color": "#003f7f", "label": "0-5 mph"},
            {"max": 11, "color": "#2c6cac", "label": "6-11 mph"},
            {"max": 16, "color": "#63a3e3", "label": "12-16 mph"},
            {"max": 28, "color": "#95d5d5", "label": "17-28 mph"},
            {"max": 45, "color": "#c7c7c7", "label": "29-45 mph"},
            {"max": 999, "color": "#f9f9f9", "label": ">45 mph"},
        ]
    },
    "humidity": {
        "colors": [
            {"max": 25, "color": "#08035d", "label": "<25%"},
            {"max": 30, "color": "#0d4d8d", "label": "25-30%"},
            {"max": 35, "color": "#3070b0", "label": "30-35%"},
            {"max": 40, "color": "#4e8ece", "label": "35-40%"},
            {"max": 45, "color": "#71b1f1", "label": "40-45%"},
            {"max": 50, "color": "#80c0c0", "label": "45-50%"},
            {"max": 55, "color": "#09feed", "label": "50-55%"},
            {"max": 60, "color": "#55faad", "label": "55-60%"},
            {"max": 65, "color": "#94fe6a", "label": "60-65%"},
            {"max": 70, "color": "#eafb16", "label": "65-70%"},
            {"max": 75, "color": "#fec600", "label": "70-75%"},
            {"max": 80, "color": "#fc8602", "label": "75-80%"},
            {"max": 85, "color": "#fe3401", "label": "80-85%"},
            {"max": 90, "color": "#ea0000", "label": "85-90%"},
            {"max": 95, "color": "#b70000", "label": "90-95%"},
            {"max": 100, "color": "#e10000", "label": "95-100%"},
        ]
    },
    "temperature": {
        "colors": [
            {"max": -40, "color": "#fc00fc", "label": "< -40°F"},
            {"max": -31, "color": "#000085", "label": "-40 to -31°F"},
            {"max": -21, "color": "#0000b2", "label": "-30 to -21°F"},
            {"max": -12, "color": "#0000ec", "label": "-21 to -12°F"},
            {"max": -3, "color": "#0034fe", "label": "-12 to -3°F"},
            {"max": 5, "color": "#0089fe", "label": "-3 to 5°F"},
            {"max": 14, "color": "#00d4fe", "label": "5 to 14°F"},
            {"max": 23, "color": "#1efede", "label": "14 to 23°F"},
            {"max": 32, "color": "#fbfbfb", "label": "23 to 32°F"},
            {"max": 41, "color": "#5efe9e", "label": "32 to 41°F"},
            {"max": 50, "color": "#a2fe5a", "label": "41 to 50°F"},
            {"max": 59, "color": "#fede00", "label": "50 to 59°F"},
            {"max": 68, "color": "#fe9e00", "label": "59 to 68°F"},
            {"max": 77, "color": "#fe5a00", "label": "68 to 77°F"},
            {"max": 86, "color": "#fe1e00", "label": "77 to 86°F"},
            {"max": 95, "color": "#e20000", "label": "86 to 95°F"},
            {"max": 104, "color": "#a90000", "label": "95 to 104°F"},
            {"max": 113, "color": "#7e0000", "label": "104 to 113°F"},
            {"max": 999, "color": "#c6c6c6", "label": ">113°F"},
        ]
    },
    "smoke": {
        "colors": [
            {"max": 2, "color": "#003f7f", "label": "No Smoke"},
            {"max": 5, "color": "#4f8fcf", "label": "5 µg/m³"},
            {"max": 10, "color": "#78bec8", "label": "10 µg/m³"},
            {"max": 20, "color": "#87d2c1", "label": "20 µg/m³"},
            {"max": 40, "color": "#d68f87", "label": "40 µg/m³"},
            {"max": 60, "color": "#c96459", "label": "60 µg/m³"},
            {"max": 80, "color": "#bd3b2d", "label": "80 µg/m³"},
            {"max": 100, "color": "#b51504", "label": "100 µg/m³"},
            {"max": 200, "color": "#654321", "label": "200 µg/m³"},
            {"max": 999, "color": "#37220f", "label": ">500 µg/m³"},
        ]
    }
}


class ForecastBuilder:
    """
    Builds complete forecast from multiple data sources
    """
    
    def __init__(self):
        self.cmc = cmc_fetcher
        self.openmeteo = openmeteo_fetcher
    
    async def build_forecast(self, location: Location, 
                             use_cache: bool = True) -> ForecastResponse:
        """
        Build complete forecast for a location
        """
        logger.info(f"Building forecast for {location.name} ({location.latitude}, {location.longitude})")
        
        # Get timezone offset - handle both Location and ForecastLocation
        if hasattr(location, 'timezone') and location.timezone:
            tz_offset = get_timezone_offset(location.timezone)
        elif hasattr(location, 'tz_offset'):
            tz_offset = location.tz_offset
        else:
            tz_offset = 0
        
        now = datetime.now(timezone.utc)
        start_time = now.replace(minute=0, second=0, microsecond=0)
        
        astro = create_calculator(
            location.latitude, 
            location.longitude,
            location.elevation or 0
        )
        
        model_run, run_datetime = self.cmc.get_latest_model_run()
        
        cmc_data = None
        if self.cmc._grib_available:
            cache_key = f"{location.latitude:.2f}_{location.longitude:.2f}"
            cmc_data = self.cmc.get_cached_forecast(cache_key, model_run)
            
            if cmc_data is None:
                cmc_data = self.cmc.extract_point_forecast(
                    location.latitude,
                    location.longitude,
                    model_run
                )
                
                if cmc_data.get("seeing") or cmc_data.get("transparency"):
                    self.cmc.save_cached_forecast(cache_key, model_run, cmc_data)
                    logger.info(f"Cached CMC data for {location.name}")
        
        openmeteo_data = await self.openmeteo.fetch_forecast(
            location.latitude,
            location.longitude,
            forecast_days=7
        )
        
        # Fetch air quality for smoke
        air_quality = await self.openmeteo.fetch_air_quality(
            location.latitude,
            location.longitude,
            forecast_days=4
        )
        
        darkness_data = astro.calculate_hourly_darkness(start_time, hours=96)
        
        hourly_forecasts = []
        
        cmc_seeing_by_hour = {}
        cmc_transp_by_hour = {}
        cmc_cloud_by_hour = {}
        
        if cmc_data:
            for item in cmc_data.get("seeing", []):
                if item.get("forecast_hour"):
                    cmc_seeing_by_hour[item["forecast_hour"]] = item["value"]
            for item in cmc_data.get("transparency", []):
                if item.get("forecast_hour"):
                    cmc_transp_by_hour[item["forecast_hour"]] = item["value"]
            for item in cmc_data.get("cloud_cover", []):
                if item.get("forecast_hour"):
                    cmc_cloud_by_hour[item["forecast_hour"]] = item["value"]
        
        has_cmc_seeing = len(cmc_seeing_by_hour) > 0
        has_cmc_transp = len(cmc_transp_by_hour) > 0
        
        if has_cmc_seeing or has_cmc_transp:
            logger.info(f"Using CMC astronomy data: {len(cmc_seeing_by_hour)} seeing, {len(cmc_transp_by_hour)} transparency values")
        else:
            logger.info("No CMC astronomy data available, using estimation")
        
        if openmeteo_data.get("available"):
            hourly = openmeteo_data.get("hourly", {})
            times = hourly.get("time", [])
            
            for i, time_str in enumerate(times[:168]):
                try:
                    dt = datetime.fromisoformat(time_str.replace('Z', '+00:00'))
                    if dt.tzinfo is None:
                        dt = dt.replace(tzinfo=timezone.utc)
                except:
                    dt = start_time + timedelta(hours=i)
                
                if dt < start_time:
                    continue
                
                forecast_hour = i + 1
                
                cloud_cover = hourly.get("cloud_cover", [None] * len(times))[i]
                temp_c = hourly.get("temperature_2m", [None] * len(times))[i]
                humidity = hourly.get("relative_humidity_2m", [None] * len(times))[i]
                wind_speed = hourly.get("wind_speed_10m", [None] * len(times))[i]
                wind_dir = hourly.get("wind_direction_10m", [None] * len(times))[i]
                visibility = hourly.get("visibility", [None] * len(times))[i]
                
                cmc_cloud = cmc_cloud_by_hour.get(forecast_hour)
                if cmc_cloud is not None:
                    cloud_cover = cmc_cloud
                
                temp_f = (temp_c * 9/5 + 32) if temp_c is not None else None
                wind_mph = (wind_speed * 0.621371) if wind_speed is not None else None
                
                hours_from_start = int((dt - start_time).total_seconds() / 3600)
                dark = darkness_data[hours_from_start] if 0 <= hours_from_start < len(darkness_data) else {}
                
                if has_cmc_seeing and forecast_hour in cmc_seeing_by_hour:
                    raw_seeing = cmc_seeing_by_hour[forecast_hour]
                    seeing = self.cmc.convert_seeing_value(raw_seeing)
                else:
                    seeing = self._estimate_seeing(cloud_cover, wind_mph)
                
                if has_cmc_transp and forecast_hour in cmc_transp_by_hour:
                    raw_transp = cmc_transp_by_hour[forecast_hour]
                    transparency = self.cmc.convert_transparency_value(raw_transp, cloud_cover)
                else:
                    transparency = self._estimate_transparency(cloud_cover, humidity, visibility)
                
                if cloud_cover is not None and cloud_cover > 90:
                    seeing = "too_cloudy"
                    transparency = "too_cloudy"
                
                # Get smoke (PM2.5)
                smoke = None
                if air_quality.get("available"):
                    aq_hourly = air_quality.get("hourly", {})
                    pm25_list = aq_hourly.get("pm2_5", [])
                    if i < len(pm25_list):
                        smoke = pm25_list[i]
                
                local_dt = dt + timedelta(hours=tz_offset)
                
                hourly_forecast = HourlyForecast(
                    time=dt,
                    hour_local=local_dt.hour,
                    cloud_cover_pct=cloud_cover,
                    cloud_cover_category=self._categorize_cloud(cloud_cover),
                    ecmwf_cloud_pct=hourly.get("cloud_cover", [None] * len(times))[i],
                    ecmwf_cloud_category=self._categorize_cloud(hourly.get("cloud_cover", [None] * len(times))[i]),
                    transparency=transparency,
                    seeing=seeing,
                    darkness=dark.get("limiting_mag"),
                    is_daylight=dark.get("is_daylight", False),
                    moon_illumination=dark.get("moon_illumination"),
                    wind_speed_mph=wind_mph,
                    wind_direction=wind_dir,
                    humidity_pct=humidity,
                    temperature_f=temp_f,
                    smoke_ugm3=smoke,
                    is_connected_block=False
                )
                hourly_forecasts.append(hourly_forecast)
                
                if len(hourly_forecasts) >= 96:
                    break
        
        if not hourly_forecasts:
            for i, dark in enumerate(darkness_data):
                dt = start_time + timedelta(hours=i)
                local_dt = dt + timedelta(hours=tz_offset)
                
                hourly_forecast = HourlyForecast(
                    time=dt,
                    hour_local=local_dt.hour,
                    darkness=dark.get("limiting_mag"),
                    is_daylight=dark.get("is_daylight", False),
                    moon_illumination=dark.get("moon_illumination"),
                )
                hourly_forecasts.append(hourly_forecast)
        
        days = self._group_by_day(hourly_forecasts, tz_offset)
        
        forecast_run_str = f"{run_datetime.strftime('%Y-%m-%dT%H')}:00:00Z"
        
        return ForecastResponse(
            location=None,
            generated_at=datetime.now(timezone.utc),
            forecast_run=forecast_run_str,
            forecast_hours=len(hourly_forecasts),
            days=days,
            color_scales=COLOR_SCALES
        )
    
    def _categorize_cloud(self, cloud_pct: Optional[float]) -> Optional[str]:
        if cloud_pct is None:
            return None
        if cloud_pct < 10:
            return "clear"
        elif cloud_pct < 30:
            return "mostly_clear"
        elif cloud_pct < 50:
            return "partly_cloudy"
        elif cloud_pct < 70:
            return "mostly_cloudy"
        elif cloud_pct < 90:
            return "cloudy"
        else:
            return "overcast"
    
    def _estimate_transparency(self, cloud: Optional[float], 
                               humidity: Optional[float],
                               visibility: Optional[float]) -> Optional[str]:
        if cloud is not None and cloud > 30:
            return "too_cloudy"
        
        if humidity is None:
            return None
        
        if humidity > 85:
            return "poor"
        elif humidity > 70:
            return "below_avg"
        elif humidity > 55:
            return "average"
        elif humidity > 40:
            return "above_avg"
        else:
            return "transparent"
    
    def _estimate_seeing(self, cloud: Optional[float], 
                         wind_mph: Optional[float]) -> Optional[str]:
        if cloud is not None and cloud > 80:
            return "too_cloudy"
        
        if wind_mph is None:
            return "poor"
        
        if wind_mph > 20:
            return "bad"
        elif wind_mph > 12:
            return "poor"
        elif wind_mph > 6:
            return "average"
        else:
            return "good"
    
    def _group_by_day(self, forecasts: List[HourlyForecast], 
                      tz_offset: float) -> List[DayForecast]:
        days_dict: Dict[str, List[HourlyForecast]] = {}
        
        for f in forecasts:
            local_dt = f.time + timedelta(hours=tz_offset)
            date_str = local_dt.strftime("%Y-%m-%d")
            
            if date_str not in days_dict:
                days_dict[date_str] = []
            days_dict[date_str].append(f)
        
        days = []
        for date_str in sorted(days_dict.keys()):
            days.append(DayForecast(
                date=date_str,
                hours=days_dict[date_str]
            ))
        
        return days


forecast_builder = ForecastBuilder()