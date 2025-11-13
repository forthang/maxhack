"""Schedule endpoints.

This module defines HTTP endpoints related to the academic schedule. It
provides read access to schedule items for a user's group and allows
authorized users to upload a schedule for a specific group.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from ..crud import schedule as crud
from .. import schemas
from .deps import get_db


router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.get("", response_model=list[schemas.ScheduleItemOut])
def read_schedule(user_id: int, db: Session = Depends(get_db)) -> list[schemas.ScheduleItemOut]:
    """Return the schedule for the given user's group."""
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="user_id is required")
    return crud.get_schedule(db, user_id)


@router.post("/upload", status_code=status.HTTP_201_CREATED)
def upload_schedule(
    group_id: int,
    items: list[schemas.ScheduleItemBase] = Body(...),
    db: Session = Depends(get_db)
) -> dict[str, str]:
    """Upload a schedule for a specific group.

    In a real application, this would be restricted to authorized users.
    This endpoint serves as a placeholder for more complex logic like
    parsing an Excel file.
    """
    # Here you could add logic to parse an Excel file and convert it to `items`
    # For now, we accept the items directly as JSON.
    crud.add_schedule_for_group(db, group_id=group_id, schedule_items=items)
    return {"message": f"Schedule uploaded successfully for group {group_id}"}