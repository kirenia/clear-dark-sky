# ClearDarkSky

A community rebuild of Attilla Danko's Clear Sky Charts, preserving his legacy for the astronomy community.

Attilla created the original cleardarksky.com in 2001 and maintained it until his passing on November 28, 2024. This project recreates the essential functionality using modern, maintainable technologies while keeping the familiar interface astronomers rely on.

## Stack

- **Frontend**: React + Vite
- **Backend**: Python FastAPI
- **Database**: SQLite
- **Data**: CMC astronomy forecasts (same source as original)
- **Deployment**: Railway

## Project Structure

```
clear-dark-sky/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   └── services/
│   │       ├── cmc_fetcher.py      # GRIB2 data fetcher
│   │       └── forecast_builder.py  # Forecast processor
│   ├── scrape_locations.py          # Location scraper
│   ├── manage_locations.py          # CLI tool
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── HomePage.jsx
│           ├── ChartPage.jsx
│           ├── AllChartsPage.jsx
│           └── AboutPage.jsx
└── README.md
```

## Local Development

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Scraping Locations

Populate the database with all 6,000+ chart locations:

```bash
cd backend
pip install requests beautifulsoup4
python scrape_locations.py --details --output data/locations.json
```

## API Endpoints

- `GET /api/locations/` - List locations
- `GET /api/locations/nearby?lat=X&lon=Y` - Find nearby
- `GET /api/forecast/{key}` - Get forecast for location
- `POST /api/locations/` - Add location

## Data Source

CMC astronomy forecasts from Environment Canada:
- `https://dd.weather.gc.ca/model_gem_regional/astronomy/grib2/{HH}/`
- Updates 4x daily (00, 06, 12, 18 UTC)
- Variables: seeing, transparency

## Contributing

- **Code**: [github.com/kirenia/clear-dark-sky](https://github.com/kirenia/clear-dark-sky)
- **Donate**: [ko-fi.com/kirenia](https://ko-fi.com/kirenia)

## Credits

- **Attilla Danko** (1959–2024) — Original Clear Sky Charts
- **Allan Rahill** — CMC astronomy forecast data
- **Environment Canada** — Weather data infrastructure