from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from .. import models, schemas

def create_event_review(db: Session, review: schemas.EventReviewCreate) -> models.EventReview:
    db_review = models.EventReview(
        event_id=review.event_id,
        user_id=review.user_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_event_reviews(db: Session, event_id: int) -> List[models.EventReview]:
    """
    Retrieves all reviews for a given event, eagerly loading the associated user
    to prevent N+1 query issues.
    """
    return db.query(models.EventReview).options(joinedload(models.EventReview.user)).filter(models.EventReview.event_id == event_id).all()

def create_course_review(db: Session, review: schemas.CourseReviewCreate) -> models.CourseReview:
    db_review = models.CourseReview(
        course_id=review.course_id,
        user_id=review.user_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_course_reviews(db: Session, course_id: str) -> List[models.CourseReview]:
    """
    Retrieves all reviews for a given course ID, eagerly loading the associated user
    to prevent N+1 query issues.
    """
    return db.query(models.CourseReview).options(joinedload(models.CourseReview.user)).filter(models.CourseReview.course_id == course_id).all()
