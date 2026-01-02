import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';
import './HomePage.css';
import './AllChartsPage.css';

function AllChartsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch(`/api/locations/?limit=10000`);
        if (!res.ok) throw new Error('Failed to fetch locations');
        const data = await res.json();
        setLocations(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchLocations();
  }, []);

  // Update URL when search changes
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  if (loading) {
    return <div className="all-charts-page all-charts-page--loading">Loading locations...</div>;
  }

  if (error) {
    return (
      <div className="all-charts-page all-charts-page--error">
        <h1>Error</h1>
        <p>{error}</p>
        <Link to="/">← Back to Home</Link>
      </div>
    );
  }

  // Filter by search
  const filtered = searchQuery
    ? locations.filter(loc => 
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.region?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : locations;

  // Group by country, then by region
  const grouped = {};
  filtered.forEach(loc => {
    const country = loc.country || 'Other';
    const region = loc.region || 'General';
    
    if (!grouped[country]) {
      grouped[country] = {};
    }
    if (!grouped[country][region]) {
      grouped[country][region] = [];
    }
    grouped[country][region].push(loc);
  });

  // Sort countries, regions, and locations
  const sortedCountries = Object.keys(grouped).sort();

  // Get unique countries for nav
  const countries = [...new Set(locations.map(l => l.country))].filter(Boolean).sort();

  return (
    <div className="all-charts-page">
      <div className="legacy-banner">
        <p>
          <strong>A community effort to continue Attilla Danko's legacy.</strong> The original Clear Sky Chart creator passed away in November 2024. 
          This open-source rebuild preserves his work for future astronomers.
          <a href="https://github.com/kirenia/clear-dark-sky" target="_blank" rel="noopener noreferrer">Contribute on GitHub</a>
        </p>
      </div>
      <header className="header">
        <nav className="nav">
          <Link to="/" className="nav__logo">ClearDarkSky</Link>
          <div className="nav__links">
            <Link to="/charts">All Charts</Link>
            <Link to="/about">About</Link>
          </div>
        </nav>
      </header>

      <div className="all-charts-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> &gt; All Charts
        </div>
        <h1>ClearDarkSky Chart Directory</h1>
        <p className="chart-count">
          There are <strong>{locations.length}</strong> charts.
        </p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => handleSearchChange('')} className="clear-search">×</button>
        )}
      </div>

      <nav className="country-nav">
        {countries.map(country => (
          <a key={country} href={`#${country.replace(/\s+/g, '-')}`}>
            {country}
          </a>
        ))}
      </nav>

      <div className="locations-list">
        {sortedCountries.map(country => {
          const regions = grouped[country];
          const sortedRegions = Object.keys(regions).sort();
          
          return (
            <section key={country} id={country.replace(/\s+/g, '-')} className="country-section">
              <h2 className="country-heading">{country}</h2>
              
              {sortedRegions.map(region => {
                const locs = regions[region];
                const sortedLocs = [...locs].sort((a, b) => a.name.localeCompare(b.name));
                
                return (
                  <div key={region} className="region-group">
                    <h3 className="region-heading">{region}</h3>
                    <ul className="location-list">
                      {sortedLocs.map(loc => (
                        <li key={loc.key} className="location-item">
                          <Link to={`/c/${loc.key}`} className="location-link">
                            {loc.name}
                          </Link>
                          {loc.category && (
                            <span className="location-category">{loc.category}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="no-results">
          No locations found matching "{searchQuery}"
        </div>
      )}

      <footer className="footer">
        <div className="footer__content">
          <div className="footer__main">
            <div className="footer__attribution">
              <p>
                Created by <strong>Attilla Danko</strong> (1955–2024)
              </p>
              <p>
                Rebuilt by <a href="https://github.com/kiregongora">Kire</a> to keep his work alive.
              </p>
            </div>
            
            <div className="footer__credits">
              <p>
                Forecast data: <a href="https://weather.gc.ca/astro/index_e.html">Environment Canada</a> · 
                Model by Allan Rahill
              </p>
            </div>
            
            <div className="footer__links">
              <Link to="/about">About</Link>
              <Link to="/credits">Credits</Link>
              <Link to="/privacy">Privacy</Link>
              <a href="mailto:contact@cleardarksky.com">Contact</a>
            </div>
          </div>
          
          <p className="footer__tribute">Clear skies, Attilla. ✨</p>
        </div>
      </footer>
    </div>
  );
}

export default AllChartsPage;