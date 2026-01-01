"""
Clear Dark Sky API - Clear Sky Chart Recreation
Using Allan Rahill's CMC Astronomy Forecast Data
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from typing import Optional
import asyncio

from .config import settings
from .routers import forecast, locations, embed
from .services.scheduler import start_scheduler

app = FastAPI(
    title="Clear Dark Sky API",
    description="Astronomy weather forecasts using CMC data",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(forecast.router, prefix="/api/forecast", tags=["forecast"])
app.include_router(locations.router, prefix="/api/locations", tags=["locations"])
app.include_router(embed.router, prefix="/api/embed", tags=["embed"])


@app.on_event("startup")
async def startup_event():
    """Initialize data fetching on startup"""
    # Start background scheduler for data updates
    asyncio.create_task(start_scheduler())


@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head><title>Clear Dark Sky API</title></head>
        <body>
            <h1>Clear Dark Sky API</h1>
            <p>Astronomy weather forecasts using CMC data from Allan Rahill</p>
            <p><a href="/docs">API Documentation</a></p>
        </body>
    </html>
    """


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
