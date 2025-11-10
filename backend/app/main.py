"""Main FastAPI application entrypoint.

This module configures the FastAPI app, binds route handlers, and wires
database access via dependency injection. Endpoints are designed to be
lightweight wrappers around functions in `crud.py`. The application
autonomously initializes the database on startup and seeds it with sample
data for a quick demonstration.

Security note: authentication is simplified. Users are created via
invitation links outside of this backend. In a real system you would
integrate proper authentication and enforce access control. Here we only
require a `user_id` query parameter where necessary.
"""

from fastapi import Depends, FastAPI, HTTPException, Path, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import SessionLocal, init_db


def get_db():
    """Provide a database session for request handlers."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Initialize the FastAPI app
app = FastAPI(
    title="University Support API",
    description="Backend API for university mobile web application.",
    version="0.1.0",
)

origins = [
    "http://localhost",
    "http://localhost:5173",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    """Initialize the database when the application starts."""
    init_db()


@app.get("/", tags=["root"])
def read_root() -> dict[str, str]:
    """Root endpoint showing service status."""
    return {"status": "ok"}


@app.get("/schedule", response_model=list[schemas.ScheduleItemOut], tags=["schedule"])
def get_schedule(
    user_id: int | None = Query(None, description="ID of the current user"),
    db: Session = Depends(get_db),
) -> list[schemas.ScheduleItemOut]:
    """Return the schedule for the user (optional).

    The response includes a flag per schedule item indicating whether the
    requesting user has already signed up. If no `user_id` is provided the
    flag defaults to `false` for all items.
    """
    return crud.get_schedule(db, user_id)


@app.post(
    "/schedule/{schedule_id}/signup",
    response_model=dict,
    tags=["schedule"],
    status_code=status.HTTP_200_OK,
)
def signup_schedule_item(
    schedule_id: int = Path(..., description="ID of the schedule item"),
    user_id: int = Query(..., description="ID of the user performing the sign‑up"),
    db: Session = Depends(get_db),
) -> dict[str, bool]:
    """Sign the current user up for a schedule item.

    Returns `{'created': True}` if the sign‑up was successful or
    `{'created': False}` if the user was already registered.
    """
    # Validate existence of user and schedule
    schedule = db.query(models.ScheduleItem).filter(models.ScheduleItem.id == schedule_id).first()
    if schedule is None:
        raise HTTPException(status_code=404, detail="Расписание не найдено")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    created = crud.signup_for_schedule(db, user_id, schedule_id)
    return {"created": created}


@app.get("/events", response_model=list[schemas.EventOut], tags=["events"])
def list_events(db: Session = Depends(get_db)) -> list[schemas.EventOut]:
    """List all extracurricular events."""
    return crud.get_events(db)


@app.get("/leaderboard", response_model=list[schemas.LeaderboardEntry], tags=["leaderboard"])
def leaderboard(db: Session = Depends(get_db)) -> list[schemas.LeaderboardEntry]:
    """Return the university leaderboard sorted by points."""
    return crud.get_leaderboard(db)


@app.get(
    "/profile/{user_id}",
    response_model=schemas.ProfileOut,
    tags=["profile"],
)
def read_profile(
    user_id: int = Path(..., description="ID of the user"),
    db: Session = Depends(get_db),
) -> schemas.ProfileOut:
    """Retrieve a user's profile by ID."""
    profile = crud.get_profile(db, user_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return profile


@app.put(
    "/profile/{user_id}",
    response_model=schemas.ProfileOut,
    tags=["profile"],
)
def update_profile(
    *,
    user_id: int = Path(..., description="ID of the user"),
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
) -> schemas.ProfileOut:
    """Update editable fields of a user's profile."""
    profile = crud.update_profile(db, user_id, payload)
    if profile is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return profile