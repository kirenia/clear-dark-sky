import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_URL } from '../config';
import './Home.css'
import './Forecast.css'

const LOCAL_CHART_KEY = 'cleardarksky_local_chart';

const CHART_STATS = {
  total: 6186,
  countries: {
    canada: 1313,
    usa: 4853,
    mexico: 16,
    bahamas: 3
  }
}

//
const BROWSE_CATEGORIES = [
  { name: 'Astronomy Clubs', slug: 'clubs' },
  { name: 'Observatories', slug: 'observatories' },
  { name: 'Dark-Sky Preserves', slug: 'dark-sky' },
  { name: 'State Parks', slug: 'state-parks' },
  { name: 'National Parks', slug: 'national-parks' },
  { name: 'Star Parties', slug: 'star-parties' },
]

const US_STATES = [
  { name: 'Alabama', abbr: 'AL', count: 58 },
  { name: 'Alaska', abbr: 'AK', count: 38 },
  { name: 'Arizona', abbr: 'AZ', count: 175 },
  { name: 'Arkansas', abbr: 'AR', count: 50 },
  { name: 'California', abbr: 'CA', count: 469 },
  { name: 'Colorado', abbr: 'CO', count: 173 },
  { name: 'Connecticut', abbr: 'CT', count: 46 },
  { name: 'Delaware', abbr: 'DE', count: 11 },
  { name: 'Florida', abbr: 'FL', count: 200 },
  { name: 'Georgia', abbr: 'GA', count: 106 },
  { name: 'Idaho', abbr: 'ID', count: 62 },
  { name: 'Illinois', abbr: 'IL', count: 119 },
  { name: 'Indiana', abbr: 'IN', count: 78 },
  { name: 'Iowa', abbr: 'IA', count: 44 },
  { name: 'Kansas', abbr: 'KS', count: 70 },
  { name: 'Kentucky', abbr: 'KY', count: 57 },
  { name: 'Louisiana', abbr: 'LA', count: 33 },
  { name: 'Maine', abbr: 'ME', count: 63 },
  { name: 'Maryland', abbr: 'MD', count: 58 },
  { name: 'Massachusetts', abbr: 'MA', count: 73 },
  { name: 'Michigan', abbr: 'MI', count: 157 },
  { name: 'Minnesota', abbr: 'MN', count: 82 },
  { name: 'Mississippi', abbr: 'MS', count: 37 },
  { name: 'Missouri', abbr: 'MO', count: 105 },
  { name: 'Montana', abbr: 'MT', count: 36 },
  { name: 'Nebraska', abbr: 'NE', count: 52 },
  { name: 'Nevada', abbr: 'NV', count: 57 },
  { name: 'New Hampshire', abbr: 'NH', count: 49 },
  { name: 'New Jersey', abbr: 'NJ', count: 62 },
  { name: 'New Mexico', abbr: 'NM', count: 131 },
  { name: 'New York', abbr: 'NY', count: 191 },
  { name: 'North Carolina', abbr: 'NC', count: 129 },
  { name: 'North Dakota', abbr: 'ND', count: 13 },
  { name: 'Ohio', abbr: 'OH', count: 135 },
  { name: 'Oklahoma', abbr: 'OK', count: 63 },
  { name: 'Oregon', abbr: 'OR', count: 121 },
  { name: 'Pennsylvania', abbr: 'PA', count: 188 },
  { name: 'Rhode Island', abbr: 'RI', count: 17 },
  { name: 'South Carolina', abbr: 'SC', count: 105 },
  { name: 'South Dakota', abbr: 'SD', count: 40 },
  { name: 'Tennessee', abbr: 'TN', count: 89 },
  { name: 'Texas', abbr: 'TX', count: 394 },
  { name: 'Utah', abbr: 'UT', count: 91 },
  { name: 'Vermont', abbr: 'VT', count: 40 },
  { name: 'Virginia', abbr: 'VA', count: 147 },
  { name: 'Washington', abbr: 'WA', count: 140 },
  { name: 'West Virginia', abbr: 'WV', count: 41 },
  { name: 'Wisconsin', abbr: 'WI', count: 110 },
  { name: 'Wyoming', abbr: 'WY', count: 45 },
]

