import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "FitPulse Fitness Platform"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    PORT: int = 8001
    HOST: str = "0.0.0.0"

    # Database Configuration (PostgreSQL primary with automatic SQLite fallback)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/fitpulse"
    FALLBACK_SQLITE_URL: str = "sqlite:///./fitpulse.db"

    # JWT Authentication
    JWT_SECRET_KEY: str = "fitpulse_jwt_secret_dev_key_super_secure_change_in_prod_2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # AIORI-3 Integration Configuration
    AIORI_BASE_URL: str = "http://127.0.0.1:8000"
    AIORI_CONSUMER_API_KEY: str = "fitpulse_api_key_live_2026"
    AIORI_ADMIN_API_KEY: str = "fittrack_admin_secret_key_change_in_prod"
    AIORI_CONSUMER_ID: str = "consumer_fitpulse"
    AIORI_TIMEOUT_SECONDS: float = 5.0

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8001",
        "http://127.0.0.1:8001",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()

