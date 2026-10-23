"""Tests for FastAPI health check route."""

from fastapi.testclient import TestClient
from ml_server.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data
