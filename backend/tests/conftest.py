import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set test environment
os.environ["DATABASE_URL"] = "sqlite:///./test_fitpulse.db"
os.environ["FALLBACK_SQLITE_URL"] = "sqlite:///./test_fitpulse.db"
os.environ["JWT_SECRET_KEY"] = "test_super_secure_secret_key_32_bytes_minimum_length_2026"

from app.db.session import Base, get_db
from app.db.init_db import init_db
from app.main import app

TEST_DB_URL = "sqlite:///./test_fitpulse.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    init_db(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_fitpulse.db"):
        os.remove("./test_fitpulse.db")

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers_user(client):
    login_resp = client.post("/api/auth/login", json={"username_or_email": "user_001", "password": "password123"})
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def auth_headers_admin(client):
    login_resp = client.post("/api/auth/login", json={"username_or_email": "admin_fitpulse", "password": "adminpassword123"})
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
