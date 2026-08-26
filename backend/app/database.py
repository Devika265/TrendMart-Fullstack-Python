import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    db_host = os.getenv("DB_HOST", "localhost")
    
    # Aiven cloud MySQL requires SSL
    ssl_config = {"ssl_mode": "REQUIRED"} if db_host != "localhost" else None
    
    return pymysql.connect(
        host=db_host,
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "devika99"),
        database=os.getenv("DB_NAME", "trendmart"),
        port=int(os.getenv("DB_PORT", 3306)),
        ssl=ssl_config,
        cursorclass=pymysql.cursors.DictCursor
    )
