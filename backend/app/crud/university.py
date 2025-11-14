from typing import List
from sqlalchemy.orm import Session

from .base import CRUDBase
from ..models.university import University
from ..models.user import User
from ..schemas.university import UniversityCreate


class CRUDUniversity(CRUDBase[University, UniversityCreate, UniversityCreate]):
    def get_all(self, db: Session) -> List[University]:
        return db.query(University).all()

    def add_student_to_university(self, db: Session, *, university_id: int, user: User) -> User:
        university = self.get(db, id=university_id)
        if not university:
            raise ValueError("University not found")
        
        user.university_id = university.id
        # The group assignment logic will be handled separately.
        # For now, we just assign the university.
        # user.group_id = ...

        db.add(user)
        db.commit()
        db.refresh(user)
        return user

university = CRUDUniversity(University)
