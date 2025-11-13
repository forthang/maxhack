from typing import Optional
from sqlalchemy.orm import Session, joinedload
from .. import models, schemas

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    """Retrieve a user by ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_profile(db: Session, user_id: int) -> Optional[schemas.ProfileOut]:
    """Retrieve a user's profile by ID."""
    user = db.query(models.User).options(
        joinedload(models.User.group)
        .joinedload(models.Group.course)
        .joinedload(models.Course.specialization)
        .joinedload(models.Specialization.university),
        joinedload(models.User.completed_courses),
        joinedload(models.User.purchases)
    ).filter(models.User.id == user_id).first()

    if user is None:
        return None

    # This is a workaround to ensure from_orm works as expected with nested models
    profile_data = schemas.ProfileOut.model_validate(user)
    if user.group and user.group.course and user.group.course.specialization and user.group.course.specialization.university:
        profile_data.university = schemas.UniversityOut.model_validate(user.group.course.specialization.university)

    return profile_data

def login_user(db: Session, user_data: schemas.UserLoginData) -> schemas.ProfileOut:
    """Finds a user by ID and updates their info, or creates them if they don't exist."""
    user = db.query(models.User).filter(models.User.id == user_data.id).first()
    if user:
        # Update existing user
        user.first_name = user_data.first_name
        user.last_name = user_data.last_name
        user.username = user_data.username
        user.photo_url = user_data.photo_url
    else:
        # Create new user
        user = models.User(
            id=user_data.id,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            username=user_data.username,
            photo_url=user_data.photo_url,
            language_code=user_data.language_code,
            group_id=None,
            university_id=None,
            xp=0,
            coins=0
        )
        db.add(user)
    
    db.commit()
    db.refresh(user)
    
    return get_profile(db, user.id)


def complete_course(db: Session, user_id: int, course_id: str, xp: int, coins: int) -> schemas.ProfileOut:
    """Mark a course as completed for a user, awarding XP and coins."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    existing = (
        db.query(models.CompletedCourse)
        .filter(models.CompletedCourse.user_id == user_id, models.CompletedCourse.course_id == course_id)
        .first()
    )
    if existing is None:
        completion = models.CompletedCourse(user_id=user_id, course_id=course_id)
        db.add(completion)
        user.xp += xp
        user.coins += coins
        db.commit()
    return get_profile(db, user_id)

def purchase_item(db: Session, user_id: int, item_id: str, cost: int) -> schemas.ProfileOut:
    """Record a purchase for the user if they have enough coins."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    if user.coins < cost:
        raise ValueError("Insufficient coins")
    purchase = models.PurchasedItem(user_id=user_id, item_id=item_id)
    user.coins -= cost
    db.add(purchase)
    db.commit()
    return get_profile(db, user_id)


def join_group(db: Session, user_id: int, group_id: int) -> schemas.ProfileOut:
    """Associate a user with a group and university."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise ValueError("User not found")

    group = db.query(models.Group).options(
        joinedload(models.Group.course)
        .joinedload(models.Course.specialization)
        .joinedload(models.Specialization.university)
    ).filter(models.Group.id == group_id).first()

    if not group:
        raise ValueError("Group not found")

    user.group_id = group.id
    user.university_id = group.course.specialization.university.id
    db.commit()
    
    return get_profile(db, user_id)


def update_profile(db: Session, user_id: int, payload: schemas.UserUpdate) -> Optional[schemas.ProfileOut]:
    """Update a user's editable fields."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        return None
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.commit()
    return get_profile(db, user.id)
