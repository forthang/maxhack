from pydantic import BaseModel
import datetime

class EventBase(BaseModel):
    title: str
    description: str | None = None
    start_time: datetime.datetime
    end_time: datetime.datetime
    location: str | None = None

class EventCreate(EventBase):
    pass

class EventUpdate(EventBase):
    pass

class EventInDBBase(EventBase):
    id: int

    class Config:
        orm_mode = True

class Event(EventInDBBase):
    pass

class EventOut(EventInDBBase):
    pass
