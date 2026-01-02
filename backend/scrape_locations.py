#!/usr/bin/env python3
"""
Scrape all locations from cleardarksky.com
Extracts location names, chart keys, and coordinates.
"""

import re
import json
import time
import requests
from bs4 import BeautifulSoup
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "https://server1.cleardarksky.com"
LIST_URL = f"{BASE_URL}/csk/big_clist.html"
OUTPUT_FILE = Path(__file__).parent / "data" / "locations.json"

def fetch_page(url, retries=3):
    """Fetch a page with retries."""
    for attempt in range(retries):
        try:
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            return resp.text
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(1)
            else:
                print(f"Failed to fetch {url}: {e}")
                return None

def parse_location_list(html):
    """Parse the main location list page."""
    soup = BeautifulSoup(html, 'html.parser')
    locations = []
    
    # Find all chart links - pattern: /c/{key}key.html
    links = soup.find_all('a', href=re.compile(r'^/c/\w+key\.html'))
    
    current_country = None
    current_region = None
    
    for link in links:
        href = link.get('href', '')
        name = link.get_text(strip=True)
        
        # Extract chart key from URL like /c/CtsldBHkey.html?1
        match = re.search(r'/c/(\w+)key\.html', href)
        if not match:
            continue
            
        chart_key = match.group(1)
        
        # Try to find description (text after the link)
        description = ""
        next_sibling = link.next_sibling
        if next_sibling and isinstance(next_sibling, str):
            desc_text = next_sibling.strip()
            if desc_text.startswith('-'):
                description = desc_text[1:].strip()
        
        # Check parent elements for region/country context
        parent = link.find_parent('li')
        if parent:
            # Look for parent list items that indicate region
            grandparent = parent.find_parent('li')
            if grandparent:
                region_link = grandparent.find('a', href=False) or grandparent.find('b')
                if region_link:
                    current_region = region_link.get_text(strip=True)
        
        locations.append({
            'name': name,
            'chart_key': chart_key,
            'url': f"{BASE_URL}{href.split('?')[0]}",
            'description': description,
        })
    
    return locations

def get_chart_details(chart_key):
    """Fetch coordinates and other details from individual chart page."""
    url = f"{BASE_URL}/c/{chart_key}key.html"
    html = fetch_page(url)
    if not html:
        return {}
    
    soup = BeautifulSoup(html, 'html.parser')
    details = {}
    
    # Get coordinates from ICBM meta tag (most reliable)
    icbm = soup.find('meta', attrs={'name': 'ICBM'})
    if icbm and icbm.get('content'):
        try:
            lat, lon = icbm['content'].split(',')
            details['latitude'] = float(lat.strip())
            details['longitude'] = float(lon.strip())
        except (ValueError, IndexError):
            pass
    
    # Get region from province link like /csk/prov/Alberta_charts.html
    prov_link = soup.find('a', href=re.compile(r'/csk/prov/(\w+)_charts\.html'))
    if prov_link:
        match = re.search(r'/csk/prov/(\w+)_charts\.html', prov_link['href'])
        if match:
            details['region'] = match.group(1).replace('_', ' ')
    
    # Get timezone offset from text like "Local time for X is -7.0 hours from GMT"
    text = soup.get_text()
    tz_match = re.search(r'is\s+(-?\d+\.?\d*)\s+hours?\s+from\s+(?:GMT|UTC)', text, re.I)
    if tz_match:
        details['tz_offset'] = float(tz_match.group(1))
    
    # Get elevation from satellite link like alt=574.0
    for link in soup.find_all('a', href=True):
        alt_match = re.search(r'alt=(\d+\.?\d*)', link['href'])
        if alt_match:
            details['elevation'] = float(alt_match.group(1))
            break
    
    # Get description from AKA line
    for td in soup.find_all('td'):
        td_text = td.get_text()
        if td_text.startswith('AKA'):
            aka_link = td.find('a')
            if aka_link:
                details['description'] = aka_link.get_text(strip=True)
            break
    
    return details

