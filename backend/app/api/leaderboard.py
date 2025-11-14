"""Leaderboard endpoints.

Provides endpoints to retrieve the university and student leaderboards.
Universities are ordered by points, and students by XP.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..crud import university as crud
from .. import schemas
from .deps import get_db


router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=list[schemas.LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)) -> list[schemas.LeaderboardEntry]:
    """Return the university leaderboard."""
    return crud.get_leaderboard(db)


@router.get("/students", response_model=list[schemas.StudentLeaderboardEntry])
def get_student_leaderboard(db: Session = Depends(get_db)) -> list[schemas.StudentLeaderboardEntry]:
    """Return the student leaderboard, ranked by XP."""
    return crud.get_student_leaderboard(db)