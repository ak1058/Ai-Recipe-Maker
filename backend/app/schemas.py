from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    gender: Optional[str] = None  


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    gender: Optional[str]

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    user: UserOut
