from sqlalchemy.orm import Session
from .session import engine, SessionLocal
from .base_class import Base
from .seed_db import seed_db

def init_db() -> None:
    # Import all models here so that Base has them registered
    from ..models import (
        User,
        University,
        Group,
        ScheduleItem,
        Event,
        EventSubscription,
        Review,
        CompletedCourse,
        Purchase,
    )

    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Seed the database with initial data
    db = SessionLocal()
    try:
        seed_db(db)
    finally:
        db.close()