def parse_region_from_key(chart_key):
    """Infer region from chart key suffix."""
    # Common suffixes: AB=Alberta, BC=British Columbia, ON=Ontario, etc.
    suffixes = {
        'AB': ('Canada', 'Alberta'),
        'BC': ('Canada', 'British Columbia'),
        'MB': ('Canada', 'Manitoba'),
        'NB': ('Canada', 'New Brunswick'),
        'NL': ('Canada', 'Newfoundland'),
        'NF': ('Canada', 'Newfoundland'),
        'NS': ('Canada', 'Nova Scotia'),
        'NT': ('Canada', 'Northwest Territories'),
        'NU': ('Canada', 'Nunavut'),
        'ON': ('Canada', 'Ontario'),
        'PE': ('Canada', 'Prince Edward Island'),
        'QC': ('Canada', 'Quebec'),
        'SK': ('Canada', 'Saskatchewan'),
        'YT': ('Canada', 'Yukon'),
        'AL': ('USA', 'Alabama'),
        'AK': ('USA', 'Alaska'),
        'AZ': ('USA', 'Arizona'),
        'AR': ('USA', 'Arkansas'),
        'CA': ('USA', 'California'),
        'CO': ('USA', 'Colorado'),
        'CT': ('USA', 'Connecticut'),
        'DE': ('USA', 'Delaware'),
        'FL': ('USA', 'Florida'),
        'GA': ('USA', 'Georgia'),
        'HI': ('USA', 'Hawaii'),
        'ID': ('USA', 'Idaho'),
        'IL': ('USA', 'Illinois'),
        'IN': ('USA', 'Indiana'),
        'IA': ('USA', 'Iowa'),
        'KS': ('USA', 'Kansas'),
        'KY': ('USA', 'Kentucky'),
        'LA': ('USA', 'Louisiana'),
        'ME': ('USA', 'Maine'),
        'MD': ('USA', 'Maryland'),
        'MA': ('USA', 'Massachusetts'),
        'MI': ('USA', 'Michigan'),
        'MN': ('USA', 'Minnesota'),
        'MS': ('USA', 'Mississippi'),
        'MO': ('USA', 'Missouri'),
        'MT': ('USA', 'Montana'),
        'NE': ('USA', 'Nebraska'),
        'NV': ('USA', 'Nevada'),
        'NH': ('USA', 'New Hampshire'),
        'NJ': ('USA', 'New Jersey'),
        'NM': ('USA', 'New Mexico'),
        'NY': ('USA', 'New York'),
        'NC': ('USA', 'North Carolina'),
        'ND': ('USA', 'North Dakota'),
        'OH': ('USA', 'Ohio'),
        'OK': ('USA', 'Oklahoma'),
        'OR': ('USA', 'Oregon'),
        'PA': ('USA', 'Pennsylvania'),
        'RI': ('USA', 'Rhode Island'),
        'SC': ('USA', 'South Carolina'),
        'SD': ('USA', 'South Dakota'),
        'TN': ('USA', 'Tennessee'),
        'TX': ('USA', 'Texas'),
        'UT': ('USA', 'Utah'),
        'VT': ('USA', 'Vermont'),
        'VA': ('USA', 'Virginia'),
        'WA': ('USA', 'Washington'),
        'WV': ('USA', 'West Virginia'),
        'WI': ('USA', 'Wisconsin'),
        'WY': ('USA', 'Wyoming'),
        'DC': ('USA', 'District of Columbia'),
        'BH': ('Bahamas', 'Bahamas'),
        'BA': ('Bahamas', 'Bahamas'),
        'MX': ('Mexico', 'Mexico'),
    }
    
    # Check last 2 characters of key (before 'key')
    if len(chart_key) >= 2:
        suffix = chart_key[-2:].upper()
        if suffix in suffixes:
            return suffixes[suffix]
    
    return ('Unknown', 'Unknown')

def scrape_all_locations(fetch_details=False, max_workers=10):
    """Main scraping function."""
    print("Fetching location list...")
    html = fetch_page(LIST_URL)
    if not html:
        print("Failed to fetch location list")
        return []
    
    print("Parsing locations...")
    locations = parse_location_list(html)
    print(f"Found {len(locations)} locations")
    
    # Add region info based on chart key as fallback
    for loc in locations:
        country, region = parse_region_from_key(loc['chart_key'])
        loc['country'] = country
        loc['region'] = region
    
    if fetch_details:
        print("Fetching details from chart pages (this may take a while)...")
        
        def fetch_loc_details(loc):
            details = get_chart_details(loc['chart_key'])
            return loc['chart_key'], details
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {executor.submit(fetch_loc_details, loc): loc for loc in locations}
            completed = 0
            
            for future in as_completed(futures):
                chart_key, details = future.result()
                for loc in locations:
                    if loc['chart_key'] == chart_key:
                        # Update with fetched details
                        if 'latitude' in details:
                            loc['latitude'] = details['latitude']
                        if 'longitude' in details:
                            loc['longitude'] = details['longitude']
                        if 'region' in details:
                            loc['region'] = details['region']
                        if 'elevation' in details:
                            loc['elevation'] = details['elevation']
                        if 'tz_offset' in details:
                            loc['tz_offset'] = details['tz_offset']
                        if 'description' in details and details['description']:
                            loc['description'] = details['description']
                        break
                
                completed += 1
                if completed % 100 == 0:
                    print(f"  Processed {completed}/{len(locations)}")
    
    return locations

def save_locations(locations, output_file=OUTPUT_FILE):
    """Save locations to JSON file."""
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_file, 'w') as f:
        json.dump(locations, f, indent=2)
    
    print(f"Saved {len(locations)} locations to {output_file}")

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Scrape Clear Dark Sky locations')
    parser.add_argument('--details', action='store_true', help='Fetch coords/details from each chart page (slow)')
    parser.add_argument('--workers', type=int, default=10, help='Number of concurrent workers')
    parser.add_argument('--output', type=str, default=str(OUTPUT_FILE), help='Output file')
    
    args = parser.parse_args()
    
    locations = scrape_all_locations(fetch_details=args.details, max_workers=args.workers)
    save_locations(locations, Path(args.output))