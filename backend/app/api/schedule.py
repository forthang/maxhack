from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from .. import crud, models, schemas
from .deps import get_current_user, get_db

router = APIRouter(prefix="/schedule", tags=["schedule"])

@router.get("", response_model=List[schemas.ScheduleItemOut])
def read_schedule(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
) -> List[schemas.ScheduleItemOut]:
    """
    Return the personalized schedule for the current user.
    This includes classes for their group and events they are subscribed to.
    """
    output_items = []

    # 1. Get group-specific classes if the user is in a group
    if current_user.group_id:
        group_schedule = crud.schedule.get_by_group(db, group_id=current_user.group_id)
        for item in group_schedule:
            output_items.append(
                schemas.ScheduleItemOut(
                    id=item.id,
                    title=item.subject,
                    start_time=item.start_time.strftime('%H:%M'),
                    end_time=item.end_time.strftime('%H:%M'),
                    location=item.location,
                    type='class',
                )
            )

    # 2. Get subscribed events
    subscribed_events = crud.event.get_subscribed_by_user(db, user_id=current_user.id)
    for event in subscribed_events:
        output_items.append(
            schemas.ScheduleItemOut(
                id=event.id,
                title=event.title,
                start_time=event.start_time.isoformat(),
                end_time=event.end_time.isoformat(),
                location=event.location,
                type='event',
            )
        )
        
    return output_items