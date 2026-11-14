from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.session import SessionLocal
from app.db.init_db import init_db
from app.api.auth import router as auth_router
from app.api.workouts import router as workouts_router
from app.api.profile import router as profile_router
from app.api.analytics import router as analytics_router
from app.api.consent import router as consent_router
from app.api.consumer import router as consumer_router
from app.api.admin import router as admin_router
from app.api.health import router as health_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed data
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FitPulse Fitness Platform — Integrated with AIORI-3 Purpose-Based Consent Ledger",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(workouts_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(consent_router, prefix=settings.API_V1_STR)
app.include_router(consumer_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": "FitPulse Fitness Platform",
        "status": "operational",
        "api_docs": "/docs",
        "consent_authority": settings.AIORI_BASE_URL,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
