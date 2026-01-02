import { Link } from 'react-router-dom';
import './Home.css';
import './Docs.css';

function Docs() {
  return (
    <div className="docs">
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; Reading the Charts
      </div>

      <h1>How to Read Clear Sky Charts</h1>

      <section className="intro">
        <p>
          Clear Sky Charts summarize astronomical weather forecasts at a glance, showing when 
          conditions will be good for observing over the next few days. The data comes from 
          forecast models developed by Allan Rahill of the Canadian Meteorological Centre (CMC), 
          specifically designed for astronomers.
        </p>
        <p className="summary-tip">
          <strong>Quick tip:</strong> In the rows labeled "Sky", find a column of blue blocks. 
          You can probably observe then.
        </p>
      </section>

      <section id="how-to-read">
        <h2>Reading the Chart</h2>
        <p>
          Read the chart from left to right. Each column represents a different hour. The two 
          numbers at the top of a column show the time in 24-hour format (a "1" on top of a "3" 
          means 13:00 or 1pm local time).
        </p>
        <p>
          Single blocks mean separate forecast data for each hour. Connected blocks mean one 
          forecast calculation covers several hours.
        </p>
      </section>

      <section id="cloud-cover">
        <h2>Cloud Cover</h2>
        <div className="color-scale">
          <div className="scale-item" style={{background: '#fff'}}>Overcast</div>
          <div className="scale-item" style={{background: '#e0e8f0'}}>90%</div>
          <div className="scale-item" style={{background: '#c0d4e8'}}>80%</div>
          <div className="scale-item" style={{background: '#a0c0e0'}}>70%</div>
          <div className="scale-item" style={{background: '#80acd8'}}>60%</div>
          <div className="scale-item" style={{background: '#6098d0'}}>50%</div>
          <div className="scale-item" style={{background: '#4084c8'}}>40%</div>
          <div className="scale-item" style={{background: '#2070c0'}}>30%</div>
          <div className="scale-item" style={{background: '#0060b8'}}>20%</div>
          <div className="scale-item" style={{background: '#0050a0', color: '#fff'}}>10%</div>
          <div className="scale-item" style={{background: '#004080', color: '#fff'}}>Clear</div>
        </div>
        <p>
          Dark blue means clear skies. Lighter shades indicate increasing cloudiness, and white 
          is overcast. This forecast may miss low clouds and afternoon thunderstorms. When the 
          forecast shows clear, the sky may still be hazy if transparency is poor.
        </p>
        <p className="accuracy-note">
          <strong>Accuracy:</strong> For predictions less than 12 hours out, mostly-clear forecasts 
          (cloud &lt;25%) are right 80% of the time. Mostly-cloudy forecasts (cloud &gt;75%) are 
          right 91% of the time.
        </p>
      </section>

      <section id="transparency">
        <h2>Transparency</h2>
        <div className="color-scale">
          <div className="scale-item" style={{background: '#fff'}}>Too Cloudy</div>
          <div className="scale-item" style={{background: '#c0a080'}}>Poor</div>
          <div className="scale-item" style={{background: '#90b090'}}>Below Avg</div>
          <div className="scale-item" style={{background: '#60c0a0'}}>Average</div>
          <div className="scale-item" style={{background: '#40d0b0'}}>Above Avg</div>
          <div className="scale-item" style={{background: '#20e0c0'}}>Transparent</div>
        </div>
        <p>
          Transparency measures how clear the atmosphere is from ground to space, calculated from 
          water vapor content. It's somewhat independent of cloud cover—you can have isolated 
          clouds in transparent air, or poor transparency with few clouds (like thick haze on a 
          cloudless day).
        </p>
        <ul>
          <li><strong>Above average:</strong> Required for galaxies and nebulae</li>
          <li><strong>Below average:</strong> Fine for open clusters and planetary nebulae</li>
          <li><strong>Poor:</strong> Still usable for planets and large globulars</li>
        </ul>
        <p>
          White means CMC didn't compute transparency because cloud cover exceeded 30%. This 
          forecast does not account for smoke—check the separate smoke row.
        </p>
      </section>

      <section id="seeing">
        <h2>Seeing</h2>
        <div className="color-scale">
          <div className="scale-item" style={{background: '#fff'}}>Too Cloudy</div>
          <div className="scale-item" style={{background: '#e04040', color: '#fff'}}>Bad 1/5</div>
          <div className="scale-item" style={{background: '#e08040'}}>Poor 2/5</div>
          <div className="scale-item" style={{background: '#e0c040'}}>Average 3/5</div>
          <div className="scale-item" style={{background: '#80c040'}}>Good 4/5</div>
          <div className="scale-item" style={{background: '#40a040', color: '#fff'}}>Excellent 5/5</div>
        </div>
        <p>
          "Seeing" is an astronomy term for atmospheric turbulence (scintillation, shimmer, twinkling). 
          It affects high-magnification detail on planets. Good seeing does <em>not</em> mean 
          "everything looks good"—it specifically means steady air.
        </p>
        <ul>
          <li><strong>Excellent:</strong> Fine planetary detail visible at high magnification</li>
          <li><strong>Bad:</strong> Planets look like they're under rippling water, but galaxies are unaffected</li>
        </ul>
        <p>
          Bad seeing can occur in perfectly clear weather. Often good seeing happens during poor 
          transparency—they're not directly related. The scale is calibrated for 11-14 inch instruments. 
          Seeing is forecast in 3-hour blocks (shown as connected triplets).
        </p>
        <p className="note">
          Your actual seeing may be worse due to tube currents or ground-level turbulence near 
          your telescope.
        </p>
      </section>

      <section id="darkness">
        <h2>Darkness</h2>
        <div className="color-scale darkness-scale">
          <div className="scale-item" style={{background: '#fff'}}>Day</div>
          <div className="scale-item" style={{background: '#ffe080'}}>Dusk</div>
          <div className="scale-item" style={{background: '#40e0d0'}}>Twilight</div>
          <div className="scale-item" style={{background: '#80c0e0'}}>Full Moon</div>
          <div className="scale-item" style={{background: '#4080c0', color: '#fff'}}>Partial Moon</div>
          <div className="scale-item" style={{background: '#000', color: '#fff'}}>Dark</div>
        </div>
        <p>
          This is <em>not</em> a weather forecast—it shows when the sky will be astronomically dark, 
          assuming no light pollution and clear skies. The scale shows limiting magnitude (faintest 
          star visible at zenith):
        </p>
        <ul>
          <li><strong>Black (6.0+):</strong> Dark sky, faint objects visible</li>
          <li><strong>Deep blue (4.0-5.5):</strong> Partial moon or moon near horizon</li>
          <li><strong>Light blue (3.0-4.0):</strong> Full moon</li>
          <li><strong>Turquoise:</strong> Twilight</li>
          <li><strong>Yellow:</strong> Dusk/dawn</li>
          <li><strong>White:</strong> Daylight</li>
        </ul>
        <p>
          Based on sun/moon position, moon phase, and atmospheric scattering models. Does not 
          account for light pollution, dust, clouds, or observer's visual acuity.
        </p>
      </section>

      <section id="smoke">
        <h2>Smoke</h2>
        <div className="color-scale">
          <div className="scale-item" style={{background: '#e0f0ff'}}>None</div>
          <div className="scale-item" style={{background: '#c0e0f0'}}>2 µg/m³</div>
          <div className="scale-item" style={{background: '#a0d0e0'}}>5</div>
          <div className="scale-item" style={{background: '#80c0d0'}}>10</div>
          <div className="scale-item" style={{background: '#c0a080'}}>20</div>
          <div className="scale-item" style={{background: '#e08060'}}>40</div>
          <div className="scale-item" style={{background: '#e04040', color: '#fff'}}>60</div>
          <div className="scale-item" style={{background: '#c02020', color: '#fff'}}>80</div>
          <div className="scale-item" style={{background: '#a00000', color: '#fff'}}>100</div>
          <div className="scale-item" style={{background: '#600000', color: '#fff'}}>200+</div>
        </div>
        <p>
          Forecasts wildfire smoke levels. Any value other than "none" will affect transparency. 
          The EPA limit for 24-hour exposure is 35 µg/m³—values above this are shown in red/brown.
        </p>
        <p className="warning">
          If smoke shows red blocks, check local air quality warnings. Brown blocks mean stay indoors.
        </p>
      </section>

      <section id="wind">
        <h2>Wind</h2>
        <div className="color-scale">
          <div className="scale-item" style={{background: '#ff4040', color: '#fff'}}>&gt;45 mph</div>
          <div className="scale-item" style={{background: '#ff8040'}}>29-45</div>
          <div className="scale-item" style={{background: '#ffc040'}}>17-28</div>
          <div className="scale-item" style={{background: '#c0e080'}}>12-16</div>
          <div className="scale-item" style={{background: '#80c0a0'}}>6-11</div>
          <div className="scale-item" style={{background: '#40a0c0'}}>0-5 mph</div>
        </div>
        <p>
          Wind speed at tree-top level. Won't prevent observing but affects comfort and what 
          you can do. Long focal-length astrophotography and large Dobsonians need calm conditions. 
          High wind is dangerous for truss-tube Dobsonians that must be disassembled vertically.
        </p>
      </section>

      <section id="humidity">
        <h2>Humidity</h2>
        <div className="color-scale humidity-scale">
          <div className="scale-item" style={{background: '#ffe0c0'}}>&lt;25%</div>
          <div className="scale-item" style={{background: '#e0d0a0'}}>40%</div>
          <div className="scale-item" style={{background: '#c0d0a0'}}>55%</div>
          <div className="scale-item" style={{background: '#a0d0c0'}}>70%</div>
          <div className="scale-item" style={{background: '#80c0e0'}}>85%</div>
          <div className="scale-item" style={{background: '#60a0e0'}}>95%+</div>
        </div>
        <p>
          Ground-level relative humidity. Indicates dewing likelihood for optics and eyepieces. 
          Dewing depends on multiple factors: clear sky, dropping temperature, low wind, and 
          local terrain (hilltops vs. valleys).
        </p>
        <ul>
          <li><strong>Humidity spike after clouds clear + no wind:</strong> Ground fog will form</li>
          <li><strong>Opaque clouds + 95% humidity:</strong> Rain likely—cover telescopes</li>
        </ul>
      </section>

      <section id="temperature">
        <h2>Temperature</h2>
        <div className="color-scale temp-scale">
          <div className="scale-item" style={{background: '#8000ff', color: '#fff'}}>&lt;-40°F</div>
          <div className="scale-item" style={{background: '#0040ff', color: '#fff'}}>-12°F</div>
          <div className="scale-item" style={{background: '#0080ff', color: '#fff'}}>14°F</div>
          <div className="scale-item" style={{background: '#00c0c0'}}>32°F</div>
          <div className="scale-item" style={{background: '#40c040'}}>50°F</div>
          <div className="scale-item" style={{background: '#c0c000'}}>68°F</div>
          <div className="scale-item" style={{background: '#ff8000'}}>86°F</div>
          <div className="scale-item" style={{background: '#ff0000', color: '#fff'}}>&gt;104°F</div>
        </div>
        <p>
          Ground-level temperature forecast. Useful for planning clothing—<strong>dress as if 
          it's 20°F (10°C) colder than forecast</strong>. Observers with thick primary mirrors 
          should note falling temperatures for thermal equilibration.
        </p>
        <p>
          Cold also affects: battery capacity, lubricant stiffness, cable flexibility, LCD 
          responsiveness. Camera sensors benefit from reduced noise in cold weather.
        </p>
      </section>
    </div>
  );
}

export default Docs;