"""
Configuration for the Integration Gateway.
"""

from pydantic_settings import BaseSettings


class IntegrationSettings(BaseSettings):
    """Integration gateway settings."""

    # Service URLs
    ai_agent_url: str = "http://localhost:8001"
    marketplace_url: str = "http://localhost:8002"

    # Rate limiting
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60

    # Circuit breaker
    circuit_breaker_threshold: int = 5
    circuit_breaker_timeout_seconds: int = 30

    # Timeouts
    request_timeout_seconds: float = 30.0
    connect_timeout_seconds: float = 10.0

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3001"]

    # API settings
    api_prefix: str = "/api/v1"

    model_config = {
        "env_prefix": "INTEGRATION_",
        "env_file": ".env",
    }


settings = IntegrationSettings()
