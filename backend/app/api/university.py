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


@router.get("/{university_id}/details", response_model=schemas.UniversityDetailOut)
def read_university_details(
    university_id: int = Path(..., description="ID of the university"),
    db: Session = Depends(get_db),
) -> schemas.UniversityDetailOut:
    """Return a university and its students sorted by XP descending.

    This endpoint expands upon the basic university information by including
    all students enrolled in the university. The list of students is sorted
    by their accumulated XP in descending order so that the most active
    students appear first. If the university does not exist, a 404 error
    is returned.
    """
    details = crud.get_university_details(db, university_id)
    if details is None:
        raise HTTPException(status_code=404, detail="Университет не найден")
    return details


@router.post("/{university_id}/add_student", status_code=201)
def add_student(
    university_id: int = Path(..., description="ID of the university"),
    user_id: int | None = None,
    db: Session = Depends(get_db),
) -> dict:
    """Add a student (by user ID) to a university.

    This endpoint assigns the specified user to the given university. The
    authenticated user ID is not used here; instead, the client must
    provide a `user_id` query parameter in the request. If the assignment
    is successful, the response contains `{"assigned": True}`. If the
    user already belongs to a university or either entity does not exist,
    `{"assigned": False}` is returned.
    """
    if user_id is None:
        raise HTTPException(status_code=400, detail="Не указан user_id")
    success = crud.add_student_to_university(db, user_id=user_id, university_id=university_id)
    return {"assigned": success}