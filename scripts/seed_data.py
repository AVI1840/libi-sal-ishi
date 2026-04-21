"""
Seed data script for development.

Run with: python scripts/seed_data.py
"""

import asyncio
import uuid
from datetime import datetime, timedelta

# This script populates the database with demo data


async def seed_users():
    """Seed demo users."""
    users = [
        {
            "user_id": "550e8400-e29b-41d4-a716-446655440000",
            "teudat_zehut": "000000000",
            "first_name": "[שם לדוגמה]",
            "last_name": "[שם משפחה לדוגמה]",
            "birth_date": "1950-01-01",
            "phone": "050-0000000",
            "nursing_level": 3,
            "languages": ["hebrew"],
        },
        {
            "user_id": "550e8400-e29b-41d4-a716-446655440001",
            "teudat_zehut": "234567891",
            "first_name": "יעקב",
            "last_name": "לוי",
            "birth_date": "1948-08-20",
            "phone": "050-2345678",
            "nursing_level": 4,
            "languages": ["hebrew", "arabic"],
        },
    ]

    print(f"Created {len(users)} users")
    return users


async def seed_vendors():
    """Seed demo vendors."""
    vendors = [
        {
            "vendor_id": str(uuid.uuid4()),
            "business_name": "יוסי כהן פיזיותרפיסט",
            "license_number": "FT-12345",
            "service_areas": ["תל אביב", "רמת גן", "גבעתיים"],
            "rating": 4.8,
        },
        {
            "vendor_id": str(uuid.uuid4()),
            "business_name": "מתנ\"ס הרצליה",
            "license_number": "CC-54321",
            "service_areas": ["הרצליה", "רעננה", "כפר סבא"],
            "rating": 4.9,
        },
        {
            "vendor_id": str(uuid.uuid4()),
            "business_name": "שירותי סיעוד אהבה",
            "license_number": "NS-67890",
            "service_areas": ["תל אביב", "רמת גן", "פתח תקווה"],
            "rating": 4.7,
        },
    ]

    print(f"Created {len(vendors)} vendors")
    return vendors


async def seed_services(vendors):
    """Seed demo services."""
    services = [
        {
            "service_id": str(uuid.uuid4()),
            "vendor_id": vendors[0]["vendor_id"],
            "category": "physiotherapy",
            "title_he": "פיזיותרפיה בבית",
            "unit_cost": 2,
            "duration_minutes": 45,
            "is_optimal_aging": True,
        },
        {
            "service_id": str(uuid.uuid4()),
            "vendor_id": vendors[1]["vendor_id"],
            "category": "social_activity",
            "title_he": "קפה וחברים",
            "unit_cost": 1,
            "duration_minutes": 120,
            "is_optimal_aging": True,
        },
        {
            "service_id": str(uuid.uuid4()),
            "vendor_id": vendors[2]["vendor_id"],
            "category": "nursing",
            "title_he": "ביקור אחות בבית",
            "unit_cost": 3,
            "duration_minutes": 60,
            "is_optimal_aging": False,
        },
    ]

    print(f"Created {len(services)} services")
    return services


async def seed_wallets(users):
    """Seed demo wallets."""
    # Nursing level to units mapping
    units_map = {1: 40, 2: 64, 3: 96, 4: 144, 5: 192, 6: 288}

    wallets = []
    for user in users:
        total = units_map.get(user["nursing_level"], 96)
        wallet = {
            "wallet_id": str(uuid.uuid4()),
            "user_id": user["user_id"],
            "nursing_level": user["nursing_level"],
            "total_units": total,
            "available_units": total - 8,
            "reserved_units": 8,
            "optimal_aging_units": 2,
            "units_expire_at": (datetime.now() + timedelta(days=90)).date(),
        }
        wallets.append(wallet)

    print(f"Created {len(wallets)} wallets")
    return wallets


async def main():
    """Run all seed functions."""
    print("🌱 Seeding database...")
    print("")

    users = await seed_users()
    vendors = await seed_vendors()
    services = await seed_services(vendors)
    wallets = await seed_wallets(users)

    print("")
    print("✅ Seeding complete!")
    print("")
    print("Demo credentials:")
    print("  User 1: שרה כהן (ID: 123456782)")
    print("  User 2: יעקב לוי (ID: 234567891)")


if __name__ == "__main__":
    asyncio.run(main())
