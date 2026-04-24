from fastapi import APIRouter
from pydantic import BaseModel
from app.database import get_db_connection

router = APIRouter(prefix="/api/milestones", tags=["Milestones"])

@router.get("/")
async def get_milestones():
    
    stats = [
        {
            "id": 1,
            "icon": "fa-users",
            "rate": "5,500+",
            "note": "Happy Customers"
        },
        {
            "id": 2,
            "icon": "fa-comment-dots",
            "rate": "1,500+",
            "note": "Positive Product Reviews"
        },
        {
            "id": 3,
            "icon": "fa-truck-fast",
            "rate": "4,300+",
            "note": "Successful Orders"
        },
    ]
    return stats