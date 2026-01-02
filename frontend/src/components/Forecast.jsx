import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '../config';
import './Home.css';
import './Forecast.css';

// Color scales
const COLORS = {
  cloud: [
    { max: 10, color: '#004080', label: 'Clear' },
    { max: 20, color: '#0050a0', label: '10%' },
    { max: 30, color: '#0060b8', label: '20%' },
    { max: 40, color: '#2070c0', label: '30%' },
    { max: 50, color: '#4084c8', label: '40%' },
    { max: 60, color: '#6098d0', label: '50%' },
    { max: 70, color: '#80acd8', label: '60%' },
    { max: 80, color: '#a0c0e0', label: '70%' },
    { max: 90, color: '#c0d4e8', label: '80%' },
    { max: 100, color: '#e0e8f0', label: '90%' },
    { max: 101, color: '#ffffff', label: 'Overcast' }
  ],
  transparency: [
    { value: 'too_cloudy', color: '#ffffff', label: 'Too Cloudy' },
    { value: 'poor', color: '#c0a080', label: 'Poor' },
    { value: 'below_avg', color: '#90b090', label: 'Below Avg' },
    { value: 'average', color: '#60c0a0', label: 'Average' },
    { value: 'above_avg', color: '#40d0b0', label: 'Above Avg' },
    { value: 'transparent', color: '#20e0c0', label: 'Transparent' }
  ],
  seeing: [
    { value: 'too_cloudy', color: '#ffffff', label: 'Too Cloudy' },
    { value: 'bad', color: '#e04040', label: 'Bad 1/5' },
    { value: 'poor', color: '#e08040', label: 'Poor 2/5' },
    { value: 'average', color: '#e0c040', label: 'Average 3/5' },
    { value: 'good', color: '#80c040', label: 'Good 4/5' },
    { value: 'excellent', color: '#40a040', label: 'Excellent 5/5' }
  ],
  darkness: [
    { max: 0.5, color: '#ffffff', label: 'Day' },
    { max: 1.5, color: '#ffe080', label: 'Dusk' },
    { max: 2.5, color: '#40e0d0', label: 'Twilight' },
    { max: 4.0, color: '#80c0e0', label: 'Full Moon' },
    { max: 5.5, color: '#4080c0', label: 'Partial Moon' },
    { max: 7.0, color: '#000020', label: 'Dark' }
  ],
  smoke: [
    { max: 1, color: '#e0f0ff', label: 'None' },
    { max: 5, color: '#c0e0f0', label: '2 µg/m³' },
    { max: 10, color: '#a0d0e0', label: '5' },
    { max: 20, color: '#80c0d0', label: '10' },
    { max: 40, color: '#c0a080', label: '20' },
    { max: 60, color: '#e08060', label: '40' },
    { max: 80, color: '#e04040', label: '60' },
    { max: 100, color: '#c02020', label: '80' },
    { max: 200, color: '#a00000', label: '100' },
    { max: 1000, color: '#600000', label: '200+' }
  ],
  wind: [
    { max: 5, color: '#40a0c0', label: '0-5 mph' },
    { max: 11, color: '#80c0a0', label: '6-11' },
    { max: 16, color: '#c0e080', label: '12-16' },
    { max: 28, color: '#ffc040', label: '17-28' },
    { max: 45, color: '#ff8040', label: '29-45' },
    { max: 200, color: '#ff4040', label: '>45 mph' }
  ],
  humidity: [
    { max: 25, color: '#ffe0c0', label: '<25%' },
    { max: 40, color: '#e0d0a0', label: '25-40%' },
    { max: 55, color: '#c0d0a0', label: '40-55%' },
    { max: 70, color: '#a0d0c0', label: '55-70%' },
    { max: 85, color: '#80c0e0', label: '70-85%' },
    { max: 100, color: '#60a0e0', label: '85%+' }
  ],
  temperature: [
    { max: 32, color: '#0080ff', label: '<32°F' },
    { max: 50, color: '#00c0c0', label: '32-50°F' },
    { max: 68, color: '#40c040', label: '50-68°F' },
    { max: 86, color: '#c0c000', label: '68-86°F' },
    { max: 104, color: '#ff8000', label: '86-104°F' },
    { max: 200, color: '#ff0000', label: '>104°F' }
  ]
};

function getColor(value, scale, type = 'range') {
  if (value === null || value === undefined) {
    const nullEntry = scale.find(s => s.value === 'too_cloudy' || s.value === null);
    return nullEntry ? nullEntry.color : '#ffffff';
  }
  
  // For scales with 'value' (exact match by string)
  if (type === 'value' || scale[0]?.value !== undefined) {
    const entry = scale.find(s => s.value === value);
    return entry ? entry.color : '#ffffff';
  }
  
  // For scales with 'max' (range)
  for (const entry of scale) {
    if (value <= entry.max) {
      return entry.color;
    }
  }
  return scale[scale.length - 1].color;
}

function formatHour(hour) {
  const top = Math.floor(hour / 10);
  const bottom = hour % 10;
  return { top: top || '', bottom };
}

