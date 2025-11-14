"""Database initialization and seeding.

This module contains the `init_db` function which is responsible for creating
database tables and populating them with initial data. This is intended for
development environments to ensure a consistent starting state.
"""

from sqlalchemy import text
from .session import Base, engine, SessionLocal

def init_db() -> None:
    """Create database tables and apply lightweight migrations.

    This function should be invoked at application startup. It creates all
    tables based on the defined models. Data seeding is handled separately
    by the seed_db script.
    """
    from .. import models

    # Tables should be created with Alembic migrations
    # But for this project, we'll just use create_all
    Base.metadata.create_all(bind=engine)

    # Lightweight migrations for development
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS duration_hours INTEGER DEFAULT 2"))
        conn.execute(text("ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS materials VARCHAR"))
        conn.execute(text("ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS auditorium VARCHAR"))
        conn.execute(text("ALTER TABLE IF EXISTS schedule ADD COLUMN IF NOT EXISTS auditorium VARCHAR"))
        # Drop the obsolete signups table if it exists
        conn.execute(text("DROP TABLE IF EXISTS signups"))
        conn.commit()

