import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL } from '../config';
import './Home.css';
import './Forecast.css';

const COLORS = {
  cloud: [
    { max: 5, color: '#003e7e', label: 'Clear' },
    { max: 15, color: '#135393', label: '10%' },
    { max: 25, color: '#2666a6', label: '20%' },
    { max: 35, color: '#4e8ece', label: '30%' },
    { max: 45, color: '#62a2e2', label: '40%' },
    { max: 55, color: '#76b6f6', label: '50%' },
    { max: 65, color: '#99d9d9', label: '60%' },
    { max: 75, color: '#adeded', label: '70%' },
    { max: 85, color: '#c1c1c1', label: '80%' },
    { max: 95, color: '#e9e9e9', label: '90%' },
    { max: 101, color: '#fafafa', label: 'Overcast' }
  ],
  transparency: [
    { value: 'too_cloudy', color: '#f9f9f9', label: 'Too Cloudy' },
    { value: 'poor', color: '#c7c7c7', label: 'Poor' },
    { value: 'below_avg', color: '#95d5d5', label: 'Below Avg' },
    { value: 'average', color: '#63a3e3', label: 'Average' },
    { value: 'above_avg', color: '#2c6cac', label: 'Above Avg' },
    { value: 'transparent', color: '#003f7f', label: 'Transparent' }
  ],
  seeing: [
    { value: 'too_cloudy', color: '#f9f9f9', label: 'Too Cloudy' },
    { value: 'bad', color: '#c7c7c7', label: 'Bad 1/5' },
    { value: 'poor', color: '#95d5d5', label: 'Poor 2/5' },
    { value: 'average', color: '#63a3e3', label: 'Average 3/5' },
    { value: 'good', color: '#2c6cac', label: 'Good 4/5' },
    { value: 'excellent', color: '#003f7f', label: 'Excellent 5/5' }
  ],
  darkness: [
    { max: -3.5, color: '#ffffff', label: 'Day' },
    { max: -2.5, color: '#fff1d8', label: 'Bright' },
    { max: -1.5, color: '#ffe3b1', label: 'Bright' },
    { max: -0.5, color: '#ffd58a', label: 'Dusk' },
    { max: 0.5, color: '#ffc662', label: 'Dusk' },
    { max: 1.5, color: '#ffb83b', label: 'Twilight' },
    { max: 2.5, color: '#ffaa14', label: 'Twilight' },
    { max: 3.25, color: '#00ffff', label: 'Bright Moon' },
    { max: 3.75, color: '#00cbff', label: 'Bright Moon' },
    { max: 4.25, color: '#0096ff', label: 'Partial Moon' },
    { max: 4.75, color: '#0064e4', label: 'Partial Moon' },
    { max: 5.25, color: '#0032ca', label: 'Dim Moon' },
    { max: 5.75, color: '#0000af', label: 'Dim Moon' },
    { max: 6.25, color: '#000042', label: 'Dark' },
    { max: 7.0, color: '#00004b', label: 'Dark' }
  ],
  smoke: [
    { max: 2, color: '#003f7f', label: 'None' },
    { max: 5, color: '#4f8fcf', label: '5 µg/m³' },
    { max: 10, color: '#78bec8', label: '10' },
    { max: 20, color: '#87d2c1', label: '20' },
    { max: 40, color: '#d68f87', label: '40' },
    { max: 60, color: '#c96459', label: '60' },
    { max: 80, color: '#bd3b2d', label: '80' },
    { max: 100, color: '#b51504', label: '100' },
    { max: 200, color: '#654321', label: '200' },
    { max: 1000, color: '#37220f', label: '500+' }
  ],
  wind: [
    { max: 5, color: '#003f7f', label: '0-5 mph' },
    { max: 11, color: '#2c6cac', label: '6-11' },
    { max: 16, color: '#63a3e3', label: '12-16' },
    { max: 28, color: '#95d5d5', label: '17-28' },
    { max: 45, color: '#c7c7c7', label: '29-45' },
    { max: 200, color: '#f9f9f9', label: '>45 mph' }
  ],
  humidity: [
    { max: 25, color: '#08035d', label: '<25%' },
    { max: 30, color: '#0d4d8d', label: '25-30%' },
    { max: 35, color: '#3070b0', label: '30-35%' },
    { max: 40, color: '#4e8ece', label: '35-40%' },
    { max: 45, color: '#71b1f1', label: '40-45%' },
    { max: 50, color: '#80c0c0', label: '45-50%' },
    { max: 55, color: '#09feed', label: '50-55%' },
    { max: 60, color: '#55faad', label: '55-60%' },
    { max: 65, color: '#94fe6a', label: '60-65%' },
    { max: 70, color: '#eafb16', label: '65-70%' },
    { max: 75, color: '#fec600', label: '70-75%' },
    { max: 80, color: '#fc8602', label: '75-80%' },
    { max: 85, color: '#fe3401', label: '80-85%' },
    { max: 90, color: '#ea0000', label: '85-90%' },
    { max: 95, color: '#b70000', label: '90-95%' },
    { max: 100, color: '#e10000', label: '95%+' }
  ],
  temperature: [
    { max: -40, color: '#fc00fc', label: '< -40°F' },
    { max: -31, color: '#000085', label: '-40 to -31°F' },
    { max: -21, color: '#0000b2', label: '-30 to -21°F' },
    { max: -12, color: '#0000ec', label: '-21 to -12°F' },
    { max: -3, color: '#0034fe', label: '-12 to -3°F' },
    { max: 5, color: '#0089fe', label: '-3 to 5°F' },
    { max: 14, color: '#00d4fe', label: '5 to 14°F' },
    { max: 23, color: '#1efede', label: '14 to 23°F' },
    { max: 32, color: '#fbfbfb', label: '23 to 32°F' },
    { max: 41, color: '#5efe9e', label: '32 to 41°F' },
    { max: 50, color: '#a2fe5a', label: '41 to 50°F' },
    { max: 59, color: '#fede00', label: '50 to 59°F' },
    { max: 68, color: '#fe9e00', label: '59 to 68°F' },
    { max: 77, color: '#fe5a00', label: '68 to 77°F' },
    { max: 86, color: '#fe1e00', label: '77 to 86°F' },
    { max: 95, color: '#e20000', label: '86 to 95°F' },
    { max: 104, color: '#a90000', label: '95 to 104°F' },
    { max: 113, color: '#7e0000', label: '104 to 113°F' },
    { max: 200, color: '#c6c6c6', label: '>113°F' }
  ]
};

