def test_rbac_user_cannot_access_admin_endpoints(client, auth_headers_user):
    """Regular USER role cannot view admin stats."""
    resp = client.get("/api/admin/stats", headers=auth_headers_user)
    assert resp.status_code == 403

def test_rbac_admin_can_access_admin_stats(client, auth_headers_admin):
    """ADMIN role can access admin telemetry."""
    resp = client.get("/api/admin/stats", headers=auth_headers_admin)
    assert resp.status_code == 200
    assert "platform" in resp.json()

def test_unauthenticated_request_rejected(client):
    """Requests without token receive HTTP 401."""
    resp = client.get("/api/workouts")
    assert resp.status_code == 401

def test_ownership_enforcement(client, auth_headers_user):
    """A user cannot access another user's private workout."""
    # Create workout as user_001
    w_resp = client.post(
        "/api/workouts",
        headers=auth_headers_user,
        json={"title": "Private User Workout", "category": "Walking", "duration_minutes": 15},
    )
    w_id = w_resp.json()["id"]

    # Register user_002
    reg_resp = client.post(
        "/api/auth/register",
        json={"name": "User Two", "email": "user2@example.com", "password": "password123"},
    )
    token_user2 = reg_resp.json()["access_token"]
    headers_user2 = {"Authorization": f"Bearer {token_user2}"}

    # User 2 attempts to fetch or delete User 1's workout
    forbidden_resp = client.get(f"/api/workouts/{w_id}", headers=headers_user2)
    assert forbidden_resp.status_code == 403

    del_forbidden = client.delete(f"/api/workouts/{w_id}", headers=headers_user2)
    assert del_forbidden.status_code == 403

def test_admin_cannot_grant_or_withdraw_user_consent(client, auth_headers_admin):
    """
    Enforces DPDP Act 2023 §6: Administrators cannot grant or withdraw
    personal consent on behalf of users.
    """
    grant_resp = client.post(
        "/api/consent/grant",
        headers=auth_headers_admin,
        json={"purpose_id": "fitness_analytics", "language": "en"},
    )
    assert grant_resp.status_code == 403
    assert "Administrators cannot" in grant_resp.json()["detail"]

    withdraw_resp = client.post(
        "/api/consent/withdraw",
        headers=auth_headers_admin,
        json={"purpose_id": "fitness_analytics", "language": "en"},
    )
    assert withdraw_resp.status_code == 403
    assert "Administrators cannot" in withdraw_resp.json()["detail"]

