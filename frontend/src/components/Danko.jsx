import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Danko.css'

const sections = [
  { id: 'memorial', label: 'Memorial', icon: '✨' },
  { id: 'origin', label: 'Origin Story', icon: '🐍' },
  { id: 'faq', label: 'Telescope FAQ', icon: '🔭' },
  { id: 'seeing', label: 'Understanding Seeing', icon: '👁️' },
  { id: 'silly', label: 'Silly Files', icon: '😄' },
  { id: 'four-observers', label: 'Four Observers', icon: '🎭' },
  { id: 'expletive', label: 'Expletive Scale', icon: '🤬' },
  { id: 'community', label: 'Community', icon: '👥' },
  { id: 'news', label: 'News Archive', icon: '📰' },
]

function Danko() {
  const [activeSection, setActiveSection] = useState('memorial')
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      setActiveSection(id)
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [location.hash])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -60% 0px' }
    )

    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      window.history.pushState(null, '', `#${id}`)
    }
  }

  return (
    <div className="danko-page">
      {/* Starfield background */}
      <div className="danko-stars" aria-hidden="true">
        {[...Array(50)].map((_, i) => (
          <span
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Left Navigation */}
      <nav className="danko-nav">
        <div className="danko-nav-header">
          <span>Danko's Corner</span>
        </div>
        <ul className="danko-nav-list">
          {sections.map(({ id, label, icon }) => (
            <li key={id}>
              <button
                onClick={() => scrollToSection(id)}
                className={activeSection === id ? 'active' : ''}
              >
                <span className="nav-item-icon">{icon}</span>
                {label}
              </button>
            </li>
          ))}
        </ul>
        <div className="danko-nav-footer">
          <Link to="/">← Back to Home</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="danko-content">
        {/* Memorial Section */}
        <section id="memorial" className="danko-section">
          <div className="section-header memorial-header">
            <h1>Attilla Danko</h1>
            <p className="dates">1955 – 2024</p>
            <p className="subtitle">Creator of the Clear Sky Charts</p>
          </div>

          <div className="memorial-content">
            <p>
              Attilla Danko passed away on November 28, 2024. He created the Clear Sky Charts 
              in the early 2000s as a personal project to make weather forecasting easier for 
              amateur astronomers. What started as a way to avoid downloading hundreds of 
              forecast maps became an indispensable tool for thousands of stargazers across 
              North America.
            </p>

            <p>
              An ashes scattering ceremony was held September 28, 2025 on what would have been 
              his 70th birthday, at the North Frontenac Astronomy Park. Ironically, just the 
              weekend before, they held their first overnight star party—he had been really 
              looking forward to bringing a big scope.
            </p>

            <div className="asteroid-card">
              <h3>Asteroid (161693) Attilladanko</h3>
              <p>
                In recognition of his contributions to amateur astronomy, asteroid 161693 
                was named in his honor. Discovered in 2006, this main-belt asteroid orbits 
                the Sun between Mars and Jupiter.
              </p>
              <a
                href="https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=161693"
                target="_blank"
                rel="noopener noreferrer"
                className="asteroid-link"
              >
                View on NASA/JPL →
              </a>
            </div>

            <h3>Awards & Recognition</h3>
            <ul className="awards-list">
              <li><strong>Chilton Prize</strong> – Royal Astronomical Society of Canada, Ottawa Centre</li>
              <li><strong>CMOS Award</strong> – Canadian Meteorological and Oceanographic Society</li>
              <li><strong>Omega Centauri Award</strong> – South Florida Amateur Astronomers Association</li>
              <li><strong>NAA Site of the Week</strong> – Night-Sky Awareness Association</li>
              <li><strong>Stellar Link</strong> – Astronomical League</li>
            </ul>

            <div className="mine-quote">
              <h4>From the Terms of Use:</h4>
              <p>"MINE! MINE! MINE! MINE! MINE!"</p>
              <p className="mine-context">
                — Attilla's response to the question of who owns the Clear Sky Charts
              </p>
            </div>
          </div>
        </section>

        {/* Origin Story Section */}
        <section id="origin" className="danko-section">
          <h2>The Origin Story</h2>
          <p className="section-intro">
            From Attilla's "Boring Homepage" — in his own words.
          </p>

          <div className="faq-item">
            <h3>Me</h3>
            <p>
              I'm a retired software weenie, that's the technical term, and an amateur astronomer.
            </p>
            <p>
              I never had a use for a personal website until I heard about the computer language{' '}
              <a href="http://www.python.org" target="_blank" rel="noopener noreferrer">Python</a>. 
              I figured any language named after{' '}
              <a href="http://en.wikipedia.org/wiki/Monty_Python" target="_blank" rel="noopener noreferrer">
                Monty Python's Flying Circus
              </a>{' '}
              had to be cool. But to learn Python, I needed a problem to write code for. I found it 
              tedious to add 5 in my head to convert UTC to EST in using the astronomy forecast maps 
              at CMC, so I started writing code.
            </p>
            <p>
              Next thing I know, I'm writing optical character recognition code, reverse-engineering 
              map transforms, writing javascripts and web databases, writing failover and load-sharing 
              code for windows and generating Clear Sky Charts. Because of the very cool numerical 
              model Allan Rahill (of CMC) wrote, the Clear Sky Charts turn out to be just about the 
              most accurate forecasting device for astronomers. Then word got around.
            </p>
            <p>
              I'm generating clear sky charts for 6,000+ observatories and observing sites in North 
              America and having an absolute blast. I wish I knew how to turn clear sky charts into 
              a livelihood so I could do it full time.
            </p>
          </div>

          <div className="faq-item">
            <h3>Other Projects</h3>
            <p>There are a few other things on this website that largely came about from the charts:</p>
            <ul className="awards-list">
              <li>
                <strong>Ottawa Astronomy Weather</strong> — A page to explain to fellow observers 
                in Ottawa why the local forecasts were so bad and where to get real astronomer's forecasts.
              </li>
              <li>
                <strong>Seeing Observations Database</strong> — So Allan Rahill could get real data 
                on astronomical seeing in order to tune his numerical seeing model.
              </li>
            </ul>
            <p>And then there is just plain silliness (see below).</p>
          </div>

          <blockquote className="famous-quote">
            <p>
              "Little colored blocks that let you know when you can see a few billion 
              lightyears away? That's just too silly."
            </p>
            <cite>— Attilla Danko</cite>
          </blockquote>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="danko-section">
          <h2>Telescope FAQ</h2>
          <p className="section-intro">
            Attilla received countless emails over the years. Here are answers to the most 
            common questions (not about Clear Sky Charts).
          </p>

          <div className="faq-item">
            <h3>What telescope should I buy?</h3>
            <p>
              Astronomy is one of those hobbies where there is quite a bit to learn before 
              one can safely spend large sums of money with the confidence that you will get a 
              satisfying product.
            </p>
            <p>
              So, I suggest people <strong>don't</strong> buy a telescope. (How un-commercial 
              of me.) Instead I suggest attending star parties, joining an observing group or 
              club and looking through many scopes before you spend any money. The best way to 
              find people who will let you look through their telescopes is to find an astronomy 
              club and go to a local star party.
            </p>
            <p>
              (In case you are wondering, star parties happen in almost complete darkness, so 
              high-heels, tuxedos and even alcohol are not called for.)
            </p>
          </div>

          <div className="faq-item">
            <h3>No really, I want to buy a telescope.</h3>
            <p>
              In that case I must warn you that a good starter scope costs at least $500 and 
              looks like a homemade cannon. Less expensive scopes may look very high-tech but 
              are usually less satisfying than a good pair of binoculars, a good book and an 
              astronomy magazine subscription.
            </p>
            <p>
              On that topic, good choices would be <strong>10×50 binoculars</strong>, the book{' '}
              <em>"Nightwatch"</em> by Terence Dickinson and a subscription to Sky News Magazine 
              or Night Sky Magazine.
            </p>
          </div>

          <div className="faq-item">
            <h3>Ahem. Back on topic, please.</h3>
            <p>
              Right. The first thing anyone needs to know about buying telescopes is to be 
              suspicious of any scope that advertises magnification or power. Any telescope 
              can be made to magnify at any power. Power is not an indication of scope quality 
              or ability. In any case, most good views occur at low power.
            </p>
            <p>
              The second is that there are a great number of different telescopes designs in a 
              wide range of qualities. One telescope cannot do all things or satisfy all people.
            </p>
            <p>
              However, the most recommended first telescope for a beginning visual (i.e. no 
              photography) observer is a <strong>6 inch f/8 Newtonian on a Dobsonian mount</strong>.
            </p>
            <p>
              But a child might find a 4 inch more their size just as some adults might find 
              that they stoop less with an 8". The general idea is to get the largest aperture 
              that you are comfortable using.
            </p>
            <p>
              The details of the possible choices are vast. Terence Dickinson describes the 
              choices very clearly in his book "The Backyard Astronomer's Guide".
            </p>
          </div>

          <div className="faq-item">
            <h3>I know what I want. Where can I buy it?</h3>
            <p>
              If you want helpful sales advice, pick a local telescope shop. If they don't 
              stock it, they all have the ability to order from manufacturers.
            </p>
          </div>

          <div className="faq-item">
            <h3>Hey... I'm a child of the internet, and I fear not spam. Where on the net can I buy a used scope?</h3>
            <p>The most popular places are:</p>
            <ul className="awards-list">
              <li>
                <a href="https://www.astromart.com/classifieds/" target="_blank" rel="noopener noreferrer">
                  Astromart Classifieds
                </a>
              </li>
              <li>
                <a href="https://www.cloudynights.com/classifieds/" target="_blank" rel="noopener noreferrer">
                  CloudyNights Classifieds
                </a>
              </li>
            </ul>
            <p>
              But before you buy a scope you never looked through, you should probably know 
              the meanings of the words: <em>aperture, dobsonian, apochromatic, equatorial, 
              periodic error, star test, finder alignment, collimation</em>, and{' '}
              <em>shipping-damage claim</em>.
            </p>
          </div>
        </section>

        {/* Understanding Seeing Section */}
        <section id="seeing" className="danko-section">
          <h2>Understanding Astronomical Seeing</h2>
          <p className="section-intro">
            From the Canada/USA Astronomical Seeing Observation Program that ClearDarkSky 
            was tickled to host.
          </p>

          <div className="seeing-content">
            <h3>What is Seeing?</h3>
            <p>
              <strong>Seeing</strong> is the term astronomers use to describe an image formed 
              by a telescope that is jiggling, wiggling, swarming, blobbing or otherwise moving 
              in a manner that destroys visible detail.
            </p>
            <p className="emphasis">It's really quite annoying.</p>
            <p>
              The cause is a combination of temperature difference and turbulence in the 
              atmosphere that the light travelled through to get to the eyepiece. That means 
              it can be anywhere from the high atmosphere to the air in the telescope.
            </p>

            <div className="seeing-types">
              <div className="seeing-type">
                <h4>Tube Currents</h4>
                <p>
                  Bad seeing caused by temperature and turbulence in a telescope tube is 
                  properly called <strong>tube currents</strong>.
                </p>
              </div>
              <div className="seeing-type">
                <h4>Ground Seeing</h4>
                <p>
                  Bad seeing caused by local effects, like a hot driveway, is properly 
                  called <strong>ground seeing</strong>.
                </p>
              </div>
              <div className="seeing-type">
                <h4>Atmospheric Seeing</h4>
                <p>
                  Bad seeing caused by temperature and turbulence in the atmosphere, for 
                  example the jet stream, is properly called <strong>atmospheric seeing</strong>.
                </p>
              </div>
            </div>

            <p>
              But astronomers tend to use the term "seeing" to mean just the appearance of 
              bad seeing. This website prefers to use seeing to mean <em>atmospheric seeing</em>.
            </p>

            <h3>Why Make Records of Seeing?</h3>
            <p>
              A night of exceptionally good seeing, a night where the detail seen on Jupiter 
              causes observers to swoon and swear, is thought to be rare. It would be a boon 
              to know in advance when good and bad seeing might occur.
            </p>
            <p>
              Allan Rahill, meteorologist of the CMC and amateur astronomer, created a numerical 
              weather model of atmospheric seeing. Allan previously created an astronomical 
              transparency forecast which is the basis of the Clear Sky Charts. Allan's 
              transparency forecast is known to be more accurate than all other predictors of 
              clear skies (80% to 90%). However, Allan was still tuning his seeing model.
            </p>
            <p>
              The best way for Allan to tune his seeing forecast was for him to compare with 
              real observations of seeing conditions, made by experienced amateur astronomers. 
              (Pros are welcome too, they just tend to be rare.)
            </p>

            <h3>Who Can Participate?</h3>
            <p>
              Anyone who knows the difference between seeing and tube currents, has a telescope 
              6 inches or larger, can rate seeing on any of 5 semi-standard scales, and can 
              tolerate typing into HTML forms is encouraged to participate.
            </p>
            <p className="emphasis">(A sense of humor helps too.)</p>
          </div>
        </section>

        {/* Silly Files Section */}
        <section id="silly" className="danko-section">
          <h2>Silly Files</h2>
          <p className="section-intro">
            Many fine nights observing with buddies who were also Monty Python fans caused 
            moments of weakness. This section collects the silliness.
          </p>

          <div className="silly-item">
            <h3>How Environment Canada Really Forecasts the Weather</h3>
            <p>According to the Rick Mercer Report:</p>
            <a
              href="https://www.youtube.com/watch?v=wkDvqQKGgDA"
              target="_blank"
              rel="noopener noreferrer"
              className="video-link"
            >
              Watch on YouTube →
            </a>
          </div>

          <div className="silly-item">
            <h3>The Nirvana Blues</h3>
            <p>
              Nirvana is a magnitude 7.1 dark-sky site in Ontario frequented by observers 
              from 150km around including Attilla and observing buddy Ross Taylor. Ross wrote 
              and performed the lyrics and music to "The Nirvana Blues."
            </p>
          </div>

          <div className="silly-item poem-box">
            <h3>Ode to CSC</h3>
            <pre className="poem">{`The Clear Sky Chart's a wonderous tool
It offers every scoping fool
The promise of observing

I make it a priority
To check with this authority
My faith in it unswerving

But as it gives it takes away
My eagerness for night and day
It can be quite unserving

Oh, blue on blue can make me high
Point my refractor toward the sky
In weather that's unnerving

But white on white gives me a fright
It promises a gloomy night
And less than I'm deserving`}</pre>
            <p className="poem-author">— Bill Lawrence</p>
          </div>
        </section>

        {/* Four Observers Section - FULL VERSION */}
        <section id="four-observers" className="danko-section">
          <h2>The Four Observers</h2>
          <p className="section-intro">
            <em>
              Inspired by many delightful nights observing at Equuleus Observatory with friends 
              who have a bad habit of making Monty Python voices in the dark, I was inspired to 
              translate the classic sketch, The Four Yorkshiremen, into the language of amateur 
              astronomers.
            </em>{' '}
            —Attilla Danko
          </p>

          <div className="sketch-box">
            <div className="sketch-dialogue">
              <p><strong>Mike:</strong> Ahh.. Very passable, this, very passable.</p>
              
              <p><strong>Richard:</strong> Nothing like a 30" goto Starmaster, eh?</p>
              
              <p><strong>Roland:</strong> You're right there, Sir Richard.</p>
              
              <p><strong>Matt:</strong> Who'd a thought thirty years ago, we'd all be observing with a binoviewered 30" computer-controlled scope in a luxurious roll-off roof observatory big enough for a whole star party.</p>
              
              <p><strong>Mike:</strong> Aye. In them days, we'd a' been glad to have a schmidt-cassegrain.</p>
              
              <p><strong>Richard:</strong> A Halley's-comet era Celestron.</p>
              
              <p><strong>Matt:</strong> Without a tripod.</p>
              
              <p><strong>Roland:</strong> <strong>Or</strong> a drive.</p>
              
              <p><strong>Mike:</strong> 30mm finder, and all.</p>
              
              <p><strong>Matt:</strong> We never had a finder. We used to sight along a seam in the tube.</p>
              
              <p><strong>Richard:</strong> The best <strong>we</strong> could manage was to sweep at random with 25mm Kellner.</p>
              
              <p><strong>Roland:</strong> But you know, we were happy in those days, though we had crappy gear.</p>
              
              <p><strong>Mike:</strong> Aye. <strong>Because</strong> we had crappy gear. My old Dad used to say to me, "Its not the scope, its the observer."</p>
              
              <p><strong>Matt:</strong> 'E was right. I was happier then and I didn't have even a telrad. We had this tiny observatory with with greaaaaat big holes in the roof.</p>
              
              <p><strong>Richard:</strong> Observatory? You were lucky to have an Observatory! We used to observe on the porch, all twenty-six of us, no dome slit. Half the sky was missing and we were all huddled together in one corner just to see down to 35 degrees!</p>
              
              <p><strong>Roland:</strong> You were lucky to have a <strong>porch</strong>! We used to have to climb the fire escape to the roof.</p>
              
              <p><strong>Mike:</strong> Ohhhh we used to <strong>dream</strong> of fire escapes to the roof! Woulda' been Kitt Peak to us! We used to observe out the bathroom window of a downtown apartment. In the winter, the escaping warm air would cause airy disks to bloat to 20 arcseconds. Observatory. Hmmph.</p>
              
              <p><strong>Matt:</strong> Well when I say "Observatory" it was only a garden shed with the door open, but it was an observatory to <strong>us</strong>.</p>
              
              <p><strong>Richard:</strong> We were evicted from our garden shed; we had to go and observe in a sodium-vapor lit hockey rink.</p>
              
              <p><strong>Roland:</strong> You were lucky to have a <strong>rink</strong>! There were a hundred and fifty of us observing in a cardboard box in the middle of the 417.</p>
              
              <p><strong>Mike:</strong> [...challenging tone...] Cardboard box?</p>
              
              <p><strong>Roland:</strong> [...determined look...] Aye.</p>
              
              <p><strong>Mike:</strong> You were lucky. We observed for three months in the nude in a swamp. We used to have to setup at six in the morning, hack down the bullrushes, drain the swamp, sink the tripods four feet into the muck, collimate for 14 hours, just for a couple of hours of observing. And when we got home our S.O. would complain about how much we spent on telescopes.</p>
              
              <p><strong>Richard:</strong> <strong>Luxury!</strong> We used to have to set up in the swamp at six in the morning, drain the swamp, cut down trees, scrape mosquitos off of our optical surfaces, sink the tripods 6 feet into the muck, collimate for 16 hours. And when we got home, our wives would sell our telescopes, <strong>if</strong> we were lucky!</p>
              
              <p><strong>Roland:</strong> Well of course, we had it tough. ... We used to have to get set up the previous night, drain the swamp by bailing with our OTAs, re-aluminize our mirrors, and collimate 32 different optical surfaces for 20 hours. And when we got home our S.O. would accuse us of having sexual relations with a paracorr and divorce us.</p>
              
              <p><strong>Matt:</strong> <strong>Right.</strong> [...pause to muster effort...] I had to walk to the swamp, which was uphill both ways, carrying 300 pounds of gear, set up the previous night, sop up the swamp with my only copy of Uranometria, melt sand into glass, sift more sand into abrasives, chew pine trees to make pitch, grind 12 mirrors, collimate for 36 hours, observe with a 1mm eyerelief tasco eyepiece for 3 minutes under a limiting magnitude of -26 in heavy snow showers, and when we got home our S.O. would spit in our Naglers and run off with the editor of Sky&Tel.</p>
              
              <p><strong>Mike:</strong> And you try and tell the young observers today that...</p>
              
              <p><strong>All:</strong> They won't believe ya'.</p>
            </div>

            <p className="sketch-link">
              <a
                href="https://web.archive.org/web/20241119012011/http://cleardarksky.com/fourobservers.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                View original on Archive.org →
              </a>
            </p>
          </div>
        </section>

        {/* Expletive Scale Section - FULL UNCENSORED VERSION */}
        <section id="expletive" className="danko-section">
          <h2>Expletive Scale of Astronomical Observation</h2>
          <p className="section-intro warning-text">
            ⚠️ WARNING: Minors and people with taste should stop reading now.
          </p>

          <p>
            There are a number of numerical scales used to rate observing conditions in amateur 
            astronomy. There is a 1 to 10{' '}
            <a href="https://skyandtelescope.org/astronomy-resources/a-scale-of-seeing/" target="_blank" rel="noopener noreferrer">
              scale for seeing
            </a>, and the{' '}
            <a href="https://skyandtelescope.org/astronomy-resources/light-pollution-and-astronomy-the-bortle-dark-sky-scale/" target="_blank" rel="noopener noreferrer">
              John Bortle scale
            </a>{' '}
            for evaluating sky darkness.
          </p>
          <p>
            However, my observing buddies and I have settled on a scale for evaluating observing 
            conditions based on the first words people say when they look through the eyepiece. 
            Although they're completely subjective, people are remarkably consistent in the words 
            they choose. Also, observers new to the scale seem to immediately grasp the meaning.
          </p>
          <p className="emphasis">It's also a lot sillier than a numeric scale.</p>

          <div className="expletive-table">
            <table>
              <thead>
                <tr>
                  <th>Standard Term</th>
                  <th>Polite Alternative</th>
                  <th>Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="2">What am I looking at?</td>
                  <td>Scope knocked off target</td>
                </tr>
                <tr>
                  <td>Hmmph</td>
                  <td>I see it</td>
                  <td>Out of focus moon, at public star parties</td>
                </tr>
                <tr>
                  <td>Shitty, Crappy</td>
                  <td>Lousy</td>
                  <td>No bands on Jupiter</td>
                </tr>
                <tr>
                  <td colSpan="2">Crummy</td>
                  <td>Two bands on Jupiter, but nothing else</td>
                </tr>
                <tr>
                  <td colSpan="2">Good</td>
                  <td>Cassini's division</td>
                </tr>
                <tr>
                  <td colSpan="2">Wow!</td>
                  <td>Quarter moon seen through APO refractor</td>
                </tr>
                <tr>
                  <td>Orgasmic!</td>
                  <td>"Yesssss!" or "Awesome!"</td>
                  <td>M13 seen through a 25"</td>
                </tr>
                <tr>
                  <td>Holy Shit!</td>
                  <td>HS</td>
                  <td>M42 seen through a 25"</td>
                </tr>
                <tr>
                  <td>Holy Fuck!</td>
                  <td>HF</td>
                  <td>On Jupiter: detail inside blue-green festoons, tiny white ovals, dark red spots and detail inside the GRS. Any detail on Ganymede.</td>
                </tr>
                <tr>
                  <td>Holy Fucking Shit!</td>
                  <td>HFS</td>
                  <td>Cat's Eye nebula seen through an 82"</td>
                </tr>
                <tr className="highlight-row">
                  <td><strong>Totally Fucking Awesome!</strong></td>
                  <td>TFA</td>
                  <td>The bridge connecting NGC5194 and NGC5195 in M51, as seen through an 82"</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Erudite psychologists will recognize this as a{' '}
            <a 
              href="http://en.wikipedia.org/wiki/Just_noticeable_difference" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Just Noticeable Difference
            </a>{' '}
            scale.
          </p>
          <p>Canadians will notice that we swear just to keep from freezing.</p>

          <p className="sketch-link">
            <a
              href="https://web.archive.org/web/20241119012031/http://cleardarksky.com/expletivescale.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              View original on Archive.org →
            </a>
          </p>
        </section>

        {/* Community Section */}
        <section id="community" className="danko-section">
          <h2>Community</h2>
          <p className="section-intro">
            Attilla appreciated the social aspects of the astronomy hobby. So he deliberately 
            created a few places where astronomers could yak.
          </p>

          <div className="seeing-types">
            <div className="seeing-type">
              <h4>BigDob Mailing List</h4>
              <p>For big dobsonian telescope enthusiasts.</p>
              <a 
                href="https://groups.io/g/BigDobsonians" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Join on Groups.io →
              </a>
            </div>
            <div className="seeing-type">
              <h4>Ottawa Astronomy Friends (OAFs)</h4>
              <p>Mailing list for observing buddies who say Ni!</p>
              <a 
                href="https://groups.io/g/OAFs" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Join on Groups.io →
              </a>
            </div>
            <div className="seeing-type">
              <h4>Ottawa Astronomy Weather</h4>
              <p>
                Written to explain to fellow observers in Ottawa why the local forecasts were 
                so bad and where to get real astronomer's forecasts.
              </p>
              <a 
                href="https://web.archive.org/web/20241119012051/http://cleardarksky.com/oaw/"
                target="_blank" 
                rel="noopener noreferrer"
              >
                View on Archive.org →
              </a>
            </div>
          </div>
        </section>

        {/* News Archive Section */}
        <section id="news" className="danko-section">
          <h2>News Archive</h2>
          <p className="section-intro">
            A chronicle of Clear Sky Chart updates, features, and adventures from 2002 to 2024. 
            Reading through this history reveals the dedication and personality Attilla brought 
            to the project over two decades.
          </p>

          <div className="news-archive">
            <article className="news-item">
              <time>2024 April 5</time>
              <h4>Eclipse Track Features</h4>
              <p>
                Added eclipse track overlays to forecast maps and satellite imagery. "I plan 
                to use that page just an hour or so before the eclipse to make a final choice 
                of observing location."
              </p>
            </article>

            <article className="news-item">
              <time>2023 December 14</time>
              <h4>New Light Pollution Maps</h4>
              <p>
                David Lorenz recalculated his Light Pollution Atlas with 2022 satellite data. 
                Updated all lightpollution maps and ratings. ":( for those wishing to track 
                the creeping horror of increasing lightpollution."
              </p>
            </article>

            <article className="news-item">
              <time>2023 June 7</time>
              <h4>New Smoke Colors</h4>
              <p>
                Changed smoke forecast colors to more clearly indicate unhealthy levels. 
                "The last two levels I show in brown because that's what the sky actually 
                looks like at 200 to 500 micrograms per cubic meter. Yuck."
              </p>
            </article>

            <article className="news-item">
              <time>2020 September 18</time>
              <h4>Smoke Forecasts Added</h4>
              <p>
                Added Environment Canada's smoke forecast to the charts. "So like before, 
                lots of blue squares means you can observe."
              </p>
            </article>

            <article className="news-item">
              <time>2017 October 21</time>
              <h4>Aurora Alerts</h4>
              <p>
                Added aurora alerts for charts in the green region of NOAA's Ovation forecast 
                map. Alerts may update as often as every 15 minutes.
              </p>
            </article>

            <article className="news-item">
              <time>2010 Feb 21</time>
              <h4>Server Troubles</h4>
              <p>
                "If clear sky charts have been loading very slowly, or you can't reach them 
                at all... My web servers are very slow. It appears to be because of heavy use. 
                The problem appears to be certain search engines, like Yahoo, who are ignoring 
                my robots.txt file."
              </p>
            </article>

            <article className="news-item highlight">
              <time>2009 Dec 31</time>
              <h4>Y2.01K Bug</h4>
              <p>
                "In 2001 when I first wrote code to parse forecast data from CMC, I figured I 
                should check for corrupt dates. Clearly anything after 2009-12-31 was a corrupt 
                and ridiculous date. I had made a teeny weeny little assumption — that there 
                was no possible way I'd still be doing this for 10 years."
              </p>
              <p className="news-quote">
                "But really, we're overdue for a better forecast. And while we're at it, 
                where the heck is my flying car?"
              </p>
            </article>

            <article className="news-item">
              <time>2008 Feb 29</time>
              <h4>Name Change</h4>
              <p>
                Due to potential trademark infringement litigation, changed the name from 
                "Clear Sky Clock" to "Clear Sky Chart." "In a moment of complete-lack-of-
                imagination, I've decided to call them 'clear sky charts' instead."
              </p>
            </article>

            <article className="news-item highlight">
              <time>2002 October 9</time>
              <h4>Saved by the Community</h4>
              <p>
                The CMC astronomy forecasts nearly got cancelled. Over 2000 support emails 
                from users helped convince CMC directors to keep the forecasts. "The volume 
                and geographical extent of the emailed support was a factor in the CMC directors 
                deciding to work to make the Astronomy forecasts into an official CMC product."
              </p>
            </article>
          </div>

          <p className="news-note">
            This is a condensed version of the news archive. Many more updates, bug fixes, 
            and adventures are documented in the original site's history.
          </p>
        </section>
      </main>
    </div>
  )
}

export default Danko