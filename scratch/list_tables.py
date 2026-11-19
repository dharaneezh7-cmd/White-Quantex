import psycopg2

try:
    conn = psycopg2.connect('host=localhost port=5432 dbname=WhiteQuantex-Financial-Database user=postgres password=8426')
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;")
    tables = cur.fetchall()
    print("Tables in PostgreSQL:")
    for t in tables:
        print(f" - {t[0]}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
