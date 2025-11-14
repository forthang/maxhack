from pydantic import BaseModel
from typing import List

class UniversityBase(BaseModel):
    name: str

class UniversityCreate(UniversityBase):
    pass

class University(UniversityBase):
    id: int

    class Config:
        orm_mode = True

class UniversityOut(University):
    pass
