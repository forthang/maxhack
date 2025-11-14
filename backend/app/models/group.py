from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from ..db.base_class import Base

class Group(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    university_id = Column(Integer, ForeignKey("university.id"))
    students = relationship("User", back_populates="group")
    schedule_items = relationship("ScheduleItem", back_populates="group")
