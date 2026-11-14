from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class GoalCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=128)
    goal_type: str = Field(..., description="STEPS, CALORIES, WORKOUTS_WEEKLY, WEIGHT_TARGET, DISTANCE")
    target_value: float = Field(..., gt=0)
    current_value: Optional[float] = 0.0
    unit: str = Field(..., description="steps, kcal, workouts, kg, km")
    deadline: Optional[datetime] = None

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    is_completed: Optional[bool] = None
    deadline: Optional[datetime] = None

class GoalRead(BaseModel):
    id: int
    user_id: str
    title: str
    goal_type: str
    target_value: float
    current_value: float
    unit: str
    deadline: Optional[datetime] = None
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ActivityHistoryRead(BaseModel):
    id: int
    user_id: str
    activity_type: str
    summary: str
    metric_value: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

