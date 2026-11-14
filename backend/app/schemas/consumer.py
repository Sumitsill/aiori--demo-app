from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class ConsumerAccessRequest(BaseModel):
    purpose: str = Field(default="fitness_analytics", description="Purpose to simulate requesting (fitness_analytics, marketing, etc.)")
    target_user_id: Optional[str] = Field(None, description="Target user ID (defaults to current user)")
    override_api_key: Optional[str] = Field(None, description="Custom consumer key to test invalid key scenario")

class ConsumerAccessResponse(BaseModel):
    allowed: bool
    status_code: int
    status: str
    reason_code: str
    message: str
    consumer_id: Optional[str] = None
    user_id: str
    purpose: str
    timestamp: datetime
    data: Optional[Dict[str, Any]] = None
    problem_details: Optional[Dict[str, Any]] = None
