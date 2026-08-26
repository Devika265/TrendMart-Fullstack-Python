import uuid
import random
from fastapi import APIRouter, HTTPException
from app.database import get_db_connection
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/products", tags=["Products"])


class ProductCreate(BaseModel):
    category: str
    name: str
    offer: Optional[int] = 0
    offer_type: Optional[str] = None
    original_price: float
    stock: int
    rating: Optional[float] = 0.0
    image_url: str
    description: Optional[str] = None


def add_offer_label(p):
    if p.get("original_price") and p.get("offer_price") and p["original_price"] > 0:
        diff = float(p["original_price"]) - float(p["offer_price"])
        percentage = int((diff / float(p["original_price"])) * 100)
        p["offer_label"] = f"{percentage}% off"
    else:
        p["offer_label"] = "0% off"
    return p


@router.get("/")
def get_all_products(search: Optional[str] = None):
    conn = get_db_connection(); cursor = conn.cursor()
    try:
        if search:
            cursor.execute("SELECT * FROM products WHERE name LIKE %s OR category LIKE %s", (f"%{search}%", f"%{search}%"))
        else:
            cursor.execute("SELECT * FROM products")
        return [add_offer_label(p) for p in cursor.fetchall()]
    finally:
        cursor.close(); conn.close()


@router.get("/{id}")
def get_single_product(id: int):
    conn = get_db_connection(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM products WHERE id = %s", (id,))
        p = cursor.fetchone()
        if not p: raise HTTPException(status_code=404, detail="Not found")
        return add_offer_label(p)
    finally:
        cursor.close(); conn.close()


@router.post("/")
def create_product(product: ProductCreate):
    conn = get_db_connection(); cursor = conn.cursor()
    new_code = f"SKU-{random.randint(10000000, 99999999)}"
    try:
        off_price = product.original_price * (1 - (product.offer / 100)) if product.offer else product.original_price
        sql = """INSERT INTO products 
                (product_code, category, name, offer, offer_type, original_price, 
                offer_price, stock, rating, image_url, description) 
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
        cursor.execute(sql, (new_code, product.category, product.name, product.offer, 
                            product.offer_type, product.original_price, off_price, 
                            product.stock, product.rating, product.image_url, product.description))
        conn.commit()
        return {"message": "Success", "product_code": new_code}
    except Exception as e:
        conn.rollback(); raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close(); conn.close()


@router.put("/{id}")
def update_product(id: int, product: ProductCreate):
    conn = get_db_connection(); cursor = conn.cursor()
    try:
        off_price = product.original_price * (1 - (product.offer / 100)) if product.offer else product.original_price
        sql = """UPDATE products SET category=%s, name=%s, offer=%s, offer_type=%s, 
                original_price=%s, offer_price=%s, stock=%s, rating=%s, 
                image_url=%s, description=%s WHERE id=%s"""
        cursor.execute(sql, (product.category, product.name, product.offer, product.offer_type, 
                            product.original_price, off_price, product.stock, 
                            product.rating, product.image_url, product.description, id))
        conn.commit(); return {"message": "Updated"}
    finally:
        cursor.close(); conn.close()


@router.delete("/{id}")
def delete_product(id: int):
    conn = get_db_connection(); cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM products WHERE id=%s", (id,)); conn.commit()
        return {"message": "Deleted"}
    finally:
        cursor.close(); conn.close()


@router.get("/filter/category/")
def filter_category(category: str):
    conn = get_db_connection(); cursor = conn.cursor()
    try:
        cats = category.split(",")
        cursor.execute(f"SELECT * FROM products WHERE category IN ({','.join(['%s']*len(cats))})", cats)
        return [add_offer_label(p) for p in cursor.fetchall()]
    finally:
        cursor.close(); conn.close()


@router.get("/filter/price/")
def filter_price(min_price: int = 0, max_price: int = 1000000):
    conn = get_db_connection(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM products WHERE offer_price BETWEEN %s AND %s", (min_price, max_price))
        return [add_offer_label(p) for p in cursor.fetchall()]
    finally:
        cursor.close(); conn.close()


@router.get("/filter/discount/")
def filter_discount(discount: str):
    conn = get_db_connection(); cursor = conn.cursor()
    try:
        ranges = discount.split(",") 
        conditions = ["offer BETWEEN %s AND %s" for _ in ranges]
        params = []
        for r in ranges: params.extend(r.split("-"))
        cursor.execute(f"SELECT * FROM products WHERE {' OR '.join(conditions)}", params)
        return [add_offer_label(p) for p in cursor.fetchall()]
    finally:
        cursor.close(); conn.close()


@router.get("/filter/rating/")
def filter_rating(rating: str):
    conn = get_db_connection(); cursor = conn.cursor()
    try:
        ranges = rating.split(",")
        conditions = ["rating BETWEEN %s AND %s" for _ in ranges]
        params = []
        for r in ranges: params.extend(r.split("-"))
        cursor.execute(f"SELECT * FROM products WHERE {' OR '.join(conditions)}", params)
        return [add_offer_label(p) for p in cursor.fetchall()]
    finally:
        cursor.close(); conn.close()


@router.get("/filter/offer/")
def filter_offer(offer: str):
    conn = get_db_connection(); cursor = conn.cursor()
    try:
        offers = offer.split(",")
        cursor.execute(f"SELECT * FROM products WHERE offer_type IN ({','.join(['%s']*len(offers))})", offers)
        return [add_offer_label(p) for p in cursor.fetchall()]
    finally:
        cursor.close(); conn.close()


@router.get("/search/")
def search_products(q: str = ""):
    conn = get_db_connection()
    cursor = conn.cursor()   

    try:
        
        if not q:
            cursor.execute("SELECT * FROM products LIMIT 20")
        else:
            
            query = "SELECT * FROM products WHERE name LIKE %s"
            cursor.execute(query, (f"%{q}%",))
        
        products = cursor.fetchall()
        
        
        return [add_offer_label(p) for p in products]
    
    except Exception as e:
        print(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Database connection error")
    
    finally:
        cursor.close()
        conn.close()


@router.get("/new-arrivals/")
def get_new_arrivals():
    conn = get_db_connection(); cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM products ORDER BY id DESC LIMIT 9")
        return [add_offer_label(p) for p in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()