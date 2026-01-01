"""
Astronomical Calculations Service
Calculates darkness, limiting magnitude, sun/moon positions
"""

import math
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class AstroCalculator:
    """
    Calculates astronomical conditions for a given location and time.
    
    Based on Ben Sugerman's Limiting Magnitude calculations,
    same as used by Clear Sky Charts.
    """
    
    # Solar cycle approximation (affects sky brightness)
    SOLAR_CYCLE_YEARS = 11.0
    SOLAR_CYCLE_REF = 2024.5  # Approximate solar max
    
    def __init__(self, latitude: float, longitude: float, elevation: float = 0):
        self.lat = latitude
        self.lon = longitude
        self.elevation = elevation  # meters
        self._ephem_available = self._check_ephem()
    
    def _check_ephem(self) -> bool:
        """Check if ephem library is available"""
        try:
            import ephem
            return True
        except ImportError:
            logger.warning("ephem library not available. Using simplified calculations.")
            return False
    
    def calculate_darkness(self, dt: datetime) -> Dict[str, any]:
        """
        Calculate sky darkness and related parameters
        
        Returns:
            limiting_mag: Visual limiting magnitude at zenith
            is_daylight: True if sun is above horizon
            twilight_type: 'day', 'civil', 'nautical', 'astronomical', 'night'
            moon_illumination: 0-1 moon phase
            moon_altitude: Degrees above horizon
        """
        if self._ephem_available:
            return self._calculate_with_ephem(dt)
        else:
            return self._calculate_simplified(dt)
    
    def _calculate_with_ephem(self, dt: datetime) -> Dict[str, any]:
        """Full calculation using ephem library"""
        import ephem
        
        # Create observer
        obs = ephem.Observer()
        obs.lat = str(self.lat)
        obs.lon = str(self.lon)
        obs.elevation = self.elevation
        obs.date = dt
        
        # Sun calculations
        sun = ephem.Sun(obs)
        sun_alt = float(sun.alt) * 180 / math.pi  # Convert to degrees
        
        # Moon calculations
        moon = ephem.Moon(obs)
        moon_alt = float(moon.alt) * 180 / math.pi
        moon_phase = moon.phase / 100.0  # 0-1
        
        # Determine twilight type
        if sun_alt > 0:
            twilight = "day"
            is_daylight = True
        elif sun_alt > -6:
            twilight = "civil"
            is_daylight = False
        elif sun_alt > -12:
            twilight = "nautical"
            is_daylight = False
        elif sun_alt > -18:
            twilight = "astronomical"
            is_daylight = False
        else:
            twilight = "night"
            is_daylight = False
        
        # Calculate limiting magnitude
        lim_mag = self._calculate_limiting_magnitude(
            sun_alt, moon_alt, moon_phase, dt
        )
        
        return {
            "limiting_mag": lim_mag,
            "is_daylight": is_daylight,
            "twilight_type": twilight,
            "sun_altitude": sun_alt,
            "moon_illumination": moon_phase,
            "moon_altitude": moon_alt
        }
    
    def _calculate_simplified(self, dt: datetime) -> Dict[str, any]:
        """Simplified calculation without ephem"""
        # Approximate sun altitude based on time and date
        hour = dt.hour + dt.minute / 60.0
        day_of_year = dt.timetuple().tm_yday
        
        # Very rough approximation
        # Solar noon is approximately when hour angle = 0
        solar_noon = 12 - self.lon / 15  # Approximate
        hour_angle = (hour - solar_noon) * 15  # degrees
        
        # Declination approximation
        declination = 23.45 * math.sin(math.radians((day_of_year - 81) * 360 / 365))
        
        # Altitude approximation
        sin_alt = (math.sin(math.radians(self.lat)) * math.sin(math.radians(declination)) +
                   math.cos(math.radians(self.lat)) * math.cos(math.radians(declination)) *
                   math.cos(math.radians(hour_angle)))
        sun_alt = math.degrees(math.asin(max(-1, min(1, sin_alt))))
        
        # Simple moon phase approximation (synodic month = 29.53 days)
        # Reference: Jan 1, 2024 was approximately new moon
        ref_date = datetime(2024, 1, 11)
        days_since = (dt - ref_date).days
        moon_phase = (days_since % 29.53) / 29.53
        # Convert to illumination (0 at new moon, 1 at full moon)
        moon_illumination = (1 - math.cos(moon_phase * 2 * math.pi)) / 2
        
        # Rough moon altitude (simplified)
        moon_alt = 45 * math.sin(hour_angle * math.pi / 180) if not (6 < hour < 18) else -10
        
        # Determine twilight
        if sun_alt > 0:
            twilight = "day"
            is_daylight = True
        elif sun_alt > -6:
            twilight = "civil"
            is_daylight = False
        elif sun_alt > -12:
            twilight = "nautical"
            is_daylight = False
        elif sun_alt > -18:
            twilight = "astronomical"
            is_daylight = False
        else:
            twilight = "night"
            is_daylight = False
        
        lim_mag = self._calculate_limiting_magnitude(
            sun_alt, moon_alt, moon_illumination, dt
        )
        
        return {
            "limiting_mag": lim_mag,
            "is_daylight": is_daylight,
            "twilight_type": twilight,
            "sun_altitude": sun_alt,
            "moon_illumination": moon_illumination,
            "moon_altitude": moon_alt
        }
    
    def _calculate_limiting_magnitude(self, sun_alt: float, moon_alt: float,
                                      moon_phase: float, dt: datetime) -> float:
        """
        Calculate visual limiting magnitude at zenith
        
        Based on Schaefer (1990) and Sugerman's implementation
        """
        # Start with ideal dark sky (Bortle 1)
        base_mag = 7.0
        
        # Sun contribution
        if sun_alt > 0:
            # Daylight - can't see stars
            return -4.0
        elif sun_alt > -6:
            # Civil twilight
            base_mag = -2.0 + (sun_alt + 6) * -0.33
        elif sun_alt > -12:
            # Nautical twilight
            base_mag = 2.0 + (sun_alt + 12) * -0.67
        elif sun_alt > -18:
            # Astronomical twilight
            base_mag = 5.5 + (sun_alt + 18) * -0.58
        
        # Moon contribution (only if moon is up)
        if moon_alt > 0:
            # Bright moon reduces limiting magnitude
            moon_brightness = moon_phase * (1 + 0.5 * math.sin(math.radians(moon_alt)))
            moon_reduction = moon_brightness * 2.5
            base_mag -= moon_reduction
        
        # Solar cycle effect (brighter sky during solar max)
        years_from_max = abs(dt.year + dt.month/12 - self.SOLAR_CYCLE_REF)
        cycle_phase = math.cos(2 * math.pi * years_from_max / self.SOLAR_CYCLE_YEARS)
        solar_effect = 0.1 * (1 + cycle_phase) / 2
        base_mag -= solar_effect
        
        # Clamp to reasonable range
        return max(-4.0, min(7.0, base_mag))
    
    def get_darkness_color_code(self, limiting_mag: float) -> str:
        """
        Convert limiting magnitude to color code for chart display
        
        Matches Clear Sky Chart color scale
        """
        if limiting_mag < -3:
            return "daylight"      # White
        elif limiting_mag < -1:
            return "dusk"          # Yellow
        elif limiting_mag < 1:
            return "twilight"      # Light turquoise
        elif limiting_mag < 3:
            return "bright_moon"   # Light blue
        elif limiting_mag < 4.5:
            return "partial_moon"  # Medium blue
        elif limiting_mag < 5.5:
            return "dim_moon"      # Deep blue
        else:
            return "dark"          # Black/very dark blue
    
    def calculate_hourly_darkness(self, start_time: datetime, 
                                   hours: int = 84) -> List[Dict]:
        """
        Calculate darkness for multiple hours
        
        Returns list of hourly darkness data
        """
        results = []
        current = start_time
        
        for i in range(hours):
            darkness = self.calculate_darkness(current)
            darkness["time"] = current.isoformat()
            darkness["hour"] = i
            darkness["color_code"] = self.get_darkness_color_code(
                darkness["limiting_mag"]
            )
            results.append(darkness)
            current += timedelta(hours=1)
        
        return results


# Factory function
def create_calculator(lat: float, lon: float, elevation: float = 0) -> AstroCalculator:
    return AstroCalculator(lat, lon, elevation)
