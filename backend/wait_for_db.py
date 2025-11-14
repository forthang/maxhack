import time
import os
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

# It's important to use the same DATABASE_URL as in the application
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@db:5432/postgres")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

engine = create_engine(DATABASE_URL)

def check_db_connection():
    """
    Continuously try to connect to the database until successful.
    """
    retries = 0
    max_retries = 30 # Wait for a maximum of 30 seconds
    while retries < max_retries:
        try:
            # Try to establish a connection
            with engine.connect() as connection:
                print("Database connection successful.")
                return
        except OperationalError:
            print(f"Database connection failed. Retrying in 1 second... ({retries + 1}/{max_retries})")
            time.sleep(1)
            retries += 1
    
    print("Could not connect to the database after several retries. Exiting.")
    exit(1)


if __name__ == "__main__":
    print("Waiting for database to be ready...")
    check_db_connection()
