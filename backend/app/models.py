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

from .db.session import Base


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
    In this version the user also accumulates experience points and coins
    for completing courses and participating in events. Additional lookup
    tables record completed courses, purchased items and event signups.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(PgEnum(UserRole), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)
    achievements = Column(String, nullable=True)  # comma‑separated achievements
    progress = Column(Integer, default=0)  # percentage progress for simplicity

    # Additional gamified metrics. Experience points (xp) are awarded for
    # completing courses, and coins are earned through events or purchases.
    xp = Column(Integer, default=0)
    coins = Column(Integer, default=0)

    group = relationship("Group", back_populates="students")
    # New relationships for extended functionality
    completed_courses = relationship("CompletedCourse", back_populates="user")
    purchases = relationship("PurchasedItem", back_populates="user")
    event_signups = relationship("EventSignup", back_populates="user")


class University(Base):
    """University or institute that contributes to the leaderboard."""

    __tablename__ = "universities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    points = Column(Integer, default=0)

    specializations = relationship("Specialization", back_populates="university")


class Specialization(Base):
    __tablename__ = "specializations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    university = relationship("University", back_populates="specializations")
    courses = relationship("Course", back_populates="specialization")


class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    specialization_id = Column(Integer, ForeignKey("specializations.id"), nullable=False)
    specialization = relationship("Specialization", back_populates="courses")
    groups = relationship("Group", back_populates="course")


class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    course = relationship("Course", back_populates="groups")
    students = relationship("User", back_populates="group")
    schedule_items = relationship("ScheduleItem", back_populates="group")


class ScheduleItem(Base):
    """Single item in the student's schedule."""

    __tablename__ = "schedule"

    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    description = Column(String, nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)

    # Optional auditorium or classroom where the lesson takes place.
    auditorium = Column(String, nullable=True)

    group = relationship("Group", back_populates="schedule_items")



class Event(Base):
    """Extracurricular event in the university.

    Events differ from schedule items by not requiring a sign‑up; they are
    informational and open to all users. When a user creates a custom event
    through the UI it is stored here with a reference to the creator. The
    events table also stores optional materials and duration.
    """

    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_time = Column(DateTime(timezone=True), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)

    # Duration of the event in hours. Defaults to two hours.
    duration_hours = Column(Integer, nullable=False, default=2)

    # Optional link or description of materials associated with the event.
    materials = Column(String, nullable=True)

    # Optional auditorium or location of the event.
    auditorium = Column(String, nullable=True)

    # Note: We previously stored the creator ID here. To simplify the
    # schema and avoid migrations, this column has been removed. Events
    # created by users will not reference their creator in this version.


class EventSignup(Base):
    """Association table linking users to events they have signed up for.

    Unlike schedule sign‑ups, event sign‑ups always reference a user. The
    event itself is referenced via a foreign key on the events table. Each
    row represents one user attending one event.
    """

    __tablename__ = "event_signups"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)

    user = relationship("User", back_populates="event_signups")
    event = relationship("Event")


class CompletedCourse(Base):
    """Record of a completed course for a user.

    Each entry corresponds to a single course identifier that has been
    completed by a user. Course identifiers are arbitrary strings defined
    on the frontend, allowing the graph of courses to be versioned.
    """

    __tablename__ = "completed_courses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(String, nullable=False)

    user = relationship("User", back_populates="completed_courses")


class PurchasedItem(Base):
    """Item purchased in the store by a user.

    Items themselves are defined on the frontend; this table records each
    transaction so that users cannot repurchase an item unless allowed.
    """

    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    item_id = Column(String, nullable=False)

    user = relationship("User", back_populates="purchases")


from sqlalchemy.sql import func

class EventReview(Base):
    __tablename__ = "event_reviews"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False) # e.g., 1-5
    comment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    event = relationship("Event")
    user = relationship("User")

class CourseReview(Base):
    __tablename__ = "course_reviews"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(String, nullable=False) # Assuming course_id is a string as in CompletedCourse
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False) # e.g., 1-5
    comment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")