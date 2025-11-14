import json
import urllib.parse
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.crud import user as user_crud
from app import schemas

router = APIRouter(prefix="/auth", tags=["auth"])

def parse_user_from_init_data(init_data: str) -> dict | None:
    """
    Parses the user object from an initData string without validation.
    """
    try:
        parsed_data = dict(urllib.parse.parse_qsl(init_data))
        if 'user' in parsed_data:
            user_data = json.loads(parsed_data["user"])
            return user_data
    except Exception:
        return None
    return None


@router.post("/login", response_model=schemas.ProfileOut)
def login(
    payload: schemas.LoginPayload,
    db: Session = Depends(get_db)
):
    """
    Logs a user in. This endpoint does NOT perform security validation
    and will fall back to mock data if real data is unavailable.
    The main goal is to prevent the application from crashing.
    """
    user_data_dict = None

    if payload.initData:
        user_data_dict = parse_user_from_init_data(payload.initData)

    # Fallback to mock user if initData is missing, malformed, or it's a dev request
    if not user_data_dict or payload.id == -1:
        user_data_dict = {
            "id": payload.id if payload.id == -1 else -1,
            "first_name": "Mock",
            "last_name": "User",
            "username": "mockuser",
            "photo_url": "https://i.pravatar.cc/150?img=68",
            "language_code": "ru",
        }

    try:
        # Ensure the dictionary has all required fields for the schema
        final_data = {
            "id": user_data_dict.get("id"),
            "first_name": user_data_dict.get("first_name"),
            "last_name": user_data_dict.get("last_name"),
            "username": user_data_dict.get("username"),
            "photo_url": user_data_dict.get("photo_url"),
            "language_code": user_data_dict.get("language_code"),
        }
        user_login_data = schemas.UserLoginData(**final_data)
        user_profile = user_crud.login_user(db, user_data=user_login_data)
        return user_profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during login: {str(e)}")
