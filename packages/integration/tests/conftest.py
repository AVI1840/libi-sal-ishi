"""
Test configuration for Integration Gateway.
"""

import pytest
from fastapi.testclient import TestClient

from integration.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def mock_services(monkeypatch):
    """Mock downstream services."""
    # Mock responses for AI Agent and Marketplace
    pass
