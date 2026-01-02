# ClearDarkSky

A community rebuild of Attilla Danko's Clear Sky Charts, preserving his legacy for the astronomy community.

Attilla created the original cleardarksky.com in 2001 and maintained it until his passing on November 28, 2024. This project recreates the essential functionality using modern, maintainable technologies while keeping the familiar interface astronomers rely on.

## Stack

- **Frontend**: React + Vite
- **Backend**: Python FastAPI
- **Data**: CMC astronomy forecasts (same source as original)
- **Deployment**: Railway

## Project Structure

```
cleardarksky/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── routers/
│   │   │   ├── forecast.py
│   │   │   ├── locations.py
│   │   │   └── embed.py
│   │   └── services/
│   │       ├── cmc_fetcher.py
│   │       ├── forecast_builder.py
│   │       ├── astro_calculator.py
│   │       └── scheduler.py
│   ├── data/
│   │   └── locations.json
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── Home.jsx
│           ├── Forecast.jsx
│           ├── Charts.jsx
│           ├── About.jsx
│           ├── Docs.jsx
│           ├── Credits.jsx
│           ├── Legal.jsx
│           ├── Danko.jsx
│           └── Layout.jsx
├── docker-compose.yml
└── README.md
```

## Local Development

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `GET /api/locations/` - List locations
- `GET /api/locations/nearby?lat=X&lon=Y` - Find nearby locations
- `GET /api/forecast/{key}` - Get forecast for location
- `GET /api/embed/{key}` - Embeddable chart image

## Data Source

CMC astronomy forecasts from Environment Canada:
- `https://dd.weather.gc.ca/model_gem_regional/astronomy/grib2/{HH}/`
- Updates 4x daily (00, 06, 12, 18 UTC)
- Variables: cloud cover, seeing, transparency

## Contributing

- **Code**: [github.com/kirenia/cleardarksky](https://github.com/kirenia/cleardarksky)
- **Sponsor**: [github.com/sponsors/kirenia](https://github.com/sponsors/kirenia)

## Credits

- **Attilla Danko** (1955–2024) — Original Clear Sky Charts creator
- **Allan Rahill** — CMC astronomy forecast model
- **Environment Canada** — Weather data infrastructure