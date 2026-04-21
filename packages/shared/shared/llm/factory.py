"""
LLM provider factory.
"""

from typing import Literal

from shared.config import get_settings
from shared.llm.base import LLMProvider
from shared.exceptions import ValidationError


ProviderType = Literal["anthropic", "openai", "google"]


class LLMFactory:
    """Factory for creating LLM providers."""

    _providers: dict[str, type[LLMProvider]] = {}

    @classmethod
    def register(cls, name: str, provider_class: type[LLMProvider]) -> None:
        """Register a provider class."""
        cls._providers[name] = provider_class

    @classmethod
    def create(
        cls,
        provider: ProviderType | None = None,
        model: str | None = None,
        api_key: str | None = None,
        **kwargs,
    ) -> LLMProvider:
        """
        Create an LLM provider instance.

        Args:
            provider: Provider name (anthropic, openai, google)
            model: Model name (uses default from config if not specified)
            api_key: API key (uses config if not specified)
            **kwargs: Additional provider-specific parameters

        Returns:
            LLM provider instance
        """
        settings = get_settings()

        # Use config values as defaults
        provider = provider or settings.llm_provider

        # Get appropriate API key
        if api_key is None:
            if provider == "anthropic":
                api_key = settings.anthropic_api_key
            elif provider == "openai":
                api_key = settings.openai_api_key
            elif provider == "google":
                api_key = settings.google_api_key

        if not api_key:
            raise ValidationError(
                f"API key not found for provider '{provider}'",
                field="api_key",
            )

        # Get model
        if model is None:
            model = settings.llm_model

        # Create provider
        if provider == "anthropic":
            from shared.llm.anthropic_provider import AnthropicProvider
            return AnthropicProvider(
                api_key=api_key,
                model=model,
                default_max_tokens=kwargs.get("max_tokens", settings.llm_max_tokens),
                default_temperature=kwargs.get("temperature", settings.llm_temperature),
            )

        elif provider == "openai":
            from shared.llm.openai_provider import OpenAIProvider
            return OpenAIProvider(
                api_key=api_key,
                model=model,
                default_max_tokens=kwargs.get("max_tokens", settings.llm_max_tokens),
                default_temperature=kwargs.get("temperature", settings.llm_temperature),
            )

        elif provider == "google":
            from shared.llm.google_provider import GoogleProvider
            return GoogleProvider(
                api_key=api_key,
                model=model,
                default_max_tokens=kwargs.get("max_tokens", settings.llm_max_tokens),
                default_temperature=kwargs.get("temperature", settings.llm_temperature),
            )

        else:
            raise ValidationError(
                f"Unknown provider: {provider}",
                field="provider",
                details={"supported": ["anthropic", "openai", "google"]},
            )

    @classmethod
    def create_with_fallback(
        cls,
        primary_provider: ProviderType | None = None,
        fallback_provider: ProviderType | None = None,
        **kwargs,
    ) -> tuple[LLMProvider, LLMProvider | None]:
        """
        Create primary and fallback providers.

        Args:
            primary_provider: Primary provider name
            fallback_provider: Fallback provider name
            **kwargs: Additional parameters

        Returns:
            Tuple of (primary_provider, fallback_provider or None)
        """
        settings = get_settings()

        primary = cls.create(
            provider=primary_provider or settings.llm_provider,
            **kwargs,
        )

        fallback = None
        fallback_name = fallback_provider or settings.llm_fallback_provider
        if fallback_name:
            try:
                fallback = cls.create(
                    provider=fallback_name,
                    model=settings.llm_fallback_model,
                    **kwargs,
                )
            except ValidationError:
                # Fallback provider not configured, that's ok
                pass

        return primary, fallback


def create_llm(
    provider: ProviderType | None = None,
    model: str | None = None,
    **kwargs,
) -> LLMProvider:
    """
    Convenience function to create an LLM provider.

    Uses settings from environment variables by default.
    """
    return LLMFactory.create(provider=provider, model=model, **kwargs)
