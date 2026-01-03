import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { API_URL } from '../config';
import './Home.css';
import './Charts.css';

function Charts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch(`${API_URL}/api/locations/?limit=10000`);
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
<main className="all-charts-content">
      <div className="all-charts-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link> &gt; All Charts
        </div>
        <h1>ClearDarkSky Chart Directory</h1>
        <p className="chart-count">
          Currently, there are <strong>{locations.length}</strong> charts available. The rest of the locations are slowly being added. Thank you for your patience.
        </p>
      </div>

      <div className="all-charts-content">
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
      </div>
    </main>
    </div>
  );
}

export default Charts;