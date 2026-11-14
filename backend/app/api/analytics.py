from datetime import datetime, date, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.metrics import FitnessMetric
from app.models.workout import Workout
from app.schemas.metrics import MetricRead, MetricCreate

router = APIRouter(prefix="/analytics", tags=["Fitness Analytics"])

@router.get("/dashboard")
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns unified fitness telemetry for the main dashboard:
    - Today's steps, calories, heart rate (simulated/sensor), active duration
    - 7-day step trends
    - 7-day calorie trends
    - Monthly workout distribution
    - Progress toward user daily goals
    """
    today = date.today()
    metric_today = db.query(FitnessMetric).filter(
        FitnessMetric.user_id == current_user.id,
        FitnessMetric.metric_date == today,
    ).first()

    if not metric_today:
        metric_today = FitnessMetric(
            user_id=current_user.id,
            metric_date=today,
            steps=8420,
            calories_burned=420.5,
            active_minutes=45,
            resting_heart_rate=64.0,
            heart_rate_avg=72.4,
            sleep_hours=7.8,
            sleep_score=85,
            vo2_max_estimate=48.2,
            is_synthetic=True,
            recorded_at=datetime.utcnow(),
        )
        db.add(metric_today)
        db.commit()
        db.refresh(metric_today)

    # 7-day step history
    seven_days_ago = today - timedelta(days=6)
    history_records = db.query(FitnessMetric).filter(
        FitnessMetric.user_id == current_user.id,
        FitnessMetric.metric_date >= seven_days_ago,
    ).order_by(FitnessMetric.metric_date.asc()).all()

    record_map = {r.metric_date: r for r in history_records}
    weekly_steps = []
    weekly_calories = []

    for i in range(7):
        d = seven_days_ago + timedelta(days=i)
        day_label = d.strftime("%a")
        rec = record_map.get(d)
        if rec:
            steps = rec.steps
            cals = rec.calories_burned
        else:
            # Baseline synthetic values
            base_steps = 7000 + ((i * 450) % 3500)
            base_cals = 350 + ((i * 65) % 250)
            steps = base_steps
            cals = base_cals

        weekly_steps.append({"date": d.isoformat(), "day": day_label, "steps": steps})
        weekly_calories.append({"date": d.isoformat(), "day": day_label, "calories": cals})

    # Workout Category breakdown
    workouts = db.query(Workout).filter(Workout.user_id == current_user.id).all()
    categories: Dict[str, int] = {}
    for w in workouts:
        categories[w.category] = categories.get(w.category, 0) + 1

    workout_distribution = [{"name": k, "value": v} for k, v in categories.items()]
    if not workout_distribution:
        workout_distribution = [
            {"name": "Running", "value": 4},
            {"name": "Cycling", "value": 3},
            {"name": "Strength", "value": 2},
            {"name": "HIIT", "value": 1},
        ]

    profile = current_user.profile
    step_goal = profile.daily_step_goal if profile else 10000
    calorie_goal = profile.daily_calorie_goal if profile else 500

    step_progress = min(100.0, round((metric_today.steps / step_goal) * 100, 1))
    calorie_progress = min(100.0, round((metric_today.calories_burned / calorie_goal) * 100, 1))

    return {
        "today": {
            "steps": metric_today.steps,
            "calories_burned": metric_today.calories_burned,
            "active_minutes": metric_today.active_minutes,
            "heart_rate_avg": metric_today.heart_rate_avg,
            "resting_heart_rate": metric_today.resting_heart_rate,
            "sleep_hours": metric_today.sleep_hours,
            "sleep_score": metric_today.sleep_score,
            "vo2_max": metric_today.vo2_max_estimate,
            "is_synthetic": metric_today.is_synthetic,
            "sensor_source_label": "Simulated Biometric Sensor (Demo)",
        },
        "goals": {
            "step_goal": step_goal,
            "calorie_goal": calorie_goal,
            "step_progress_pct": step_progress,
            "calorie_progress_pct": calorie_progress,
        },
        "weekly_steps": weekly_steps,
        "weekly_calories": weekly_calories,
        "workout_distribution": workout_distribution,
        "total_workouts": len(workouts),
    }

@router.post("/metrics", response_model=MetricRead)
def log_metric(
    payload: MetricCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually records or overrides telemetry for a given date."""
    target_date = payload.metric_date or date.today()
    metric = db.query(FitnessMetric).filter(
        FitnessMetric.user_id == current_user.id,
        FitnessMetric.metric_date == target_date,
    ).first()

    if not metric:
        metric = FitnessMetric(
            user_id=current_user.id,
            metric_date=target_date,
            steps=payload.steps,
            calories_burned=payload.calories_burned,
            active_minutes=payload.active_minutes,
            resting_heart_rate=payload.resting_heart_rate,
            heart_rate_avg=payload.heart_rate_avg,
            sleep_hours=payload.sleep_hours,
            sleep_score=payload.sleep_score,
            vo2_max_estimate=payload.vo2_max_estimate,
            is_synthetic=payload.is_synthetic if payload.is_synthetic is not None else True,
            recorded_at=datetime.utcnow(),
        )
        db.add(metric)
    else:
        metric.steps = payload.steps
        metric.calories_burned = payload.calories_burned
        metric.active_minutes = payload.active_minutes
        if payload.resting_heart_rate is not None:
            metric.resting_heart_rate = payload.resting_heart_rate
        if payload.heart_rate_avg is not None:
            metric.heart_rate_avg = payload.heart_rate_avg
        if payload.sleep_hours is not None:
            metric.sleep_hours = payload.sleep_hours
        if payload.sleep_score is not None:
            metric.sleep_score = payload.sleep_score

    db.commit()
    db.refresh(metric)
    return metric

