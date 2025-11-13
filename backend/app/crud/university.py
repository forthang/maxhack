from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from .. import models, schemas

def get_leaderboard(db: Session) -> List[schemas.LeaderboardEntry]:
    """Return universities ordered by points descending with their rank."""
    universities = (
        db.query(models.University)
        .order_by(models.University.points.desc())
        .all()
    )
    return [
        schemas.LeaderboardEntry(
            university=schemas.UniversityOut.from_orm(uni),
            rank=idx,
        )
        for idx, uni in enumerate(universities, start=1)
    ]

def get_student_leaderboard(db: Session) -> list[schemas.StudentLeaderboardEntry]:
    """Return students ordered by XP descending with their rank."""
    students = (
        db.query(models.User)
        .filter(models.User.role == models.UserRole.student)
        .order_by(models.User.xp.desc())
        .options(joinedload(models.User.group))
        .all()
    )
    return [
        schemas.StudentLeaderboardEntry(
            user=schemas.UserOut.from_orm(student),
            rank=idx,
        )
        for idx, student in enumerate(students, start=1)
    ]

def get_university(db: Session, university_id: int) -> Optional[schemas.UniversityOut]:
    """Return a single university by its ID."""
    uni = db.query(models.University).filter(models.University.id == university_id).first()
    if uni is None:
        return None
    return schemas.UniversityOut.from_orm(uni)

def get_university_details(db: Session, university_id: int) -> Optional[schemas.UniversityDetailOut]:
    """Return a university along with its nested structure of students."""
    uni = db.query(models.University).options(
        joinedload(models.University.specializations)
        .joinedload(models.Specialization.courses)
        .joinedload(models.Course.groups)
        .joinedload(models.Group.students)
    ).filter(models.University.id == university_id).first()

    if uni is None:
        return None

    return schemas.UniversityDetailOut.from_orm(uni)
