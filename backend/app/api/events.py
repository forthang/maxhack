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
def list_events(db: Session = Depends(get_db)) -> list[schemas.EventOut]:
    """List all events sorted chronologically."""
    return crud.get_events(db)


@router.post("", response_model=schemas.EventOut, status_code=status.HTTP_201_CREATED)
def create_event_endpoint(event: schemas.EventBase, db: Session = Depends(get_db)) -> schemas.EventOut:
    """Create a new event and return it."""
    return crud.create_event(db, event)