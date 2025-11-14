import os
import hmac
import hashlib
import json
import urllib.parse
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.crud import user as user_crud
from app import schemas

# It's recommended to load this from environment variables
BOT_TOKEN = os.environ.get("BOT_TOKEN", "default_token_for_dev")

router = APIRouter(prefix="/auth", tags=["auth"])

def validate_init_data(init_data: str, bot_token: str) -> dict | None:
    """
    Validates the initData string from MAX Bridge.
    Returns the parsed user data if valid, otherwise None.
    """
    try:
        parsed_data = dict(urllib.parse.parse_qsl(init_data))
    except Exception:
        return None

    if "hash" not in parsed_data:
        return None

    hash_from_request = parsed_data.pop("hash")

    data_check_string = "\n".join(
        f"{key}={value}" for key, value in sorted(parsed_data.items())
    )

    secret_key = hmac.new(
        "WebAppData".encode(), bot_token.encode(), hashlib.sha256
    ).digest()
    
    calculated_hash = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()

    if calculated_hash == hash_from_request:
        try:
            user_data = json.loads(parsed_data["user"])
            return user_data
        except (KeyError, json.JSONDecodeError):
            return None
    
    return None


@router.post("/login", response_model=schemas.ProfileOut)
def login(
    payload: schemas.LoginPayload,
    db: Session = Depends(get_db)
):
    """
    Logs a user in by validating data from MAX Bridge's initData string
    or by using mock data if provided.
    """
    user_data_dict = None

    if payload.initData:
        if not BOT_TOKEN:
            raise HTTPException(status_code=500, detail="BOT_TOKEN environment variable not set.")
        
        validated_user = validate_init_data(payload.initData, BOT_TOKEN)
        if not validated_user:
            raise HTTPException(status_code=403, detail="Invalid hash or malformed initData.")
        user_data_dict = validated_user

    elif payload.id == -1:
        # This is a mock user for development
        user_data_dict = payload.model_dump(exclude_unset=True)
    
    else:
        raise HTTPException(status_code=400, detail="Invalid payload. Provide either 'initData' or mock user data.")

    if not user_data_dict or 'id' not in user_data_dict:
        raise HTTPException(status_code=400, detail="Could not extract user information from payload.")

    try:
        user_login_data = schemas.UserLoginData(**user_data_dict)
        user_profile = user_crud.login_user(db, user_data=user_login_data)
        return user_profile
    except Exception as e:
        # Catch potential validation errors from Pydantic or DB errors
        raise HTTPException(status_code=500, detail=f"An error occurred during login: {str(e)}")