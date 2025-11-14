from typing import List
from sqlalchemy.orm import Session

from .base import CRUDBase
from ..models.event import Event, EventSubscription
from ..schemas.event import EventCreate, EventUpdate


class CRUDEvent(CRUDBase[Event, EventCreate, EventUpdate]):
    def get_subscribed_by_user(self, db: Session, *, user_id: int) -> List[Event]:
        return db.query(Event).join(EventSubscription).filter(EventSubscription.user_id == user_id).all()

event = CRUDEvent(Event)
