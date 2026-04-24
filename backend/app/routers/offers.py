from fastapi import APIRouter, Form, HTTPException
from app.database import get_db_connection

router = APIRouter(prefix="/api/offers", tags=["Offers"])


@router.post("/")
def create_offer(
    title: str = Form(...),
    description: str = Form(...),
    image: str = Form(...),
    offer_type: str = Form(...),
    end_date: str = Form(...)
):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO offers (title, description, image, offer_type, end_date)
        VALUES (%s, %s, %s, %s, %s)
    """, (title, description, image, offer_type, end_date))

    conn.commit()

    cursor.close()
    conn.close()

    return {"message": "Offer created successfully"}



@router.get("/")
def get_offers():

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM offers ORDER BY id DESC")
    offers = cursor.fetchall()

    cursor.close()
    conn.close()

    return offers



@router.put("/{offer_id}")
def update_offer(
    offer_id: int,
    title: str = Form(...),
    description: str = Form(...),
    image: str = Form(...),
    offer_type: str = Form(...),
    end_date: str = Form(...)
):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE offers
        SET title=%s, description=%s, image=%s, offer_type=%s, end_date=%s
        WHERE id=%s
    """, (title, description, image, offer_type, end_date, offer_id))

    conn.commit()

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Offer not found")

    cursor.close()
    conn.close()

    return {"message": "Offer updated successfully"}


@router.delete("/{offer_id}")
def delete_offer(offer_id: int):

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM offers WHERE id=%s", (offer_id,))
    conn.commit()

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Offer not found")

    cursor.close()
    conn.close()

    return {"message": "Offer deleted successfully"}