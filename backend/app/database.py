"""Database configuration for FastAPI backend.

This module defines the SQLAlchemy engine and sessionmaker. It also includes
helper functions for creating database tables and seeding initial data. The
database URL is read from the `DATABASE_URL` environment variable. When no
URL is provided, it defaults to a local PostgreSQL instance. Note that in
production you should provide a proper connection string via environment
variables.

We rely on SQLAlchemy's declarative base to define models in `models.py`.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Read the database URL from environment or use a sensible default. This
# default points at the `postgres` service defined in docker‑compose.yml.
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@db:5432/postgres")

# Create the SQLAlchemy engine. `echo` can be toggled to see SQL queries
# logged to stdout for debugging purposes.
engine = create_engine(DATABASE_URL, echo=False)

# SessionLocal is a session factory that will create new Session objects when
# called. We set expire_on_commit=False so that objects remain usable after
# commit.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models. All ORM models should inherit from this
# class.
Base = declarative_base()


def init_db() -> None:
    """Create database tables and seed with some sample data.

    This function should be invoked at application startup when running
    outside of Alembic migrations. It creates all tables declared via
    `Base.metadata.create_all()` and inserts a few records to make the API
    immediately usable. If the tables already exist this function is a
    no‑op.
    """
    from . import models  # noqa: F401 – import models to register with metadata

    # Create all tables if they do not exist based on SQLAlchemy models.
    # This uses the metadata from models.py which should include all columns.
    Base.metadata.create_all(bind=engine)

    # Perform a lightweight migration to add any missing columns prior to
    # querying the ORM. Without this, SQLAlchemy will attempt to select
    # attributes that do not exist on older schemas, causing an error.
    from sqlalchemy import text
    with engine.connect() as conn:
        # Add duration_hours column to events if it does not exist. This ensures
        # the ORM can select this attribute without causing an undefined column
        # error. In a real project, use Alembic for proper migrations.
        conn.execute(text(
            "ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS duration_hours INTEGER DEFAULT 2"
        ))
        # Allow anonymous sign‑ups by dropping NOT NULL constraint on signups.user_id.
        conn.execute(text(
            "ALTER TABLE IF EXISTS signups ALTER COLUMN user_id DROP NOT NULL"
        ))
        # Add materials column for events if it doesn't exist.
        conn.execute(text(
            "ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS materials VARCHAR"
        ))
        conn.commit()

    # Seed the database with sample data only if the tables are empty. To avoid
    # selecting a non‑existent column when checking for emptiness, use raw SQL
    # rather than the ORM. This ensures compatibility with older schemas.
    db = SessionLocal()
    try:
        # Universities
        uni_count = db.execute(text("SELECT COUNT(*) FROM universities")).scalar()
        if not uni_count:
            uni1 = models.University(name="Московский Политех", points=150)
            uni2 = models.University(name="Технопарк МГТУ", points=120)
            uni3 = models.University(name="СПбГУ", points=90)
            # Добавляем дополнительные университеты для более насыщенного лидерборда
            uni4 = models.University(name="МГУ", points=180)
            uni5 = models.University(name="ВШЭ", points=140)
            uni6 = models.University(name="МФТИ", points=130)
            uni7 = models.University(name="НИУ ИТМО", points=110)
            uni8 = models.University(name="Новосибирский ГУ", points=100)
            uni9 = models.University(name="ТГУ", points=95)
            uni10 = models.University(name="ДВФУ", points=85)
            db.add_all([uni1, uni2, uni3, uni4, uni5, uni6, uni7, uni8, uni9, uni10])

        # Schedule items
        schedule_count = db.execute(text("SELECT COUNT(*) FROM schedule")).scalar()
        if not schedule_count:
            from datetime import datetime, timedelta
            now = datetime.utcnow()
            lesson1 = models.ScheduleItem(
                start_time=now + timedelta(hours=1),
                end_time=now + timedelta(hours=2),
                description="Лекция по математике"
            )
            lesson2 = models.ScheduleItem(
                start_time=now + timedelta(days=1, hours=2),
                end_time=now + timedelta(days=1, hours=3),
                description="Практика по программированию"
            )
            db.add_all([lesson1, lesson2])

        # Events
        event_count = db.execute(text("SELECT COUNT(*) FROM events")).scalar()
        if not event_count:
            from datetime import datetime, timedelta
            event1 = models.Event(
                event_time=datetime.utcnow() + timedelta(days=2),
                title="Хакатон",
                description="Участвуйте в командном хакатоне и выиграйте призы!",
                duration_hours=2,
                materials="https://example.com/hackathon-info",
            )
            event2 = models.Event(
                event_time=datetime.utcnow() + timedelta(days=3),
                title="Семинар по карьере",
                description="Поговорим о карьерных возможностях для студентов.",
                duration_hours=2,
                materials="https://example.com/career-seminar",
            )
            db.add_all([event1, event2])

        db.commit()
    finally:
        db.close()