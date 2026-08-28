import os
import pymysql

def get_db_connection():
    db_host = os.getenv("DB_HOST", "localhost")
    db_user = os.getenv("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD", "devika99")
    db_name = os.getenv("DB_NAME", "trendmart")
    db_port = int(os.getenv("DB_PORT", 3306))

    # Aiven / Cloud MySQL connections require SSL
    ssl_dict = {"ssl": {"ssl_mode": "REQUIRED"}} if db_host != "localhost" else None

    return pymysql.connect(
        host=db_host,
        user=db_user,
        password=db_password,
        database=db_name,
        port=db_port,
        cursorclass=pymysql.cursors.DictCursor,
        ssl=ssl_dict["ssl"] if ssl_dict else None
    )