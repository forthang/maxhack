"""Profile endpoints for retrieving and updating user information.

These endpoints expose user data such as experience points, coins,
completed courses and purchases. Additional actions include completing
courses (awarding XP and coins) and purchasing items from the store.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=schemas.ProfileOut)
def read_profile(db: Session = Depends(get_db)) -> schemas.ProfileOut:
    """Return the profile for the default user (ID=1).

    In a real application, the user ID would come from the authentication
    token. Here we always return the first user.
    """
    profile = crud.get_profile(db, user_id=1)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return profile


@router.post("/courses/{course_id}/complete", response_model=schemas.ProfileOut)
def complete_course(course_id: str, xp: int = 10, coins: int = 5, db: Session = Depends(get_db)) -> schemas.ProfileOut:
    """Mark a course as completed and award XP/coins.

    The XP and coin values default to 10 and 5 but can be overridden
    by the client. Returns the updated profile.
    """
    try:
        return crud.complete_course(db, user_id=1, course_id=course_id, xp=xp, coins=coins)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/store/purchase", response_model=schemas.ProfileOut)
def purchase_item(item_id: str, cost: int, db: Session = Depends(get_db)) -> schemas.ProfileOut:
    """Purchase an item from the store.

    Deducts coins from the user's balance and records the purchase. Returns the
    updated profile.
    """
    try:
        return crud.purchase_item(db, user_id=1, item_id=item_id, cost=cost)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))