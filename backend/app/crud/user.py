from typing import Optional

from sqlalchemy.orm import Session

from .base import CRUDBase
from ..models.user import User, CompletedCourse, Purchase
from ..schemas.user import UserCreate, UserUpdate


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_id(self, db: Session, *, id: int) -> Optional[User]:
        return db.query(User).filter(User.id == id).first()

    def get_or_create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_obj = self.get_by_id(db, id=obj_in.id)
        if db_obj:
            # Update user data if they already exist
            return self.update(db, db_obj=db_obj, obj_in=obj_in)
        return self.create(db, obj_in=obj_in)

    def complete_course(self, db: Session, *, user_id: int, course_id: str, xp: int, coins: int) -> User:
        user = self.get_by_id(db, id=user_id)
        if not user:
            raise ValueError("User not found")

        # Check if course is already completed
        for course in user.completed_courses:
            if course.course_id == course_id:
                return user # Already completed, do nothing

        # Add XP and coins
        user.xp += xp
        user.coins += coins

        # Mark course as completed
        completed_course = CompletedCourse(course_id=course_id, user_id=user.id)
        db.add(completed_course)
        
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def purchase_item(self, db: Session, *, user_id: int, item_id: str, cost: int) -> User:
        user = self.get_by_id(db, id=user_id)
        if not user:
            raise ValueError("User not found")

        if user.coins < cost:
            raise ValueError("Not enough coins")

        # Deduct cost
        user.coins -= cost

        # Record purchase
        purchase = Purchase(item_id=item_id, user_id=user.id)
        db.add(purchase)

        db.add(user)
        db.commit()
        db.refresh(user)
        return user

user = CRUDUser(User)
