from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from ..db.base_class import Base

class University(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    students = relationship("User", back_populates="university")
