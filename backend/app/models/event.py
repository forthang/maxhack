from sqlalchemy import Column, Integer, String, BigInteger, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship

from ..db.base_class import Base

class Event(Base):
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    location = Column(String, nullable=True)
    
    subscribers = relationship("EventSubscription", back_populates="event")

class EventSubscription(Base):
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("user.id"))
    user = relationship("User", back_populates="subscriptions")
    
    event_id = Column(Integer, ForeignKey("event.id"))
    event = relationship("Event", back_populates="subscribers")
