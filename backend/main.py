from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from app.routers import contacts, dashboard, products, orders, subscribers, login, offers, milestones, feedback
from app.database import get_db_connection

app = FastAPI(title="TrendMart Admin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(contacts.router)
app.include_router(dashboard.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(subscribers.router)
app.include_router(login.router)
app.include_router(offers.router)
app.include_router(milestones.router)
app.include_router(feedback.router)


@app.on_event("startup")
def create_tables_on_startup():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Users Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100) UNIQUE,
            password VARCHAR(255),
            role VARCHAR(20) DEFAULT 'user'
        );
        """)

        # 2. Products Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150),
            category VARCHAR(100),
            price DECIMAL(10, 2),
            original_price DECIMAL(10, 2),
            rating DECIMAL(3, 1),
            image VARCHAR(255),
            description TEXT
        );
        """)

        # 3. Offers Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS offers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(150),
            discount VARCHAR(50),
            image VARCHAR(255)
        );
        """)

        # 4. Contacts Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS contacts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100),
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 5. Subscribers Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS subscribers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 6. Orders Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            total_amount DECIMAL(10, 2),
            status VARCHAR(50) DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 7. Feedback Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100),
            rating INT,
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 8. Milestones Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS milestones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(100),
            count INT
        );
        """)

        conn.commit()
        cursor.close()
        conn.close()
        print("Database tables initialized successfully in Aiven Cloud!")
    except Exception as e:
        print(f"Error initializing tables: {e}")


@app.post("/api/sync-local-data")
def sync_local_data(data: dict = Body(...)):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Products sync
        if "products" in data and data["products"]:
            for item in data["products"]:
                cursor.execute("""
                    INSERT INTO products (name, category, price, original_price, rating, image, description)
                    VALUES (%s, %s, %s, %s, %s, %s, %s);
                """, (
                    item.get("name"), item.get("category"), item.get("price"),
                    item.get("original_price"), item.get("rating"),
                    item.get("image"), item.get("description")
                ))
                
        # Offers sync
        if "offers" in data and data["offers"]:
            for item in data["offers"]:
                cursor.execute("""
                    INSERT INTO offers (title, discount, image)
                    VALUES (%s, %s, %s);
                """, (item.get("title"), item.get("discount"), item.get("image")))

        conn.commit()
        cursor.close()
        conn.close()
        return {"status": "success", "message": "Local data successfully synced to Aiven!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
