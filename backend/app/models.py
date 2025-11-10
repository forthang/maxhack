"""SQLAlchemy models representing entities in the university application.

These models map to database tables and capture the core domain:

* User – a participant in the system with a role (student or teacher) and
  optional affiliation to a university. Authentication is simplified via
  invitation links; therefore only minimal user information is stored.
* University – a higher education institution participating in the leaderboard.
* ScheduleItem – a single lesson or activity that appears in the schedule.
* Event – a non‑academic event such as hackathons or seminars.
* SignUp – a join table linking users to schedule items they have registered for.

All date/time fields use timezone‑aware UTC datetime values. When serializing
these values to JSON they will be ISO‑8601 strings.
"""

from datetime import datetime
from enum import Enum

from sqlalchemy import Column, DateTime, Integer, String, ForeignKey, Enum as PgEnum
from sqlalchemy.orm import relationship

from .database import Base


class UserRole(str, Enum):
    """Enumeration of possible user roles.

    We distinguish between students and teachers. Applicants will be represented
    as students until they enroll; the invitation link determines the role.
    """

    student = "student"
    teacher = "teacher"


class User(Base):
    """System user participating in the application.

    The system intentionally stores only minimal personal information because
    authentication is handled through invitation links rather than accounts.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(PgEnum(UserRole), nullable=False)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True)
    achievements = Column(String, nullable=True)  # comma‑separated achievements
    progress = Column(Integer, default=0)  # percentage progress for simplicity

    university = relationship("University", back_populates="users")
    signups = relationship("SignUp", back_populates="user")


class University(Base):
    """University or institute that contributes to the leaderboard."""

    __tablename__ = "universities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    points = Column(Integer, default=0)

    users = relationship("User", back_populates="university")


class ScheduleItem(Base):
    """Single item in the student's schedule."""

    __tablename__ = "schedule"

    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    description = Column(String, nullable=False)

    signups = relationship("SignUp", back_populates="schedule_item")


class Event(Base):
    """Extracurricular event in the university.

    Events differ from schedule items by not requiring a sign‑up; they are
    informational and open to all users.
    """

    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_time = Column(DateTime(timezone=True), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)

    # Длительность события в часах. Значение по умолчанию — 2 часа.
    duration_hours = Column(Integer, nullable=False, default=2)


class SignUp(Base):
    """Association table linking users to schedule items they signed up for."""

    __tablename__ = "signups"

    id = Column(Integer, primary_key=True, index=True)
    # user_id is optional when registration is anonymous
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    schedule_item_id = Column(Integer, ForeignKey("schedule.id"), nullable=False)

    user = relationship("User", back_populates="signups")
    schedule_item = relationship("ScheduleItem", back_populates="signups")