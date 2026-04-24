from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.database import get_db_connection
from typing import List

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])

class FeedbackCreate(BaseModel):
    product_id: int
    user_name: str
    rating: int
    comment: str


@router.post("/")
def save_feedback(data: FeedbackCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        sql = "INSERT INTO feedbacks (product_id, user_name, rating, comment) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (data.product_id, data.user_name, data.rating, data.comment))
        conn.commit()
        return {"status": "success", "message": "Feedback submitted!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


@router.get("/") 
def fetch_feedbacks(product_id: int = Query(...)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        sql = "SELECT * FROM feedbacks WHERE product_id = %s ORDER BY id DESC"
        cursor.execute(sql, (product_id,))
        results = cursor.fetchall()
        return results 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()