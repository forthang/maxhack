"""Event endpoints.

Defines CRUD operations for extracurricular events. Events are separate
from academic schedule items. Users can list all events and create
new events. Creating an event does not require authentication in this
demo application but would normally be restricted.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models  # needed for update_event annotations

from ..crud import event as crud
from .. import schemas
from .deps import get_db

class UserEventPayload(schemas.BaseModel):
    user_id: int

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[schemas.EventOut])
def list_events(user_id: int | None = None, db: Session = Depends(get_db)) -> list[schemas.EventOut]:
    """List all events sorted chronologically.

    Optionally accepts a user_id to annotate each event with sign‑up
    information. If no user_id is provided, default to 1 to simulate
    an authenticated demo user.
    """
    uid = user_id or 1
    return crud.get_events(db, user_id=uid)


@router.post("", response_model=schemas.EventOut, status_code=status.HTTP_201_CREATED)
def create_event_endpoint(event: schemas.EventBase, db: Session = Depends(get_db)) -> schemas.EventOut:
    """Create a new event and return it.

    The creator ID is ignored in this version, so the event is
    created anonymously. In a real system, the authenticated user ID
    would be stored separately.
    """
    return crud.create_event(db, event)


@router.post("/{event_id}/signup", status_code=status.HTTP_200_OK)
def signup_event(event_id: int, payload: UserEventPayload, db: Session = Depends(get_db)) -> dict[str, bool]:
    """Sign up a user for an event.

    Returns a JSON object indicating whether a new sign‑up was recorded.
    """
    success = crud.signup_for_event(db, event_id=event_id, user_id=payload.user_id)
    return {"success": success}


@router.post("/{event_id}/unsubscribe", status_code=status.HTTP_200_OK)
def unsubscribe_event(event_id: int, payload: UserEventPayload, db: Session = Depends(get_db)) -> dict[str, bool]:
    """Remove a user's sign‑up for an event.

    Returns a JSON object indicating whether a sign‑up was removed.
    """
    success = crud.unsubscribe_event(db, event_id=event_id, user_id=payload.user_id)
    return {"success": success}


@router.put("/{event_id}", response_model=schemas.EventOut)
def update_event_endpoint(event_id: int, payload: schemas.EventUpdate, db: Session = Depends(get_db)) -> schemas.EventOut:
    """Update an existing event.

    Accepts partial fields via EventUpdate and returns the updated event.
    If the event does not exist, raises HTTP 404.
    """
    updated = crud.update_event(db, event_id=event_id, payload=payload)
    if updated is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Event not found")
    # annotate with sign‑up info for the default user
    # compute sign‑up count and status
    signup_count = db.query(func.count(models.EventSignup.id)).filter(models.EventSignup.event_id == event_id).scalar()
    user_signed = (
        db.query(models.EventSignup)
        .filter(models.EventSignup.event_id == event_id, models.EventSignup.user_id == 1)
        .first()
        is not None
    )
    return updated.model_copy(update={"signup_count": signup_count, "signed_up": user_signed})