from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.database import get_db_connection
import uuid

router = APIRouter(prefix="/api/orders", tags=["Orders"])


class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    subtotal: float

class OrderCreate(BaseModel):
    user_id: str  
    customer_name: str
    phone: str
    address: str
    subtotal: float
    vat: float
    total_amount: float
    payment_method: str
    items: List[OrderItem]


class StatusUpdate(BaseModel):
    status: str



@router.post("/")
def create_order(order: OrderCreate):

    print("USER ID FROM FRONTEND:", order.user_id)

    conn = get_db_connection()
    cursor = conn.cursor()

    order_number = "ORD-" + uuid.uuid4().hex[:6].upper()

    try:

        query = """
        INSERT INTO orders
        (order_number, user_id, customer_name, phone, address, total_amount, payment_method)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        """

        cursor.execute(query, (
            order_number,
            order.user_id,
            order.customer_name,
            order.phone,
            order.address,
            order.total_amount,
            order.payment_method
        ))

        order_id = cursor.lastrowid


        item_query = """
        INSERT INTO order_items
        (order_id, product_id, product_name, quantity, price, subtotal)
        VALUES (%s,%s,%s,%s,%s,%s)
        """

        for item in order.items:
            cursor.execute(item_query, (
                order_id,
                item.product_id,
                item.product_name,
                item.quantity,
                item.price,
                item.subtotal
            ))

        conn.commit()

        return {
            "message": "Order placed successfully",
            "order_number": order_number
        }

    except Exception as e:
        conn.rollback()
        print("ORDER ERROR:", e)
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
        conn.close()



@router.get("/{order_number}")
def track_order(order_number: str):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:

        cursor.execute(
            "SELECT * FROM orders WHERE order_number=%s",
            (order_number,)
        )

        order = cursor.fetchone()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")


        cursor.execute(
            "SELECT * FROM order_items WHERE order_id=%s",
            (order["id"],)
        )

        items = cursor.fetchall()

        order["items"] = items

        return order

    finally:
        cursor.close()
        conn.close()



@router.get("/")
def get_all_orders():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")

    orders = cursor.fetchall()

    cursor.close()
    conn.close()

    return orders



@router.put("/{order_id}") 
def update_status(order_id: int, data: StatusUpdate):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        
        cursor.execute(
            "UPDATE orders SET status=%s WHERE id=%s",
            (data.status, order_id)
        )

        conn.commit()

        
        if cursor.rowcount == 0:
             raise HTTPException(status_code=404, detail="Order ID not found")

        return {"message": "Status updated successfully"}

    except Exception as e:
        conn.rollback()
        print(f"Update Error: {e}") 
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
        conn.close()
        

@router.get("/my-orders/{user_id}")
async def get_my_orders(user_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    try:

        query = """
            SELECT 
                o.order_number, 
                oi.product_name, 
                p.image_url, 
                o.status, 
                oi.quantity, 
                oi.price, 
                o.created_at
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = %s
            ORDER BY o.created_at DESC
        """
        
        cursor.execute(query, (user_id,))
        results = cursor.fetchall()

        orders_list = []
        for row in results:
            
            db_status = row['status'].lower()
            status_val = "processing" if db_status == "pending" else db_status

            orders_list.append({
                "id": row['order_number'],
                "name": row['product_name'],
                "img": row['image_url'],
                "status": status_val,
                "status_text": row['status'], 
                "delivery_info": "Processing your item" if status_val == "processing" else "Status Updated",
                "qty": row['quantity'],
                "price": f"{row['price']:,}",
                "date": row['created_at'].strftime("%d %b %Y")
            })

        return orders_list

    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}
    finally:
        cursor.close()
        conn.close()