const CA_PROVINCES = [
  { name: 'Alberta', abbr: 'AB', count: 152 },
  { name: 'British Columbia', abbr: 'BC', count: 147 },
  { name: 'Manitoba', abbr: 'MB', count: 51 },
  { name: 'New Brunswick', abbr: 'NB', count: 41 },
  { name: 'Newfoundland', abbr: 'NL', count: 25 },
  { name: 'Nova Scotia', abbr: 'NS', count: 68 },
  { name: 'Ontario', abbr: 'ON', count: 430 },
  { name: 'Prince Edward Island', abbr: 'PE', count: 14 },
  { name: 'Quebec', abbr: 'QC', count: 311 },
  { name: 'Saskatchewan', abbr: 'SK', count: 42 },
]

const RELATED_SITES = [
  {
    name: 'International Dark-Sky Association',
    url: 'https://www.darksky.org/',
    description: 'Protecting the night sky'
  },
  {
    name: 'RASC Light Pollution Abatement',
    url: 'https://www.rasc.ca/lpa',
    description: 'Canadian dark-sky advocacy'
  },
  {
    name: 'Clear Sky Alarm Clock',
    url: 'http://clearskyalarmclock.com',
    description: 'Get alerts when skies clear'
  },
]

// Full color scales for chart
const COLORS = {
  cloud: [
    { max: 5, color: '#003e7e' },
    { max: 15, color: '#135393' },
    { max: 25, color: '#2666a6' },
    { max: 35, color: '#4e8ece' },
    { max: 45, color: '#62a2e2' },
    { max: 55, color: '#76b6f6' },
    { max: 65, color: '#99d9d9' },
    { max: 75, color: '#adeded' },
    { max: 85, color: '#c1c1c1' },
    { max: 95, color: '#e9e9e9' },
    { max: 101, color: '#fafafa' }
  ],
  transparency: [
    { value: 'too_cloudy', color: '#f9f9f9' },
    { value: 'poor', color: '#c7c7c7' },
    { value: 'below_avg', color: '#95d5d5' },
    { value: 'average', color: '#63a3e3' },
    { value: 'above_avg', color: '#2c6cac' },
    { value: 'transparent', color: '#003f7f' }
  ],
  seeing: [
    { value: 'too_cloudy', color: '#f9f9f9' },
    { value: 'bad', color: '#c7c7c7' },
    { value: 'poor', color: '#95d5d5' },
    { value: 'average', color: '#63a3e3' },
    { value: 'good', color: '#2c6cac' },
    { value: 'excellent', color: '#003f7f' }
  ],
  darkness: [
    { max: -3.5, color: '#ffffff' },
    { max: -2.5, color: '#fff1d8' },
    { max: -1.5, color: '#ffe3b1' },
    { max: -0.5, color: '#ffd58a' },
    { max: 0.5, color: '#ffc662' },
    { max: 1.5, color: '#ffb83b' },
    { max: 2.5, color: '#ffaa14' },
    { max: 3.25, color: '#00ffff' },
    { max: 3.75, color: '#00cbff' },
    { max: 4.25, color: '#0096ff' },
    { max: 4.75, color: '#0064e4' },
    { max: 5.25, color: '#0032ca' },
    { max: 5.75, color: '#0000af' },
    { max: 6.25, color: '#000042' },
    { max: 7.0, color: '#00004b' }
  ],
  smoke: [
    { max: 2, color: '#003f7f' },
    { max: 5, color: '#4f8fcf' },
    { max: 10, color: '#78bec8' },
    { max: 20, color: '#87d2c1' },
    { max: 40, color: '#d68f87' },
    { max: 60, color: '#c96459' },
    { max: 80, color: '#bd3b2d' },
    { max: 100, color: '#b51504' },
    { max: 200, color: '#654321' },
    { max: 1000, color: '#37220f' }
  ],
  wind: [
    { max: 5, color: '#003f7f' },
    { max: 11, color: '#2c6cac' },
    { max: 16, color: '#63a3e3' },
    { max: 28, color: '#95d5d5' },
    { max: 45, color: '#c7c7c7' },
    { max: 200, color: '#f9f9f9' }
  ],
  humidity: [
    { max: 25, color: '#08035d' },
    { max: 30, color: '#0d4d8d' },
    { max: 35, color: '#3070b0' },
    { max: 40, color: '#4e8ece' },
    { max: 45, color: '#71b1f1' },
    { max: 50, color: '#80c0c0' },
    { max: 55, color: '#09feed' },
    { max: 60, color: '#55faad' },
    { max: 65, color: '#94fe6a' },
    { max: 70, color: '#eafb16' },
    { max: 75, color: '#fec600' },
    { max: 80, color: '#fc8602' },
    { max: 85, color: '#fe3401' },
    { max: 90, color: '#ea0000' },
    { max: 95, color: '#b70000' },
    { max: 100, color: '#e10000' }
  ],
  temperature: [
    { max: -40, color: '#fc00fc' },
    { max: -31, color: '#000085' },
    { max: -21, color: '#0000b2' },
    { max: -12, color: '#0000ec' },
    { max: -3, color: '#0034fe' },
    { max: 5, color: '#0089fe' },
    { max: 14, color: '#00d4fe' },
    { max: 23, color: '#1efede' },
    { max: 32, color: '#fbfbfb' },
    { max: 41, color: '#5efe9e' },
    { max: 50, color: '#a2fe5a' },
    { max: 59, color: '#fede00' },
    { max: 68, color: '#fe9e00' },
    { max: 77, color: '#fe5a00' },
    { max: 86, color: '#fe1e00' },
    { max: 95, color: '#e20000' },
    { max: 104, color: '#a90000' },
    { max: 113, color: '#7e0000' },
    { max: 200, color: '#c6c6c6' }
  ]
};

