from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from app.models.workout import Workout
from app.models.metrics import FitnessMetric
from app.models.profile import UserProfile
from app.models.goals import ActivityHistory, FitnessGoal

MET_VALUES = {
    "Running": 9.8,
    "Cycling": 7.5,
    "Swimming": 8.0,
    "Strength": 5.0,
    "HIIT": 8.5,
    "Yoga": 3.0,
    "Walking": 3.5,
}

class WorkoutService:
    @staticmethod
    def estimate_calories(category: str, duration_minutes: int, weight_kg: Optional[float] = None) -> float:
        met = MET_VALUES.get(category, 6.0)
        weight = weight_kg if (weight_kg and weight_kg > 30) else 70.0
        # Formula: Calories = MET * weight_kg * (duration_minutes / 60)
        calories = met * weight * (duration_minutes / 60.0)
        return round(calories, 1)

    @staticmethod
    def create_workout(
        db: Session,
        user_id: str,
        title: str,
        category: str,
        duration_minutes: int,
        calories_burned: Optional[float] = None,
        distance_km: float = 0.0,
        heart_rate_avg: Optional[float] = None,
        notes: Optional[str] = None,
        performed_at: Optional[datetime] = None,
    ) -> Workout:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        weight = profile.weight_kg if profile else 70.0

        if calories_burned is None or calories_burned <= 0:
            calories_burned = WorkoutService.estimate_calories(category, duration_minutes, weight)

        workout_time = performed_at or datetime.utcnow()

        workout = Workout(
            user_id=user_id,
            title=title,
            category=category,
            duration_minutes=duration_minutes,
            calories_burned=calories_burned,
            distance_km=distance_km or 0.0,
            heart_rate_avg=heart_rate_avg,
            notes=notes,
            performed_at=workout_time,
            created_at=datetime.utcnow(),
        )
        db.add(workout)
        db.commit()
        db.refresh(workout)

        # Update daily metrics for that date
        workout_date = workout_time.date()
        metric = db.query(FitnessMetric).filter(
            FitnessMetric.user_id == user_id,
            FitnessMetric.metric_date == workout_date,
        ).first()

        if metric:
            metric.calories_burned += calories_burned
            metric.active_minutes += duration_minutes
            if distance_km and distance_km > 0:
                metric.steps += int(distance_km * 1300)
        else:
            steps_added = int(distance_km * 1300) if (distance_km and distance_km > 0) else duration_minutes * 80
            metric = FitnessMetric(
                user_id=user_id,
                metric_date=workout_date,
                steps=steps_added,
                calories_burned=calories_burned,
                active_minutes=duration_minutes,
                resting_heart_rate=65.0,
                heart_rate_avg=heart_rate_avg or 135.0,
                is_synthetic=True,
                recorded_at=datetime.utcnow(),
            )
            db.add(metric)

        # Log to Activity History
        history = ActivityHistory(
            user_id=user_id,
            activity_type=category,
            summary=f"Completed {duration_minutes}m of {title} ({calories_burned} kcal)",
            metric_value=f"{duration_minutes} min • {calories_burned} kcal",
            timestamp=workout_time,
        )
        db.add(history)

        # Update goal progress if applicable
        goals = db.query(FitnessGoal).filter(
            FitnessGoal.user_id == user_id,
            FitnessGoal.is_completed == False,
        ).all()
        for g in goals:
            if g.goal_type == "CALORIES":
                g.current_value += calories_burned
                if g.current_value >= g.target_value:
                    g.is_completed = True
            elif g.goal_type == "WORKOUTS_WEEKLY":
                g.current_value += 1
                if g.current_value >= g.target_value:
                    g.is_completed = True
            elif g.goal_type == "DISTANCE" and distance_km:
                g.current_value += distance_km
                if g.current_value >= g.target_value:
                    g.is_completed = True

        db.commit()
        return workout

    @staticmethod
    def get_summary(db: Session, user_id: str) -> Dict[str, Any]:
        workouts = db.query(Workout).filter(Workout.user_id == user_id).all()
        total_workouts = len(workouts)
        total_duration = sum(w.duration_minutes for w in workouts)
        total_calories = sum(w.calories_burned for w in workouts)
        total_distance = sum(w.distance_km for w in workouts)

        categories: Dict[str, int] = {}
        for w in workouts:
            categories[w.category] = categories.get(w.category, 0) + 1

        category_breakdown = [{"category": k, "count": v} for k, v in categories.items()]

        return {
            "total_workouts": total_workouts,
            "total_duration_minutes": total_duration,
            "total_calories_burned": round(total_calories, 1),
            "total_distance_km": round(total_distance, 2),
            "category_breakdown": category_breakdown,
        }

