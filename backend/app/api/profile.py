"""Profile endpoints for retrieving and updating user information.

These endpoints expose user data such as experience points, coins,
completed courses and purchases. Additional actions include completing
courses (awarding XP and coins) and purchasing items from the store.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..crud import user as crud
from .. import schemas
from .deps import get_db


router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/{user_id}", response_model=schemas.ProfileOut)
def read_profile(user_id: int, db: Session = Depends(get_db)) -> schemas.ProfileOut:
    """Return the profile for the given user ID.

    In a real application, the user ID would come from the authentication
    token. Here we allow fetching any user for demonstration.
    """
    profile = crud.get_profile(db, user_id=user_id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return profile


@router.post("/courses/{course_id}/complete", response_model=schemas.ProfileOut)
def complete_course(course_id: str, payload: schemas.CompleteCoursePayload, db: Session = Depends(get_db)) -> schemas.ProfileOut:
    """Mark a course as completed and award XP/coins."""
    try:
        return crud.complete_course(db, user_id=payload.user_id, course_id=course_id, xp=payload.xp, coins=payload.coins)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/store/purchase", response_model=schemas.ProfileOut)
def purchase_item(payload: schemas.PurchasePayload, db: Session = Depends(get_db)) -> schemas.ProfileOut:
    """Purchase an item from the store.

    Deducts coins from the user's balance and records the purchase. Returns the
    updated profile.
    """
    try:
        return crud.purchase_item(db, user_id=payload.user_id, item_id=payload.item_id, cost=payload.cost)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))