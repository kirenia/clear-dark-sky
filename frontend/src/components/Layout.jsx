import { Link } from 'react-router-dom';
import './Home.css';

function Layout({ children }) {
  return (
    <div className="layout">
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
            <Link to="/charts">Charts</Link>
            <Link to="/docs">Docs</Link>
            <Link to="/calc">Calc</Link>
            <Link to="/about">About</Link>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="footer__content">
          <div className="footer__main">
            <div className="footer__attribution">
              <p>Created by <strong>Attilla Danko</strong> (1955–2024)</p>
              <p>Rebuilt by <a href="https://github.com/kirenia">Kire</a> to keep his legacy alive.</p>
            </div>
            <div className="footer__credits">
              <p>Forecast data: <a href="https://weather.gc.ca/astro/index_e.html">Environment Canada</a> · Model by Allan Rahill</p>
            </div>
            <div className="footer__links">
              <Link to="/about">About</Link>
              <Link to="/danko">Danko's Corner</Link>
              <Link to="/credits">Credits</Link>
              <Link to="/legal">Legal</Link>
              <a href="mailto:hello@cleardarksky.app">Contact</a>
            </div>
          </div>
          <p className="footer__tribute">Clear skies, Attilla. ✨</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;