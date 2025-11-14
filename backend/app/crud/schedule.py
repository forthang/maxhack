from typing import List
from sqlalchemy.orm import Session
from .. import models, schemas

def get_schedule(db: Session, user_id: int) -> List[schemas.ScheduleItemOut]:
    """Return all schedule items for the user's group."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.group_id:
        return []

    items = db.query(models.ScheduleItem).filter(models.ScheduleItem.group_id == user.group_id).all()
    return [schemas.ScheduleItemOut.model_validate(item) for item in items]

def add_schedule_for_group(db: Session, group_id: int, schedule_items: List[schemas.ScheduleItemBase]) -> List[models.ScheduleItem]:
    """Adds multiple schedule items for a specific group."""
    new_items = []
    for item_data in schedule_items:
        new_item = models.ScheduleItem(
            **item_data.model_dump(),
            group_id=group_id
        )
        new_items.append(new_item)
    db.add_all(new_items)
    db.commit()
    return new_items
