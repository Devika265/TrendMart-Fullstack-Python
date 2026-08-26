from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database import get_db_connection

router = APIRouter(prefix="/api/contact/", tags=["Contacts"])

class ContactCreate(BaseModel):
    name: str
    phone: str
    email: str
    subject: str
    message: str

@router.post("/")
def create_contact(contact: ContactCreate):
    try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO contacts (name, phone, email, subject, message)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                contact.name,
                contact.phone,
                contact.email,
                contact.subject,
                contact.message
            ))

            conn.commit()
            return {"message": "Message sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()


@router.get("/")
def get_contacts():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM contacts ORDER BY id DESC")
    contacts = cursor.fetchall()

    cursor.close()
    conn.close()

    return contacts


@router.delete("/{contact_id}")
def delete_contact(contact_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM contacts WHERE id = %s", (contact_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Contact not found")

        cursor.execute("DELETE FROM contacts WHERE id = %s", (contact_id,))
        
        conn.commit()
        return {"message": f"Contact {contact_id} deleted successfully"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        conn.close()