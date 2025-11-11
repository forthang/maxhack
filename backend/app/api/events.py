"""Event endpoints.

Defines CRUD operations for extracurricular events. Events are separate
from academic schedule items. Users can list all events and create
new events. Creating an event does not require authentication in this
demo application but would normally be restricted.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
def signup_event(event_id: int, db: Session = Depends(get_db)) -> dict[str, bool]:
    """Sign up the default user (ID=1) for an event.

    Returns a JSON object indicating whether a new sign‑up was recorded.
    """
    success = crud.signup_for_event(db, event_id=event_id, user_id=1)
    return {"success": success}


@router.post("/{event_id}/unsubscribe", status_code=status.HTTP_200_OK)
def unsubscribe_event(event_id: int, db: Session = Depends(get_db)) -> dict[str, bool]:
    """Remove the default user's sign‑up for an event.

    Returns a JSON object indicating whether a sign‑up was removed.
    """
    success = crud.unsubscribe_event(db, event_id=event_id, user_id=1)
    return {"success": success}