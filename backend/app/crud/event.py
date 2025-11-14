from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from .. import models, schemas

def get_events(db: Session, user_id: Optional[int] = None) -> List[schemas.EventOut]:
    """Return all events sorted by time, optimized to avoid N+1 queries."""
    events = db.query(models.Event).options(joinedload(models.Event.signups)).order_by(models.Event.event_time).all()
    
    result: List[schemas.EventOut] = []
    for event in events:
        signup_count = len(event.signups)
        user_signed = False
        if user_id is not None:
            user_signed = any(signup.user_id == user_id for signup in event.signups)
            
        event_dict = event.__dict__.copy()
        event_dict["recommended_skills"] = event.recommended_skills.split(",") if event.recommended_skills else []
        
        event_out = schemas.EventOut.model_validate(event_dict)
        event_out = event_out.model_copy(update={"signup_count": signup_count, "signed_up": user_signed})
        result.append(event_out)
    return result

def get_event(db: Session, event_id: int) -> Optional[schemas.EventOut]:
    """Return a single event by its ID."""
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if event is None:
        return None
    
    event_dict = event.__dict__.copy()
    event_dict["recommended_skills"] = event.recommended_skills.split(",") if event.recommended_skills else []
    
    event_out = schemas.EventOut.model_validate(event_dict)
    return event_out

def create_event(db: Session, payload: schemas.EventBase) -> schemas.EventOut:
    """Create a new event and return it."""
    event_data = payload.model_dump()
    if "recommended_skills" in event_data and event_data["recommended_skills"] is not None:
        event_data["recommended_skills"] = ",".join(event_data["recommended_skills"])
    else:
        event_data["recommended_skills"] = "" # Store as empty string if None
    
    event = models.Event(**event_data)
    db.add(event)
    db.commit()
    db.refresh(event)
    
    event_dict = event.__dict__.copy()
    event_dict["recommended_skills"] = event.recommended_skills.split(",") if event.recommended_skills else []
    
    event_out = schemas.EventOut.model_validate(event_dict)
    return event_out

def update_event(db: Session, event_id: int, payload: schemas.EventUpdate) -> Optional[schemas.EventOut]:
    """Update an existing event with the provided fields."""
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if event is None:
        return None
    
    update_data = payload.model_dump(exclude_unset=True)
    if "recommended_skills" in update_data and update_data["recommended_skills"] is not None:
        update_data["recommended_skills"] = ",".join(update_data["recommended_skills"])
    elif "recommended_skills" in update_data and update_data["recommended_skills"] is None:
        update_data["recommended_skills"] = "" # Store as empty string if None
    
    for key, value in update_data.items():
        setattr(event, key, value)
    db.commit()
    db.refresh(event)
    
    event_dict = event.__dict__.copy()
    event_dict["recommended_skills"] = event.recommended_skills.split(",") if event.recommended_skills else []
    
    event_out = schemas.EventOut.model_validate(event_dict)
    return event_out

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
