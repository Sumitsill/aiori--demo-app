from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    role = Column(String(32), default="USER", nullable=False)  # "USER" or "ADMIN"
    is_active = Column(Boolean, default=True, nullable=False)
    aiori_user_id = Column(String(64), nullable=True)
    aiori_token = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    workouts = relationship("Workout", back_populates="user", cascade="all, delete-orphan")
    metrics = relationship("FitnessMetric", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("FitnessGoal", back_populates="user", cascade="all, delete-orphan")
    sync_records = relationship("ConsentSyncRecord", back_populates="user", cascade="all, delete-orphan")

