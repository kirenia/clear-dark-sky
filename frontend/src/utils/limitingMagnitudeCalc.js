/**
 * Limiting Magnitude Calculator
 * Based on Ben Sugerman's original code (Jan 2000)
 * Adapted from cleardarksky.com/others/BenSugerman/star.htm
 * 
 * Bibliography:
 * - Garstang R., 1986, P.A.S.P., Vol. 98, pp 364-375
 * - Garstang R., 1989, P.A.S.P., Vol. 101, pp 306-329
 * - Krisciunas K., Schaefer B., 1991, P.A.S.P., Vol. 102, pp 1022-1039
 * - Schaefer B., 1998, Sky & Telescope, Vol. 95, No. 5, p 57
 * - Schaefer B., 1990, P.A.S.P., Vol. 102, pp 212-229
 * - Schaefer B., 1991, P.A.S.P., Vol. 102, pp 645-660
 * - Shaefer B., 1993, Vistas in Astronomy, Vol. 36, pp 311-361
 */

// Constants
const SEC_IN_DAY = 86400;
const J2000 = 2451545;
const FLATTEN = 0.003352813;
const EQUAT_RAD = 6378137;
const PI = Math.PI;
const DEG_IN_RADIAN = 57.2957795130823;
const HRS_IN_RADIAN = 3.819718634205;

// Filter arrays (using V-band only, index 3)
const wa = [0, 0.365, 0.44, 0.55, 0.7, 0.9];
const mo = [0, -10.93, -10.45, -11.05, -11.90, -12.70];
const oz = [0, 0.000, 0.000, 0.031, 0.008, 0.000];
const wt = [0, 0.074, 0.045, 0.031, 0.020, 0.015];
const bo = [0, 8.0e1, 7.0e1, 2.0e2, 1.0e2, 3.0e2];
const cm = [0, 1.36, 0.91, 0.00, -0.76, -1.17];
const ms = [0, -25.96, -26.09, -26.74, -27.26, -27.55];

/**
 * Returns radian angle 0 to 2pi for coords x, y
 */
function atanCirc(x, y) {
  let theta = 0;
  if (x === 0) {
    if (y > 0) theta = PI / 2;
    else if (y < 0) theta = (3 * PI) / 2;
    else theta = 0;
  } else {
    theta = Math.atan(y / x);
  }
  if (x < 0) theta = theta + PI;
  if (theta < 0) theta = theta + 2 * PI;
  return theta;
}

/**
 * Normalize angle to 0-360 range
 */
function circulo(x) {
  const n = Math.floor(x / 360);
  return x - 360 * n;
}

/**
 * Angle subtended by two positions in the sky (radians)
 */
function subtend(ra1, dec1, ra2, dec2) {
  const ra1Rad = ra1 / HRS_IN_RADIAN;
  const dec1Rad = dec1 / DEG_IN_RADIAN;
  const ra2Rad = ra2 / HRS_IN_RADIAN;
  const dec2Rad = dec2 / DEG_IN_RADIAN;

  const x1 = Math.cos(ra1Rad) * Math.cos(dec1Rad);
  const y1 = Math.sin(ra1Rad) * Math.cos(dec1Rad);
  const z1 = Math.sin(dec1Rad);
  const x2 = Math.cos(ra2Rad) * Math.cos(dec2Rad);
  const y2 = Math.sin(ra2Rad) * Math.cos(dec2Rad);
  const z2 = Math.sin(dec2Rad);

  let theta = Math.acos(x1 * x2 + y1 * y2 + z1 * z2);

  // Use flat approximation for very small angles away from poles
  if (theta < 1.0e-5) {
    if (Math.abs(dec1Rad) < PI / 2 - 0.001 && Math.abs(dec2Rad) < PI / 2 - 0.001) {
      const dx = (ra2Rad - ra1Rad) * Math.cos((dec1Rad + dec2Rad) / 2);
      const dy = dec2Rad - dec1Rad;
      theta = Math.sqrt(dx * dx + dy * dy);
    }
  }
  return theta;
}

/**
 * Adjusts time (decimal hours) to be between -12 and 12
 */
function adjTime(x) {
  if (Math.abs(x) < 100000) {
    while (x > 12) x -= 24;
    while (x < -12) x += 24;
  }
  return x;
}

/**
 * Calculate altitude of celestial object
 */
