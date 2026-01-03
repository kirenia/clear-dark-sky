"""
Data models for Clear Dark Sky
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

def get_timezone_offset(timezone_str: str) -> float:
    """Get current UTC offset for a timezone string."""
    from zoneinfo import ZoneInfo
    try:
        tz = ZoneInfo(timezone_str)
        return datetime.now(tz).utcoffset().total_seconds() / 3600
    except:
        return -7  # Default Mountain


class LocationBase(BaseModel):
    """Base location model"""
    name: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    country: str
    region: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    timezone: str = "America/New_York"
    elevation: Optional[float] = None  # meters


class LocationCreate(LocationBase):
    """For creating new locations"""
    key: str  # ClearDarkSky key e.g. "CtsldBH"


class Location(LocationBase):
    """Full location model with key"""
    id: int
    key: str
    is_active: bool = True
    created_at: datetime
    
    class Config:
        from_attributes = True


class LocationSummary(BaseModel):
    """Lightweight location for lists"""
    key: str
    name: str
    country: str
    region: Optional[str] = None
    category: Optional[str] = None
    latitude: float
    longitude: float


# Forecast value enums matching CMC categories
class CloudCover(str, Enum):
    CLEAR = "clear"           # 0-10%
    MOSTLY_CLEAR = "mostly_clear"  # 10-30%
    PARTLY_CLOUDY = "partly_cloudy"  # 30-50%
    MOSTLY_CLOUDY = "mostly_cloudy"  # 50-70%
    CLOUDY = "cloudy"         # 70-90%
    OVERCAST = "overcast"     # 90-100%


class Transparency(str, Enum):
    TOO_CLOUDY = "too_cloudy"
    POOR = "poor"
    BELOW_AVG = "below_avg"
    AVERAGE = "average"
    ABOVE_AVG = "above_avg"
    TRANSPARENT = "transparent"


class Seeing(str, Enum):
    TOO_CLOUDY = "too_cloudy"
    BAD = "bad"      # 1/5
    POOR = "poor"    # 2/5
    AVERAGE = "average"  # 3/5
    GOOD = "good"    # 4/5
    EXCELLENT = "excellent"  # 5/5


class HourlyForecast(BaseModel):
    """Single hour forecast data"""
    time: datetime
    hour_local: int  # 0-23
    
    # Sky conditions
    cloud_cover_pct: Optional[float] = None  # 0-100
    cloud_cover_category: Optional[str] = None
    
    ecmwf_cloud_pct: Optional[float] = None  # ECMWF comparison
    ecmwf_cloud_category: Optional[str] = None
    
    transparency: Optional[str] = None
    transparency_value: Optional[float] = None
    
    seeing: Optional[str] = None
    seeing_value: Optional[float] = None
    
    # Darkness (calculated from sun/moon)
    darkness: Optional[float] = None  # limiting magnitude
    is_daylight: bool = False
    moon_illumination: Optional[float] = None
    
    # Ground conditions
    smoke_ugm3: Optional[float] = None  # micrograms per cubic meter
    
    wind_speed_mph: Optional[float] = None
    wind_direction: Optional[float] = None  # degrees
    
    humidity_pct: Optional[float] = None
    
    temperature_f: Optional[float] = None
    
    # Metadata
    is_connected_block: bool = False  # For 3-hour seeing blocks etc.


class DayForecast(BaseModel):
    """A single day's worth of hourly forecasts"""
    date: str  # YYYY-MM-DD
    hours: List[HourlyForecast]


class ForecastResponse(BaseModel):
    """Full forecast response for a location"""
    location: Optional[LocationSummary] = None  
    generated_at: datetime
    forecast_run: Optional[str] = None  # e.g., "2024-01-15T12:00:00Z"
    forecast_hours: int = 84
    days: List[DayForecast]
    
    # Color scales for frontend
    color_scales: Dict[str, Any] = {}


class EmbedConfig(BaseModel):
    """Configuration for embeddable chart"""
    location_id: str
    width: int = 600
    height: int = 300
    show_extended: bool = False
    theme: str = "light"


class EmbedResponse(BaseModel):
    """Response with embed code"""
    html: str
    image_url: str
    page_url: str
