import geonamescache
from app.database import SessionLocal
from app.models import City
import sys

# 1. Setup Database Connection
db = SessionLocal()

# 2. Initialize the library
gc = geonamescache.GeonamesCache()
cities = gc.get_cities()

print("Fetching cities from India...")

# Settings
TARGET_COUNTRY_CODE = 'IN'  # 'IN' is the code for India     # Only add cities with > 50k people (adjust as needed)
counter = 0

for city_id, city_data in cities.items():
    # Filter: Must be in India AND meet population requirement
    if city_data['countrycode'] == TARGET_COUNTRY_CODE:
        
        name = city_data['name']
        
        # 3. Check for Duplicates
        # Your model requires city names to be unique.
        # We check if it exists in the DB to avoid errors.
        exists = db.query(City).filter(City.name == name).first()
        
        if not exists:
            # Create new city object
            new_city = City(name=name, country="India")
            db.add(new_city)
            counter += 1
            print(f"Added: {name}")
        else:
            # Duplicate name found (e.g., duplicate 'Aurangabad' or existing entry)
            pass

        # Commit in small batches to be safe
        if counter % 50 == 0:
            db.commit()

# Final commit
db.commit()
db.close()

print(f"🎉 Success! Added {counter} Indian cities to your database.")