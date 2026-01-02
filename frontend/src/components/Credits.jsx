import { Link } from 'react-router-dom';
import './Home.css';
import './Credits.css';

// Historical sponsors from Danko's original site
const TOP_SPONSORS = [
  { name: 'RASC Edmonton Centre', url: 'http://www.edmontonrasc.com/' },
  { name: 'Winer Observatory', url: 'http://www.winer.org/' },
  { name: 'NOVAC', url: 'http://www.novac.com/' },
];

const SPONSORS = [
  { name: 'Amateur Telescope Makers of Boston', url: 'http://www.atmob.org/' },
  { name: 'Arrowhead Astronomical Society', url: 'http://www.duluthaas.com/' },
  { name: 'Buffalo Astronomical Association', url: 'https://www.buffaloastronomy.com/' },
  { name: 'Chippewa Valley Astronomical Society', url: 'http://www.cvastro.org/' },
  { name: 'Deep Springs College', url: 'https://www.deepsprings.edu/' },
  { name: 'Denver Astronomical Society', url: 'https://denverastro.org/' },
  { name: 'Gardner Camp Youth Astronomy Club', url: 'https://gardnercamp.org/astronomy/' },
  { name: 'Gloucester Area Astronomy Club', url: 'http://www.gaac.us/' },
  { name: 'Hamilton Amateur Astronomers', url: 'http://amateurastronomy.org/' },
  { name: 'Howard Astronomical League', url: 'http://www.howardastro.org' },
  { name: 'Indiana Astronomical Society', url: 'http://www.iasindy.org/' },
  { name: 'Naperville Astronomical Association', url: 'https://naperastro.org' },
  { name: 'Northern Cross Science Foundation', url: 'http://www.ncsf.info/' },
  { name: 'Oregon Star Party Committee', url: 'http://www.oregonstarparty.org/' },
  { name: 'RASC Calgary Centre', url: 'https://calgary.rasc.ca/' },
  { name: 'RASC Halifax Centre', url: 'http://halifax.rasc.ca/' },
  { name: 'RASC Ottawa Centre', url: 'http://ottawa.rasc.ca/' },
  { name: 'RASC Toronto Centre', url: 'http://toronto.rasc.ca' },
  { name: 'Riverside Astronomical Society', url: 'http://www.rivastro.org/' },
  { name: 'Salt Lake Astronomical Society', url: 'http://slas.us/' },
  { name: 'Southern California Desert Video Astronomers', url: 'http://www.scdva.org/' },
  { name: 'Southern Maryland Astronomical Society', url: 'http://www.smas.us' },
  { name: 'Sun City Astronomers', url: 'https://www.facebook.com/groups/suncityastronomers/' },
  { name: 'Texas Astronomical Society', url: 'http://texasastro.org/' },
  { name: 'Tri-Valley Stargazers', url: 'http://www.trivalleystargazers.org/' },
  { name: 'Valley of the Moon Observatory Association', url: 'http://www.rfo.org' },
  { name: 'Wolf Creek Observatory', url: 'https://wolfcreek.space/' },
];

