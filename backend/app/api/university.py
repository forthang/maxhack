from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from .deps import get_current_user, get_db

router = APIRouter(prefix="/university", tags=["university"])

@router.get("", response_model=List[schemas.UniversityOut])
def read_universities(db: Session = Depends(get_db)):
    """
    Retrieve all universities.
    """
    universities = crud.university.get_all(db)
    return universities

@router.post("/{university_id}/add_student", response_model=schemas.ProfileOut)
def add_student_to_university(
    university_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Assign the current user to a university.
    """
    try:
        updated_user = crud.university.add_student_to_university(
            db, university_id=university_id, user=current_user
        )
        return updated_user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
