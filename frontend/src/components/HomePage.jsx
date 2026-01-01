import { useState } from 'react'
import './HomePage.css'

const CHART_STATS = {
  total: 6186,
  countries: {
    canada: 1313,
    usa: 4853,
    mexico: 16,
    bahamas: 3
  }
}

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

function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('keyword')
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchType === 'keyword' && searchQuery.trim()) {
      window.location.href = `/charts/search?q=${encodeURIComponent(searchQuery)}`
    } else if (searchType === 'location' && lat && lon) {
      window.location.href = `/charts/nearby?lat=${lat}&lon=${lon}`
    }
  }

  return (
    <div className="home">
      <header className="header">
        <nav className="nav">
          <a href="/" className="nav__logo">Clear Dark Sky</a>
          <div className="nav__links">
            <a href="/charts">All Charts</a>
            <a href="/coverage">Coverage</a>
            <a href="/request">Request Chart</a>
            <a href="/about">About</a>
          </div>
        </nav>
      </header>

      <main className="main">
        <section className="hero">
          <h1 className="hero__title">Clear Dark Sky</h1>
          <p className="hero__tagline">The astronomer's forecast</p>
          <p className="hero__description">
            At a glance, see when the next 96 hours will have clear and dark skies 
            for your observing site. Forecasts for <strong>{CHART_STATS.total.toLocaleString()}</strong> locations 
            across North America.
          </p>
        </section>

        <section className="search-section">
          <h2 className="section-title">Find a Chart</h2>
          
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-tabs">
              <button 
                type="button"
                className={`search-tab ${searchType === 'keyword' ? 'search-tab--active' : ''}`}
                onClick={() => setSearchType('keyword')}
              >
                By Name
              </button>
              <button 
                type="button"
                className={`search-tab ${searchType === 'location' ? 'search-tab--active' : ''}`}
                onClick={() => setSearchType('location')}
              >
                By Location
              </button>
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
                <button type="submit" className="search-btn">Find Nearby</button>
              </div>
            )}
          </form>

          <div className="quick-links">
            <a href="/coverage" className="quick-link">Coverage Map</a>
            <a href="/charts/map" className="quick-link">Browse on Map</a>
          </div>
        </section>

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
          <a href="/about/reading-charts" className="text-link">Learn how to read a chart →</a>
        </section>

        <section className="request-section">
          <h2 className="section-title">Request a Chart</h2>
          <p>
            If you observe at a site more than 24 km (15 miles) from an existing chart, 
            you can request one for your location. Charts are available for anywhere 
            within our <a href="/coverage">coverage area</a>.
          </p>
          <a href="/request" className="btn">Request a Chart</a>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__content">
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
            <a href="/about">About</a>
            <a href="/credits">Credits</a>
            <a href="/privacy">Privacy</a>
            <a href="mailto:contact@cleardarksky.com">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
