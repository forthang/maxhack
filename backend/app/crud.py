"""CRUD utility functions for database interactions.

These functions encapsulate database queries and mutations so that the
FastAPI routes remain concise and focused on HTTP concerns. Each function
expects an active SQLAlchemy session and returns plain Python objects or
SQLAlchemy models.
"""

from typing import List, Optional, Tuple

from sqlalchemy.orm import Session
from sqlalchemy import func

from . import models, schemas


def get_schedule(db: Session, user_id: Optional[int] = None) -> List[schemas.ScheduleItemOut]:
    """Return all schedule items, annotated with sign‑up counts and user status.

    Args:
        db: Active database session.
        user_id: Optional ID of the requesting user. If provided, each item
            includes a boolean indicating whether the user has signed up.

    Returns:
        A list of ScheduleItemOut objects.
    """
    items = db.query(models.ScheduleItem).all()
    results: List[schemas.ScheduleItemOut] = []
    for item in items:
        # Count signups per item
        signup_count = db.query(func.count(models.SignUp.id)).filter(models.SignUp.schedule_item_id == item.id).scalar()
        signed_up = False
        if user_id is not None:
            signed_up = (
                db.query(models.SignUp)
                .filter(models.SignUp.schedule_item_id == item.id, models.SignUp.user_id == user_id)
                .first()
                is not None
            )
        results.append(
            schemas.ScheduleItemOut(
                id=item.id,
                start_time=item.start_time,
                end_time=item.end_time,
                description=item.description,
                signup_count=signup_count,
                signed_up=signed_up,
            )
        )
    return results


def signup_for_schedule(db: Session, schedule_id: int, user_id: Optional[int] = None) -> bool:
    """Register for a schedule item.

    If ``user_id`` is provided the function ensures the user is not already
    registered. If ``user_id`` is ``None`` a sign‑up is recorded anonymously.
    Returns True if a new sign‑up was created; always True for anonymous
    sign‑ups.
    """
    if user_id is not None:
        existing = (
            db.query(models.SignUp)
            .filter(models.SignUp.user_id == user_id, models.SignUp.schedule_item_id == schedule_id)
            .first()
        )
        if existing:
            return False
    signup = models.SignUp(user_id=user_id, schedule_item_id=schedule_id)
    db.add(signup)
    db.commit()
    return True


def get_events(db: Session) -> List[schemas.EventOut]:
    """Return all events sorted by time."""
    events = db.query(models.Event).order_by(models.Event.event_time).all()
    return [
        schemas.EventOut(
            id=event.id,
            event_time=event.event_time,
            title=event.title,
            description=event.description,
            duration_hours=event.duration_hours,
        )
        for event in events
    ]


def create_event(db: Session, payload: schemas.EventBase) -> schemas.EventOut:
    """Create a new event and return it.

    Args:
        db: Active database session.
        payload: Pydantic model containing event_time, title and description.

    Returns:
        The created EventOut schema.
    """
    event = models.Event(
        event_time=payload.event_time,
        title=payload.title,
        description=payload.description,
        duration_hours=payload.duration_hours,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return schemas.EventOut(
        id=event.id,
        event_time=event.event_time,
        title=event.title,
        description=event.description,
        duration_hours=event.duration_hours,
    )


def get_leaderboard(db: Session) -> List[schemas.LeaderboardEntry]:
    """Return universities ordered by points descending with their rank."""
    universities = (
        db.query(models.University)
        .order_by(models.University.points.desc())
        .all()
    )
    leaderboard: List[schemas.LeaderboardEntry] = []
    for idx, uni in enumerate(universities, start=1):
        leaderboard.append(
            schemas.LeaderboardEntry(
                university=schemas.UniversityOut(id=uni.id, name=uni.name, points=uni.points),
                rank=idx,
            )
        )
    return leaderboard


def get_profile(db: Session, user_id: int) -> Optional[schemas.ProfileOut]:
    """Retrieve a user's profile by ID."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        return None
    university = None
    if user.university:
        university = schemas.UniversityOut(
            id=user.university.id,
            name=user.university.name,
            points=user.university.points,
        )
    return schemas.ProfileOut(
        id=user.id,
        name=user.name,
        role=user.role,
        university_id=user.university_id,
        achievements=user.achievements,
        progress=user.progress,
        university=university,
    )


def update_profile(db: Session, user_id: int, payload: schemas.UserUpdate) -> Optional[schemas.ProfileOut]:
    """Update a user's editable fields."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        return None
    if payload.name is not None:
        user.name = payload.name
    if payload.university_id is not None:
        user.university_id = payload.university_id
    if payload.achievements is not None:
        user.achievements = payload.achievements
    if payload.progress is not None:
        user.progress = payload.progress
    db.commit()
    db.refresh(user)
    return get_profile(db, user.id)