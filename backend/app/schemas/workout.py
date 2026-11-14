from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class WorkoutCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=128)
    category: str = Field(..., description="Running, Cycling, Strength, HIIT, Yoga, Swimming, Walking")
    duration_minutes: int = Field(..., gt=0)
    calories_burned: Optional[float] = Field(None, description="Auto-estimated if omitted based on duration & MET")
    distance_km: Optional[float] = 0.0
    heart_rate_avg: Optional[float] = None
    notes: Optional[str] = None
    performed_at: Optional[datetime] = None

class WorkoutUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    duration_minutes: Optional[int] = None
    calories_burned: Optional[float] = None
    distance_km: Optional[float] = None
    heart_rate_avg: Optional[float] = None
    notes: Optional[str] = None
    performed_at: Optional[datetime] = None

class WorkoutRead(BaseModel):
    id: int
    user_id: str
    title: str
    category: str
    duration_minutes: int
    calories_burned: float
    distance_km: float
    heart_rate_avg: Optional[float] = None
    notes: Optional[str] = None
    performed_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WorkoutSummary(BaseModel):
    total_workouts: int
    total_duration_minutes: int
    total_calories_burned: float
    total_distance_km: float
    category_breakdown: List[dict]

