import hashlib
import hmac
import json
import os
from urllib.parse import parse_qsl

from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import User

router = APIRouter(prefix="/auth", tags=["auth"])

BOT_TOKEN = os.environ.get("BOT_TOKEN")

class InitDataModel(BaseModel):
    initData: str

@router.post("/validate")
def validate_and_get_user(
    payload: InitDataModel,
    db: Session = Depends(get_db)
):
    """
    Validates the initData string received from the MAX mini-app.
    If validation is successful, finds the user in the database or creates a new one.
    Returns the full user object.
    """
    if not BOT_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bot token is not configured on the server.",
        )

    try:
        parsed_data = dict(parse_qsl(payload.initData))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid initData format.",
        )

    if "hash" not in parsed_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hash is missing from initData.",
        )

    received_hash = parsed_data.pop("hash")
    data_check_string = "\n".join(
        f"{key}={value}" for key, value in sorted(parsed_data.items())
    )

    secret_key = hmac.new("WebAppData".encode(), BOT_TOKEN.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if calculated_hash != received_hash:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Validation failed: Incorrect hash.",
        )

    # --- Validation successful, now process user ---
    try:
        user_data_str = parsed_data.get("user", "{{}}")
        user_data = json.loads(user_data_str)
        user_id = user_data.get("id")

        if not user_id:
            raise HTTPException(status_code=400, detail="User ID not found in initData")

        # Upsert user
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            # Update existing user
            user.first_name = user_data.get("first_name")
            user.last_name = user_data.get("last_name")
            user.username = user_data.get("username")
            user.photo_url = user_data.get("photo_url")
        else:
            # Create new user
            user = User(
                id=user_id,
                first_name=user_data.get("first_name"),
                last_name=user_data.get("last_name"),
                username=user_data.get("username"),
                photo_url=user_data.get("photo_url"),
                language_code=user_data.get("language_code"),
                # Initially, user is not part of any group or university
                group_id=None,
                university_id=None,
                xp=0,
                coins=0
            )
            db.add(user)
        
        db.commit()
        db.refresh(user)
        
        return user

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid user data format in initData")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")