from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from app.database import get_db_connection

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

class WeeklySales(BaseModel):
    week_num: int
    total_sales: float

class RecentOrder(BaseModel):
    order_number: str
    customer: str
    status: str


@router.get("/cards")
def get_dashboard_cards():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) AS total_products FROM products")
    p_count = cursor.fetchone()["total_products"]

    cursor.execute("SELECT COUNT(*) AS total_users FROM users WHERE role='customer'")
    u_count = cursor.fetchone()["total_users"]

    cursor.execute("SELECT COUNT(*) AS total_orders FROM orders")
    o_count = cursor.fetchone()["total_orders"]

    cursor.execute("SELECT COALESCE(SUM(total_amount),0) AS total_sales FROM orders WHERE status='Delivered'")
    s_total = cursor.fetchone()["total_sales"]

    cursor.execute("""
        SELECT COALESCE(SUM(total_amount), 0) AS m_sales, COUNT(*) AS m_orders 
        FROM orders WHERE MONTH(created_at) = MONTH(CURDATE()) 
        AND YEAR(created_at) = YEAR(CURDATE()) AND status = 'Delivered'
    """)
    m_data = cursor.fetchone()

    # Order Status 
    cursor.execute("SELECT status, COUNT(*) as count FROM orders GROUP BY status")
    status_data = cursor.fetchall()

    # Top 3 Products
    cursor.execute("""
        SELECT p.name, SUM(oi.quantity) as total_qty FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        GROUP BY p.id ORDER BY total_qty DESC LIMIT 3
    """)
    top_products = cursor.fetchall()

    cursor.close(); conn.close()
    return {
        "total_products": p_count, "total_users": u_count, "total_orders": o_count,
        "total_sales": float(s_total), "month_sales": float(m_data['m_sales']), "month_orders": m_data['m_orders'],
        "status_data": status_data, "top_products": top_products
    }

@router.get("/chart", response_model=List[WeeklySales])
def get_dashboard_chart():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT (WEEK(created_at) - WEEK(DATE_SUB(created_at, INTERVAL DAYOFMONTH(created_at)-1 DAY)) + 1) AS week_num,
        CAST(SUM(total_amount) AS FLOAT) AS total_sales
        FROM orders WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
        AND status = 'Delivered' GROUP BY week_num ORDER BY week_num
    """)
    res = cursor.fetchall()
    cursor.close(); conn.close()
    return res

@router.get("/orders", response_model=List[RecentOrder])
def get_recent_orders():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT o.order_number, u.username AS customer, o.status FROM orders o 
        JOIN users u ON o.user_id = u.user_id ORDER BY o.created_at DESC LIMIT 8
    """)
    res = cursor.fetchall()
    cursor.close(); conn.close()
    return res