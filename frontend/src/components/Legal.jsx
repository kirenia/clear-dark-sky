import { Link } from 'react-router-dom';
import './Home.css';
import './Legal.css';

function Legal() {
  return (
    <div className="legal">
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; Legal
      </div>

      <h1>Policies &amp; Legal</h1>

      <nav className="legal-nav">
        <a href="#terms">Terms of Use</a>
        <a href="#copyright">Copyright</a>
        <a href="#privacy">Privacy</a>
        <a href="#linking">Linking</a>
      </nav>

      <section id="terms">
        <h2>Terms of Use</h2>
        <p>
          By using this website you agree to be a fine human being, to respect all 
          sentient life, and to not sue anyone maintaining this site for any reason. 
          We do the best we can for users, but no contract is formed when you use 
          this website.
        </p>
        <p>
          After all, it's just a weather forecast. In particular, we make no statements 
          about the safety of any site for which we provide a forecast. Most locations 
          we've never visited. Not all Clear Sky Chart locations are public or even 
          physical observing sites.
        </p>
        <p className="legal-warning">
          Check with the land owner, local astronomy clubs, or local law enforcement 
          for physical and safety concerns before attempting to visit any site listed 
          on ClearDarkSky.
        </p>
        <p>
          Clear Sky Charts and forecast data are free to use for everyone through web 
          browsers. Authors of mobile apps should <a href="mailto:hello@cleardarksky.app">contact us</a> for 
          permission before using our data.
        </p>
        <p>
          We reserve the right to change these terms at any time.
        </p>
      </section>

      <section id="copyright">
        <h2>Copyright</h2>
        <p>
          The original Clear Sky Chart website, design, and chart generation algorithms 
          are Copyright © 2001–2024 Attilla Danko.
        </p>
        <p>
          This rebuild is an open-source community project continuing Attilla's legacy. 
          The source code is available on{' '}
          <a href="https://github.com/kirenia/clear-dark-sky" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>{' '}
          under an open-source license.
        </p>

        <h3>Weather Data</h3>
        <p>
          Transparency, cloud cover, and seeing forecast maps labeled "CMC" are provided 
          by the{' '}
          <a href="https://weather.gc.ca/astro/index_e.html" target="_blank" rel="noopener noreferrer">
            Canadian Meteorological Centre
          </a>{' '}
          and are © Crown copyright, product of Environment Canada.
        </p>

        <h3>Light Pollution Data</h3>
        <p>
          Light pollution maps are from the{' '}
          <a href="http://djlorenz.github.io/astronomy/lp2022" target="_blank" rel="noopener noreferrer">
            Light Pollution Atlas 2022
          </a>{' '}
          by David Lorenz, based on{' '}
          <a href="http://www.inquinamentoluminoso.it/worldatlas/pages/fig1.htm" target="_blank" rel="noopener noreferrer">
            The World Atlas of Artificial Night Sky Brightness
          </a>.
        </p>
        <p className="legal-credit">
          Credit: P. Cinzano, F. Falchi (University of Padova), C. D. Elvidge 
          (NOAA National Geophysical Data Center, Boulder). Copyright Royal 
          Astronomical Society. Reproduced from the Monthly Notices of the RAS 
          by permission of Blackwell Science.
        </p>
      </section>

      <section id="privacy">
        <h2>Privacy</h2>
        
        <h3>Email Addresses</h3>
        <p>
          We do not sell email addresses and do not do mass mailings. If you email us, 
          we will only respond regarding this website or direct correspondence.
        </p>

        <h3>Cookies</h3>
        <p>
          We use minimal cookies necessary for site functionality. We may use privacy-respecting 
          analytics to understand usage patterns and improve the site. We do not sell your data 
          to third parties.
        </p>

        <h3>Chart Site Locations</h3>
        <p>
          Links to satellite predictions and road maps may reveal a chart site's latitude 
          and longitude. If you operate an observatory and need location confidentiality 
          for security reasons, <a href="mailto:hello@cleardarksky.app">contact us</a> and 
          we'll do our best to obscure precise coordinates.
        </p>
        <p>
          A practical alternative: pick the center of a nearby park or lake. If it's within 
          10km, the forecast will be identical and your actual location isn't revealed.
        </p>

        <h3>Server Logs</h3>
        <p>
          Standard server logs (IP addresses, pages visited) are kept temporarily for 
          security and debugging purposes. These are not made public and are only used 
          to identify issues like misbehaving bots.
        </p>
      </section>

      <section id="linking">
        <h2>Linking &amp; Embedding</h2>
        <p>
          Non-commercial websites may freely link to any page on ClearDarkSky.
        </p>
        <p>
          Websites that don't charge admission and don't run advertising may display 
          chart images or preview images, provided each image links back to the 
          chart's page on this site.
        </p>
        <p>
          Astronomy clubs: you're welcome to embed charts on your club website. 
          See the embed code at the bottom of each chart page.
        </p>
      </section>

      <section id="jurisdiction">
        <h2>Jurisdiction</h2>
        <p>
          This website is operated as an open-source community project. The original 
          Clear Sky Chart was operated from Ottawa, Ontario, Canada under Canadian law.
        </p>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>
          For questions about these policies or anything else:{' '}
          <a href="mailto:hello@cleardarksky.app">hello@cleardarksky.app</a>
        </p>
      </section>
    </div>
  );
}

export default Legal;