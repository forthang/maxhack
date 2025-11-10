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

    # Create all tables if they do not exist.
    Base.metadata.create_all(bind=engine)

    # Seed the database with sample universities, schedule items and events
    db = SessionLocal()
    try:
        # Only seed if tables are empty
        if db.query(models.University).count() == 0:
            uni1 = models.University(name="Московский Политех", points=150)
            uni2 = models.University(name="Технопарк МГТУ", points=120)
            uni3 = models.University(name="СПбГУ", points=90)
            db.add_all([uni1, uni2, uni3])

        if db.query(models.ScheduleItem).count() == 0:
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

        if db.query(models.Event).count() == 0:
            from datetime import datetime, timedelta
            event1 = models.Event(
                event_time=datetime.utcnow() + timedelta(days=2),
                title="Хакатон",
                description="Участвуйте в командном хакатоне и выиграйте призы!"
            )
            event2 = models.Event(
                event_time=datetime.utcnow() + timedelta(days=3),
                title="Семинар по карьере",
                description="Поговорим о карьерных возможностях для студентов."
            )
            db.add_all([event1, event2])

        db.commit()
    finally:
        db.close()