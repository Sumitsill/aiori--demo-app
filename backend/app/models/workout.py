from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.db.session import Base

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(128), nullable=False)
    category = Column(String(64), nullable=False)  # Running, Cycling, Strength, HIIT, Yoga, Swimming, Walking
    duration_minutes = Column(Integer, nullable=False)
    calories_burned = Column(Float, nullable=False)
    distance_km = Column(Float, default=0.0)
    heart_rate_avg = Column(Float, nullable=True)  # Clearly noted as simulated or user-supplied
    notes = Column(Text, nullable=True)
    performed_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="workouts")

