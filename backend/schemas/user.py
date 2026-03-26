from pydantic import BaseModel, EmailStr
from typing import Optional, List
from models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.BROKER
    is_active: bool = True

class UserCreate(UserBase):
    password: str
    tenant_id: Optional[int] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    tenant_id: int

    class Config:
        from_attributes = True
