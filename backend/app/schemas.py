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





class GroupBase(BaseModel):

    name: str

    course_id: int





class GroupOut(GroupBase):

    id: int



    class Config:

        from_attributes = True





class CourseBase(BaseModel):

    year: int

    specialization_id: int





class CourseOut(CourseBase):

    id: int



    class Config:

        from_attributes = True





class SpecializationBase(BaseModel):

    name: str

    university_id: int





class SpecializationOut(SpecializationBase):

    id: int



    class Config:

        from_attributes = True





class UserBase(BaseModel):

    name: str

    role: UserRole

    group_id: Optional[int] = None

    achievements: Optional[str] = None

    progress: int = Field(default=0, ge=0, le=100)





class UserCreate(UserBase):

    pass





class UserUpdate(BaseModel):

    name: Optional[str] = None

    group_id: Optional[int] = None

    achievements: Optional[str] = None

    progress: Optional[int] = Field(default=None, ge=0, le=100)





class UserOut(UserBase):

    id: int



    class Config:

        from_attributes = True





class UniversityBase(BaseModel):

    name: str

    points: int = 0





class UniversityOut(UniversityBase):

    id: int



    class Config:

        from_attributes = True





class UniversityStudentOut(BaseModel):

    id: int

    name: str

    xp: int

    coins: int

    group: GroupOut



    class Config:

        from_attributes = True





class GroupWithStudentsOut(GroupOut):





    students: list[UniversityStudentOut] = []





class CourseWithGroupsOut(CourseOut):

    groups: list[GroupWithStudentsOut] = []





class SpecializationWithCoursesOut(SpecializationOut):

    courses: list[CourseWithGroupsOut] = []





class UniversityDetailOut(UniversityOut):

    specializations: list[SpecializationWithCoursesOut] = []



    class Config:

        from_attributes = True





class ScheduleItemBase(BaseModel):

    start_time: datetime

    end_time: datetime

    description: str

    auditorium: Optional[str] = Field(default=None, description="Аудитория, где проходит занятие")

    group_id: Optional[int] = None





class ScheduleItemOut(ScheduleItemBase):

    id: int



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

    auditorium: Optional[str] = Field(

        default=None,

        description="Аудитория или место проведения события",

    )





class EventUpdate(BaseModel):

    """Schema for updating an event. All fields are optional."""

    event_time: Optional[datetime] = None

    title: Optional[str] = None

    description: Optional[str] = None

    duration_hours: Optional[int] = Field(default=None, ge=1, le=12)

    materials: Optional[str] = None

    auditorium: Optional[str] = None





class EventOut(EventBase):

    id: int

    signup_count: int | None = None

    signed_up: bool | None = None

    creator_id: int | None = None



    class Config:

        from_attributes = True





class LeaderboardEntry(BaseModel):

    university: UniversityOut

    rank: int





class StudentLeaderboardEntry(BaseModel):

    user: UserOut

    rank: int

    

    class Config:

        from_attributes = True





class ProfileOut(UserOut):

    group: Optional[GroupOut] = None

    university: Optional[UniversityOut] = None

    xp: int

    coins: int

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

















class CompleteCoursePayload(BaseModel):





    user_id: int





    xp: int





    coins: int



class PurchasePayload(BaseModel):
    user_id: int
    item_id: str
    cost: int

class JoinGroupPayload(BaseModel):
    user_id: int
    group_id: int

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Оценка от 1 до 5")
    comment: Optional[str] = Field(None, max_length=500, description="Текст отзыва")

class EventReviewCreate(ReviewBase):
    user_id: int
    event_id: int

class CourseReviewCreate(ReviewBase):
    user_id: int
    course_id: str

class ReviewOut(ReviewBase):
    id: int
    user_id: int
    created_at: datetime
    user_name: Optional[str] = None # Optionally include user name for display

    class Config:
        from_attributes = True