function Forecast() {
  const { key } = useParams();
  const [location, setLocation] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchForecast() {
      try {
        const res = await fetch(`${API_URL}/api/forecast/${key}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Location not found');
          }
          throw new Error('Failed to fetch forecast');
        }
        const data = await res.json();
        setLocation(data.location);
        setForecast(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchForecast();
  }, [key]);

  if (loading) {
    return <div className="forecast forecast--loading">Loading forecast...</div>;
  }

  if (error) {
    return (
      <div className="forecast forecast--error">
        <h1>Chart Not Found</h1>
        <p>{error}</p>
        <Link to="/">← Back to Home</Link>
      </div>
    );
  }

  // Flatten hours from days
  const allHours = forecast.days.flatMap(day => day.hours);

  const rows = [
    { key: 'cloud_cover_pct', label: 'Cloud Cover', scale: COLORS.cloud, type: 'range' },
    { key: 'transparency', label: 'Transparency', scale: COLORS.transparency, type: 'value' },
    { key: 'seeing', label: 'Seeing', scale: COLORS.seeing, type: 'value' },
    { key: 'darkness', label: 'Darkness', scale: COLORS.darkness, type: 'range' },
    { key: 'smoke_ugm3', label: 'Smoke', scale: COLORS.smoke, type: 'range' },
    { key: 'wind_speed_mph', label: 'Wind', scale: COLORS.wind, type: 'range' },
    { key: 'humidity_pct', label: 'Humidity', scale: COLORS.humidity, type: 'range' },
    { key: 'temperature_f', label: 'Temperature', scale: COLORS.temperature, type: 'range' }
  ];

  return (
    <div className="forecast">
      <div className="chart-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> &gt; {location.name}
        </div>
        
        <h1 className="chart-title">
          {location.name} <span className="chart-subtitle">Clear Sky Chart</span>
        </h1>
        
        <div className="chart-meta">
          <span className="chart-coords">
            {location.latitude?.toFixed(3)}°, {location.longitude?.toFixed(3)}°
          </span>
          {location.region && (
            <span className="chart-region">{location.region}, {location.country}</span>
          )}
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-updated">
          Forecast run: {forecast.forecast_run}
        </div>

        <div className="chart-controls">
          <h3>Chart Controls</h3>
          <ol>
            <li>Hold your mouse over a block to explain color and details.</li>
            <li>Click on a forecast block to show full forecast map</li>
            <li>Check box to display color legend: <input type="checkbox" id="showLegend" /></li>
          </ol>
        </div>
        
        <div className="forecast-chart">
          {/* Time header */}
          <div className="chart-row chart-row--header">
            <div className="chart-label"></div>
            <div className="chart-cells">
              {allHours.map((hour, i) => {
                const { top, bottom } = formatHour(hour.hour_local);
                const prevHour = i > 0 ? allHours[i-1] : null;
                const isNewDay = !prevHour || 
                  new Date(hour.time).getDate() !== new Date(prevHour.time).getDate();
                return (
                  <div key={i} className={`chart-cell chart-cell--time ${isNewDay ? 'chart-cell--new-day' : ''}`}>
                    <span className="time-top">{top}</span>
                    <span className="time-bottom">{bottom}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date header */}
          <div className="chart-row chart-row--dates">
            <div className="chart-label"></div>
            <div className="chart-cells">
              {forecast.days.map((day, i) => (
                <div 
                  key={i} 
                  className="chart-date-span"
                  style={{ width: `${(day.hours.length / allHours.length) * 100}%` }}
                >
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              ))}
            </div>
          </div>

          {/* Forecast rows */}
          {rows.map(row => (
            <div key={row.key} className="chart-row">
              <div className="chart-label">{row.label}</div>
              <div className="chart-cells">
                {allHours.map((hour, i) => (
                  <div
                    key={i}
                    className="chart-cell"
                    style={{ backgroundColor: getColor(hour[row.key], row.scale, row.type) }}
                    title={`${row.label}: ${hour[row.key] ?? 'N/A'}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-legend">
        <h3>Legend</h3>
        <div className="legend-grid">
          {rows.slice(0, 4).map(row => (
            <div key={row.key} className="legend-row">
              <strong>{row.label}</strong>
              <div className="legend-scale">
                {row.scale.filter(s => s.value !== 'too_cloudy').slice(0, 6).map((s, i) => (
                  <div key={i} className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: s.color }}></span>
                    <span className="legend-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="legend-link">
          <Link to="/docs">Full guide to reading charts →</Link>
        </p>
      </div>

      <div className="chart-links">
        <h3>Useful Links</h3>
        <div className="links-grid">
          <a href={`https://maps.google.com/maps?q=${location.latitude},${location.longitude}`} target="_blank" rel="noopener noreferrer">
            Road Map
          </a>
          <a href={`https://forecast.weather.gov/MapClick.php?lon=${location.longitude}&lat=${location.latitude}`} target="_blank" rel="noopener noreferrer">
            Civil Weather
          </a>
          <a href={`https://www.heavens-above.com/skychart2.aspx?lat=${location.latitude}&lng=${location.longitude}`} target="_blank" rel="noopener noreferrer">
            Star Chart
          </a>
        </div>
      </div>
    </div>
  );
}

export default Forecast;