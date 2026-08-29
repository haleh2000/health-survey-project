import pymysql

try:
    conn = pymysql.connect(host='localhost', user='root', password='admin')
    cursor = conn.cursor()
    cursor.execute('SHOW DATABASES')
    dbs = cursor.fetchall()
    with open('db_output.txt', 'w') as f:
        f.write(str(dbs))
    cursor.close()
    conn.close()
except Exception as e:
    with open('db_output.txt', 'w') as f:
        f.write(f'Error: {e}')