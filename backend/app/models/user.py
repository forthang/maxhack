from sqlalchemy import Column, Integer, String, BigInteger, ForeignKey
from sqlalchemy.orm import relationship

from ..db.base_class import Base

class User(Base):
    id = Column(BigInteger, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=True)
    username = Column(String, nullable=True, unique=True)
    language_code = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    
    university_id = Column(Integer, ForeignKey("university.id"), nullable=True)
    university = relationship("University", back_populates="students")
    
    group_id = Column(Integer, ForeignKey("group.id"), nullable=True)
    group = relationship("Group", back_populates="students")

    xp = Column(Integer, default=0)
    coins = Column(Integer, default=0)

    completed_courses = relationship("CompletedCourse", back_populates="user")
    purchases = relationship("Purchase", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    subscriptions = relationship("EventSubscription", back_populates="user")

class CompletedCourse(Base):
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(String, index=True)
    user_id = Column(BigInteger, ForeignKey("user.id"))
    user = relationship("User", back_populates="completed_courses")

class Purchase(Base):
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(String, index=True)
    user_id = Column(BigInteger, ForeignKey("user.id"))
    user = relationship("User", back_populates="purchases")
