from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, crud, models
from ..api import deps

router = APIRouter()

@router.post("/events/{event_id}/reviews", response_model=schemas.ReviewOut)
def create_event_review(
    event_id: int,
    review_create: schemas.EventReviewCreate,
    db: Session = Depends(deps.get_db)
):
    event = crud.event.get_event(db, event_id=event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    user = crud.user.get_user(db, user_id=review_create.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_review = crud.review.create_event_review(db, review=review_create)
    
    # Populate user_name for the response
    review_out = schemas.ReviewOut.model_validate(db_review)
    review_out.user_name = f"{user.first_name} {user.last_name}" if user.first_name or user.last_name else user.username
    return review_out

@router.get("/events/{event_id}/reviews", response_model=List[schemas.ReviewOut])
def get_event_reviews(
    event_id: int,
    db: Session = Depends(deps.get_db)
):
    reviews = crud.review.get_event_reviews(db, event_id=event_id)
    reviews_out = []
    for review in reviews:
        user = crud.user.get_user(db, user_id=review.user_id)
        review_out = schemas.ReviewOut.model_validate(review)
        review_out.user_name = f"{user.first_name} {user.last_name}" if user and (user.first_name or user.last_name) else (user.username if user else "Unknown User")
        reviews_out.append(review_out)
    return reviews_out

@router.post("/courses/{course_id}/reviews", response_model=schemas.ReviewOut)
def create_course_review(
    course_id: str,
    review_create: schemas.CourseReviewCreate,
    db: Session = Depends(deps.get_db)
):
    # For courses, we don't have a direct Course model to check existence.
    # We can assume a course_id is valid if it's used in the frontend.
    
    user = crud.user.get_user(db, user_id=review_create.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db_review = crud.review.create_course_review(db, review=review_create)
    
    # Populate user_name for the response
    review_out = schemas.ReviewOut.model_validate(db_review)
    review_out.user_name = f"{user.first_name} {user.last_name}" if user.first_name or user.last_name else user.username
    return review_out

@router.get("/courses/{course_id}/reviews", response_model=List[schemas.ReviewOut])
def get_course_reviews(
    course_id: str,
    db: Session = Depends(deps.get_db)
):
    reviews = crud.review.get_course_reviews(db, course_id=course_id)
    reviews_out = []
    for review in reviews:
        user = crud.user.get_user(db, user_id=review.user_id)
        review_out = schemas.ReviewOut.model_validate(review)
        review_out.user_name = f"{user.first_name} {user.last_name}" if user and (user.first_name or user.last_name) else (user.username if user else "Unknown User")
        reviews_out.append(reviews_out)
    return reviews_out
