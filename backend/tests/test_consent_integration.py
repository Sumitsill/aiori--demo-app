from unittest.mock import patch

def test_consent_overview_and_grant_withdraw(client, auth_headers_user):
    """FitPulse communicates with AIORI-3 to retrieve overview, grant and withdraw consent."""
    # 1. Overview
    overview_resp = client.get("/api/consent/overview", headers=auth_headers_user)
    assert overview_resp.status_code == 200
    ov_data = overview_resp.json()
    assert "purposes" in ov_data
    assert len(ov_data["purposes"]) >= 4

    # 2. Grant consent
    with patch("app.services.aiori_client.aiori_client.grant_consent") as mock_grant:
        mock_grant.return_value = (True, {
            "event_id": "evt_test_123",
            "action": "GRANT",
            "purpose_id": "fitness_analytics",
            "notice_version": "v1.0",
            "notice_hash": "hash_test_123",
        })
        grant_resp = client.post(
            "/api/consent/grant",
            headers=auth_headers_user,
            json={"purpose_id": "fitness_analytics", "language": "en"},
        )
        assert grant_resp.status_code == 200
        assert grant_resp.json()["success"] is True

    # 3. Withdraw consent
    with patch("app.services.aiori_client.aiori_client.withdraw_consent") as mock_withdraw:
        mock_withdraw.return_value = (True, {
            "event_id": "evt_test_withdraw",
            "action": "WITHDRAW",
            "purpose_id": "fitness_analytics",
        })
        with_resp = client.post(
            "/api/consent/withdraw",
            headers=auth_headers_user,
            json={"purpose_id": "fitness_analytics", "language": "en"},
        )
        assert with_resp.status_code == 200
        assert with_resp.json()["success"] is True

def test_consumer_access_simulation(client, auth_headers_user):
    """Simulating downstream consumer data access: allowed when granted, denied when withdrawn."""
    # Scenario 1: Allowed access
    with patch("app.services.aiori_client.aiori_client.simulate_downstream_data_access") as mock_sim:
        mock_sim.return_value = (200, {
            "status": "ALLOWED",
            "reason_code": "CONSENT_ACTIVE",
            "consumer_id": "consumer_fitpulse",
            "user_id": "user_001",
            "purpose": "fitness_analytics",
            "data": {"step_count": 8420, "active_calories": 420.5},
        })
        acc_resp = client.post(
            "/api/consumer/test-access",
            headers=auth_headers_user,
            json={"purpose": "fitness_analytics"},
        )
        assert acc_resp.status_code == 200
        res = acc_resp.json()
        assert res["allowed"] is True
        assert res["reason_code"] == "CONSENT_ACTIVE"
        assert res["data"]["step_count"] == 8420

    # Scenario 2: Denied access (Consent Withdrawn)
    with patch("app.services.aiori_client.aiori_client.simulate_downstream_data_access") as mock_sim:
        mock_sim.return_value = (403, {
            "status": "DENIED",
            "reason_code": "CONSENT_WITHDRAWN",
            "detail": "Data principal has actively withdrawn consent for purpose 'fitness_analytics'",
            "user_id": "user_001",
            "purpose": "fitness_analytics",
        })
        acc_resp = client.post(
            "/api/consumer/test-access",
            headers=auth_headers_user,
            json={"purpose": "fitness_analytics"},
        )
        assert acc_resp.status_code == 200
        res = acc_resp.json()
        assert res["allowed"] is False
        assert res["reason_code"] == "CONSENT_WITHDRAWN"
        assert res["data"] is None

def test_fail_closed_outbox_when_aiori_unreachable(client, auth_headers_user):
    """When AIORI-3 is unreachable during withdrawal, withdrawal is recorded locally as PENDING and sharing is blocked."""
    with patch("app.services.aiori_client.aiori_client.withdraw_consent") as mock_withdraw:
        mock_withdraw.return_value = (False, {"error": "Connection refused"})
        with_resp = client.post(
            "/api/consent/withdraw",
            headers=auth_headers_user,
            json={"purpose_id": "marketing", "language": "en"},
        )
        assert with_resp.status_code == 200
        data = with_resp.json()
        assert data["success"] is True
        assert "fail-closed" in data["message"].lower() or "pending" in data["message"].lower()

def test_admin_publish_notice_invalidates_consents_stale(client, auth_headers_user, auth_headers_admin):
    """
    Publishing a new privacy notice as Admin invalidates earlier user consents (CONSENT_STALE)
    and blocks subsequent data access under DPDP Act §6.
    """
    # 1. User grants consent under v1.0
    with patch("app.services.aiori_client.aiori_client.grant_consent") as mock_grant:
        mock_grant.return_value = (True, {
            "event_id": "evt_v1",
            "action": "GRANT",
            "purpose_id": "fitness_analytics",
            "notice_version": "v1.0",
            "notice_hash": "hash_v1",
        })
        client.post(
            "/api/consent/grant",
            headers=auth_headers_user,
            json={"purpose_id": "fitness_analytics", "language": "en"},
        )

    # 2. Admin publishes notice v2.0
    with patch("app.services.aiori_client.aiori_client.publish_notice") as mock_pub:
        mock_pub.return_value = (True, {
            "version": "v2.0",
            "title": "FitPulse Revised Privacy Notice v2.0",
            "language": "en",
            "hash_sha256": "new_sha256_hash_v2",
        })
        pub_resp = client.post(
            "/api/admin/notices/publish",
            headers=auth_headers_admin,
            json={
                "version": "v2.0",
                "title": "FitPulse Revised Privacy Notice v2.0",
                "content": "Updated telemetry and sports science terms.",
                "language": "en",
            },
        )
        assert pub_resp.status_code == 200
        pub_data = pub_resp.json()
        assert pub_data["success"] is True
        assert "v2.0" in pub_data["message"]

    # 3. Subsequent consumer access is rejected with CONSENT_STALE
    with patch("app.services.aiori_client.aiori_client.simulate_downstream_data_access") as mock_sim:
        mock_sim.return_value = (403, {
            "status": "DENIED",
            "reason_code": "CONSENT_STALE",
            "detail": "Consent was granted under notice version 'v1.0', which is superseded by 'v2.0'.",
            "user_id": "user_001",
            "purpose": "fitness_analytics",
        })
        acc_resp = client.post(
            "/api/consumer/test-access",
            headers=auth_headers_user,
            json={"purpose": "fitness_analytics"},
        )
        assert acc_resp.status_code == 200
        res = acc_resp.json()
        assert res["allowed"] is False
        assert res["reason_code"] == "CONSENT_STALE"

