# db.py - MySQL database connection using a connection pool
#
# A connection pool keeps a set of database connections open and ready to use.
# Instead of opening a new connection every time someone sends a message (which
# is slow), we grab an already-open connection from the pool, use it, and return
# it when done. Think of it like a library lending out books - the books (connections)
# stay in the library (pool) and get reused by different people (requests).

import mysql.connector
from mysql.connector import pooling

# Create a pool of 5 reusable database connections.
# pool_name  = a label so MySQL can track this pool internally
# pool_size  = how many connections to keep open at once (5 is fine for a small app)
# host/user/password/database = credentials to connect to the MySQL server
db_pool = pooling.MySQLConnectionPool(
    pool_name="neurochat_pool",
    pool_size=5,
    host="127.0.0.1",
    user="root",            # default MySQL user - change if you created a dedicated user
    password="root",        # change this to your actual MySQL root password
    database="neurochat"
)


def get_db():
    """
    Borrow one connection from the pool.

    Usage:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT ...")
        conn.close()   # <-- this returns the connection to the pool, it doesn't
                        #     actually close it permanently
    """
    return db_pool.get_connection()
