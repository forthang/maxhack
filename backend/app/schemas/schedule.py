from pydantic import BaseModel
import datetime

class ScheduleItemBase(BaseModel):
    day_of_week: int
    start_time: datetime.time
    end_time: datetime.time
    subject: str
    teacher: str | None = None
    location: str | None = None
    group_id: int

class ScheduleItemCreate(ScheduleItemBase):
    pass

class ScheduleItemUpdate(ScheduleItemBase):
    pass

class ScheduleItemInDBBase(ScheduleItemBase):
    id: int

    class Config:
        orm_mode = True

class ScheduleItem(ScheduleItemInDBBase):
    pass

# This will be the common output schema for both schedule items and events
class ScheduleItemOut(BaseModel):
    id: int
    title: str
    start_time: str
    end_time: str
    location: str | None
    type: str # 'class' or 'event'
    
    class Config:
        orm_mode = True
