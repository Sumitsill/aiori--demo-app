from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class MetricCreate(BaseModel):
    metric_date: Optional[date] = None
    steps: int = 0
    calories_burned: float = 0.0
    active_minutes: int = 0
    resting_heart_rate: Optional[float] = None
    heart_rate_avg: Optional[float] = None
    sleep_hours: Optional[float] = None
    sleep_score: Optional[int] = None
    vo2_max_estimate: Optional[float] = None
    is_synthetic: Optional[bool] = True

class MetricRead(BaseModel):
    id: int
    user_id: str
    metric_date: date
    steps: int
    calories_burned: float
    active_minutes: int
    resting_heart_rate: Optional[float] = None
    heart_rate_avg: Optional[float] = None
    sleep_hours: Optional[float] = None
    sleep_score: Optional[int] = None
    vo2_max_estimate: Optional[float] = None
    is_synthetic: bool
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DashboardAnalytics(BaseModel):
    today: MetricRead
    weekly_steps: List[Dict[str, Any]]
    weekly_calories: List[Dict[str, Any]]
    monthly_activity: List[Dict[str, Any]]
    workout_distribution: List[Dict[str, Any]]
    summary: Dict[str, Any]

