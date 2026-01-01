# Clear Dark Sky - Clear Sky Charts

A recreation of Attilla Danko's Clear Sky Charts using Allan Rahill's CMC astronomy forecast data.

## Features

- **Astronomy-specific forecasts**: Cloud cover, transparency, seeing, darkness
- **Ground conditions**: Wind, humidity, temperature, smoke
- **Multiple data sources**: CMC astronomy data, ECMWF comparison
- **Embed codes**: Generate embeddable widgets for any location
- **Multi-location support**: Easily add any location in North America

## Project Structure

```
clear-dark-sky/
├── backend/           # Python FastAPI backend
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── config.py         # Configuration
│   │   ├── models.py         # Pydantic models
│   │   ├── database.py       # SQLAlchemy setup
│   │   ├── routers/          # API endpoints
│   │   └── services/         # Business logic
│   ├── manage_locations.py   # CLI for location management
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/          # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API client
│   │   └── types/            # TypeScript types
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

## Quick Start

### Local Development

1. **Start the backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python run.py
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Or use Docker Compose:**
   ```bash
   docker-compose up frontend-dev backend
   ```

### Add Locations

Use the CLI tool to manage locations:

```bash
cd backend

# Add a location
python manage_locations.py add "Idaho Falls" 43.4917 -112.0339 --elevation 1432 --tz -7

# List all locations
python manage_locations.py list

# Add sample locations
python manage_locations.py seed

# Delete a location
python manage_locations.py delete idaho-falls
```

**Via API:**
```bash
curl -X POST http://localhost:8000/api/locations/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Observatory",
    "latitude": 43.5,
    "longitude": -112.0,
    "elevation": 1500,
    "timezone_offset": -7
  }'
```

## API Endpoints

### Forecasts
- `GET /api/forecast/{location_id}` - Get forecast for a location
- `GET /api/forecast/coords/?lat=X&lon=Y` - Get forecast for coordinates

### Locations
- `GET /api/locations/` - List all locations
- `POST /api/locations/` - Create a location
- `GET /api/locations/{id}` - Get a location
- `DELETE /api/locations/{id}` - Delete a location
- `GET /api/locations/search/nearby?lat=X&lon=Y` - Find nearby locations

### Embeds
- `GET /api/embed/code/{location_id}` - Get embed code
- `GET /api/embed/iframe/{location_id}` - Get embeddable iframe HTML
- `GET /api/embed/image/{location_id}.png` - Get chart image

## Deploy to Railway

### Backend

1. Create a new Railway project
2. Connect your GitHub repo
3. Set the root directory to `backend`
4. Add environment variables:
   - `CORS_ORIGINS=["https://your-frontend.railway.app"]`
   - `DATABASE_URL=sqlite:///./clear-dark-sky.db` (or use Railway's Postgres)

### Frontend

1. In the same Railway project, add another service
2. Set the root directory to `frontend`
3. Add build argument:
   - `VITE_API_URL=https://your-backend.railway.app/api`

## Data Sources

### CMC Astronomy Data (Primary)
- **URL**: `https://dd.alpha.meteo.gc.ca/model_gem_regional/astronomy/grib2/{HH}`
- **Variables**: Seeing, Transparency
- **Updates**: 4x daily (00, 06, 12, 18 UTC)
- **Coverage**: North America

### CMC RDPS (Production)
- **URL**: `https://dd.weather.gc.ca/model_gem_regional/10km/grib2/{HH}/{hhh}`
- **Variables**: Cloud cover, wind, temperature, humidity
- **Resolution**: 10km grid

### Open-Meteo ECMWF (Comparison)
- **URL**: `https://api.open-meteo.com/v1/forecast`
- **Variables**: Cloud cover (for comparison layer)
- **No API key required**

## Color Scales

The chart uses color scales matching the original Clear Sky Charts:

| Row | Good Conditions | Poor Conditions |
|-----|-----------------|-----------------|
| Cloud Cover | Dark blue (clear) | White (overcast) |
| Transparency | Dark blue (transparent) | White (too cloudy) |
| Seeing | Green (excellent) | Red (bad) |
| Darkness | Black (dark sky) | White (daylight) |
| Wind | Dark green (calm) | Light tan (windy) |
| Humidity | Brown (dry) | Cyan (humid) |

## Credits

- **Allan Rahill** - CMC astronomy forecasts
- **Attilla Danko** (1959-2023) - Original Clear Sky Charts concept
- **Canadian Meteorological Centre** - Weather data

## License

This project recreates the Clear Sky Chart concept for educational purposes.
CMC data is provided under the Environment and Climate Change Canada Data Servers End-use License.
