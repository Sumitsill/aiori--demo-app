import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
    get_current_user,
)
from app.db.session import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.models.integration import ApplicationAuditLog
from app.schemas.auth import TokenResponse, UserRegister, UserLogin, UserRead
from app.services.aiori_client import aiori_client

router = APIRouter(prefix="/auth", tags=["FitPulse Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Registers a new user on FitPulse and provisions an identity on AIORI-3."""
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{payload.email}' already exists.",
        )

    # Generate or format ID
    count = db.query(User).count()
    user_id = f"user_{count + 1:03d}"
    if db.query(User).filter(User.id == user_id).first():
        user_id = f"user_{uuid.uuid4().hex[:6]}"

    hashed_pwd = get_password_hash(payload.password)
    user = User(
        id=user_id,
        name=payload.name,
        email=payload.email,
        hashed_password=hashed_pwd,
        role=payload.role or "USER",
        is_active=True,
    )
    db.add(user)

    # Create associated default UserProfile
    profile = UserProfile(
        user_id=user.id,
        fitness_level="Intermediate",
        preferred_activity="Running",
        daily_step_goal=10000,
        daily_calorie_goal=500,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)

    # Automatically provision/sync with AIORI-3
    aiori_token = aiori_client.ensure_user_synced(
        user_id=user.id,
        name=user.name,
        email=user.email,
        password="password123",  # Known demo password
        db=db,
    )
    if aiori_token:
        user.aiori_user_id = user.id
        user.aiori_token = aiori_token
        db.commit()

    # Issue FitPulse JWT
    token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserRead.model_validate(user),
    )

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticates a FitPulse user and returns a signed JWT."""
    identifier = payload.username_or_email.strip()
    user = db.query(User).filter((User.email == identifier) | (User.id == identifier)).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/ID or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    # Refresh AIORI sync if token missing
    if not user.aiori_token:
        aiori_token = aiori_client.ensure_user_synced(
            user_id=user.id,
            name=user.name,
            email=user.email,
            password="password123",
            db=db,
        )
        if aiori_token:
            user.aiori_user_id = user.id
            user.aiori_token = aiori_token
            db.commit()

    token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserRead.model_validate(user),
    )

@router.get("/me", response_model=UserRead)
def get_current_profile(current_user: User = Depends(get_current_user)):
    """Returns currently authenticated user."""
    return current_user