function getColor(value, scale, type = 'range') {
  if (value === null || value === undefined) {
    const nullEntry = scale.find(s => s.value === 'too_cloudy' || s.value === null);
    return nullEntry ? nullEntry.color : '#ffffff';
  }
  
  if (type === 'value' || scale[0]?.value !== undefined) {
    const entry = scale.find(s => s.value === value);
    return entry ? entry.color : '#ffffff';
  }
  
  for (const entry of scale) {
    if (value <= entry.max) {
      return entry.color;
    }
  }
  return scale[scale.length - 1].color;
}

function groupHoursByLocalDate(allHours) {
  const groups = [];
  let currentGroup = null;
  
  allHours.forEach((hour, i) => {
    const utcDate = new Date(hour.time);
    const localDate = new Date(utcDate.getTime());
    if (hour.hour_local > utcDate.getUTCHours()) {
      localDate.setUTCDate(localDate.getUTCDate() - 1);
    } else if (hour.hour_local < utcDate.getUTCHours() - 12) {
      localDate.setUTCDate(localDate.getUTCDate() + 1);
    }
    
    const dateKey = `${localDate.getUTCFullYear()}-${String(localDate.getUTCMonth() + 1).padStart(2, '0')}-${String(localDate.getUTCDate()).padStart(2, '0')}`;
    
    if (!currentGroup || currentGroup.dateKey !== dateKey) {
      currentGroup = {
        dateKey,
        date: localDate,
        startIndex: i,
        count: 1
      };
      groups.push(currentGroup);
    } else {
      currentGroup.count++;
    }
  });
  
  return groups;
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

  const allHours = forecast.days.flatMap(day => day.hours);
  const dayGroups = groupHoursByLocalDate(allHours);

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
        
        <div className="forecast-chart">

          {/* Date header row */}
          <div className="chart-row chart-row--dates">
            <div className="chart-label"></div>
            <div className="chart-cells">
              {allHours.map((hour, i) => {
                // Find which day group this hour belongs to
                const group = dayGroups.find(g => i >= g.startIndex && i < g.startIndex + g.count);
                const isFirstOfDay = group && i === group.startIndex;
                const isMidnight = hour.hour_local === 0 && i > 0;
                
                if (isFirstOfDay) {
                  const weekday = group.date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
                  const dayNum = group.date.getUTCDate();
                  // Calculate width: cells are 10px + 1px gap each, minus last gap
                  const spanWidth = (group.count * 11) - 1;
                  return (
                    <div 
                      key={i}
                      className={`chart-date-span ${isMidnight ? 'chart-date-span--midnight' : ''}`}
                      style={{ width: `${spanWidth}px` }}
                    >
                      {weekday}, {dayNum}
                    </div>
                  );
                }
                return null;
              }).filter(Boolean)}
            </div>
          </div>

          {/* Time header - stacked digits */}
          <div className="chart-row chart-row--time">
            <div className="chart-label"></div>
            <div className="chart-cells">
              {allHours.map((hour, i) => {
                const tens = Math.floor(hour.hour_local / 10);
                const ones = hour.hour_local % 10;
                const isMidnight = hour.hour_local === 0 && i > 0;
                return (
                  <div 
                    key={i} 
                    className={`chart-cell chart-cell--time ${isMidnight ? 'chart-cell--midnight' : ''}`}
                  >
                    <span className="time-tens">{tens}</span>
                    <span className="time-ones">{ones}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Forecast rows */}
          {rows.map(row => (
            <div key={row.key} className="chart-row">
              <div className="chart-label">{row.label}</div>
              <div className="chart-cells">
                {allHours.map((hour, i) => {
                  const isMidnight = hour.hour_local === 0 && i > 0;
                  return (
                    <div
                      key={i}
                      className={`chart-cell chart-cell--data ${isMidnight ? 'chart-cell--midnight' : ''}`}
                      style={{ backgroundColor: getColor(hour[row.key], row.scale, row.type) }}
                      title={`${row.label}: ${hour[row.key] ?? 'N/A'}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-legend">
  <h3>Legend</h3>
  
  <div className="legend-section">
    <div className="legend-section-title">Cloud Cover</div>
    <div className="legend-items">
      {COLORS.cloud.map((c, i) => (
        <span key={i} className="legend-block" style={{ backgroundColor: c.color }}>
          <span className={`legend-text ${i < 4 ? 'light' : 'dark'}`}>{c.label}</span>
        </span>
      ))}
    </div>
  </div>

  <div className="legend-section">
    <div className="legend-section-title">Transparency</div>
    <div className="legend-items">
      {COLORS.transparency.map((c, i) => (
        <span key={i} className="legend-block" style={{ backgroundColor: c.color }}>
          <span className={`legend-text ${i < 3 ? 'dark' : 'light'}`}>{c.label}</span>
        </span>
      ))}
    </div>
  </div>

  <div className="legend-section">
    <div className="legend-section-title">Seeing</div>
    <div className="legend-items">
      {COLORS.seeing.map((c, i) => (
        <span key={i} className="legend-block" style={{ backgroundColor: c.color }}>
          <span className={`legend-text ${i < 3 ? 'dark' : 'light'}`}>{c.label}</span>
        </span>
      ))}
    </div>
  </div>

  <div className="legend-section">
    <div className="legend-section-title">Darkness</div>
    <div className="legend-items">
      {COLORS.darkness.filter((_, i) => i % 2 === 0).map((c, i) => (
        <span key={i} className="legend-block" style={{ backgroundColor: c.color }}>
          <span className={`legend-text ${c.max < 3 ? 'dark' : 'light'}`}>{c.label}</span>
        </span>
      ))}
    </div>
  </div>

  <div className="legend-section">
    <div className="legend-section-title">Smoke</div>
    <div className="legend-items">
      {COLORS.smoke.map((c, i) => (
        <span key={i} className="legend-block" style={{ backgroundColor: c.color }}>
          <span className={`legend-text ${i < 4 ? 'light' : i < 7 ? 'dark' : 'light'}`}>{c.label}</span>
        </span>
      ))}
    </div>
  </div>

  <div className="legend-section">
    <div className="legend-section-title">Wind</div>
    <div className="legend-items">
      {COLORS.wind.map((c, i) => (
        <span key={i} className="legend-block" style={{ backgroundColor: c.color }}>
          <span className={`legend-text ${i < 3 ? 'light' : 'dark'}`}>{c.label}</span>
        </span>
      ))}
    </div>
  </div>

  <div className="legend-section">
    <div className="legend-section-title">Humidity</div>
    <div className="legend-items">
      {COLORS.humidity.map((c, i) => (
        <span key={i} className="legend-block" style={{ backgroundColor: c.color }}>
          <span className={`legend-text ${i < 3 ? 'light' : 'dark'}`}>{c.label}</span>
        </span>
      ))}
    </div>
  </div>

  <div className="legend-section">
    <div className="legend-section-title">Temperature</div>
    <div className="legend-items">
      {COLORS.temperature.map((c, i) => (
        <span key={i} className="legend-block" style={{ backgroundColor: c.color }}>
          <span className={`legend-text ${i < 6 || i > 14 ? 'light' : 'dark'}`}>{c.label}</span>
        </span>
      ))}
    </div>
  </div>
</div>
<p className="legend-link">
  <Link to="/docs">Full guide to reading charts →</Link>
</p>

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