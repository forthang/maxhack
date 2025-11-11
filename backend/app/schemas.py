"""Pydantic schema definitions used for request/response bodies.

These schemas help FastAPI validate and document the structure of data
exchanged with the frontend. They mirror the SQLAlchemy models defined in
`models.py` but omit ORM‑specific details such as relationships and other
non‑serializable fields.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from .models import UserRole


class UserBase(BaseModel):
    name: str
    role: UserRole
    university_id: Optional[int] = None
    achievements: Optional[str] = None
    progress: int = Field(default=0, ge=0, le=100)


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: Optional[str] = None
    university_id: Optional[int] = None
    achievements: Optional[str] = None
    progress: Optional[int] = Field(default=None, ge=0, le=100)


class UserOut(UserBase):
    id: int

    class Config:
        # In Pydantic v2, `from_attributes` replaces `orm_mode` to allow
        # creating models from ORM objects.
        from_attributes = True


class UniversityBase(BaseModel):
    name: str
    points: int = 0


class UniversityOut(UniversityBase):
    id: int

    class Config:
        from_attributes = True


class ScheduleItemBase(BaseModel):
    start_time: datetime
    end_time: datetime
    description: str


class ScheduleItemOut(ScheduleItemBase):
    id: int
    signup_count: int
    signed_up: bool = False

    class Config:
        from_attributes = True


class EventBase(BaseModel):
    event_time: datetime
    title: str
    description: str
    duration_hours: int = Field(default=2, ge=1, le=12, description="Длительность события в часах")
    materials: Optional[str] = Field(
        default=None,
        description="Дополнительные материалы или ссылка на ресурсы события",
    )


class EventOut(EventBase):
    id: int
    # Total number of users signed up for the event and whether the requesting user
    # is signed up. These fields are populated in CRUD functions.
    signup_count: int | None = None
    signed_up: bool | None = None
    # Identifier of the user who created the event, if any. This may be null
    # because the backend no longer stores creator information in the events
    # table.
    creator_id: int | None = None

    class Config:
        from_attributes = True


class LeaderboardEntry(BaseModel):
    university: UniversityOut
    rank: int


class ProfileOut(UserOut):
    university: Optional[UniversityOut] = None
    # Gamified metrics
    xp: int
    coins: int
    # Lists of completed courses and purchased items
    completed_courses: list['CompletedCourseOut'] = []
    purchases: list['PurchasedItemOut'] = []

    class Config:
        from_attributes = True


class CompletedCourseOut(BaseModel):
    id: int
    course_id: str

    class Config:
        from_attributes = True


class PurchasedItemOut(BaseModel):
    id: int
    item_id: str

    class Config:
        from_attributes = True