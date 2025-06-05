import json
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Inventory
import os

def load_inventory_data():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, 'inventory.json')
    
    with open(json_path, 'r') as file:
        return json.load(file)

def seed_inventory():
    db: Session = SessionLocal()
    inventory_data = load_inventory_data()
    
    for category, items in inventory_data.items():
        for item_name in items:
            existing = db.query(Inventory).filter_by(name=item_name).first()
            if not existing:
                db.add(Inventory(name=item_name, category=category))
    
    db.commit()
    db.close()
    print("Inventory seeded successfully ✅")

if __name__ == "__main__":
    seed_inventory()