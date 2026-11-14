from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.session import engine, Base
from app.models.user import User
from app.models.profile import UserProfile
from app.models.workout import Workout
from app.models.metrics import FitnessMetric
from app.models.goals import FitnessGoal, ActivityHistory
from app.models.consent_sync import ConsentSyncRecord
from app.services.aiori_client import aiori_client

def init_db(db: Session) -> None:
    # 1. Create tables
    Base.metadata.create_all(bind=engine)

    # 2. Seed Default Users
    user_alex = db.query(User).filter(User.id == "user_001").first()
    if not user_alex:
        user_alex = User(
            id="user_001",
            name="Alex Morgan",
            email="alex.morgan@example.com",
            hashed_password=get_password_hash("password123"),
            role="USER",
            is_active=True,
            aiori_user_id="user_001",
            created_at=datetime.utcnow(),
        )
        db.add(user_alex)

        profile_alex = UserProfile(
            user_id="user_001",
            age=29,
            height_cm=175.0,
            weight_kg=68.5,
            gender="Female",
            fitness_level="Advanced",
            preferred_activity="Running",
            daily_step_goal=10000,
            daily_calorie_goal=550,
        )
        db.add(profile_alex)

        # Seed sample workouts
        now = datetime.utcnow()
        sample_workouts = [
            Workout(
                user_id="user_001",
                title="Morning Interval Run",
                category="Running",
                duration_minutes=45,
                calories_burned=490.5,
                distance_km=7.2,
                heart_rate_avg=148.0,
                notes="Felt strong throughout interval segments. Pushed hard on hills.",
                performed_at=now - timedelta(hours=3),
                created_at=now - timedelta(hours=3),
            ),
            Workout(
                user_id="user_001",
                title="Full Body Kettlebell Circuit",
                category="Strength",
                duration_minutes=40,
                calories_burned=320.0,
                distance_km=0.0,
                heart_rate_avg=132.0,
                notes="Sets of swings, clean & presses, and goblet squats.",
                performed_at=now - timedelta(days=1, hours=2),
                created_at=now - timedelta(days=1, hours=2),
            ),
            Workout(
                user_id="user_001",
                title="Sunset Road Cycling",
                category="Cycling",
                duration_minutes=60,
                calories_burned=510.0,
                distance_km=21.4,
                heart_rate_avg=138.0,
                notes="Paced steady cadence along river trail.",
                performed_at=now - timedelta(days=2, hours=4),
                created_at=now - timedelta(days=2, hours=4),
            ),
            Workout(
                user_id="user_001",
                title="Vinyasa Recovery Flow",
                category="Yoga",
                duration_minutes=35,
                calories_burned=145.0,
                distance_km=0.0,
                heart_rate_avg=92.0,
                notes="Hamstring stretches and spinal mobility.",
                performed_at=now - timedelta(days=3, hours=5),
                created_at=now - timedelta(days=3, hours=5),
            ),
        ]
        db.add_all(sample_workouts)

        # Seed 7-day metrics
        today = date.today()
        metric_samples = [
            (today, 9482, 612.0, 52, 68.0, 58.0, 7.8, 88),
            (today - timedelta(days=1), 10450, 680.0, 58, 71.0, 59.0, 7.5, 84),
            (today - timedelta(days=2), 12100, 740.0, 65, 74.0, 60.0, 8.1, 92),
            (today - timedelta(days=3), 7850, 430.0, 35, 66.0, 57.0, 6.9, 79),
            (today - timedelta(days=4), 11200, 690.0, 60, 73.0, 59.0, 7.6, 86),
            (today - timedelta(days=5), 8900, 510.0, 42, 69.0, 58.0, 7.2, 81),
            (today - timedelta(days=6), 10800, 640.0, 50, 70.0, 58.0, 7.9, 89),
        ]
        for m_date, steps, cals, active_m, hr_avg, hr_rest, sleep, score in metric_samples:
            m = FitnessMetric(
                user_id="user_001",
                metric_date=m_date,
                steps=steps,
                calories_burned=cals,
                active_minutes=active_m,
                resting_heart_rate=hr_rest,
                heart_rate_avg=hr_avg,
                sleep_hours=sleep,
                sleep_score=score,
                vo2_max_estimate=51.4,
                is_synthetic=True,
                recorded_at=datetime.utcnow(),
            )
            db.add(m)

        # Seed goals
        goals = [
            FitnessGoal(
                user_id="user_001",
                title="Daily 10k Steps",
                goal_type="STEPS",
                target_value=10000.0,
                current_value=9482.0,
                unit="steps",
                deadline=now + timedelta(days=30),
                is_completed=False,
            ),
            FitnessGoal(
                user_id="user_001",
                title="Burn 3,500 Active kcal Weekly",
                goal_type="CALORIES",
                target_value=3500.0,
                current_value=2750.0,
                unit="kcal",
                deadline=now + timedelta(days=7),
                is_completed=False,
            ),
            FitnessGoal(
                user_id="user_001",
                title="Complete 4 Workouts per Week",
                goal_type="WORKOUTS_WEEKLY",
                target_value=4.0,
                current_value=3.0,
                unit="workouts",
                deadline=now + timedelta(days=7),
                is_completed=False,
            ),
        ]
        db.add_all(goals)

        # Activity history
        activity = ActivityHistory(
            user_id="user_001",
            activity_type="Running",
            summary="Morning Interval Run completed (490.5 kcal)",
            metric_value="45 min • 7.2 km",
            timestamp=now - timedelta(hours=3),
        )
        db.add(activity)

    # Seed Admin User
    admin = db.query(User).filter(User.id == "admin_fitpulse").first()
    if not admin:
        admin = User(
            id="admin_fitpulse",
            name="FitPulse Administrator",
            email="admin@fitpulse.example.com",
            hashed_password=get_password_hash("adminpassword123"),
            role="ADMIN",
            is_active=True,
            created_at=datetime.utcnow(),
        )
        db.add(admin)

    db.commit()

    # Pre-sync user_001 with AIORI-3 if online
    try:
        aiori_client.ensure_user_synced(
            user_id="user_001",
            name="Alex Morgan",
            email="alex.morgan@example.com",
            password="password123",
            db=db,
        )
    except Exception:
        pass

