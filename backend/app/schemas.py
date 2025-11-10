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
        orm_mode = True


class UniversityBase(BaseModel):
    name: str
    points: int = 0


class UniversityOut(UniversityBase):
    id: int

    class Config:
        orm_mode = True


class ScheduleItemBase(BaseModel):
    start_time: datetime
    end_time: datetime
    description: str


class ScheduleItemOut(ScheduleItemBase):
    id: int
    signup_count: int
    signed_up: bool = False

    class Config:
        orm_mode = True


class EventBase(BaseModel):
    event_time: datetime
    title: str
    description: str


class EventOut(EventBase):
    id: int

    class Config:
        orm_mode = True


class LeaderboardEntry(BaseModel):
    university: UniversityOut
    rank: int


class ProfileOut(UserOut):
    university: Optional[UniversityOut] = None
    # Additional derived fields can be added here in the future