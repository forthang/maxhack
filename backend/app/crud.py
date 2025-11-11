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
    """Register a user for a schedule item.

    If user_id is provided, ensure the user hasn't already signed up. If
    user_id is None, create or look up a "Гость" user and use that ID.

    Returns True if a new sign‑up was created; False if the user was
    already registered.
    """
    actual_user_id = user_id
    if actual_user_id is not None:
        existing = (
            db.query(models.SignUp)
            .filter(models.SignUp.user_id == actual_user_id, models.SignUp.schedule_item_id == schedule_id)
            .first()
        )
        if existing:
            return False
    else:
        # Use or create a guest user if none provided
        guest = db.query(models.User).filter(models.User.name == "Гость").first()
        if guest is None:
            guest = models.User(name="Гость", role=models.UserRole.student)
            db.add(guest)
            db.commit()
            db.refresh(guest)
        actual_user_id = guest.id
    signup = models.SignUp(user_id=actual_user_id, schedule_item_id=schedule_id)
    db.add(signup)
    db.commit()
    return True


def get_events(db: Session, user_id: Optional[int] = None) -> List[schemas.EventOut]:
    """Return all events sorted by time.

    When user_id is provided, include sign‑up count for each event and
    whether the user has signed up. Also include the creator_id of
    custom events.
    """
    events = db.query(models.Event).order_by(models.Event.event_time).all()
    result: List[schemas.EventOut] = []
    for event in events:
        # Count sign‑ups for this event
        signup_count = db.query(func.count(models.EventSignup.id)).filter(models.EventSignup.event_id == event.id).scalar()
        user_signed = False
        if user_id is not None:
            user_signed = (
                db.query(models.EventSignup)
                .filter(models.EventSignup.event_id == event.id, models.EventSignup.user_id == user_id)
                .first()
                is not None
            )
        event_out = schemas.EventOut(
            id=event.id,
            event_time=event.event_time,
            title=event.title,
            description=event.description,
            duration_hours=event.duration_hours,
            materials=event.materials,
            creator_id=None,
        )
        # Use model_copy/update to set additional fields not defined in the base model
        event_out = event_out.model_copy(update={"signup_count": signup_count, "signed_up": user_signed})
        result.append(event_out)
    return result


def create_event(db: Session, payload: schemas.EventBase, creator_id: Optional[int] = None) -> schemas.EventOut:
    """Create a new event and return it.

    Args:
        db: Active database session.
        payload: Pydantic model containing event_time, title, description,
            duration and materials.
        creator_id: ignored in this simplified version. Creator information
            is not stored in the database.

    Returns:
        The created EventOut schema.
    """
    # The creator_id argument is ignored because the events table does not
    # include a creator column. This avoids errors when inserting into the
    # database. If needed, this value could be stored in a separate table.
    event = models.Event(
        event_time=payload.event_time,
        title=payload.title,
        description=payload.description,
        duration_hours=payload.duration_hours,
        materials=payload.materials,
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
        materials=event.materials,
        creator_id=None,
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
    """Retrieve a user's profile by ID.

    Returns the user's basic attributes along with xp/coins, completed
    courses and purchased items. If the user does not exist this
    returns None.
    """
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
    # Build lists of completed courses and purchases
    completed = [
        schemas.CompletedCourseOut(id=cc.id, course_id=cc.course_id)
        for cc in user.completed_courses
    ]
    purchases = [
        schemas.PurchasedItemOut(id=p.id, item_id=p.item_id)
        for p in user.purchases
    ]
    return schemas.ProfileOut(
        id=user.id,
        name=user.name,
        role=user.role,
        university_id=user.university_id,
        achievements=user.achievements,
        progress=user.progress,
        university=university,
        xp=user.xp,
        coins=user.coins,
        completed_courses=completed,
        purchases=purchases,
    )


def complete_course(db: Session, user_id: int, course_id: str, xp: int, coins: int) -> schemas.ProfileOut:
    """Mark a course as completed for a user, awarding XP and coins.

    If the course has already been completed by this user, no XP or
    coins are granted and the existing profile is returned.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    existing = (
        db.query(models.CompletedCourse)
        .filter(models.CompletedCourse.user_id == user_id, models.CompletedCourse.course_id == course_id)
        .first()
    )
    if existing is None:
        completion = models.CompletedCourse(user_id=user_id, course_id=course_id)
        db.add(completion)
        user.xp += xp
        user.coins += coins
        db.commit()
        db.refresh(user)
    return get_profile(db, user_id)


def purchase_item(db: Session, user_id: int, item_id: str, cost: int) -> schemas.ProfileOut:
    """Record a purchase for the user if they have enough coins.

    Deducts the cost from the user's coins and records the purchased item.
    Returns the updated profile. Raises ValueError if insufficient funds or
    the user does not exist.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    if user.coins < cost:
        raise ValueError("Insufficient coins")
    purchase = models.PurchasedItem(user_id=user_id, item_id=item_id)
    user.coins -= cost
    db.add(purchase)
    db.commit()
    db.refresh(user)
    return get_profile(db, user_id)


def signup_for_event(db: Session, event_id: int, user_id: int) -> bool:
    """Register a user for an event.

    Returns True if the sign‑up was created; False if the user had already
    signed up for this event.
    """
    existing = (
        db.query(models.EventSignup)
        .filter(models.EventSignup.user_id == user_id, models.EventSignup.event_id == event_id)
        .first()
    )
    if existing:
        return False
    signup = models.EventSignup(user_id=user_id, event_id=event_id)
    db.add(signup)
    db.commit()
    return True


def unsubscribe_event(db: Session, event_id: int, user_id: int) -> bool:
    """Remove a user's sign‑up for an event.

    Returns True if a sign‑up existed and was removed; False if there was
    no sign‑up to delete.
    """
    existing = (
        db.query(models.EventSignup)
        .filter(models.EventSignup.user_id == user_id, models.EventSignup.event_id == event_id)
        .first()
    )
    if existing is None:
        return False
    db.delete(existing)
    db.commit()
    return True


def get_university(db: Session, university_id: int) -> Optional[schemas.UniversityOut]:
    """Return a single university by its ID.

    Args:
        db: Active database session.
        university_id: Primary key of the university.

    Returns:
        UniversityOut if found, else None.
    """
    uni = db.query(models.University).filter(models.University.id == university_id).first()
    if uni is None:
        return None
    return schemas.UniversityOut(id=uni.id, name=uni.name, points=uni.points)


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