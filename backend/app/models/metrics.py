from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from app.db.session import Base

class FitnessMetric(Base):
    __tablename__ = "fitness_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    metric_date = Column(Date, default=date.today, nullable=False, index=True)
    steps = Column(Integer, default=0, nullable=False)
    calories_burned = Column(Float, default=0.0, nullable=False)
    active_minutes = Column(Integer, default=0, nullable=False)
    resting_heart_rate = Column(Float, nullable=True)
    heart_rate_avg = Column(Float, nullable=True)
    sleep_hours = Column(Float, nullable=True)
    sleep_score = Column(Integer, nullable=True)
    vo2_max_estimate = Column(Float, nullable=True)
    is_synthetic = Column(Boolean, default=True, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="metrics")

