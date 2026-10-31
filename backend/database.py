"""PostgreSQL connection handling (psycopg2, plain SQL - no ORM)."""
import os
from contextlib import contextmanager
from pathlib import Path

from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor
from psycopg2.pool import ThreadedConnectionPool

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/task_tracker"
)

pool = ThreadedConnectionPool(minconn=1, maxconn=10, dsn=DATABASE_URL)


@contextmanager
def get_cursor():
    """Yield a dict cursor; commit on success, roll back on error."""
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        pool.putconn(conn)


def init_db():
    """Create the tables from schema.sql if they don't exist yet."""
    sql = (Path(__file__).parent / "schema.sql").read_text()
    with get_cursor() as cur:
        cur.execute(sql)
