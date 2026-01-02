import { useState, useEffect, useCallback } from 'react'
import { calculateLimitingMagnitude, getCurrentTimeParams } from '../utils/limitingMagnitudeCalc'
import './Home.css';
import './Calc.css'

function Calc() {
  // Location inputs
  const [longi, setLongi] = useState('74 00')
  const [lati, setLati] = useState('40 45')
  const [longDir, setLongDir] = useState('W')
  const [latDir, setLatDir] = useState('N')
  const [elevation, setElevation] = useState('100')
  
  // Time inputs
  const [stime, setStime] = useState('17:31:21')
  const [year, setYear] = useState('2026')
  const [month, setMonth] = useState('1')
  const [day, setDay] = useState('2')
  const [dst, setDst] = useState(false)
  
  // Weather inputs
  const [temperature, setTemperature] = useState('65.0')
  const [humidity, setHumidity] = useState('40.0')
  
  // Observer inputs
  const [snellen, setSnellen] = useState('1.0')
  const [experience, setExperience] = useState('5')
  const [age, setAge] = useState('35')
  
  // Pointing inputs
  const [alt, setAlt] = useState('45.')
  const [az, setAz] = useState('180.')
  
  // Results
  const [results, setResults] = useState(null)
  
  // Set current time on mount
  useEffect(() => {
    setCurrentTime()
  }, [])
  
  const setCurrentTime = () => {
    const params = getCurrentTimeParams()
    setYear(String(params.year))
    setMonth(String(params.month))
    setDay(String(params.day))
    const h = String(params.hour).padStart(2, '0')
    const m = String(params.minute).padStart(2, '0')
    const s = String(params.second).padStart(2, '0')
    setStime(`${h}:${m}:${s}`)
  }
  
  const clearEntries = () => {
    setLongi('74 00')
    setLati('40 45')
    setLongDir('W')
    setLatDir('N')
    setElevation('100')
    setTemperature('65.0')
    setHumidity('40.0')
    setSnellen('1.0')
    setExperience('5')
    setAge('35')
    setAlt('45.')
    setAz('180.')
    setDst(false)
    setResults(null)
  }
  
  const calculate = useCallback(() => {
    // Parse longitude/latitude from "dd mm" format
    const lonParts = longi.trim().split(/\s+/)
    const latParts = lati.trim().split(/\s+/)
    const longDeg = parseFloat(lonParts[0]) + (parseFloat(lonParts[1] || 0) / 60)
    const latDeg = parseFloat(latParts[0]) + (parseFloat(latParts[1] || 0) / 60)
    const longitude = longDeg * (longDir === 'W' ? 1 : -1)
    const latitude = latDeg * (latDir === 'N' ? 1 : -1)
    
    // Parse time
    const timeParts = stime.split(':')
    const hour = parseInt(timeParts[0]) || 0
    const minute = parseInt(timeParts[1]) || 0
    const second = parseInt(timeParts[2]) || 0
    
    const params = {
      longitude,
      latitude,
      elevation: parseFloat(elevation),
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      hour,
      minute,
      second,
      dst: dst ? 1 : 0,
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      snellen: parseFloat(snellen),
      experience: parseFloat(experience),
      age: parseFloat(age),
      altStar: parseFloat(alt),
      azStar: parseFloat(az)
    }
    
    try {
      const result = calculateLimitingMagnitude(params)
      setResults(result)
    } catch (e) {
      console.error('Calculation error:', e)
      alert('Error in calculation. Please check your inputs.')
    }
  }, [longi, lati, longDir, latDir, elevation, year, month, day, stime, dst, temperature, humidity, snellen, experience, age, alt, az])
  
  return (
    <div className="calc-page">
      <div className="calc-content">
        <h2>Limiting Magnitude Calculations</h2>
        <p className="calc-instructions">
          Use this form to calculate the faintest star you can see for a given place, time and observer.<br />
          Fill in the "Observer's Info" and click <strong>Calculate</strong>. To reset to the current time, click <strong>Current Time</strong>.
        </p>
        
        {/* Info bar before calculator */}
        <div className="calc-info-bar">
          <span className="calc-info-item calc-caution">
            <a href="#cautions">⚠ Read the cautions</a>
          </span>
          <span className="calc-info-divider">·</span>
          <span className="calc-info-item">
            <a href="#testing">Model Testing</a>
          </span>
          <span className="calc-info-divider">·</span>
          <span className="calc-info-item">
            <a href="#biblio">Bibliography</a>
          </span>
        </div>
        
        <table className="calc-main-table">
          <tbody>
            <tr valign="top">
              {/* Left Column - Observer's Info */}
              <td className="calc-input-col">
                <h3>Observer's Info</h3>
                
                <table className="calc-inner-table">
                  <tbody>
                    <tr>
                      <td><strong>Longitude (dd mm)</strong></td>
                      <td>
                        <input 
                          type="text" 
                          value={longi} 
                          onChange={(e) => setLongi(e.target.value)}
                          size="7"
                        />
                      </td>
                      <td>
                        <label>
                          <input 
                            type="radio" 
                            checked={longDir === 'W'} 
                            onChange={() => setLongDir('W')}
                          /> West
                        </label>
                      </td>
                      <td>
                        <label>
                          <input 
                            type="radio" 
                            checked={longDir === 'E'} 
                            onChange={() => setLongDir('E')}
                          /> East
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Latitude (dd mm)</strong></td>
                      <td>
                        <input 
                          type="text" 
                          value={lati} 
                          onChange={(e) => setLati(e.target.value)}
                          size="7"
                        />
                      </td>
                      <td>
                        <label>
                          <input 
                            type="radio" 
                            checked={latDir === 'N'} 
                            onChange={() => setLatDir('N')}
                          /> North
                        </label>
                      </td>
                      <td>
                        <label>
                          <input 
                            type="radio" 
                            checked={latDir === 'S'} 
                            onChange={() => setLatDir('S')}
                          /> South
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Elevation (meters)</strong></td>
                      <td>
                        <input 
                          type="text" 
                          value={elevation} 
                          onChange={(e) => setElevation(e.target.value)}
                          size="6"
                        />
                      </td>
                      <td colSpan="2">above sea-level</td>
                    </tr>
                    <tr>
                      <td><strong>Time (hh:mm:ss)</strong></td>
                      <td>
                        <input 
                          type="text" 
                          value={stime} 
                          onChange={(e) => setStime(e.target.value)}
                          size="8"
                          maxLength="8"
                        />
                      </td>
                      <td colSpan="2">
                        <strong>Daylight Savings</strong><br />
                        <label>
                          <input 
                            type="radio" 
                            checked={dst === true} 
                            onChange={() => setDst(true)}
                          /> ON
                        </label>
                        {' '}
                        <label>
                          <input 
                            type="radio" 
                            checked={dst === false} 
                            onChange={() => setDst(false)}
                          /> OFF
                        </label>
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <table className="calc-inner-table">
                  <tbody>
                    <tr>
                      <td><strong>Year</strong></td>
                      <td>
                        <input 
                          type="text" 
                          value={year} 
                          onChange={(e) => setYear(e.target.value)}
                          size="4"
                          maxLength="4"
                        />
                      </td>
                      <td><strong>Month</strong></td>
                      <td>
                        <input 
                          type="text" 
                          value={month} 
                          onChange={(e) => setMonth(e.target.value)}
                          size="2"
                          maxLength="2"
                        />
                      </td>
                      <td><strong>Day</strong></td>
                      <td>
                        <input 
                          type="text" 
                          value={day} 
                          onChange={(e) => setDay(e.target.value)}
                          size="2"
                          maxLength="2"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <table className="calc-inner-table">
                  <tbody>
                    <tr>
                      <td><strong>Temperature (F)</strong></td>
                      <td>
                        <input 
                          type="text" 
                          value={temperature} 
                          onChange={(e) => setTemperature(e.target.value)}
                          size="5"
                          maxLength="5"
                        />
                      </td>
                      <td><strong>Humidity (%)</strong></td>
                      <td>
                        <input 
                          type="text" 
                          value={humidity} 
                          onChange={(e) => setHumidity(e.target.value)}
                          size="5"
                          maxLength="5"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <table className="calc-inner-table">
                  <tbody>
                    <tr>
                      <td><a href="#snel"><strong>Snellen Ratio</strong></a></td>
                      <td>
                        <input 
                          type="text" 
                          value={snellen} 
                          onChange={(e) => setSnellen(e.target.value)}
                          size="5"
                          maxLength="5"
                        />
                      </td>
                      <td><a href="#accuity"><strong>Experience</strong></a> (0-10)</td>
                      <td>
                        <input 
                          type="text" 
                          value={experience} 
                          onChange={(e) => setExperience(e.target.value)}
                          size="5"
                          maxLength="3"
                        />
                      </td>
                      <td><a href="#age"><strong>Age</strong></a> (yrs)</td>
                      <td>
                        <input 
                          type="text" 
                          value={age} 
                          onChange={(e) => setAge(e.target.value)}
                          size="3"
                          maxLength="3"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table className="calc-inner-table">
                  <tbody>
                    <tr>
                      <td colSpan="4"><strong>Where is the observer looking in the sky?</strong></td>
                    </tr>
                    <tr>
                      <td><a href="#alt"><strong>Altitude</strong></a></td>
                      <td>
                        <input 
                          type="text" 
                          value={alt} 
                          onChange={(e) => setAlt(e.target.value)}
                          size="5"
                          maxLength="5"
                        />
                      </td>
                      <td><a href="#az"><strong>Azimuth</strong></a></td>
                      <td>
                        <input 
                          type="text" 
                          value={az} 
                          onChange={(e) => setAz(e.target.value)}
                          size="5"
                          maxLength="5"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="calc-buttons">
                  <button onClick={calculate}>Calculate</button>
                  <button onClick={setCurrentTime}>Current Time</button>
                  <button onClick={clearEntries}>Clear Entries</button>
                </div>
              </td>
              
              {/* Right Column - Estimated Physical Conditions */}
              <td className="calc-output-col">
                <h3>Estimated Physical Conditions</h3>
                
                <table className="calc-inner-table">
                  <tbody>
                    <tr className="calc-header-row">
                      <td></td>
                      <td><a href="#alt">Alt</a></td>
                      <td><a href="#az">Az</a></td>
                      <td><a href="#elongation">Elong.</a></td>
                      <td>% Illum.</td>
                      <td><a href="#magmn">V Mag</a></td>
                    </tr>
                    <tr>
                      <td><strong>Sun</strong></td>
                      <td><input type="text" value={results?.altSun ?? ''} readOnly size="5" /></td>
                      <td><input type="text" value={results?.azSun ?? ''} readOnly size="5" /></td>
                      <td><input type="text" value={results?.rhoSun ?? ''} readOnly size="5" /></td>
                      <td></td>
                      <td><input type="text" value={results?.magSun ?? ''} readOnly size="5" /></td>
                    </tr>
                    <tr>
                      <td><strong>Moon</strong></td>
                      <td><input type="text" value={results?.altMoon ?? ''} readOnly size="5" /></td>
                      <td><input type="text" value={results?.azMoon ?? ''} readOnly size="5" /></td>
                      <td><input type="text" value={results?.rhoMoon ?? ''} readOnly size="5" /></td>
                      <td><input type="text" value={results?.illFrac ?? ''} readOnly size="5" /></td>
                      <td><input type="text" value={results?.magMoon ?? ''} readOnly size="5" /></td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="calc-result-highlight">
                  <strong><a href="#lvm">Limiting visual magnitude</a></strong>
                  <span className="calc-result-value">
                    <input type="text" value={results?.limMag ?? ''} readOnly size="6" />
                    <span className="calc-plusminus">±</span>
                    <input type="text" value={results?.magErr ?? ''} readOnly size="5" />
                  </span>
                </div>
                
                <hr />
                
                <table className="calc-inner-table">
                  <tbody>
                    <tr>
                      <td><input type="text" value={results?.extinctionCoeff ?? ''} readOnly size="5" /></td>
                      <td><strong>Extinction coefficient</strong> [V mag/airmass]</td>
                    </tr>
                    <tr>
                      <td><input type="text" value={results?.extinction ?? ''} readOnly size="5" /></td>
                      <td><strong>Extinction</strong> [V magnitudes]</td>
                    </tr>
                  </tbody>
                </table>
                
                <table className="calc-inner-table calc-brightness-table">
                  <tbody>
                    <tr className="calc-header-row">
                      <td><a href="#sky"><strong>Total Sky Brightness</strong></a></td>
                      <td><a href="#sky"><strong>Lunar Brightness</strong></a></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td><input type="text" value={results?.skyBrightnessNL ?? ''} readOnly size="10" /></td>
                      <td><input type="text" value={results?.moonBrightnessNL ?? ''} readOnly size="10" /></td>
                      <td>NanoLamberts</td>
                    </tr>
                    <tr>
                      <td><input type="text" value={results?.skyBrightnessMag ?? ''} readOnly size="10" /></td>
                      <td><input type="text" value={results?.moonBrightnessMag ?? ''} readOnly size="10" /></td>
                      <td>V Mag/arcsec²</td>
                    </tr>
                  </tbody>
                </table>
                
                <hr />
                
                <table className="calc-inner-table">
                  <tbody>
                    <tr>
                      <td><strong>Julian Date</strong></td>
                      <td><input type="text" value={results?.jd?.toFixed(6) ?? ''} readOnly size="14" /></td>
                    </tr>
                    <tr>
                      <td><strong>MLST</strong></td>
                      <td><input type="text" value={results?.lst ?? ''} readOnly size="9" /></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        <p className="calc-attribution">
          <em>Hacked together by Ben Sugerman, Jan 2000.</em> Ben no longer supports this page.
        </p>
        
        {/* Term Definitions */}
        <div className="calc-definitions">
          <h2>Term Definitions</h2>
          
          <p>
            <a id="alt"><strong>Altitude</strong></a>: Degrees measured from the horizon toward the zenith. Horizon = 0°, zenith = 90°.
          </p>
          <p>
            <a id="az"><strong>Azimuth</strong></a>: Degrees measured clockwise along the horizon from north. North = 0°, East = 90°, South = 180°, West = 270°.
          </p>
          <p>
            <a id="elongation"><strong>Elongation</strong></a>: Angular distance in degrees between two points on the sky (here, from sun/moon to your pointing direction).
          </p>
          <p>
            <a id="snel"><strong>Snellen Ratio</strong></a>: Your vision quality as a ratio. Normal "20/20" = 1.0, poor "20/100" = 0.2, excellent "20/10" = 2.0.
          </p>
          <p>
            <a id="accuity"><strong>Observer's Experience</strong></a>: Self-rating from 0-10 measuring your sensitivity to faint light:
          </p>
          <ul>
            <li><strong>0</strong> – Never observed at night; bump into things in a dark room.</li>
            <li><strong>3</strong> – Some experience; can see room details when dark-adapted; can split Alcor/Mizar. <em>Use this if unsure.</em></li>
            <li><strong>5</strong> – Average astronomy club member; can find Messier objects in a finderscope.</li>
            <li><strong>6</strong> – Use this to evaluate without observer experience correction.</li>
            <li><strong>7</strong> – Very experienced; can see Messier objects naked-eye and distinguish extended sources.</li>
            <li><strong>10</strong> – Exceptional; can read by starlight, count 14 Pleiades stars, see Jupiter's moons unaided.</li>
          </ul>
          <p>
            <a id="age"><strong>Age</strong></a>: Pupil response varies with age. Set <strong>age=25</strong> to disable the age correction.
          </p>
          <p>
            <a id="magmn"><strong>Observed Moon/Sun Magnitude</strong></a>: Visual magnitude given phase and position. Shows "down" if below horizon.
          </p>
          <p>
            <a id="lvm"><strong>Limiting Visual Magnitude</strong></a>: The faintest star visible under your conditions. Does not account for light pollution, clouds, volcanic dust, jet stream, etc. Error assumes 20% sky brightness uncertainty.
          </p>
          <p>
            <a id="sky"><strong>Total Sky Brightness</strong></a>: Combined brightness from airglow, zodiacal light, moon, sun, and twilight gradient. ~20% uncertainty. Does not include artificial light pollution. <strong>Lunar Sky Brightness</strong> is the moon's contribution only.
          </p>
          
          <hr />
          
          <h2 id="cautions">Important Caveats</h2>
          
          <p>
            The model estimates sky brightness from four factors: sunlight, moonlight, night-sky glow, and twilight gradient (plus glare within 5° of the moon). From your pointing direction, temperature, and humidity, it estimates atmospheric extinction. A star must be brighter than sky brightness minus extinction to be visible.
          </p>
          
          <p>
            Reality is messier. Even without light pollution, atmospheric conditions vary unpredictably: air currents, jet stream, pressure fronts, temperature/humidity gradients at altitude, dust, pollen, haze. The model uses average conditions—if today differs from the historical average, results won't match. Human vision varies too, and detecting faint objects requires trained eyes.
          </p>
          
          <p>
            This implementation reconstructs Dr. Bradley Schaefer's (Yale) published methods. Schaefer tested sky brightness estimates at ~20% accuracy. With error propagation through all calculations, <strong>expect ~8% uncertainty in magnitude</strong> and <strong>10-40 minutes temporal uncertainty</strong>.
          </p>
          
          <p>
            Take results with a grain of salt. If you don't see what the model predicts, that's expected given the inherent variability.
          </p>
          
          <hr />
          
          <h2 id="testing">Model Testing Results</h2>
          <p>Jan 15, 2000 at MDM Observatory, Arizona (Long 111°37'E, Lat 31°57', Elev 1925m, Temp 58°F, Humid 8%, Snellen 1.0, Exp 6, Age 25):</p>
          <ul>
            <li><strong>6:00</strong> – Boötes star 46 (Alt 65°, Az 96°) observed at V=5.56 → Model: 6.07 ± 0.4 [full dark]</li>
            <li><strong>17:30</strong> – Capella (Alt 37°, Az 53°) observed at V=0.08 → Model: 0.07 ± 0.34 [sunset + quarter moon]</li>
            <li><strong>19:20</strong> – Pleiades star 19 (Alt 72°, Az 111°) observed at V=4.29 → Model: 4.78 ± 0.42 [dark + quarter moon]</li>
            <li><strong>19:40</strong> – Orion star 52 (Alt 40°, Az 110°) observed at V=5.28 → Model: 4.97 ± 0.42 [dark + quarter moon]</li>
          </ul>
          
          <hr />
          
          <h2 id="biblio">Bibliography</h2>
          <ul>
            <li>Garstang R., 1986, P.A.S.P., Vol. 98, pp 364-375</li>
            <li>Garstang R., 1989, P.A.S.P., Vol. 101, pp 306-329</li>
            <li>Krisciunas K., Schaefer B., 1991, P.A.S.P., Vol. 102, pp 1022-1039</li>
            <li>Schaefer B., 1990, P.A.S.P., Vol. 102, pp 212-229</li>
            <li>Schaefer B., 1991, P.A.S.P., Vol. 102, pp 645-660</li>
            <li>Schaefer B., 1993, Vistas in Astronomy, Vol. 36, pp 311-361</li>
            <li>Schaefer B., 1998, Sky & Telescope, Vol. 95, No. 5, p 57</li>
            <li>Schaefer B., Bulder H., Bourgeois J., 1992, Icarus, Vol. 100, pp 60-72</li>
          </ul>
          <p className="calc-credits">
            Thanks to Brad Schaefer, John Thorstensen (Skycalc), and Larry Bogan (JavaScript port).
          </p>
          
          <hr />
          
          <p className="calc-archive-link">
            Original preserved on the{' '}
            <a href="https://web.archive.org/web/20241119012051/http://cleardarksky.com/others/BenSugerman/star.htm" target="_blank" rel="noopener noreferrer">
              Wayback Machine
            </a>. Source code on{' '}
            <a href="https://github.com/ad5oo/limiting-magnitude" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Calc