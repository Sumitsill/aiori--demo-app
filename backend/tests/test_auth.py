def test_register_and_login_flow(client):
    """User can register with valid credentials and log in."""
    reg_resp = client.post(
        "/api/auth/register",
        json={
            "name": "Sarah Connor",
            "email": "sarah.c@example.com",
            "password": "strongpassword123",
            "role": "USER",
        },
    )
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "sarah.c@example.com"
    user_id = reg_data["user"]["id"]

    # Login
    login_resp = client.post(
        "/api/auth/login",
        json={"username_or_email": "sarah.c@example.com", "password": "strongpassword123"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # Me profile
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["id"] == user_id

def test_login_invalid_password(client):
    """Invalid password receives HTTP 401."""
    resp = client.post(
        "/api/auth/login",
        json={"username_or_email": "user_001", "password": "wrong_password"},
    )
    assert resp.status_code == 401

def test_duplicate_registration_rejected(client):
    """Registering existing email returns HTTP 400."""
    resp = client.post(
        "/api/auth/register",
        json={"name": "Alex Duplicate", "email": "alex.morgan@example.com", "password": "pass"},
    )
    assert resp.status_code == 400

