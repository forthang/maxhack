from typing import List
from sqlalchemy.orm import Session

from .base import CRUDBase
from ..models.schedule import ScheduleItem
from ..schemas.schedule import ScheduleItemCreate, ScheduleItemUpdate


class CRUDScheduleItem(CRUDBase[ScheduleItem, ScheduleItemCreate, ScheduleItemUpdate]):
    def get_by_group(self, db: Session, *, group_id: int) -> List[ScheduleItem]:
        return db.query(ScheduleItem).filter(ScheduleItem.group_id == group_id).all()

schedule = CRUDScheduleItem(ScheduleItem)
