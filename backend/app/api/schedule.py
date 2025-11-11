"""Schedule endpoints.

This module defines HTTP endpoints related to the academic schedule. It
provides read access to schedule items and allows anonymous users to
register for them. The actual data access is delegated to the `crud`
module to keep route handlers succinct.
"""

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..database import SessionLocal


def get_db():
    """Dependency that provides a SQLAlchemy session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.get("", response_model=list[schemas.ScheduleItemOut])
def read_schedule(user_id: int | None = None, db: Session = Depends(get_db)) -> list[schemas.ScheduleItemOut]:
    """Return the full schedule.

    If a user_id is provided, annotate each item with whether the user has
    registered. When omitted, anonymous users always see signed_up=False.
    """
    return crud.get_schedule(db, user_id)


@router.post("/{schedule_id}/signup", response_model=dict, status_code=status.HTTP_200_OK)
def signup_schedule_item(
    schedule_id: int = Path(..., description="ID of the schedule item"),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    """Sign up anonymously for a schedule item.

    Always returns ``{"created": True}`` even if duplicate, mirroring the
    original behaviour.
    """
    schedule = db.query(models.ScheduleItem).filter(models.ScheduleItem.id == schedule_id).first()
    if schedule is None:
        raise HTTPException(status_code=404, detail="Расписание не найдено")
    crud.signup_for_schedule(db, schedule_id, None)
    return {"created": True}