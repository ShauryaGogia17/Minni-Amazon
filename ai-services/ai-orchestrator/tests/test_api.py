from unittest.mock import AsyncMock
from fastapi.testclient import TestClient
from main import create_app


def test_live_and_available_shopping_agents():
    with TestClient(create_app()) as client:
        response = client.get("/health/live", headers={"X-Request-ID": "test-request"})
        assert response.status_code == 200
        assert response.headers["X-Request-ID"] == "test-request"
        result = client.get("/api/v1/ai/capabilities").json()
        assert result["llm_enabled"] is False
        assert len(result["agents"]) == 5
        assert {agent["id"] for agent in result["agents"] if agent["available"]} == {"shopping", "recommendation"}


def test_readiness_success_and_failure():
    app = create_app()
    with TestClient(app) as client:
        app.state.probe.check = AsyncMock(return_value={"postgres": True, "redis": True, "product_service": True})
        assert client.get("/health/ready").status_code == 200
        app.state.probe.check = AsyncMock(return_value={"postgres": False, "redis": True, "product_service": True})
        result = client.get("/health/ready")
        assert result.status_code == 503
        assert result.json()["status"] == "not_ready"


def test_chat_requires_valid_input_and_sanitizes_request_id():
    with TestClient(create_app()) as client:
        assert client.post("/api/v1/ai/chat", json={"message": " "}).status_code == 422
        response = client.get("/health/live", headers={"X-Request-ID": "unsafe value"})
        assert response.headers["X-Request-ID"] != "unsafe value"
