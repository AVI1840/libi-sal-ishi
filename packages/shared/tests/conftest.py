"""
Test fixtures for shared package.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock


@pytest.fixture
def mock_settings():
    """Create mock settings for testing."""
    from shared.config import Settings

    return Settings(
        environment="development",
        database_url="postgresql://test:test@localhost:5432/test_db",
        jwt_secret_key="test-secret-key-for-unit-tests-only-32chars",
        cloud_provider="gcp",
        llm_provider="anthropic",
        tts_provider="google",
    )


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "teudat_zehut": "123456782",  # Valid Israeli ID
        "first_name": "יוסי",
        "last_name": "כהן",
        "birth_date": "1950-01-15",
        "phone": "050-1234567",
        "email": "yossi@example.com",
        "nursing_level": 3,
        "languages": ["hebrew"],
    }


@pytest.fixture
def sample_wallet_data():
    """Sample wallet data for testing."""
    return {
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "nursing_level": 3,
        "total_units": 36,
        "available_units": 32,
        "reserved_units": 4,
        "optimal_aging_units": 2,
    }


@pytest.fixture
def sample_service_data():
    """Sample service data for testing."""
    return {
        "vendor_id": "550e8400-e29b-41d4-a716-446655440001",
        "category": "physiotherapy",
        "title": "Home Physiotherapy",
        "title_he": "פיזיותרפיה בבית",
        "description": "Professional physiotherapy at home",
        "description_he": "פיזיותרפיה מקצועית בבית",
        "unit_cost": 2,
        "duration_minutes": 45,
        "is_optimal_aging": True,
    }


@pytest.fixture
def mock_llm_response():
    """Mock LLM response."""
    return {
        "content": "שלום! מה שלומך היום?",
        "model": "claude-3-5-sonnet-20241022",
        "usage": {
            "prompt_tokens": 10,
            "completion_tokens": 15,
            "total_tokens": 25,
        },
    }


@pytest.fixture
def mock_async_session():
    """Create mock async database session."""
    session = AsyncMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    session.close = AsyncMock()
    session.execute = AsyncMock()
    return session
