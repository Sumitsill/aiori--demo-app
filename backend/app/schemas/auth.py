from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "USER"

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserRead(BaseModel):
    id: str
    name: str
    email: str
    role: str
    is_active: bool
    aiori_user_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead

