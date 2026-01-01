"""
Embed API Router
Generates embeddable chart widgets and images
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Response
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from typing import Optional
import json

from ..database import get_db, LocationDB
from ..models import EmbedConfig, EmbedResponse
from ..config import settings

router = APIRouter()


# Base URL for the application (set via environment or config)
def get_base_url() -> str:
    """Get the base URL for embedding"""
    # In production, this would come from settings/env
    return "https://cleardarksky.example.com"


@router.get("/code/{location_id}", response_model=EmbedResponse)
async def get_embed_code(
    location_id: str,
    width: int = Query(600, ge=200, le=1200),
    height: int = Query(300, ge=150, le=600),
    theme: str = Query("light", regex="^(light|dark)$"),
    db: Session = Depends(get_db)
):
    """
    Generate embed code for a location's sky chart
    
    Returns HTML snippet that can be embedded on other websites.
    Also returns direct image URL for simple embedding.
    """
    # Verify location exists
    location = db.query(LocationDB).filter(LocationDB.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found")
    
    base_url = get_base_url()
    
    # Generate URLs
    page_url = f"{base_url}/chart/{location_id}"
    image_url = f"{base_url}/api/embed/image/{location_id}.png"
    iframe_url = f"{base_url}/embed/{location_id}?theme={theme}"
    
    # Generate HTML embed code
    html = f'''<a href="{page_url}" target="_blank" rel="noopener">
  <img src="{image_url}" 
       alt="Clear Sky Chart for {location.name}"
       width="{width}" 
       height="{height}"
       style="border:none;">
</a>'''

    # Alternative iframe embed (for live updating)
    iframe_html = f'''<iframe 
  src="{iframe_url}"
  width="{width}" 
  height="{height}"
  frameborder="0"
  title="Sky Chart for {location.name}">
</iframe>'''
    
    return EmbedResponse(
        html=html,
        image_url=image_url,
        page_url=page_url
    )


@router.get("/iframe/{location_id}", response_class=HTMLResponse)
async def get_embed_iframe(
    location_id: str,
    theme: str = Query("light", regex="^(light|dark)$"),
    compact: bool = Query(False),
    db: Session = Depends(get_db)
):
    """
    Return embeddable HTML page for iframe embedding
    
    This is a minimal page designed to be embedded in an iframe.
    """
    # Verify location exists
    location = db.query(LocationDB).filter(LocationDB.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found")
    
    base_url = get_base_url()
    
    # Colors based on theme
    bg_color = "#1a1a2e" if theme == "dark" else "#ffffff"
    text_color = "#e0e0e0" if theme == "dark" else "#333333"
    
    html = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sky Chart - {location.name}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: {bg_color};
            color: {text_color};
            padding: 8px;
        }}
        .chart-container {{
            width: 100%;
            overflow-x: auto;
        }}
        .chart-header {{
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
        }}
        .chart-link {{
            font-size: 11px;
            color: #666;
            text-decoration: none;
        }}
        .chart-link:hover {{
            text-decoration: underline;
        }}
        #chart {{
            min-width: 600px;
        }}
    </style>
</head>
<body>
    <div class="chart-header">
        Clear Sky Chart for {location.name}
    </div>
    <div class="chart-container">
        <div id="chart">
            <!-- Chart will be rendered here by JavaScript -->
            <p>Loading forecast data...</p>
        </div>
    </div>
    <a href="{base_url}/chart/{location_id}" target="_blank" class="chart-link">
        View full chart →
    </a>
    
    <script>
        // Fetch and render chart data
        const API_URL = '{base_url}/api/forecast/{location_id}';
        
        async function loadChart() {{
            try {{
                const response = await fetch(API_URL);
                const data = await response.json();
                renderChart(data);
            }} catch (error) {{
                document.getElementById('chart').innerHTML = 
                    '<p>Error loading forecast. <a href="{base_url}/chart/{location_id}">View on site →</a></p>';
            }}
        }}
        
        function renderChart(data) {{
            // Simplified inline chart rendering
            // Full implementation would be more complex
            const container = document.getElementById('chart');
            container.innerHTML = '<p>Chart loaded. View full details at <a href="{base_url}/chart/{location_id}">{location.name}</a></p>';
        }}
        
        loadChart();
    </script>
</body>
</html>'''
    
    return HTMLResponse(content=html)


@router.get("/image/{location_id}.png")
async def get_embed_image(
    location_id: str,
    width: int = Query(600, ge=200, le=1200),
    height: int = Query(300, ge=150, le=600),
    db: Session = Depends(get_db)
):
    """
    Generate PNG image of the sky chart
    
    This creates a static image that can be embedded anywhere.
    For now, returns a placeholder - real implementation would use
    matplotlib, Pillow, or similar to render the chart.
    """
    # Verify location exists
    location = db.query(LocationDB).filter(LocationDB.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found")
    
    # TODO: Generate actual chart image
    # For now, return a simple placeholder
    # Real implementation would:
    # 1. Fetch forecast data
    # 2. Render chart using matplotlib/Pillow
    # 3. Return as PNG
    
    # Placeholder - return a 1x1 transparent PNG
    # In production, this would be a real chart image
    png_data = bytes([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
    ])
    
    return Response(
        content=png_data,
        media_type="image/png",
        headers={
            "Cache-Control": "public, max-age=3600",  # Cache for 1 hour
            "X-Content-Note": "Placeholder image - real chart generation coming soon"
        }
    )