function calcAlt(ra, dec, lat, lst) {
  const ha = adjTime(lst - ra);
  const decRad = dec / DEG_IN_RADIAN;
  const haRad = ha / HRS_IN_RADIAN;
  const latRad = lat / DEG_IN_RADIAN;
  return DEG_IN_RADIAN * Math.asin(
    Math.cos(decRad) * Math.cos(haRad) * Math.cos(latRad) +
    Math.sin(decRad) * Math.sin(latRad)
  );
}

/**
 * Calculate azimuth of celestial object
 */
function calcAz(ra, dec, lat, lst) {
  const ha = adjTime(lst - ra);
  const decRad = dec / DEG_IN_RADIAN;
  const haRad = ha / HRS_IN_RADIAN;
  const latRad = lat / DEG_IN_RADIAN;
  const y = Math.sin(decRad) * Math.cos(latRad) - Math.cos(decRad) * Math.cos(haRad) * Math.sin(latRad);
  const z = -Math.cos(decRad) * Math.sin(haRad);
  return atanCirc(y, z) * DEG_IN_RADIAN;
}

/**
 * Convert date to Julian Date
 */
function dateToJD(year, month, day, dtime, tzone) {
  let y = year;
  let m = month;
  let d = day;

  if (m <= 2) {
    y = y - 1;
    m = m + 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  d += dtime / 24;

  let jdg = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
  jdg -= tzone / 24;

  const jd0 = Math.floor(jdg + 0.5) - 0.5;
  let jd1 = jd0 + (dtime - tzone) / 24;
  if (dtime - tzone >= 24) {
    jd1 -= 1;
  }
  return jd1;
}

/**
 * Calculate Local Mean Sidereal Time
 */
function calcLST(jd, longitude) {
  const jdint = Math.floor(jd);
  const jdfrac = jd - jdint;

  let jdmid, ut;
  if (jdfrac < 0.5) {
    jdmid = jdint - 0.5;
    ut = jdfrac + 0.5;
  } else {
    jdmid = jdint + 0.5;
    ut = jdfrac - 0.5;
  }

  const t = (jdmid - J2000) / 36525;
  let sidG = (24110.54841 + 8640184.812866 * t + 0.093104 * t * t - 6.2e-6 * t * t * t) / SEC_IN_DAY;
  sidG -= Math.floor(sidG);
  sidG += 1.0027379093 * ut - longitude / 360;
  sidG = (sidG - Math.floor(sidG)) * 24;
  if (sidG < 0) sidG += 24;

  return sidG;
}

/**
 * Low precision Sun position
 */
function lpSun(jd) {
  const n = jd - J2000;
  const L = 280.460 + 0.9856474 * n;
  const g = (357.528 + 0.9856003 * n) / DEG_IN_RADIAN;
  const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) / DEG_IN_RADIAN;
  const epsilon = (23.439 - 0.0000004 * n) / DEG_IN_RADIAN;

  const x = Math.cos(lambda);
  const y = Math.cos(epsilon) * Math.sin(lambda);
  const z = Math.sin(epsilon) * Math.sin(lambda);

  return {
    ra: atanCirc(x, y) * HRS_IN_RADIAN,
    dec: Math.asin(z) * DEG_IN_RADIAN
  };
}

/**
 * Low precision Moon position (topocentric corrected)
 */
