from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from .. import models, schemas

def get_events(db: Session, user_id: Optional[int] = None) -> List[schemas.EventOut]:
    """Return all events sorted by time, optimized to avoid N+1 queries."""
    # Eager load signups to prevent N+1 queries in the loop
    events = db.query(models.Event).options(joinedload(models.Event.signups)).order_by(models.Event.event_time).all()
    
    result: List[schemas.EventOut] = []
    for event in events:
        signup_count = len(event.signups)
        user_signed = False
        if user_id is not None:
            # Check in-memory signups instead of a new DB query
            user_signed = any(signup.user_id == user_id for signup in event.signups)
            
        event_out = schemas.EventOut.model_validate(event)
        event_out = event_out.model_copy(update={"signup_count": signup_count, "signed_up": user_signed})
        result.append(event_out)
    return result

def get_event(db: Session, event_id: int) -> Optional[models.Event]:
    """Return a single event by its ID."""
    return db.query(models.Event).filter(models.Event.id == event_id).first()

def create_event(db: Session, payload: schemas.EventBase) -> schemas.EventOut:
    """Create a new event and return it."""
    event = models.Event(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return schemas.EventOut.model_validate(event)

def update_event(db: Session, event_id: int, payload: schemas.EventUpdate) -> Optional[schemas.EventOut]:
    """Update an existing event with the provided fields."""
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if event is None:
        return None
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return schemas.EventOut.model_validate(event)

def signup_for_event(db: Session, event_id: int, user_id: int) -> bool:
    """Register a user for an event."""
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
    """Remove a user's sign‑up for an event."""
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
