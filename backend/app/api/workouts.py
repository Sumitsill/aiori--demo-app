from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.security import get_current_user, verify_user_ownership
from app.db.session import get_db
from app.models.user import User
from app.models.workout import Workout
from app.schemas.workout import WorkoutCreate, WorkoutUpdate, WorkoutRead, WorkoutSummary
from app.services.workout_service import WorkoutService

router = APIRouter(prefix="/workouts", tags=["Workouts"])

@router.get("", response_model=List[WorkoutRead])
def list_workouts(
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves workout history for authenticated user."""
    query = db.query(Workout).filter(Workout.user_id == current_user.id)
    if category:
        query = query.filter(Workout.category == category)
    return query.order_by(desc(Workout.performed_at)).offset(offset).limit(limit).all()

@router.post("", response_model=WorkoutRead, status_code=status.HTTP_201_CREATED)
def create_workout(
    payload: WorkoutCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Adds a new workout, auto-calculates calories, and updates daily telemetry."""
    return WorkoutService.create_workout(
        db=db,
        user_id=current_user.id,
        title=payload.title,
        category=payload.category,
        duration_minutes=payload.duration_minutes,
        calories_burned=payload.calories_burned,
        distance_km=payload.distance_km or 0.0,
        heart_rate_avg=payload.heart_rate_avg,
        notes=payload.notes,
        performed_at=payload.performed_at,
    )

@router.get("/summary", response_model=WorkoutSummary)
def get_workout_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Calculates cumulative workout summaries and category distributions."""
    return WorkoutService.get_summary(db, current_user.id)

@router.get("/{workout_id}", response_model=WorkoutRead)
def get_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves an individual workout entry."""
    workout = db.query(Workout).filter(Workout.id == workout_id).first()
    if not workout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout not found.")
    verify_user_ownership(workout.user_id, current_user)
    return workout

@router.put("/{workout_id}", response_model=WorkoutRead)
def update_workout(
    workout_id: int,
    payload: WorkoutUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Updates workout fields."""
    workout = db.query(Workout).filter(Workout.id == workout_id).first()
    if not workout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout not found.")
    verify_user_ownership(workout.user_id, current_user)

    if payload.title is not None:
        workout.title = payload.title
    if payload.category is not None:
        workout.category = payload.category
    if payload.duration_minutes is not None:
        workout.duration_minutes = payload.duration_minutes
    if payload.calories_burned is not None:
        workout.calories_burned = payload.calories_burned
    if payload.distance_km is not None:
        workout.distance_km = payload.distance_km
    if payload.heart_rate_avg is not None:
        workout.heart_rate_avg = payload.heart_rate_avg
    if payload.notes is not None:
        workout.notes = payload.notes
    if payload.performed_at is not None:
        workout.performed_at = payload.performed_at

    db.commit()
    db.refresh(workout)
    return workout

@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(
    workout_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deletes an individual workout."""
    workout = db.query(Workout).filter(Workout.id == workout_id).first()
    if not workout:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workout not found.")
    verify_user_ownership(workout.user_id, current_user)

    db.delete(workout)
    db.commit()
    return None

