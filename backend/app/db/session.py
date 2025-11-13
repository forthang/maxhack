"""Database session management for the application.

This module provides the core components for database interaction:
- The SQLAlchemy engine, configured from an environment variable.
- A `SessionLocal` factory for creating new database sessions.
- A declarative `Base` for ORM models to inherit from.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Read the database URL from environment or use a sensible default. This
# default points at the `postgres` service defined in docker-compose.yml.
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
