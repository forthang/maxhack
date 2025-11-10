"""Leaderboard endpoints.

Provides an endpoint to retrieve the university leaderboard. Universities
are ordered by their points descending and a rank is computed on the fly.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=list[schemas.LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)) -> list[schemas.LeaderboardEntry]:
    """Return the university leaderboard."""
    return crud.get_leaderboard(db)