const INDIVIDUAL_SPONSORS = [
  'Aaron Quick', 'Alan & Pamela', 'Alexandre Koukarine', 'Andre Vaillancourt',
  'Anthony Scandurra', 'Ben Lutch', 'Bert Stevens', 'Beth Colyear', 'Billy and Domitta Gladson',
  'Bob Hillier', 'Bob Pitt', 'Brian Combs', 'Brian M. Carroll', 'Bruce C Taylor',
  'Cary MacWilliams', 'Charles S Morris', 'Chris Webb', 'Christopher Azar', 'Claude Duplessis',
  'Colin Orion Chandler', 'Connor Ness', 'D. Craig Tupper', 'Dave & Robert', 'Dave Hasenauer',
  'Dave LoPresti', 'David M. Douglass', 'David McDavid', 'David Musser', 'David Oesper',
  'David ONeill', 'David Pettersson', 'David T. and Jean M. Long', 'Dee Jay Randall',
  'Derek Archer', 'Diego Gomez', 'Dodie Reagan', 'Don Pensack', 'Dr. John Sohl',
  'Dr. Michael W. Ridenhour', 'Ekim Unal', 'Eric Laflamme', 'Eric Rachut', 'Frank M. Klicar',
  'Frank Willburn', 'Gaboury Benoit', 'Gailen Marshall', 'Gary D. Maupin',
  'Gene and Charlotte Dupree', 'George Palermo', 'Ginny Stumborg-Rosin', 'Hai Du',
  'Hans Flaatrud', 'Harry Sarber', 'Herman Zwirn', 'James Munson', 'James Pond',
  'Jane Gnass', 'Jane Houston Jones and Morris Jones', 'Jay and Maureen Huston',
  'Jeff Alfeld', 'Jerel Smith', 'Jerome Hollon', 'Jerry Hilburn', 'Jerry Spevak',
  'Jim & Lisa McKay', 'Jim & Terry Turner', 'Jim Mazur', 'Jim Woods', 'Jimmy Deetman',
  'Jnani Cevvel', 'Joel E. Guthals', 'John & Cathy Moore', 'John Harris', 'John R. Crilly',
  'John W. Palmieri', 'Joseph & Amy Galloway', 'Joseph Comeau', 'Joseph Geiger',
  'Joseph Trerotola', 'Juno Porter', 'Justin Bailo', 'Justin Hendricks', 'Karen Miller SLC',
  'Kaushik Iyer', 'Kayla Vasquez', 'Ken Sabatini', 'Kenneth Stallard', 'Kerrigan and Ridley Singer',
  'Kevin & Carmen Kasner', 'Klaus Peltsch', 'Kok Chen', 'Kyle Goodwin', 'Lauren Weiss',
  'Liang Ming', 'LKappukatt', 'Luke Edens', 'Mark Biersack', 'Mark C.', 'Mark Hanning-Lee',
  'Mark Manner', 'Mark Simmons', 'Mark Warren', 'Martin Flynn', 'Martin Wilson',
  'Max Mitchell', 'Michael Collins', 'Michael Person', 'Michael Rosolina', 'Michael Rudy',
  'Mike Wirths', 'N3DXW & N3ED', 'Nick Lloyd', 'Noah Albers', 'Oleg Rumiancev',
  'Oscar Echeverri', 'Paul D Clarke', 'Paul Dawson', 'Pedro', 'Peter Zsenits', 'Philip Massey',
  'Rhonda Weeks', 'Richard Seely', 'RJH Photography', 'Rob & Theresa Britschgi',
  'Robert & Erika Moon', 'Robert & Elaine White', 'Roger Menard', 'Roxanne Kamin',
  'Steven LJ Russo', 'Steven Schlagel', 'Stephen Craig', 'Steve Altstadt', 'Steve Altic',
  'Steve Cariddi', 'Steve Johnson, PhD', 'Stuart Alldritt', 'Sue and Alan French',
  'The Noroads Garage', 'The Wilkersons of Pittsburgh', 'Thomas Wroblewski', 'Tiffiny Mansouri',
  'Tim Kearsley', 'Tim Povlick', 'Todd Kunioka', 'Tom Hoffelder', 'Tom Jaeger', 'Tom Neville',
  'Tracy Tuttle', 'Victoria Woods', 'William C. Bryson', 'Yves Barriere', 'Zack Whaley',
];

