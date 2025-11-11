"""University endpoints.

This module exposes endpoints to retrieve information about individual
universities. The leaderboard endpoint returns a list of all
universities, but this endpoint allows clients to fetch details for
a specific university.
"""

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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