// frontend/src/components/Embed.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../config';
import './Embed.css';

const COLORS = {
  cloud: [
    { max: 10, color: '#004080' },
    { max: 20, color: '#0050a0' },
    { max: 30, color: '#0060b8' },
    { max: 40, color: '#2070c0' },
    { max: 50, color: '#4084c8' },
    { max: 60, color: '#6098d0' },
    { max: 70, color: '#80acd8' },
    { max: 80, color: '#a0c0e0' },
    { max: 90, color: '#c0d4e8' },
    { max: 100, color: '#e0e8f0' },
    { max: 101, color: '#ffffff' }
  ],
  transparency: [
    { value: 'too_cloudy', color: '#ffffff' },
    { value: 'poor', color: '#c0a080' },
    { value: 'below_avg', color: '#90b090' },
    { value: 'average', color: '#60c0a0' },
    { value: 'above_avg', color: '#40d0b0' },
    { value: 'transparent', color: '#20e0c0' }
  ],
  seeing: [
    { value: 'too_cloudy', color: '#ffffff' },
    { value: 'bad', color: '#e04040' },
    { value: 'poor', color: '#e08040' },
    { value: 'average', color: '#e0c040' },
    { value: 'good', color: '#80c040' },
    { value: 'excellent', color: '#40a040' }
  ],
  darkness: [
    { max: 0.5, color: '#ffffff' },
    { max: 1.5, color: '#ffe080' },
    { max: 2.5, color: '#40e0d0' },
    { max: 4.0, color: '#80c0e0' },
    { max: 5.5, color: '#4080c0' },
    { max: 7.0, color: '#000020' }
  ],
  wind: [
    { max: 5, color: '#40a0c0' },
    { max: 11, color: '#80c0a0' },
    { max: 16, color: '#c0e080' },
    { max: 28, color: '#ffc040' },
    { max: 45, color: '#ff8040' },
    { max: 200, color: '#ff4040' }
  ],
  humidity: [
    { max: 25, color: '#ffe0c0' },
    { max: 40, color: '#e0d0a0' },
    { max: 55, color: '#c0d0a0' },
    { max: 70, color: '#a0d0c0' },
    { max: 85, color: '#80c0e0' },
    { max: 100, color: '#60a0e0' }
  ],
  temperature: [
    { max: 32, color: '#0080ff' },
    { max: 50, color: '#00c0c0' },
    { max: 68, color: '#40c040' },
    { max: 86, color: '#c0c000' },
    { max: 104, color: '#ff8000' },
    { max: 200, color: '#ff0000' }
  ]
};

function getColor(value, scale, type = 'range') {
  if (value === null || value === undefined) return '#ffffff';
  if (type === 'value' || scale[0]?.value !== undefined) {
    const entry = scale.find(s => s.value === value);
    return entry ? entry.color : '#ffffff';
  }
  for (const entry of scale) {
    if (value <= entry.max) return entry.color;
  }
  return scale[scale.length - 1].color;
}

function Embed() {
  const { key } = useParams();
  const [forecast, setForecast] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/forecast/${key}`)
      .then(res => res.ok ? res.json() : Promise.reject('Not found'))
      .then(data => {
        setLocation(data.location);
        setForecast(data);
      })
      .catch(err => setError(err));
  }, [key]);

  if (error) return <div className="embed-error">Chart not found</div>;
  if (!forecast) return <div className="embed-loading">Loading...</div>;

  const allHours = forecast.days.flatMap(day => day.hours);
  const rows = [
    { key: 'cloud_cover_pct', label: 'Cloud', scale: COLORS.cloud, type: 'range' },
    { key: 'transparency', label: 'Transp', scale: COLORS.transparency, type: 'value' },
    { key: 'seeing', label: 'Seeing', scale: COLORS.seeing, type: 'value' },
    { key: 'darkness', label: 'Dark', scale: COLORS.darkness, type: 'range' },
    { key: 'wind_speed_mph', label: 'Wind', scale: COLORS.wind, type: 'range' },
    { key: 'humidity_pct', label: 'Humid', scale: COLORS.humidity, type: 'range' },
    { key: 'temperature_f', label: 'Temp', scale: COLORS.temperature, type: 'range' }
  ];

  return (
    <div className="embed">
      <div className="embed-header">
        <a href={`https://cleardarksky.app/c/${key}`} target="_blank" rel="noopener noreferrer">
          {location.name} Clear Sky Chart
        </a>
      </div>
      <div className="embed-chart">
        {rows.map(row => (
          <div key={row.key} className="embed-row">
            <div className="embed-label">{row.label}</div>
            <div className="embed-cells">
              {allHours.map((hour, i) => (
                <div
                  key={i}
                  className="embed-cell"
                  style={{ backgroundColor: getColor(hour[row.key], row.scale, row.type) }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="embed-footer">
        <a href="https://cleardarksky.app" target="_blank" rel="noopener noreferrer">ClearDarkSky.app</a>
      </div>
    </div>
  );
}

export default Embed;