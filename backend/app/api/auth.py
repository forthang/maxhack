from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.crud import user as user_crud
from app import schemas

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=schemas.ProfileOut)
def login(
    payload: schemas.UserLoginData,
    db: Session = Depends(get_db)
):
    """
    Logs a user in by finding them in the database or creating a new entry
    based on the data from MAX Bridge's initDataUnsafe object.
    This endpoint does not perform any validation.
    """
    try:
        user_profile = user_crud.login_user(db, user_data=payload)
        return user_profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
