import pymysql

# 1. Local MySQL Connection
local_conn = pymysql.connect(
    host="localhost",
    user="root",
    password="devika99",
    database="trendmart",
    cursorclass=pymysql.cursors.DictCursor
)

# 2. Aiven Cloud MySQL Connection
aiven_conn = pymysql.connect(
    host="mysql-e067198-trendmart-db.k.aivencloud.com",
    user="avnadmin",
    password="AVNS_6TgkrvaIOhIH3fXtlt5",
    database="defaultdb",
    port=19095,
    ssl={"ssl_mode": "REQUIRED"},
    cursorclass=pymysql.cursors.DictCursor
)

try:
    with local_conn.cursor() as local_cur, aiven_conn.cursor() as aiven_cur:
        aiven_cur.execute("SET FOREIGN_KEY_CHECKS = 0;")
        
        # Local-la irukkura tables list edukkirom
        local_cur.execute("SHOW TABLES;")
        tables = [list(row.values())[0] for row in local_cur.fetchall()]
        print(f"Found {len(tables)} tables to migrate: {tables}")
        
        for table in tables:
            print(f"Migrating table: {table}...")
            
            # Copy Structure
            local_cur.execute(f"SHOW CREATE TABLE `{table}`;")
            create_table_sql = local_cur.fetchone()["Create Table"]
            aiven_cur.execute(f"DROP TABLE IF EXISTS `{table}`;")
            aiven_cur.execute(create_table_sql)
            
            # Copy Rows
            local_cur.execute(f"SELECT * FROM `{table}`;")
            rows = local_cur.fetchall()
            
            if rows:
                columns = ", ".join([f"`{k}`" for k in rows[0].keys()])
                placeholders = ", ".join(["%s"] * len(rows[0]))
                insert_sql = f"INSERT INTO `{table}` ({columns}) VALUES ({placeholders})"
                
                values = [tuple(row.values()) for row in rows]
                aiven_cur.executemany(insert_sql, values)
                print(f"-> {len(rows)} rows copied into {table}")
        
        aiven_cur.execute("SET FOREIGN_KEY_CHECKS = 1;")
        aiven_conn.commit()
        print("\nAll tables & exact data migrated to Aiven Cloud successfully!")

except Exception as e:
    print(f"\nMigration error: {e}")

finally:
    local_conn.close()
    aiven_conn.close()