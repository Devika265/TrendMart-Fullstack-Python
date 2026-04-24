from fastapi import APIRouter, Form, HTTPException
from app.database import get_db_connection

router = APIRouter(prefix="/api/subscribers", tags=["Subscribers"])


# GET ALL SUBSCRIBERS
@router.get("/")
def get_subscribers():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            s.id,
            u.username,
            u.user_id,
            s.email,
            s.subscribed_at,
            s.status
        FROM subscribers s
        LEFT JOIN users u
        ON s.email = u.email
        ORDER BY s.subscribed_at DESC
    """)

    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return data


# ADD SUBSCRIBER
@router.post("/")
def add_subscriber(email: str = Form(...)):

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO subscribers (email,status) VALUES (%s,'subscribed')",
            (email,)
        )
        conn.commit()

    except Exception:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Email already subscribed")

    cursor.close()
    conn.close()

    return {"message": "Subscribed successfully"}


# UPDATE STATUS
@router.put("/status/{email}")
def update_status(email: str, status: str = Form(...)):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE subscribers SET status=%s WHERE email=%s",
        (status, email)
    )

    conn.commit()

    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Subscriber not found")

    cursor.close()
    conn.close()

    return {"message": "Status updated successfully"}


# DELETE SUBSCRIBER
@router.delete("/{email}")
def delete_subscriber(email: str):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM subscribers WHERE email=%s",
        (email,)
    )

    conn.commit()

    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Subscriber not found")

    cursor.close()
    conn.close()

    return {"message": "Subscriber deleted successfully"}