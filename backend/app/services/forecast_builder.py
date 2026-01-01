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
    Location, HourlyForecast, DayForecast, ForecastResponse
)
from .cmc_fetcher import cmc_fetcher, openmeteo_fetcher
from .astro_calculator import create_calculator

logger = logging.getLogger(__name__)


# Color scales matching Clear Sky Chart
COLOR_SCALES = {
    "cloud_cover": {
        "colors": [
            {"max": 10, "color": "#0000aa", "label": "Clear"},
            {"max": 20, "color": "#0033bb", "label": "10% covered"},
            {"max": 30, "color": "#0066cc", "label": "20% covered"},
            {"max": 40, "color": "#0099dd", "label": "30% covered"},
            {"max": 50, "color": "#33aaee", "label": "40% covered"},
            {"max": 60, "color": "#66bbee", "label": "50% covered"},
            {"max": 70, "color": "#99ccee", "label": "60% covered"},
            {"max": 80, "color": "#bbddee", "label": "70% covered"},
            {"max": 90, "color": "#ddeeff", "label": "80% covered"},
            {"max": 95, "color": "#eef5ff", "label": "90% covered"},
            {"max": 100, "color": "#ffffff", "label": "Overcast"},
        ]
    },
    "transparency": {
        "colors": [
            {"value": "too_cloudy", "color": "#ffffff", "label": "Too cloudy"},
            {"value": "poor", "color": "#99bbdd", "label": "Poor"},
            {"value": "below_avg", "color": "#6699cc", "label": "Below Average"},
            {"value": "average", "color": "#3377aa", "label": "Average"},
            {"value": "above_avg", "color": "#115588", "label": "Above Average"},
            {"value": "transparent", "color": "#003366", "label": "Transparent"},
        ]
    },
    "seeing": {
        "colors": [
            {"value": "too_cloudy", "color": "#ffffff", "label": "Too cloudy"},
            {"value": "bad", "color": "#cc6666", "label": "Bad 1/5"},
            {"value": "poor", "color": "#cc9966", "label": "Poor 2/5"},
            {"value": "average", "color": "#cccc66", "label": "Average 3/5"},
            {"value": "good", "color": "#99cc66", "label": "Good 4/5"},
            {"value": "excellent", "color": "#66cc66", "label": "Excellent 5/5"},
        ]
    },
    "darkness": {
        "colors": [
            {"max": -3, "color": "#ffffff", "label": "Daylight"},
            {"max": -1, "color": "#ffffaa", "label": "Dusk"},
            {"max": 1, "color": "#aaffff", "label": "Twilight"},
            {"max": 3, "color": "#aaddff", "label": "Bright Moon"},
            {"max": 4.5, "color": "#5599dd", "label": "Partial Moon"},
            {"max": 5.5, "color": "#2266aa", "label": "Dim Moon"},
            {"max": 7, "color": "#001144", "label": "Dark Sky"},
        ]
    },
    "wind": {
        "colors": [
            {"max": 5, "color": "#004400", "label": "0-5 mph"},
            {"max": 11, "color": "#006600", "label": "6-11 mph"},
            {"max": 16, "color": "#228822", "label": "12-16 mph"},
            {"max": 28, "color": "#66aa66", "label": "17-28 mph"},
            {"max": 45, "color": "#aacc88", "label": "29-45 mph"},
            {"max": 999, "color": "#ddddaa", "label": ">45 mph"},
        ]
    },
    "humidity": {
        "colors": [
            {"max": 25, "color": "#663300", "label": "<25%"},
            {"max": 30, "color": "#774411", "label": "25-30%"},
            {"max": 35, "color": "#885522", "label": "30-35%"},
            {"max": 40, "color": "#996633", "label": "35-40%"},
            {"max": 45, "color": "#aa7744", "label": "40-45%"},
            {"max": 50, "color": "#bb8855", "label": "45-50%"},
            {"max": 55, "color": "#cc9966", "label": "50-55%"},
            {"max": 60, "color": "#ddaa77", "label": "55-60%"},
            {"max": 65, "color": "#eebb88", "label": "60-65%"},
            {"max": 70, "color": "#ffcc99", "label": "65-70%"},
            {"max": 75, "color": "#ffddaa", "label": "70-75%"},
            {"max": 80, "color": "#ffeebb", "label": "75-80%"},
            {"max": 85, "color": "#ffffcc", "label": "80-85%"},
            {"max": 90, "color": "#eeffdd", "label": "85-90%"},
            {"max": 95, "color": "#ddfff0", "label": "90-95%"},
            {"max": 100, "color": "#ccffff", "label": "95-100%"},
        ]
    },
    "temperature": {
        # Temperature in Fahrenheit
        "colors": [
            {"max": -40, "color": "#4400aa", "label": "< -40°F"},
            {"max": -31, "color": "#5500bb", "label": "-40 to -31°F"},
            {"max": -21, "color": "#6600cc", "label": "-30 to -21°F"},
            {"max": -12, "color": "#7722dd", "label": "-21 to -12°F"},
            {"max": -3, "color": "#8844ee", "label": "-12 to -3°F"},
            {"max": 5, "color": "#9966ff", "label": "-3 to 5°F"},
            {"max": 14, "color": "#aa88ff", "label": "5 to 14°F"},
            {"max": 23, "color": "#aaaaff", "label": "14 to 23°F"},
            {"max": 32, "color": "#88ccff", "label": "23 to 32°F"},
            {"max": 41, "color": "#66eeff", "label": "32 to 41°F"},
            {"max": 50, "color": "#44ffcc", "label": "41 to 50°F"},
            {"max": 59, "color": "#66ff99", "label": "50 to 59°F"},
            {"max": 68, "color": "#88ff66", "label": "59 to 68°F"},
            {"max": 77, "color": "#aaff44", "label": "68 to 77°F"},
            {"max": 86, "color": "#ccff22", "label": "77 to 86°F"},
            {"max": 95, "color": "#ffcc00", "label": "86 to 95°F"},
            {"max": 104, "color": "#ff9900", "label": "95 to 104°F"},
            {"max": 113, "color": "#ff6600", "label": "104 to 113°F"},
            {"max": 999, "color": "#ff3300", "label": ">113°F"},
        ]
    },
    "smoke": {
        "colors": [
            {"max": 1, "color": "#004488", "label": "No Smoke"},
            {"max": 2, "color": "#226699", "label": "2 µg/m³"},
            {"max": 5, "color": "#4488aa", "label": "5 µg/m³"},
            {"max": 10, "color": "#66aabb", "label": "10 µg/m³"},
            {"max": 20, "color": "#88bbcc", "label": "20 µg/m³"},
            {"max": 40, "color": "#ffaaaa", "label": "40 µg/m³"},
            {"max": 60, "color": "#ff8888", "label": "60 µg/m³"},
            {"max": 80, "color": "#ff6666", "label": "80 µg/m³"},
            {"max": 100, "color": "#ff4444", "label": "100 µg/m³"},
            {"max": 200, "color": "#cc3333", "label": "200 µg/m³"},
            {"max": 999, "color": "#884422", "label": ">500 µg/m³"},
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
        
        Combines:
        - CMC astronomy data (seeing, transparency)
        - CMC RDPS data (clouds, wind, temp, humidity)
        - Open-Meteo ECMWF (comparison cloud layer)
        - Calculated darkness/moon data
        """
        logger.info(f"Building forecast for {location.name}")
        
        # Get current time and round to nearest hour
        now = datetime.now(timezone.utc)
        start_time = now.replace(minute=0, second=0, microsecond=0)
        
        # Create astro calculator for this location
        astro = create_calculator(
            location.latitude, 
            location.longitude,
            location.elevation or 0
        )
        
        # Fetch data from all sources
        # For now, primarily use Open-Meteo as it's the most reliable source
        # CMC GRIB2 parsing would require additional setup
        
        openmeteo_data = await self.openmeteo.fetch_forecast(
            location.latitude,
            location.longitude,
            forecast_days=7
        )
        
        # Calculate darkness for all hours
        darkness_data = astro.calculate_hourly_darkness(start_time, hours=84)
        
        # Build hourly forecasts
        hourly_forecasts = []
        
        if openmeteo_data.get("available"):
            hourly = openmeteo_data.get("hourly", {})
            times = hourly.get("time", [])
            
            for i, time_str in enumerate(times[:84]):  # Limit to 84 hours
                # Parse time
                try:
                    dt = datetime.fromisoformat(time_str.replace('Z', '+00:00'))
                except:
                    dt = start_time + timedelta(hours=i)
                
                # Get values from Open-Meteo
                cloud_cover = hourly.get("cloud_cover", [None] * len(times))[i]
                temp_c = hourly.get("temperature_2m", [None] * len(times))[i]
                humidity = hourly.get("relative_humidity_2m", [None] * len(times))[i]
                wind_speed = hourly.get("wind_speed_10m", [None] * len(times))[i]
                wind_dir = hourly.get("wind_direction_10m", [None] * len(times))[i]
                visibility = hourly.get("visibility", [None] * len(times))[i]
                
                # Convert temperature to Fahrenheit
                temp_f = (temp_c * 9/5 + 32) if temp_c is not None else None
                
                # Convert wind speed from km/h to mph
                wind_mph = (wind_speed * 0.621371) if wind_speed is not None else None
                
                # Get darkness data
                dark = darkness_data[i] if i < len(darkness_data) else {}
                
                # Estimate transparency from humidity and visibility
                # (This is an approximation - real CMC data would be better)
                transparency = self._estimate_transparency(cloud_cover, humidity, visibility)
                
                # Estimate seeing from wind and cloud data
                # (This is an approximation - real CMC data would be better)
                seeing = self._estimate_seeing(cloud_cover, wind_mph)
                
                # Local hour (adjusted for timezone)
                local_dt = dt + timedelta(hours=location.timezone_offset)
                
                hourly_forecast = HourlyForecast(
                    time=dt,
                    hour_local=local_dt.hour,
                    cloud_cover_pct=cloud_cover,
                    cloud_cover_category=self._categorize_cloud(cloud_cover),
                    ecmwf_cloud_pct=cloud_cover,  # Using same source for now
                    ecmwf_cloud_category=self._categorize_cloud(cloud_cover),
                    transparency=transparency,
                    seeing=seeing,
                    darkness=dark.get("limiting_mag"),
                    is_daylight=dark.get("is_daylight", False),
                    moon_illumination=dark.get("moon_illumination"),
                    wind_speed_mph=wind_mph,
                    wind_direction=wind_dir,
                    humidity_pct=humidity,
                    temperature_f=temp_f,
                    smoke_ugm3=None,  # Would need separate data source
                    is_connected_block=False
                )
                hourly_forecasts.append(hourly_forecast)
        
        # If no data available, create placeholder forecasts with just darkness
        if not hourly_forecasts:
            for i, dark in enumerate(darkness_data):
                dt = start_time + timedelta(hours=i)
                local_dt = dt + timedelta(hours=location.timezone_offset)
                
                hourly_forecast = HourlyForecast(
                    time=dt,
                    hour_local=local_dt.hour,
                    darkness=dark.get("limiting_mag"),
                    is_daylight=dark.get("is_daylight", False),
                    moon_illumination=dark.get("moon_illumination"),
                )
                hourly_forecasts.append(hourly_forecast)
        
        # Group into days
        days = self._group_by_day(hourly_forecasts, location.timezone_offset)
        
        return ForecastResponse(
            location=location,
            generated_at=datetime.now(timezone.utc),
            forecast_run=start_time.strftime("%Y-%m-%dT%H:00:00Z"),
            forecast_hours=len(hourly_forecasts),
            days=days,
            color_scales=COLOR_SCALES
        )
    
    def _categorize_cloud(self, cloud_pct: Optional[float]) -> Optional[str]:
        """Categorize cloud cover percentage"""
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
        """
        Estimate transparency from available data
        
        Real CMC transparency uses precipitable water vapor.
        This is a rough approximation.
        """
        if cloud is not None and cloud > 30:
            return "too_cloudy"
        
        if humidity is None:
            return None
        
        # Higher humidity = worse transparency
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
        """
        Estimate seeing from available data
        
        Real CMC seeing uses atmospheric turbulence models.
        This is a rough approximation based on wind.
        """
        if cloud is not None and cloud > 80:
            return "too_cloudy"
        
        if wind_mph is None:
            return "average"
        
        # Higher wind often correlates with worse seeing
        # But relationship is complex
        if wind_mph > 25:
            return "bad"
        elif wind_mph > 15:
            return "poor"
        elif wind_mph > 8:
            return "average"
        elif wind_mph > 3:
            return "good"
        else:
            return "excellent"
    
    def _group_by_day(self, forecasts: List[HourlyForecast], 
                      tz_offset: int) -> List[DayForecast]:
        """Group hourly forecasts by local date"""
        days_dict: Dict[str, List[HourlyForecast]] = {}
        
        for f in forecasts:
            local_dt = f.time + timedelta(hours=tz_offset)
            date_str = local_dt.strftime("%Y-%m-%d")
            
            if date_str not in days_dict:
                days_dict[date_str] = []
            days_dict[date_str].append(f)
        
        # Convert to list of DayForecast
        days = []
        for date_str in sorted(days_dict.keys()):
            days.append(DayForecast(
                date=date_str,
                hours=days_dict[date_str]
            ))
        
        return days


# Singleton
forecast_builder = ForecastBuilder()
