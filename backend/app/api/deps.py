"""API dependencies.

This module contains dependency-injection functions used throughout the API
routers. These are primarily used for acquiring a database session.
"""

from ..db.session import SessionLocal


def get_db():
    """Dependency that provides a SQLAlchemy session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