function Credits() {
  return (
    <div className="credits">
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; Credits
      </div>

      <h1>Credits &amp; Thanks</h1>

      <section className="credits-section credits-data">
        <h2>The People Behind the Data</h2>
        
        <div className="credit-card credit-card--primary">
          <h3>Attilla Danko (1955–2024)</h3>
          <p>
            Created the original Clear Sky Chart in 2001 and maintained it for over two decades. 
            His work helped countless astronomers find clear skies. This rebuild exists to 
            continue his legacy.
          </p>
          <Link to="/danko" className="credit-link">Visit Danko's Corner →</Link>
        </div>

        <div className="credit-card">
          <h3>Allan Rahill</h3>
          <p>
            Designed the numerical forecast models computed at the{' '}
            <a href="https://weather.gc.ca/astro/index_e.html" target="_blank" rel="noopener noreferrer">
              Canadian Meteorological Centre
            </a>{' '}
            (CMC) that power Clear Sky Charts. The accuracy of these astronomy-specific 
            forecasts is unmatched.
          </p>
        </div>

        <div className="credit-card">
          <h3>Darkness Algorithm</h3>
          <p>
            Based on Ben Sugarman's algorithm, which extends Brad Schaefer's work 
            (1998, Sky &amp; Telescope, Vol. 95, No. 5, p 57).
          </p>
        </div>

        <div className="credit-card">
          <h3>Light Pollution Data</h3>
          <p>
            From the{' '}
            <a href="http://djlorenz.github.io/astronomy/lp2022" target="_blank" rel="noopener noreferrer">
              Light Pollution Atlas 2022
            </a>{' '}
            by David Lorenz, based on The World Atlas of Artificial Night Sky Brightness.
          </p>
          <p className="credit-fine">
            Credit: P. Cinzano, F. Falchi (University of Padova), C. D. Elvidge 
            (NOAA National Geophysical Data Center). © Royal Astronomical Society.
          </p>
        </div>
      </section>

      <section className="credits-section">
        <h2>Historical Sponsors</h2>
        <p className="section-intro">
          These remarkable individuals and organizations supported Attilla's work over the years, 
          helping keep Clear Sky Charts free for everyone. We honor their contributions.
        </p>

        <div className="sponsor-note">
          <p>
            Attilla stopped accepting sponsorships before his passing. In his memory, 
            he suggested donations to the{' '}
            <a href="https://give.wellspring.ca/give-wcsf-paypal" target="_blank" rel="noopener noreferrer">
              Wellspring Cancer Support Foundation
            </a>.
          </p>
        </div>

        <h3>Top Sponsors</h3>
        <div className="sponsors-grid sponsors-grid--top">
          {TOP_SPONSORS.map(s => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="sponsor-card sponsor-card--top">
              {s.name}
            </a>
          ))}
        </div>

        <h3>Astronomy Clubs &amp; Organizations</h3>
        <div className="sponsors-grid">
          {SPONSORS.map(s => (
            <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="sponsor-card">
              {s.name}
            </a>
          ))}
        </div>

        <h3>Individual Supporters</h3>
        <p className="individuals-intro">
          And {INDIVIDUAL_SPONSORS.length} individual astronomers who believed in the mission:
        </p>
        <div className="individuals-list">
          {INDIVIDUAL_SPONSORS.map((name, i) => (
            <span key={name} className="individual-name">
              {name}{i < INDIVIDUAL_SPONSORS.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      </section>

      <section className="credits-section credits-help">
        <h2>How to Help</h2>
        <p className="section-intro">
          This is an open-source volunteer project. Here's how you can contribute:
        </p>

        <div className="help-grid">
          <div className="help-card">
            <h3>Support Development</h3>
            <p>Help cover hosting costs and keep the charts running.</p>
            <a href="https://github.com/sponsors/kirenia" target="_blank" rel="noopener noreferrer" className="help-btn help-btn--donate">
              Become a Sponsor
            </a>
          </div>

          <div className="help-card">
            <h3>Contribute Code</h3>
            <p>Help improve the site, fix bugs, or add features.</p>
            <a href="https://github.com/kirenia/clear-dark-sky" target="_blank" rel="noopener noreferrer" className="help-btn help-btn--github">
              View on GitHub
            </a>
          </div>

          <div className="help-card">
            <h3>Report Issues</h3>
            <p>Found a bug, broken link, or incorrect location? Let us know.</p>
            <a href="mailto:hello@cleardarksky.app" className="help-btn">
              Contact Us
            </a>
          </div>

          <div className="help-card">
            <h3>Support CMC</h3>
            <p>
              Email{' '}
              <a href="mailto:allan.rahill@gmail.com">Allan Rahill</a>{' '}
              describing how you find the forecasts useful. It helps secure 
              continued funding for the astronomy forecast models.
            </p>
          </div>
        </div>
      </section>

      <section className="credits-section credits-rebuild">
        <h2>This Rebuild</h2>
        <p>
          Built by{' '}
          <a href="https://github.com/kirenia" target="_blank" rel="noopener noreferrer">Kire</a>{' '}
          to keep Attilla's legacy alive. Open source, community-driven, and dedicated to 
          serving amateur astronomers for years to come.
        </p>
        <p>
          Special thanks to everyone in the astronomy community who reached out with 
          encouragement, data, and memories of Attilla's work.
        </p>
      </section>
    </div>
  );
}

export default Credits;