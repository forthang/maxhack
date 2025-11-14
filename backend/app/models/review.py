from sqlalchemy import Column, Integer, String, BigInteger, ForeignKey, Text
from sqlalchemy.orm import relationship

from ..db.base_class import Base

class Review(Base):
    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    
    user_id = Column(BigInteger, ForeignKey("user.id"))
    user = relationship("User", back_populates="reviews")
    
    # This could be a review for a university, a course, an event, etc.
    # Using a simple string for the target type and an integer for the ID.
    target_type = Column(String, nullable=False)
    target_id = Column(Integer, nullable=False)