function lpMoon(jd, latitude, lst) {
  const T = (jd - J2000) / 36525;

  let lambda = 218.32 + 481267.883 * T +
    6.29 * Math.sin((134.9 + 477198.85 * T) / DEG_IN_RADIAN) -
    1.27 * Math.sin((259.2 - 413335.38 * T) / DEG_IN_RADIAN) +
    0.66 * Math.sin((235.7 + 890534.23 * T) / DEG_IN_RADIAN) +
    0.21 * Math.sin((269.9 + 954397.70 * T) / DEG_IN_RADIAN) -
    0.19 * Math.sin((357.5 + 35999.05 * T) / DEG_IN_RADIAN) -
    0.11 * Math.sin((186.6 + 966404.05 * T) / DEG_IN_RADIAN);
  lambda = lambda / DEG_IN_RADIAN;

  let beta = 5.13 * Math.sin((93.3 + 483202.03 * T) / DEG_IN_RADIAN) +
    0.28 * Math.sin((228.2 + 960400.87 * T) / DEG_IN_RADIAN) -
    0.28 * Math.sin((318.3 + 6003.18 * T) / DEG_IN_RADIAN) -
    0.17 * Math.sin((217.6 - 407332.20 * T) / DEG_IN_RADIAN);
  beta = beta / DEG_IN_RADIAN;

  let pie = 0.9508 +
    0.0518 * Math.cos((134.9 + 477198.85 * T) / DEG_IN_RADIAN) +
    0.0095 * Math.cos((259.2 - 413335.38 * T) / DEG_IN_RADIAN) +
    0.0078 * Math.cos((235.7 + 890534.23 * T) / DEG_IN_RADIAN) +
    0.0028 * Math.cos((269.9 + 954397.70 * T) / DEG_IN_RADIAN);
  pie = pie / DEG_IN_RADIAN;

  const distance = 1 / Math.sin(pie);

  let l = Math.cos(beta) * Math.cos(lambda);
  let m = 0.9175 * Math.cos(beta) * Math.sin(lambda) - 0.3978 * Math.sin(beta);
  let n = 0.3978 * Math.cos(beta) * Math.sin(lambda) + 0.9175 * Math.sin(beta);

  // Topocentric correction
  let x = l * distance;
  let y = m * distance;
  let z = n * distance;

  const radLat = latitude / DEG_IN_RADIAN;
  const radLst = lst / HRS_IN_RADIAN;

  x = x - Math.cos(radLat) * Math.cos(radLst);
  y = y - Math.cos(radLat) * Math.sin(radLst);
  z = z - Math.sin(radLat);

  const topoDist = Math.sqrt(x * x + y * y + z * z);

  l = x / topoDist;
  m = y / topoDist;
  n = z / topoDist;

  const alpha = atanCirc(l, m);
  const delta = Math.asin(n);

  return {
    ra: alpha * HRS_IN_RADIAN,
    dec: delta * DEG_IN_RADIAN,
    dist: topoDist
  };
}

/**
 * Main limiting magnitude calculation
 */
