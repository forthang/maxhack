import json
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from .. import crud
from ..db.session import SessionLocal
from ..schemas.user import UserCreate

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    x_telegram_user: str = Header(...), db: Session = Depends(get_db)
):
    """
    Dependency to get the current user from the X-Telegram-User header.
    Parses the user data, and gets or creates the user in the database.
    
    In a real production environment, you should validate the hash from
    Telegram's initData to ensure the request is authentic.
    """
    if not x_telegram_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-Telegram-User header",
        )
    
    try:
        user_data = json.loads(x_telegram_user)
        user_id = user_data.get("id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user data in header: 'id' is missing",
            )

        user_in = UserCreate(
            id=user_id,
            first_name=user_data.get("first_name", ""),
            last_name=user_data.get("last_name"),
            username=user_data.get("username"),
            language_code=user_data.get("language_code"),
            photo_url=user_data.get("photo_url"),
        )
        
        # Get or create user in the database
        user = crud.user.get_or_create(db, obj_in=user_in)
        return user

    except (json.JSONDecodeError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON in X-Telegram-User header",
        )
