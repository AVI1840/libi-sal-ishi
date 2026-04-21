"""
Centralized configuration management using Pydantic Settings.

All configuration is loaded from environment variables with sensible defaults.
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Environment
    environment: Literal["development", "staging", "production"] = "development"

    # Database
    database_url: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/libi_db",
        description="PostgreSQL connection URL"
    )
    database_pool_size: int = Field(default=10, ge=1, le=100)
    database_max_overflow: int = Field(default=20, ge=0, le=100)
    database_echo: bool = Field(default=False, description="Echo SQL queries")

    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0")
    redis_password: str | None = None

    # JWT Authentication
    jwt_secret_key: str = Field(
        default="replace-with-random-secret-min-32-characters-long",
        min_length=32,
    )
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = Field(default=60, ge=5, le=1440)
    jwt_refresh_token_expire_days: int = Field(default=7, ge=1, le=30)

    # Cloud Provider
    cloud_provider: Literal["aws", "gcp", "azure"] = "gcp"

    # AWS
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    aws_region: str = "eu-west-1"
    aws_s3_bucket: str = "libi-storage"

    # GCP
    google_application_credentials: str | None = None
    gcp_project_id: str | None = None
    gcp_storage_bucket: str = "libi-storage"

    # Azure
    azure_storage_connection_string: str | None = None
    azure_storage_container: str = "libi-storage"

    # LLM Provider
    llm_provider: Literal["anthropic", "openai", "google"] = "anthropic"
    llm_model: str = "claude-3-5-sonnet-20241022"
    llm_fallback_provider: Literal["anthropic", "openai", "google"] | None = "openai"
    llm_fallback_model: str | None = "gpt-4o"
    llm_max_tokens: int = Field(default=2048, ge=100, le=100000)
    llm_temperature: float = Field(default=0.7, ge=0, le=2)

    # LLM API Keys
    anthropic_api_key: str | None = None
    openai_api_key: str | None = None
    google_api_key: str | None = None

    # TTS Provider
    tts_provider: Literal["google", "elevenlabs"] = "google"
    tts_language: str = "he-IL"
    tts_voice: str = "he-IL-Wavenet-A"
    tts_speaking_rate: float = Field(default=0.85, ge=0.5, le=1.5)

    # TTS API Keys
    google_tts_api_key: str | None = None
    elevenlabs_api_key: str | None = None
    elevenlabs_voice_id: str | None = None

    # Vector Store
    vector_store_provider: Literal["pinecone", "pgvector"] = "pinecone"
    pinecone_api_key: str | None = None
    pinecone_environment: str = "us-east-1"
    pinecone_index: str = "libi-memories"

    # AI Agent
    emergency_phone: str = "101"  # Israeli emergency
    enable_emergency_detection: bool = True
    enable_cognitive_monitoring: bool = True
    max_conversation_history: int = Field(default=50, ge=10, le=200)
    sentiment_alert_threshold: float = Field(default=-0.5, ge=-1, le=0)

    # Marketplace
    payment_gateway: Literal["mock", "tranzila", "payplus"] = "mock"
    platform_fee_percent: float = Field(default=7.0, ge=0, le=30)
    unit_value_nis: float = Field(default=120.0, ge=1)
    min_optimal_aging_units: int = Field(default=2, ge=0)
    units_expiry_days: int = Field(default=90, ge=30)

    # Service URLs
    ai_agent_url: str = "http://localhost:8001"
    marketplace_url: str = "http://localhost:8002"
    integration_url: str = "http://localhost:8003"

    # Logging
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    log_format: Literal["json", "text"] = "json"
    sentry_dsn: str | None = None

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:3001,http://localhost:3002"

    @field_validator("cors_origins")
    @classmethod
    def parse_cors_origins(cls, v: str) -> str:
        """Validate CORS origins format."""
        # Just validate it's a comma-separated list
        origins = [o.strip() for o in v.split(",") if o.strip()]
        if not origins:
            return "http://localhost:3000"
        return ",".join(origins)

    @property
    def cors_origins_list(self) -> list[str]:
        """Get CORS origins as a list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development."""
        return self.environment == "development"


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.

    Uses lru_cache to ensure settings are only loaded once.
    """
    return Settings()
