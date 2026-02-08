"""
Quick database verification script with advanced queries.
"""
import asyncio
import sys
from pathlib import Path
from sqlalchemy import text

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from src.database import async_session


async def run_verification_queries():
    """Run various queries to demonstrate the database is working correctly."""

    print("\n" + "="*70)
    print("DATABASE VERIFICATION - ADVANCED QUERIES")
    print("="*70)

    async with async_session() as session:
        # Query 1: Table row counts
        print("\n[1] TABLE ROW COUNTS")
        print("-" * 70)
        tables = ['users', 'tasks', 'categories', 'products', 'orders']
        for table in tables:
            result = await session.execute(text(f"SELECT COUNT(*) FROM {table}"))
            count = result.scalar()
            print(f"  {table:20s}: {count:5d} rows")

        # Query 2: All categories
        print("\n[2] ALL CATEGORIES")
        print("-" * 70)
        result = await session.execute(
            text("SELECT id, name, description FROM categories ORDER BY name")
        )
        for row in result.fetchall():
            print(f"  [{row[0]}] {row[1]:20s} - {row[2]}")

        # Query 3: Products sorted by price
        print("\n[3] PRODUCTS BY PRICE (Top 5 Most Expensive)")
        print("-" * 70)
        result = await session.execute(
            text("""
                SELECT name, price, stock,
                       TO_CHAR(created_at, 'YYYY-MM-DD') as created
                FROM products
                ORDER BY price DESC
                LIMIT 5
            """)
        )
        for row in result.fetchall():
            print(f"  ${row[1]:7.2f} - {row[0]:30s} (Stock: {row[2]:3d}, Created: {row[3]})")

        # Query 4: Orders by status with totals
        print("\n[4] ORDER STATISTICS BY STATUS")
        print("-" * 70)
        result = await session.execute(
            text("""
                SELECT
                    status,
                    COUNT(*) as order_count,
                    SUM(total_amount) as total_revenue,
                    AVG(total_amount) as avg_order_value,
                    MIN(total_amount) as min_order,
                    MAX(total_amount) as max_order
                FROM orders
                GROUP BY status
                ORDER BY total_revenue DESC
            """)
        )
        print(f"  {'Status':<15} {'Count':>6} {'Total Rev':>12} {'Avg Order':>12} {'Min':>10} {'Max':>10}")
        print("  " + "-" * 68)
        for row in result.fetchall():
            print(f"  {row[0]:<15} {row[1]:>6} ${row[2]:>10.2f} ${row[3]:>10.2f} ${row[4]:>8.2f} ${row[5]:>8.2f}")

        # Query 5: Recent orders with user info
        print("\n[5] RECENT ORDERS (Last 5)")
        print("-" * 70)
        result = await session.execute(
            text("""
                SELECT
                    o.id,
                    u.email,
                    o.total_amount,
                    o.status,
                    TO_CHAR(o.created_at, 'YYYY-MM-DD HH24:MI') as order_date
                FROM orders o
                JOIN users u ON o.user_id = u.id
                ORDER BY o.created_at DESC
                LIMIT 5
            """)
        )
        print(f"  {'ID':>4} {'Email':<30} {'Amount':>10} {'Status':<12} {'Date':<20}")
        print("  " + "-" * 68)
        for row in result.fetchall():
            print(f"  {row[0]:>4} {row[1]:<30} ${row[2]:>8.2f} {row[3]:<12} {row[4]:<20}")

        # Query 6: Products with low stock alert
        print("\n[6] LOW STOCK ALERT (Stock < 100)")
        print("-" * 70)
        result = await session.execute(
            text("""
                SELECT name, stock, price, (stock * price) as inventory_value
                FROM products
                WHERE stock < 100
                ORDER BY stock ASC
            """)
        )
        print(f"  {'Product':<30} {'Stock':>6} {'Price':>10} {'Inv Value':>12}")
        print("  " + "-" * 68)
        for row in result.fetchall():
            print(f"  {row[0]:<30} {row[1]:>6} ${row[2]:>8.2f} ${row[3]:>10.2f}")

        # Query 7: Database statistics
        print("\n[7] DATABASE STATISTICS")
        print("-" * 70)

        # Total products value
        result = await session.execute(
            text("SELECT SUM(price * stock) FROM products")
        )
        total_inventory = result.scalar()
        print(f"  Total Inventory Value: ${total_inventory:,.2f}")

        # Total orders value
        result = await session.execute(
            text("SELECT SUM(total_amount) FROM orders")
        )
        total_orders = result.scalar()
        print(f"  Total Orders Value:    ${total_orders:,.2f}")

        # Average order value
        result = await session.execute(
            text("SELECT AVG(total_amount) FROM orders")
        )
        avg_order = result.scalar()
        print(f"  Average Order Value:   ${avg_order:,.2f}")

        # Total users
        result = await session.execute(
            text("SELECT COUNT(*) FROM users")
        )
        total_users = result.scalar()
        print(f"  Total Users:           {total_users}")

        print("\n" + "="*70)
        print("VERIFICATION COMPLETE - All queries executed successfully!")
        print("="*70 + "\n")


if __name__ == "__main__":
    asyncio.run(run_verification_queries())
