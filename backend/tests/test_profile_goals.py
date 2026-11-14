def test_profile_update_and_goals(client, auth_headers_user):
    """User can view and update profile and goals."""
    # Profile
    p_resp = client.get("/api/profile", headers=auth_headers_user)
    assert p_resp.status_code == 200

    update_resp = client.put(
        "/api/profile",
        headers=auth_headers_user,
        json={"weight_kg": 69.2, "fitness_level": "Elite", "daily_step_goal": 12000},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["weight_kg"] == 69.2
    assert update_resp.json()["daily_step_goal"] == 12000

    # Goals
    g_create = client.post(
        "/api/profile/goals",
        headers=auth_headers_user,
        json={
            "title": "Run 50km this month",
            "goal_type": "DISTANCE",
            "target_value": 50.0,
            "unit": "km",
        },
    )
    assert g_create.status_code == 201
    g_id = g_create.json()["id"]

    # List goals
    g_list = client.get("/api/profile/goals", headers=auth_headers_user)
    assert g_list.status_code == 200
    assert any(g["id"] == g_id for g in g_list.json())

    # Dashboard telemetry
    dash_resp = client.get("/api/analytics/dashboard", headers=auth_headers_user)
    assert dash_resp.status_code == 200
    d = dash_resp.json()
    assert "today" in d
    assert "weekly_steps" in d
    assert len(d["weekly_steps"]) == 7

