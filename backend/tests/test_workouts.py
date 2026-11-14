def test_create_and_list_workouts(client, auth_headers_user):
    """User can record a workout, query summaries, and view history."""
    create_resp = client.post(
        "/api/workouts",
        headers=auth_headers_user,
        json={
            "title": "Evening Outdoor Run",
            "category": "Running",
            "duration_minutes": 30,
            "distance_km": 5.0,
            "heart_rate_avg": 142.0,
            "notes": "Tempo pace",
        },
    )
    assert create_resp.status_code == 201
    w = create_resp.json()
    assert w["title"] == "Evening Outdoor Run"
    assert w["calories_burned"] > 0  # auto estimated

    # List workouts
    list_resp = client.get("/api/workouts", headers=auth_headers_user)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # Workout Summary
    summary_resp = client.get("/api/workouts/summary", headers=auth_headers_user)
    assert summary_resp.status_code == 200
    s_data = summary_resp.json()
    assert s_data["total_workouts"] >= 1
    assert s_data["total_calories_burned"] > 0

def test_update_and_delete_workout(client, auth_headers_user):
    """User can update and delete their workout."""
    create_resp = client.post(
        "/api/workouts",
        headers=auth_headers_user,
        json={
            "title": "Morning Stretch",
            "category": "Yoga",
            "duration_minutes": 20,
        },
    )
    w_id = create_resp.json()["id"]

    # Update
    update_resp = client.put(
        f"/api/workouts/{w_id}",
        headers=auth_headers_user,
        json={"title": "Gentle Morning Yoga", "duration_minutes": 25},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "Gentle Morning Yoga"

    # Delete
    del_resp = client.delete(f"/api/workouts/{w_id}", headers=auth_headers_user)
    assert del_resp.status_code == 204

    # Verify deleted
    get_resp = client.get(f"/api/workouts/{w_id}", headers=auth_headers_user)
    assert get_resp.status_code == 404

