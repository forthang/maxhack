import hashlib
import hmac
import os
from fastapi import APIRouter, Depends, HTTPException, status, Body
from urllib.parse import parse_qsl

router = APIRouter(prefix="/auth", tags=["auth"])

BOT_TOKEN = os.environ.get("BOT_TOKEN")

@router.post("/validate")
def validate_data(init_data: str = Body(..., embed=True)):
    """
    Validates the initData string received from the MAX mini-app.
    """
    if not BOT_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Bot token is not configured on the server.",
        )

    try:
        # URL-decode and parse the query string
        parsed_data = dict(parse_qsl(init_data))
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

    # Prepare the data-check-string
    data_check_string = "\n".join(
        f"{key}={value}" for key, value in sorted(parsed_data.items())
    )

    # Create the secret key
    secret_key = hmac.new(
        "WebAppData".encode(), BOT_TOKEN.encode(), hashlib.sha256
    ).digest()

    # Calculate the hash
    calculated_hash = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()

    # Compare hashes
    if calculated_hash != received_hash:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Validation failed: Incorrect hash.",
        )

    return {"status": "ok", "message": "Validation successful."}