function getColor(value, scale, type = 'range') {
  if (value === null || value === undefined) {
    return '#ffffff';
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

function groupHoursByLocalDate(allHours, tzOffset) {
  const groups = [];
  let currentGroup = null;
  
  allHours.forEach((hour, i) => {
    let timeStr = hour.time;
    if (!timeStr.endsWith('Z') && !timeStr.includes('+')) {
      timeStr += 'Z';
    }
    const utcDate = new Date(timeStr);
    const localMs = utcDate.getTime() + (tzOffset * 60 * 60 * 1000);
    const localDate = new Date(localMs);
    const dateKey = localDate.toISOString().split('T')[0];
    
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

function LocalChart({ forecast }) {
  const location = forecast.location;
  const allHours = forecast.days.flatMap(day => day.hours);
  const tzOffset = location.tz_offset ?? -7;
  const dayGroups = groupHoursByLocalDate(allHours, tzOffset);
  const newDayIndices = new Set(dayGroups.slice(1).map(g => g.startIndex));

  const now = new Date();
  const localNow = new Date(now.getTime() + (tzOffset * 60 * 60 * 1000));
  const localDateStr = localNow.toISOString().split('T')[0];

  const skyRows = [
    { key: 'cloud_cover_pct', label: 'Cloud Cover', scale: COLORS.cloud, type: 'range' },
    { key: 'transparency', label: 'Transparency', scale: COLORS.transparency, type: 'value' },
    { key: 'seeing', label: 'Seeing', scale: COLORS.seeing, type: 'value' },
    { key: 'darkness', label: 'Darkness', scale: COLORS.darkness, type: 'range' },
  ];

  const groundRows = [
    { key: 'smoke_ugm3', label: 'Smoke', scale: COLORS.smoke, type: 'range' },
    { key: 'wind_speed_mph', label: 'Wind', scale: COLORS.wind, type: 'range' },
    { key: 'humidity_pct', label: 'Humidity', scale: COLORS.humidity, type: 'range' },
    { key: 'temperature_f', label: 'Temperature', scale: COLORS.temperature, type: 'range' }
  ];

  const renderDataRow = (row) => (
    <div key={row.key} className="chart-row">
      <div className="chart-label">{row.label}:</div>
      <div className="chart-cells">
        {allHours.map((hour, i) => {
          const isNewDay = newDayIndices.has(i);
          return (
            <div
              key={i}
              className={`chart-cell chart-cell--data ${isNewDay ? 'chart-cell--midnight' : ''}`}
              style={{ backgroundColor: getColor(hour[row.key], row.scale, row.type) }}
              title={`${row.label}: ${hour[row.key] ?? 'N/A'}`}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="chart-container">
      <div className="chart-info-bar">
        <div className="chart-datetime">{localDateStr} Local Time (GMT{tzOffset >= 0 ? '+' : ''}{tzOffset})</div>
      </div>
      
      <div className="forecast-chart">
        {/* Date header row */}
        <div className="chart-row chart-row--dates">
          <div className="chart-label"></div>
          <div className="chart-cells">
            {dayGroups.map((group, groupIdx) => {
              const weekday = group.date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
              const dayNum = group.date.getUTCDate();
              const spanWidth = (group.count * 13) - 1;
              const isNewDay = groupIdx > 0;
              return (
                <div 
                  key={groupIdx}
                  className={`chart-date-span ${isNewDay ? 'chart-date-span--midnight' : ''}`}
                  style={{ width: `${spanWidth}px` }}
                >
                  {weekday}, {dayNum}
                </div>
              );
            })}
          </div>
        </div>

        {/* Time header - stacked digits */}
        <div className="chart-row chart-row--time">
          <div className="chart-label"></div>
          <div className="chart-cells">
            {allHours.map((hour, i) => {
              const tens = Math.floor(hour.hour_local / 10);
              const ones = hour.hour_local % 10;
              const isNewDay = newDayIndices.has(i);
              return (
                <div 
                  key={i} 
                  className={`chart-cell chart-cell--time ${isNewDay ? 'chart-cell--midnight' : ''}`}
                >
                  <span className="time-tens">{tens}</span>
                  <span className="time-ones">{ones}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sky section */}
        <div className="chart-section">
          <div className="chart-section-label chart-section-label--sky">SKY</div>
          <div className="chart-section-rows">
            {skyRows.map(renderDataRow)}
          </div>
        </div>

        {/* Ground section */}
        <div className="chart-section">
          <div className="chart-section-label chart-section-label--ground">GROUND</div>
          <div className="chart-section-rows">
            {groundRows.map(renderDataRow)}
          </div>
        </div>
      </div>
      
      {/* Copyright footer */}
      <div className="chart-copyright">
        <span>© {new Date().getFullYear()} Attilla Danko</span>
        <span>forecast: A.Rahill</span>
        <span>data: Environment Canada / Environnement Canada</span>
        <span>Last updated: {forecast.forecast_run}</span>
      </div>
    </div>
  );
}

function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('keyword')
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState('')
  const [localChart, setLocalChart] = useState(null)
  const [localChartLoading, setLocalChartLoading] = useState(true)
  const [localChartError, setLocalChartError] = useState('')

  // Fetch local chart on mount
  useEffect(() => {
    async function getLocalChart() {
      try {
        // 1. Check localStorage first
        const cached = localStorage.getItem(LOCAL_CHART_KEY);
        if (cached) {
          const { key, timestamp } = JSON.parse(cached);
          // Use cache if less than 24 hours old
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            console.log('Using cached chart key:', key);
            const res = await fetch(`${API_URL}/api/forecast/${key}`);
            if (res.ok) {
              setLocalChart(await res.json());
              setLocalChartLoading(false);
              return;
            }
          }
        }

        // 2. Try browser geolocation
        console.log('Trying browser geolocation...');
        let coords = await getBrowserLocation().catch((err) => {
          console.log('Browser geolocation failed:', err.message);
          return null;
        });
        
        // 3. Fall back to IP geolocation
        if (!coords) {
          console.log('Trying IP geolocation...');
          coords = await getIPLocation().catch((err) => {
            console.log('IP geolocation failed:', err.message);
            return null;
          });
        }

        if (!coords) {
          console.log('No coordinates available');
          setLocalChartError('Could not determine location');
          setLocalChartLoading(false);
          return;
        }

        console.log('Got coords:', coords);

        // Find nearest chart
        const nearbyUrl = `${API_URL}/api/locations/nearby?lat=${coords.lat}&lon=${coords.lon}&limit=1`;
        console.log('Fetching nearby:', nearbyUrl);
        const nearbyRes = await fetch(nearbyUrl);
        if (!nearbyRes.ok) {
          console.log('Nearby API failed:', nearbyRes.status);
          setLocalChartError('Could not find nearby charts');
          setLocalChartLoading(false);
          return;
        }
        const nearby = await nearbyRes.json();
        console.log('Nearby response:', nearby);
        
        if (!nearby || nearby.length === 0) {
          setLocalChartError('No charts found near you');
          setLocalChartLoading(false);
          return;
        }
        
        // nearby returns { location: {...}, distance_km: ... }
        const nearest = nearby[0].location;
        
        if (!nearest || !nearest.key) {
          console.log('No key in nearest location:', nearest);
          setLocalChartError('Invalid location data');
          setLocalChartLoading(false);
          return;
        }

        // Cache the chart key
        localStorage.setItem(LOCAL_CHART_KEY, JSON.stringify({
          key: nearest.key,
          timestamp: Date.now()
        }));

        // Fetch the forecast
        console.log('Fetching forecast for:', nearest.key);
        const forecastRes = await fetch(`${API_URL}/api/forecast/${nearest.key}`);
        if (forecastRes.ok) {
          setLocalChart(await forecastRes.json());
        } else {
          console.log('Forecast fetch failed:', forecastRes.status);
          setLocalChartError('Could not load forecast');
        }
      } catch (err) {
        console.error('Failed to get local chart:', err);
        setLocalChartError('Something went wrong');
      }
      setLocalChartLoading(false);
    }

    getLocalChart();
  }, []);

  function getBrowserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => reject(err),
        { timeout: 5000 }
      );
    });
  }

  async function getIPLocation() {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error('IP lookup failed');
    const data = await res.json();
    if (!data.latitude || !data.longitude) throw new Error('No coords in IP response');
    return { lat: data.latitude, lon: data.longitude };
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchType === 'keyword' && searchQuery.trim()) {
      window.location.href = `/charts?q=${encodeURIComponent(searchQuery)}`
    } else if (searchType === 'location' && lat && lon) {
      window.location.href = `/charts?lat=${lat}&lon=${lon}`
    }
  }

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported')
      return
    }
    setGeoLoading(true)
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(4))
        setLon(position.coords.longitude.toFixed(4))
        setGeoLoading(false)
      },
      (err) => {
        setGeoError('Could not get location')
        setGeoLoading(false)
      }
    )
  }

  return (
    <div className="home">
      <main className="main">
        <section className="hero">
          <h1 className="hero__title">ClearDarkSky</h1>
          <p className="hero__tagline">The astronomer's forecast</p>
          <p className="hero__description">
            At a glance, see when the next 96 hours will have clear and dark skies 
            for your observing site. Forecasts for <strong>{CHART_STATS.total.toLocaleString()}</strong> locations 
            across North America.
          </p>
        </section>

        {/* Local Chart Section */}
        {localChartLoading ? (
          <section className="local-chart-section">
            <p className="local-chart-loading">Finding your nearest chart...</p>
          </section>
        ) : localChart ? (
          <section className="local-chart-section">
            <div className="local-chart-header">
              <div className="local-chart-title-row">
                <h2 className="section-title">Your Local Forecast</h2>
                <span className="local-chart-name">{localChart.location.name}</span>
                {localChart.location.region && (
                  <span className="local-chart-region">{localChart.location.region}, {localChart.location.country}</span>
                )}
              </div>
              <button 
                className="local-chart-change"
                onClick={() => {
                  localStorage.removeItem(LOCAL_CHART_KEY);
                  setLocalChart(null);
                  setLocalChartLoading(true);
                  window.location.reload();
                }}
              >
                Change location
              </button>
            </div>
            <LocalChart forecast={localChart} />
            <Link to={`/c/${localChart.location.key}`} className="local-chart-cta">
              View full forecast →
            </Link>
          </section>
        ) : localChartError ? (
          <section className="local-chart-section">
            <p className="local-chart-error">{localChartError}</p>
          </section>
        ) : null}

        <section className="search-section">
          <h2 className="section-title">Find a Chart</h2>
          
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-tabs">
      
            
            </div>

            {searchType === 'keyword' ? (
              <div className="search-input-group">
                <input
                  type="text"
                  className="search-input"
                  placeholder='Try "Lick Observatory" or "Tucson"'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-btn">Search</button>
              </div>
            ) : (
              <div className="search-coords">
                <button 
                  type="button" 
                  className="geo-btn"
                  onClick={getMyLocation}
                  disabled={geoLoading}
                >
                  {geoLoading ? 'Getting location...' : 'Use My Location'}
                </button>
                {geoError && <p className="geo-error">{geoError}</p>}
                <div className="coord-inputs">
                  <div className="coord-input">
                    <label htmlFor="lat">Latitude</label>
                    <input
                      type="text"
                      id="lat"
                      className="search-input"
                      placeholder="e.g. 43.6532"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                    />
                  </div>
                  <div className="coord-input">
                    <label htmlFor="lon">Longitude</label>
                    <input
                      type="text"
                      id="lon"
                      className="search-input"
                      placeholder="e.g. -79.3832"
                      value={lon}
                      onChange={(e) => setLon(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="search-btn" disabled={!lat || !lon}>Find Nearby</button>
              </div>
            )}
          </form>

          {/*
          <div className="quick-links">
            <a href="/coverage" className="quick-link">Coverage Map</a>
            <a href="/charts/map" className="quick-link">Browse on Map</a>
          </div>
          */}

        </section>

        {/*
        <section className="browse-section">
          <h2 className="section-title">Browse Charts</h2>
          
          <div className="browse-categories">
            {BROWSE_CATEGORIES.map(cat => (
              <a key={cat.slug} href={`/charts/category/${cat.slug}`} className="category-link">
                {cat.name}
              </a>
            ))}
          </div>

          <div className="browse-regions">
            <div className="region">
              <h3 className="region__title">
                United States 
                <span className="region__count">{CHART_STATS.countries.usa.toLocaleString()} charts</span>
              </h3>
              <div className="region__list">
                {US_STATES.map(state => (
                  <a 
                    key={state.abbr} 
                    href={`/charts/us/${state.abbr.toLowerCase()}`}
                    className="region__item"
                  >
                    {state.name} <span className="region__item-count">({state.count})</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="region">
              <h3 className="region__title">
                Canada
                <span className="region__count">{CHART_STATS.countries.canada.toLocaleString()} charts</span>
              </h3>
              <div className="region__list">
                {CA_PROVINCES.map(prov => (
                  <a 
                    key={prov.abbr} 
                    href={`/charts/ca/${prov.abbr.toLowerCase()}`}
                    className="region__item"
                  >
                    {prov.name} <span className="region__item-count">({prov.count})</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
        */}

        <section className="about-section">
          <h2 className="section-title">What is a Clear Sky Chart?</h2>
          <p>
            A Clear Sky Chart shows hourly predictions for cloud cover, transparency, 
            and seeing for the next 96 hours. Created by the late Attilla Danko, 
            it uses forecast data from Environment Canada's numerical weather model 
            developed by Allan Rahill.
          </p>
          <p>
            Look for columns of blue blocks — that's when skies will be clear and dark. 
            Good transparency means you can see faint objects. Good seeing means steady 
            air for planetary detail.
          </p>
          <Link to="/docs" className="text-link">Learn how to read a chart →</Link>
        </section>

        <section className="request-section">
          <h2 className="section-title">Request a Chart</h2>
          <p>
            If you observe at a site more than 24 km (15 miles) from an existing chart, 
            you can request one for your location. Charts are available for anywhere 
            within our <a href="/coverage">coverage area</a>.
          </p>
          <a href="mailto:hello@cleardarksky.app?subject=Chart%20Request" className="btn">Request a Chart</a>
        </section>

        <section className="related-section">
          <h2 className="section-title">Related Sites</h2>
          <div className="related-grid">
            {RELATED_SITES.map(site => (
              <a 
                key={site.name} 
                href={site.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="related-card"
              >
                <span className="related-name">{site.name}</span>
                <span className="related-desc">{site.description}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="asteroid-mention">
          <a 
            href="https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=attilladanko&view=VOP"
            target="_blank"
            rel="noopener noreferrer"
            className="asteroid-link"
          >
            <span className="asteroid-icon">🌟</span>
            <span className="asteroid-text">
              <strong>Asteroid (161693) Attilladanko</strong>
              <span>Named in honor of Clear Sky Chart's creator</span>
            </span>
          </a>
        </section>
      </main>
    </div>
  )
}

export default Home