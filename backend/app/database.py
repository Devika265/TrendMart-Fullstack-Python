import pymysql

def get_db_connection():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="devika99",
        database="trendmart",
        cursorclass=pymysql.cursors.DictCursor
    )
    
    