import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("fitpulse.db")

Base = declarative_base()

def get_engine():
    target_url = settings.DATABASE_URL
    try:
        if target_url.startswith("postgresql"):
            # Attempt to connect to PostgreSQL
            eng = create_engine(target_url, pool_pre_ping=True, connect_args={"connect_timeout": 3})
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Connected successfully to PostgreSQL database.")
            return eng
        else:
            return create_engine(
                target_url,
                connect_args={"check_same_thread": False} if target_url.startswith("sqlite") else {},
            )
    except Exception as e:
        logger.warning(
            f"Unable to connect to primary database ({target_url}): {e}. "
            f"Falling back to local SQLite ({settings.FALLBACK_SQLITE_URL}) for resilience."
        )
        return create_engine(
            settings.FALLBACK_SQLITE_URL,
            connect_args={"check_same_thread": False},
        )

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

