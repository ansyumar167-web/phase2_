"""
Database setup and testing script.
Tests connection, creates tables via migration, populates with dummy data, and verifies.
"""
import asyncio
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    os.system('chcp 65001 > nul')

# Add backend directory to path to enable proper imports
sys.path.insert(0, str(Path(__file__).resolve().parent))

from src.database import engine, async_session
from src.models import Product, Category, Order, User


async def test_connection():
    """Test database connection."""
    print("\n" + "="*60)
    print("STEP 1: Testing Database Connection")
    print("="*60)

    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"[OK] Connection successful!")
            print(f"  PostgreSQL version: {version}")
            return True
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")
        return False


async def check_existing_tables():
    """Check what tables currently exist in the database."""
    print("\n" + "="*60)
    print("STEP 2: Checking Existing Tables")
    print("="*60)

    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            """))
            tables = result.fetchall()

            if tables:
                print(f"[OK] Found {len(tables)} table(s):")
                for table in tables:
                    print(f"  - {table[0]}")
            else:
                print("  No tables found in public schema")

            return [table[0] for table in tables]
    except Exception as e:
        print(f"[ERROR] Error checking tables: {e}")
        return []


async def populate_categories(session: AsyncSession):
    """Populate categories table with dummy data."""
    print("\n" + "="*60)
    print("STEP 3: Populating Categories Table")
    print("="*60)

    # Check if categories already exist
    result = await session.execute(text("SELECT COUNT(*) FROM categories"))
    existing_count = result.scalar()

    if existing_count > 0:
        print(f"[INFO] Categories table already has {existing_count} rows. Skipping insertion.")
        # Fetch existing categories to return
        result = await session.execute(text("SELECT id, name FROM categories ORDER BY id"))
        rows = result.fetchall()
        print(f"[OK] Existing categories:")
        for row in rows:
            print(f"  - ID {row[0]}: {row[1]}")
        return []

    categories_data = [
        {"name": "Electronics", "description": "Electronic devices and accessories"},
        {"name": "Clothing", "description": "Apparel and fashion items"},
        {"name": "Books", "description": "Physical and digital books"},
        {"name": "Home & Garden", "description": "Home improvement and gardening supplies"},
        {"name": "Sports & Outdoors", "description": "Sports equipment and outdoor gear"},
        {"name": "Toys & Games", "description": "Toys, games, and entertainment"},
        {"name": "Food & Beverages", "description": "Groceries and beverages"},
        {"name": "Health & Beauty", "description": "Health and beauty products"},
    ]

    try:
        categories = []
        for data in categories_data:
            category = Category(**data)
            session.add(category)
            categories.append(category)

        await session.commit()

        # Refresh to get IDs
        for category in categories:
            await session.refresh(category)

        print(f"[OK] Successfully inserted {len(categories)} categories:")
        for cat in categories:
            print(f"  - ID {cat.id}: {cat.name}")

        return categories
    except Exception as e:
        await session.rollback()
        print(f"[ERROR] Error populating categories: {e}")
        return []


async def populate_products(session: AsyncSession):
    """Populate products table with dummy data."""
    print("\n" + "="*60)
    print("STEP 4: Populating Products Table")
    print("="*60)

    # Check if products already exist
    result = await session.execute(text("SELECT COUNT(*) FROM products"))
    existing_count = result.scalar()

    if existing_count > 0:
        print(f"[INFO] Products table already has {existing_count} rows. Skipping insertion.")
        # Fetch existing products to return
        result = await session.execute(text("SELECT id, name, price, stock FROM products ORDER BY id LIMIT 10"))
        rows = result.fetchall()
        print(f"[OK] Existing products:")
        for row in rows:
            print(f"  - ID {row[0]}: {row[1]} (${row[2]}, Stock: {row[3]})")
        return []

    products_data = [
        {"name": "Wireless Mouse", "description": "Ergonomic wireless mouse with USB receiver", "price": 29.99, "stock": 150},
        {"name": "Mechanical Keyboard", "description": "RGB mechanical gaming keyboard", "price": 89.99, "stock": 75},
        {"name": "USB-C Cable", "description": "6ft USB-C to USB-C charging cable", "price": 12.99, "stock": 300},
        {"name": "Laptop Stand", "description": "Adjustable aluminum laptop stand", "price": 45.50, "stock": 120},
        {"name": "Webcam HD", "description": "1080p HD webcam with microphone", "price": 59.99, "stock": 85},
        {"name": "Bluetooth Headphones", "description": "Noise-cancelling over-ear headphones", "price": 149.99, "stock": 60},
        {"name": "Phone Case", "description": "Protective silicone phone case", "price": 15.99, "stock": 200},
        {"name": "Portable Charger", "description": "20000mAh portable power bank", "price": 39.99, "stock": 110},
        {"name": "HDMI Cable", "description": "10ft 4K HDMI cable", "price": 18.99, "stock": 180},
        {"name": "Monitor Stand", "description": "Dual monitor desk mount stand", "price": 79.99, "stock": 45},
    ]

    try:
        products = []
        # Use timezone-naive datetime to match database models
        base_time = datetime.now()

        for i, data in enumerate(products_data):
            # Stagger creation times
            data["created_at"] = base_time - timedelta(days=len(products_data) - i)
            product = Product(**data)
            session.add(product)
            products.append(product)

        await session.commit()

        # Refresh to get IDs
        for product in products:
            await session.refresh(product)

        print(f"[OK] Successfully inserted {len(products)} products:")
        for prod in products:
            print(f"  - ID {prod.id}: {prod.name} (${prod.price}, Stock: {prod.stock})")

        return products
    except Exception as e:
        await session.rollback()
        print(f"[ERROR] Error populating products: {e}")
        return []


async def populate_orders(session: AsyncSession):
    """Populate orders table with dummy data."""
    print("\n" + "="*60)
    print("STEP 5: Populating Orders Table")
    print("="*60)

    # First, check if we have any users
    result = await session.execute(text("SELECT id FROM users LIMIT 5"))
    user_ids = [row[0] for row in result.fetchall()]

    if not user_ids:
        print("[WARN] No users found in database. Creating a test user first...")
        # Create a test user
        test_user = User(
            email="testuser@example.com",
            password_hash="$2b$12$dummy_hash_for_testing_purposes_only"
        )
        session.add(test_user)
        await session.commit()
        await session.refresh(test_user)
        user_ids = [test_user.id]
        print(f"  [OK] Created test user with ID: {test_user.id}")

    orders_data = [
        {"user_id": user_ids[0], "total_amount": 149.99, "status": "completed"},
        {"user_id": user_ids[0], "total_amount": 89.50, "status": "pending"},
        {"user_id": user_ids[0], "total_amount": 234.97, "status": "shipped"},
        {"user_id": user_ids[0], "total_amount": 45.99, "status": "processing"},
        {"user_id": user_ids[0], "total_amount": 299.99, "status": "completed"},
        {"user_id": user_ids[0], "total_amount": 67.48, "status": "pending"},
        {"user_id": user_ids[0], "total_amount": 128.75, "status": "cancelled"},
        {"user_id": user_ids[0], "total_amount": 199.99, "status": "completed"},
    ]

    try:
        orders = []
        # Use timezone-naive datetime to match database models
        base_time = datetime.now()

        for i, data in enumerate(orders_data):
            # Stagger creation times
            data["created_at"] = base_time - timedelta(days=len(orders_data) - i)
            order = Order(**data)
            session.add(order)
            orders.append(order)

        await session.commit()

        # Refresh to get IDs
        for order in orders:
            await session.refresh(order)

        print(f"[OK] Successfully inserted {len(orders)} orders:")
        for ord in orders:
            print(f"  - ID {ord.id}: User {ord.user_id}, ${ord.total_amount:.2f}, Status: {ord.status}")

        return orders
    except Exception as e:
        await session.rollback()
        print(f"[ERROR] Error populating orders: {e}")
        return []


async def verify_data():
    """Verify all data was inserted successfully."""
    print("\n" + "="*60)
    print("STEP 6: Verifying Data")
    print("="*60)

    try:
        async with async_session() as session:
            # Count categories
            result = await session.execute(text("SELECT COUNT(*) FROM categories"))
            cat_count = result.scalar()
            print(f"[OK] Categories: {cat_count} rows")

            # Count products
            result = await session.execute(text("SELECT COUNT(*) FROM products"))
            prod_count = result.scalar()
            print(f"[OK] Products: {prod_count} rows")

            # Count orders
            result = await session.execute(text("SELECT COUNT(*) FROM orders"))
            ord_count = result.scalar()
            print(f"[OK] Orders: {ord_count} rows")

            # Sample query: Get products with low stock
            print("\n  Sample Query - Products with stock < 100:")
            result = await session.execute(
                text("SELECT name, stock FROM products WHERE stock < 100 ORDER BY stock ASC LIMIT 5")
            )
            for row in result.fetchall():
                print(f"    - {row[0]}: {row[1]} units")

            # Sample query: Get order statistics by status
            print("\n  Sample Query - Orders by status:")
            result = await session.execute(
                text("SELECT status, COUNT(*), SUM(total_amount) FROM orders GROUP BY status ORDER BY status")
            )
            for row in result.fetchall():
                print(f"    - {row[0]}: {row[1]} orders, ${row[2]:.2f} total")

            return True
    except Exception as e:
        print(f"[ERROR] Error verifying data: {e}")
        return False


async def main():
    """Main execution function."""
    print("\n" + "="*60)
    print("DATABASE SETUP AND TESTING SCRIPT")
    print("="*60)

    # Step 1: Test connection
    if not await test_connection():
        print("\n[ERROR] Database connection failed. Please check your .env file.")
        return

    # Step 2: Check existing tables
    existing_tables = await check_existing_tables()

    # Step 3-5: Populate tables
    async with async_session() as session:
        await populate_categories(session)
        await populate_products(session)
        await populate_orders(session)

    # Step 6: Verify data
    await verify_data()

    print("\n" + "="*60)
    print("DATABASE SETUP COMPLETE!")
    print("="*60)
    print("\nNext steps:")
    print("  1. Run migrations if tables don't exist: cd backend && alembic upgrade head")
    print("  2. Start the FastAPI server: cd backend && uvicorn src.main:app --reload")
    print("  3. Access API docs at: http://localhost:8000/docs")
    print("="*60 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
