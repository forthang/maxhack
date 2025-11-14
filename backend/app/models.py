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
from sqlalchemy.sql import func

from .db.session import Base


class User(Base):
    """System user participating in the application.

    The user is identified by their MAX platform ID. The record stores
    profile information provided by MAX and tracks their progress and
    affiliation within the university structure.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=False) # Use MAX ID
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    username = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    language_code = Column(String, nullable=True)

    # Affiliation - nullable because user is an applicant first
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True)

    # Gamification metrics
    xp = Column(Integer, default=0)
    coins = Column(Integer, default=0)

    group = relationship("Group", back_populates="students")
    university = relationship("University", back_populates="users")
    completed_courses = relationship("CompletedCourse", back_populates="user")
    purchases = relationship("PurchasedItem", back_populates="user")
    event_signups = relationship("EventSignup", back_populates="user")
    event_reviews = relationship("EventReview", back_populates="user")
    course_reviews = relationship("CourseReview", back_populates="user")


class University(Base):
    """University or institute that contributes to the leaderboard."""

    __tablename__ = "universities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    points = Column(Integer, default=0)

    specializations = relationship("Specialization", back_populates="university")
    users = relationship("User", back_populates="university")


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

    signups = relationship("EventSignup", back_populates="event")
    reviews = relationship("EventReview", back_populates="event")


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
    event = relationship("Event", back_populates="signups")


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


class EventReview(Base):
    __tablename__ = "event_reviews"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False) # e.g., 1-5
    comment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    event = relationship("Event", back_populates="reviews")
    user = relationship("User", back_populates="event_reviews")

class CourseReview(Base):
    __tablename__ = "course_reviews"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(String, nullable=False) # Assuming course_id is a string as in CompletedCourse
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False) # e.g., 1-5
    comment = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="course_reviews")
