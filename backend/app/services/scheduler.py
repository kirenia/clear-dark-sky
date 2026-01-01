"""
Background Scheduler Service
Handles periodic data updates from CMC
"""

import asyncio
import logging
from datetime import datetime, timedelta

from ..config import settings
from .cmc_fetcher import cmc_fetcher

logger = logging.getLogger(__name__)


async def update_cmc_data():
    """Fetch latest CMC data"""
    try:
        logger.info("Starting CMC data update...")
        
        # Fetch astronomy data
        astro_result = await cmc_fetcher.fetch_astronomy_data()
        if astro_result.get("available"):
            logger.info(f"Updated astronomy data from run {astro_result.get('model_run')}")
        
        # Fetch RDPS data
        # rdps_result = await cmc_fetcher.fetch_rdps_data()
        
        logger.info("CMC data update complete")
        
    except Exception as e:
        logger.error(f"Error updating CMC data: {e}")


async def start_scheduler():
    """Start the background data update scheduler"""
    logger.info("Starting background scheduler...")
    
    # Initial update
    await update_cmc_data()
    
    # Schedule periodic updates
    while True:
        await asyncio.sleep(settings.DATA_UPDATE_INTERVAL * 60)
        await update_cmc_data()
