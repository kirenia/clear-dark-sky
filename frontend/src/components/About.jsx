import './Home.css';
import './About.css';

function About() {
  return (
    <div className="about">
      <main className="about-content">
        <section className="hero-section">
          <h1>Continuing Attilla Danko's Legacy</h1>
          <p className="subtitle">
            A community effort to preserve and modernize the Clear Sky Chart
          </p>
        </section>

        <section className="memorial-section">
          <h2>In Memory of Attilla Danko</h2>
          <p>
            Attilla Danko created the original Clear Sky Chart in 2001, providing amateur 
            astronomers across North America with an invaluable tool for planning their 
            observing sessions. For over two decades, his work helped countless stargazers 
            find clear skies.
          </p>
          <p>
            Attilla passed away on November 28, 2024. His contribution to the astronomy 
            community cannot be overstated—over 6,000 forecast charts serving observers 
            from Alaska to the Bahamas, all maintained as a labor of love.
          </p>
        </section>

        <section className="mission-section">
          <h2>Our Mission</h2>
          <p>
            This project is not intended to replace Attilla's work, but to carry his 
            legacy forward. The original cleardarksky.com faces technical challenges, 
            and we believe the astronomy community deserves continued access to these 
            essential forecasts.
          </p>
          <p>
            We're rebuilding the Clear Sky Chart using modern, sustainable web technologies 
            while preserving the familiar interface that astronomers have relied on for 
            years. The same Canadian Meteorological Centre data, the same color-coded 
            forecasts, the same utility, just on a more maintainable foundation.
          </p>
        </section>

        <section className="features-section">
          <h2>What We're Building</h2>
          <div className="features-grid">
            <div className="feature">
              <h3>Same Trusted Data</h3>
              <p>CMC astronomy forecasts for cloud cover, seeing, and transparency</p>
            </div>
            <div className="feature">
              <h3>Mobile Friendly</h3>
              <p>Responsive design that works on any device at the telescope</p>
            </div>
            <div className="feature">
              <h3>Embeddable Charts</h3>
              <p>Astronomy clubs can still embed charts on their websites</p>
            </div>
            <div className="feature">
              <h3>Open Source</h3>
              <p>Community-driven development ensures long-term sustainability</p>
            </div>
          </div>
        </section>

        <section className="contribute-section">
          <h2>Support the Project</h2>
          <p>
            This is a volunteer effort to keep Attilla's vision alive. If you'd like 
            to help, there are two ways to contribute:
          </p>
          
          <div className="contribute-options">
            <a 
              href="https://github.com/sponsors/kirenia" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contribute-btn donate-btn"
            >
              Sponsor the Project
            </a>
            <a 
              href="https://github.com/kirenia/clear-dark-sky" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contribute-btn github-btn"
            >
              Contribute on GitHub
            </a>
          </div>
        </section>

        <section className="credits-section">
          <h2>Credits</h2>
          <p>
            <strong>Original Clear Sky Chart:</strong> Created by Attilla Danko (2001-2024)
          </p>
          <p>
            <strong>Weather Data:</strong> Canadian Meteorological Centre astronomy forecasts 
            by Allan Rahill
          </p>
          <p>
            <strong>This Rebuild:</strong> Open source project maintained by the astronomy community
          </p>
        </section>
      </main>
    </div>
  );
}

export default About;