from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ProfileUpdate(BaseModel):
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    gender: Optional[str] = None
    fitness_level: Optional[str] = None
    preferred_activity: Optional[str] = None
    daily_step_goal: Optional[int] = None
    daily_calorie_goal: Optional[int] = None

class ProfileRead(BaseModel):
    id: int
    user_id: str
    age: Optional[int] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    gender: Optional[str] = None
    fitness_level: str
    preferred_activity: str
    daily_step_goal: int
    daily_calorie_goal: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

