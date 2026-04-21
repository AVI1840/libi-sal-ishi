"""
Unit tests for gateway router.
"""

import pytest
from fastapi.testclient import TestClient

from integration.main import app


@pytest.fixture
def client():
    return TestClient(app)


class TestHealthEndpoint:
    """Tests for health check endpoint."""

    def test_health_check(self, client):
        """Health check should return healthy status."""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "integration-gateway"


class TestRootEndpoint:
    """Tests for root endpoint."""

    def test_root(self, client):
        """Root endpoint should return service info."""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "Savta.AI Integration Gateway" in data["service"]