export function calculateLimitingMagnitude(params) {
  const {
    longitude,    // decimal degrees, west positive
    latitude,     // decimal degrees, north positive
    elevation,    // meters
    year,
    month,
    day,
    hour,
    minute,
    second,
    dst,          // daylight savings: 1 = on, 0 = off
    temperature,  // Fahrenheit
    humidity,     // percent
    snellen,      // Snellen ratio (normal = 1.0)
    experience,   // 0-10 scale
    age,          // years
    altStar,      // altitude of pointing (degrees)
    azStar        // azimuth of pointing (degrees)
  } = params;

  // Calculate timezone from longitude
  const tzone = Math.round(-longitude / 15) + dst;
  
  // Decimal time
  const dtime = hour + minute / 60 + second / 3600;
  
  // Julian Date
  const jd = dateToJD(year, month, day, dtime, tzone);
  
  // Local Sidereal Time
  const lst = calcLST(jd, longitude);
  
  // Sun position
  const sun = lpSun(jd);
  const altSun = calcAlt(sun.ra, sun.dec, latitude, lst);
  const azSun = calcAz(sun.ra, sun.dec, latitude, lst);
  
  // Moon position
  const moon = lpMoon(jd, latitude, lst);
  const altMoon = calcAlt(moon.ra, moon.dec, latitude, lst);
  const azMoon = calcAz(moon.ra, moon.dec, latitude, lst);
  
  // Moon illumination fraction
  const illFrac = 0.5 * (1 - Math.cos(subtend(moon.ra, moon.dec, sun.ra, sun.dec)));
  
  // Clamp star altitude
  let starAlt = Math.max(0, Math.min(90, altStar));
  
  // Moon phase angle
  const qphase = Math.acos(2 * illFrac - 1) * DEG_IN_RADIAN;
  
  // Angular distances
  const qzenmn = subtend(0, 90, azMoon / 15, altMoon);
  const qrhomn = subtend(azStar / 15, starAlt, azMoon / 15, altMoon);
  const qzensn = subtend(0, 90, azSun / 15, altSun);
  const qrhosn = subtend(azStar / 15, starAlt, azSun / 15, altSun);
  const qrhoms = subtend(moon.ra, moon.dec, sun.ra, sun.dec);
  
  // Temperature in Celsius
  const qtemp = (temperature - 32) * 5 / 9;
  const qzenst = (90 - starAlt) / DEG_IN_RADIAN;
  const lt = latitude / DEG_IN_RADIAN;
  
  // V-band index
  const i = 3;
  
  // Airmass calculations
  const zz = qzenst;
  const xg = 1 / (Math.cos(zz) + 0.0286 * Math.exp(-10.5 * Math.cos(zz)));
  const xa = 1 / (Math.cos(zz) + 0.0123 * Math.exp(-24.5 * Math.cos(zz)));
  const xo = 1 / Math.sqrt(1.0 - Math.pow(Math.sin(zz) / (1.0 + 20.0 / 6378.0), 2));
  
  // Extinction components
  const kr = 0.1066 * Math.exp(-elevation / 8200) * Math.pow(wa[i] / 0.55, -4);
  const ka = 0.12 * Math.pow(wa[i] / 0.55, -1.3) * Math.exp(-elevation / 1500) *
    Math.pow(1 - 0.32 / Math.log(humidity / 100.0), 4 / 3) *
    (1 + 0.33 * Math.sin(sun.ra / HRS_IN_RADIAN));
  const ko = oz[i] * (3.0 + 0.4 * (lt * Math.cos(sun.ra / HRS_IN_RADIAN) - Math.cos(3 * lt))) / 3.0;
  const kw = wt[i] * 0.94 * (humidity / 100.0) * Math.exp(qtemp / 15) * Math.exp(-elevation / 8200);
  
  const k = kr + ka + ko + kw;
  const sigk = Math.sqrt(
    Math.pow(0.01 + 0.4 * kr, 2) +
    Math.pow(0.01 + 0.4 * ka, 2) +
    Math.pow(0.01 + 0.4 * ko, 2) +
    Math.pow(0.01 + 0.4 * kw, 2)
  );
  const dm = kr * xg + ka * xa + ko * xo + kw * xg;
  
  // Airmasses
  const amst = 1 / (Math.cos(zz) + 0.025 * Math.exp(-11 * Math.cos(zz)));
  let ammn = 1 / (Math.cos(qzenmn) + 0.025 * Math.exp(-11 * Math.cos(qzenmn)));
  let amsn = 1 / (Math.cos(qzensn) + 0.025 * Math.exp(-11 * Math.cos(qzensn)));
  if (qzenmn > PI / 2) ammn = 40.0;
  if (qzensn > PI / 2) amsn = 40.0;
  
  // Phase functions
  const ffmn = Math.pow(10, 5.36) * (1.06 + Math.pow(Math.cos(qrhomn), 2)) +
    Math.pow(10, 6.15 - qrhomn * DEG_IN_RADIAN / 40) +
    6.2e7 * Math.pow(qrhomn * DEG_IN_RADIAN, -2);
  const ffsun = Math.pow(10, 5.36) * (1.06 + Math.pow(Math.cos(qrhosn), 2)) +
    Math.pow(10, 6.15 - qrhosn * DEG_IN_RADIAN / 40) +
    6.2e7 * Math.pow(qrhosn * DEG_IN_RADIAN, -2);
  const ffsunm = Math.pow(10, 5.36) * (1.06 + Math.pow(Math.cos(qrhoms), 2)) +
    Math.pow(10, 6.15 - qrhoms * DEG_IN_RADIAN / 40) +
    6.2e7 * Math.pow(qrhoms * DEG_IN_RADIAN, -2);
  
  // Moon brightness
  const zmagmn = -12.73 + 0.026 * Math.abs(qphase) + 4e-9 * Math.pow(qphase, 4);
  let ismoon = Math.pow(10, -0.4 * (zmagmn + 16.57));
  const moondist = moon.dist / 60.27;
  ismoon = ismoon / Math.pow(moondist, 2) * Math.max(1, 1.35 - 0.05 * Math.abs(qphase));
  const imoon = ismoon * Math.pow(10, -0.4 * k * ammn);
  
  let magmn;
  if (altMoon > 0) {
    magmn = Math.round(100 * (-2.5 * Math.log(imoon) / Math.log(10) - 16.57)) / 100;
  } else {
    magmn = null; // Moon is down
  }
  
  // Moon surface brightness
  const bmoonm = 9.9e8 * imoon * (1 - Math.pow(10, -0.4 * k * ammn));
  
  let bmoon, bglare;
  if (qrhomn * DEG_IN_RADIAN <= 5 && qphase > 1) {
    const batm = 6.25e7 * ismoon * Math.pow(qrhomn, -2) *
      (Math.pow(10, -0.4 * k * ammn) - Math.pow(10, -0.8 * k * ammn));
    const beye = 4.63e7 * imoon * Math.pow(qrhomn, -2);
    bglare = batm + beye;
    bmoon = 5.67e10 * imoon / qphase;
  } else {
    bglare = 0;
    bmoon = ffmn * imoon * (1 - Math.pow(10, -0.4 * k * amst));
  }
  
  // Sky brightness including solar cycle
  const bnight = bo[i] * (0.4 + 0.6 * amst) *
    Math.pow(10, -0.4 * k * amst) *
    (1 + 0.3 * Math.cos(2 * PI * (year - 1992) / 11));
  const bnightm = bo[i] * (0.4 + 0.6 * ammn) *
    Math.pow(10, -0.4 * k * ammn) *
    (1 + 0.3 * Math.cos(2 * PI * (year - 1992) / 11));
  
  // Twilight brightness
  const hsun = altSun;
  const btwilt = Math.max(1, Math.pow(10, qrhosn * DEG_IN_RADIAN / 90 - 1.1)) *
    Math.pow(10, 8.45 + 0.4 * hsun) * (1 - Math.pow(10, -0.4 * k * amst));
  const btwiltm = Math.max(1, Math.pow(10, qrhoms * DEG_IN_RADIAN / 90 - 1.1)) *
    Math.pow(10, 8.45 + 0.4 * hsun) * (1 - Math.pow(10, -0.4 * k * ammn));
  
  // Day brightness
  const bday = 11700 * ffsun * Math.pow(10, -0.4 * k * amsn) *
    (1 - Math.pow(10, -0.4 * k * amst));
  const bdaym = 11700 * ffsunm * Math.pow(10, -0.4 * k * amsn) *
    (1 - Math.pow(10, -0.4 * k * ammn));
  
  let magsn;
  if (altSun > 0) {
    magsn = Math.round(100 * (-2.5 * Math.log(11700 * Math.pow(10, -0.4 * k * amsn)) / Math.log(10) - 16.57)) / 100;
  } else {
    magsn = null; // Sun is down
  }
  
  // Effective background brightness
  const beff = bmoon + bglare + bnight + Math.min(btwilt, bday);
  const beffm = bnightm + Math.min(btwiltm, bdaym);
  
  // Day/night mode
  const isDay = beff >= 1479 ? 1 : 0;
  
  // Correction factors
  let Fe, Fci, Fcb, sigFe, sigFci, sigFcb;
  if (isDay === 1) {
    Fe = Math.pow(10, 0.4 * k * amst);
    Fci = 1;
    Fcb = 1;
    sigFe = sigk * amst * 0.92 * Fe;
    sigFci = 0;
    sigFcb = 0;
  } else {
    Fe = Math.pow(10, 0.48 * k * amst);
    Fci = Math.pow(10, -0.4 * (1 - 0.5 / 2));
    Fcb = Math.pow(10, -0.4 * (1 - 0.7 / 2));
    sigFe = sigk * amst * 1.105 * Fe;
    sigFci = 0.5 * 0.46 * Fci;
    sigFcb = 0.1 * 0.46 * Fcb;
  }
  
  // Pupil size for age
  const De = 7.0 * Math.exp(-0.5 * Math.pow(age / 100, 2));
  const Ds = 7.0 * Math.exp(-0.5 * Math.pow(25 / 100, 2));
  const Fp = Math.pow(Ds / De, 2);
  const sigFp = 5 * age / 5000 * Fp;
  
  // Critical visual angle
  let cva;
  if (day === 1) {
    cva = 42 * Math.pow(10, 8.28 * Math.pow(beff, -0.29)) / snellen;
  } else {
    cva = Math.min(900, 380 * Math.pow(10, 0.3 * Math.pow(beff, -0.29))) / snellen;
  }
  
  const zeta = 1800 * Math.sqrt(illFrac); // equiv angular diameter of moon
  
  let cth;
  if (cva > zeta) {
    cth = Math.max(2.4 * Math.pow(beff, -0.1), 20 * Math.pow(beff, -0.4)) *
      Math.pow(cva / zeta, 2);
  } else if (beff > 1e6) {
    cth = 0.0028 + 2.4 * Math.pow(beff, -0.1) * Math.pow(cva / zeta, 2);
  } else {
    cth = Math.pow(10, -(0.12 * 0.40 * Math.log(beff) / Math.log(10)) +
      (0.90 - 0.15 * Math.log(beff) / Math.log(10)) *
      Math.log(100 * 60 / zeta) / Math.log(10));
  }
  
  // Seeing distribution
  const xi = Math.sqrt(8 * 0.361 * 1.5 * 1.5 * amst);
  const Fr = (1 + 0.03 * Math.pow(xi / cva, 2)) / Math.pow(snellen, 2);
  const sigFr = 0.1 * 2 / snellen * Fr;
  
  // Sky brightness in magnitudes
  const b = beff;
  const bmag = 27.78151 - Math.log(b / 0.263) / 0.921034;
  
  // Format brightness output
  let bnlStr;
  if (b > 1000) {
    const be = Math.floor(Math.log(b) / Math.log(10));
    const br = b / Math.pow(10, be);
    bnlStr = (Math.round(100 * br) / 100) + "E" + be;
  } else {
    bnlStr = Math.round(100 * b) / 100;
  }
  
  // Moon brightness output
  let bmnlStr, bmmag;
  if (altMoon >= 0) {
    const bm = bmoon;
    bmmag = 27.78151 - Math.log(bm / 0.263) / 0.921034;
    if (bm > 1000) {
      const be = Math.floor(Math.log(bm) / Math.log(10));
      const br = bm / Math.pow(10, be);
      bmnlStr = (Math.round(100 * br) / 100) + "E" + be;
    } else {
      bmnlStr = Math.round(100 * bm) / 100;
    }
  } else {
    bmnlStr = null;
    bmmag = null;
  }
  
  // Threshold of visibility
  const bCorr = beff / (Fp * Fcb);
  const c1 = day === 1 ? Math.pow(10, -8.35) : Math.pow(10, -9.8);
  const c2 = day === 1 ? Math.pow(10, -5.9) : Math.pow(10, -1.9);
  const zlimfc = c1 * Math.pow(1 + Math.sqrt(c2 * bCorr), 2);
  const zlimfcs = zlimfc * Fp * Fr * Fci * Fe;
  const zlimmag = -16.57 - 2.5 * Math.log(zlimfcs) / Math.log(10);
  
  // Apply observer experience correction
  const rlimmag = zlimmag + 0.16 * (experience - 6);
  
  // Calculate formal error
  const sigb = bCorr * Math.sqrt(Math.pow(0.2, 2) + Math.pow(sigFp / Fp, 2) + Math.pow(sigFcb / Fcb, 2));
  const sigfc = sigb * c1 * c2 * (1 + 1 / Math.sqrt(c2 * bCorr));
  const sigfcs = zlimfcs * Math.sqrt(
    Math.pow(sigfc / zlimfc, 2) +
    Math.pow(sigFe / Fe, 2) +
    Math.pow(sigFp / Fp, 2) +
    Math.pow(sigFr / Fr, 2) +
    Math.pow(sigFci / Fci, 2)
  );
  const sigmag = sigfcs * 2.5 / (Math.log(10) * zlimfcs);
  const siglim = Math.sqrt(Math.pow(sigmag, 2) + Math.pow(0.16, 2));
  
  // Format LST
  const lstHr = Math.floor(lst);
  const lstMn = (lst - lstHr) * 60;
  const lstSc = Math.round((lstMn - Math.floor(lstMn)) * 60);
  const lstStr = `${lstHr}h${Math.floor(lstMn)}m${lstSc}s`;
  
  return {
    // Inputs echoed back (some clamped)
    altStar: starAlt,
    
    // Sun
    altSun: Math.round(altSun * 10) / 10,
    azSun: Math.round(azSun * 10) / 10,
    rhoSun: Math.round(qrhosn * DEG_IN_RADIAN * 10) / 10,
    magSun: magsn,
    
    // Moon
    altMoon: Math.round(altMoon * 10) / 10,
    azMoon: Math.round(azMoon * 10) / 10,
    rhoMoon: Math.round(qrhomn * DEG_IN_RADIAN * 10) / 10,
    illFrac: Math.floor(illFrac * 1e4) / 100,
    magMoon: magmn,
    
    // Limiting magnitude
    limMag: Math.round(rlimmag * 100) / 100,
    magErr: Math.round(Math.abs(siglim) * 100) / 100,
    
    // Extinction
    extinctionCoeff: Math.round(k * 100) / 100,
    extinction: Math.round(dm * 100) / 100,
    
    // Sky brightness
    skyBrightnessNL: bnlStr,
    skyBrightnessMag: Math.round(bmag * 100) / 100,
    moonBrightnessNL: bmnlStr,
    moonBrightnessMag: bmmag ? Math.round(bmmag * 100) / 100 : null,
    
    // Time
    jd: jd,
    lst: lstStr,
    
    // Derived values for display
    isDaytime: day === 1,
    moonIsUp: altMoon > 0,
    sunIsUp: altSun > 0
  };
}

/**
 * Get current time parameters
 */
export function getCurrentTimeParams() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds()
  };
}