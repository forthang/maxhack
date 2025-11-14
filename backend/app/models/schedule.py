from sqlalchemy import Column, Integer, String, ForeignKey, Time
from sqlalchemy.orm import relationship

from ..db.base_class import Base

class ScheduleItem(Base):
    id = Column(Integer, primary_key=True, index=True)
    day_of_week = Column(Integer, nullable=False) # 0=Monday, 6=Sunday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    subject = Column(String, nullable=False)
    teacher = Column(String, nullable=True)
    location = Column(String, nullable=True)
    
    group_id = Column(Integer, ForeignKey("group.id"))
    group = relationship("Group", back_populates="schedule_items")
