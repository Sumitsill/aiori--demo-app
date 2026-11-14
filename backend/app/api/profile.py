from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.security import get_current_user, verify_user_ownership
from app.db.session import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.models.goals import FitnessGoal, ActivityHistory
from app.schemas.profile import ProfileUpdate, ProfileRead
from app.schemas.goals import GoalCreate, GoalUpdate, GoalRead, ActivityHistoryRead

router = APIRouter(prefix="/profile", tags=["User Profile & Goals"])

@router.get("", response_model=ProfileRead)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves profile of authenticated user."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("", response_model=ProfileRead)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Updates profile metrics (height, weight, goals, preferences)."""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    if payload.age is not None:
        profile.age = payload.age
    if payload.height_cm is not None:
        profile.height_cm = payload.height_cm
    if payload.weight_kg is not None:
        profile.weight_kg = payload.weight_kg
    if payload.gender is not None:
        profile.gender = payload.gender
    if payload.fitness_level is not None:
        profile.fitness_level = payload.fitness_level
    if payload.preferred_activity is not None:
        profile.preferred_activity = payload.preferred_activity
    if payload.daily_step_goal is not None:
        profile.daily_step_goal = payload.daily_step_goal
    if payload.daily_calorie_goal is not None:
        profile.daily_calorie_goal = payload.daily_calorie_goal

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/goals", response_model=List[GoalRead])
def list_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists fitness goals for authenticated user."""
    return db.query(FitnessGoal).filter(FitnessGoal.user_id == current_user.id).order_by(FitnessGoal.is_completed.asc(), FitnessGoal.created_at.desc()).all()

@router.post("/goals", response_model=GoalRead, status_code=status.HTTP_201_CREATED)
def create_goal(
    payload: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Creates a new fitness target goal."""
    goal = FitnessGoal(
        user_id=current_user.id,
        title=payload.title,
        goal_type=payload.goal_type,
        target_value=payload.target_value,
        current_value=payload.current_value or 0.0,
        unit=payload.unit,
        deadline=payload.deadline,
        is_completed=False,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.put("/goals/{goal_id}", response_model=GoalRead)
def update_goal(
    goal_id: int,
    payload: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Updates goal progress or completes a goal."""
    goal = db.query(FitnessGoal).filter(FitnessGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found.")
    verify_user_ownership(goal.user_id, current_user)

    if payload.title is not None:
        goal.title = payload.title
    if payload.target_value is not None:
        goal.target_value = payload.target_value
    if payload.current_value is not None:
        goal.current_value = payload.current_value
    if payload.is_completed is not None:
        goal.is_completed = payload.is_completed
    if payload.deadline is not None:
        goal.deadline = payload.deadline

    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deletes a fitness goal."""
    goal = db.query(FitnessGoal).filter(FitnessGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found.")
    verify_user_ownership(goal.user_id, current_user)

    db.delete(goal)
    db.commit()
    return None

@router.get("/activity", response_model=List[ActivityHistoryRead])
def list_activity_history(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns recent activity event stream for user."""
    return db.query(ActivityHistory).filter(
        ActivityHistory.user_id == current_user.id
    ).order_by(desc(ActivityHistory.timestamp)).limit(limit).all()

