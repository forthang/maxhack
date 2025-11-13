"""University endpoints.

This module exposes endpoints to retrieve information about individual
universities. The leaderboard endpoint returns a list of all
universities, but this endpoint allows clients to fetch details for
a specific university.
"""

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from ..crud import university as crud
from .. import schemas
from .deps import get_db


router = APIRouter(prefix="/universities", tags=["universities"])


@router.get("/{university_id}", response_model=schemas.UniversityOut)
def read_university(
    university_id: int = Path(..., description="ID of the university"),
    db: Session = Depends(get_db),
) -> schemas.UniversityOut:
    """Return details of a university by ID."""
    uni = crud.get_university(db, university_id)
    if uni is None:
        raise HTTPException(status_code=404, detail="Университет не найден")
    return uni


@router.get("/{university_id}/details", response_model=schemas.UniversityDetailOut)
def read_university_details(
    university_id: int = Path(..., description="ID of the university"),
    db: Session = Depends(get_db),
) -> schemas.UniversityDetailOut:
    """Return a university and its full nested structure of students.

    This endpoint expands upon the basic university information by including
    all specializations, courses, groups, and students within the university.
    If the university does not exist, a 404 error is returned.
    """
    details = crud.get_university_details(db, university_id)
    if details is None:
        raise HTTPException(status_code=404, detail="Университет не найден")
    return details