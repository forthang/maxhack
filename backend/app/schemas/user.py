from pydantic import BaseModel
from typing import List, Optional

# Shared properties
class UserBase(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    language_code: Optional[str] = None
    photo_url: Optional[str] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    pass

# Properties to receive via API on update
class UserUpdate(UserBase):
    pass

class UserInDBBase(UserBase):
    university_id: Optional[int] = None
    group_id: Optional[int] = None
    xp: int = 0
    coins: int = 0

    class Config:
        orm_mode = True

# Additional properties to return to client
class User(UserInDBBase):
    pass

# Properties to return in the main profile endpoint
class ProfileOut(UserInDBBase):
    completed_courses: List[str] = []
    purchases: List[str] = []
    # Add other detailed fields if needed
