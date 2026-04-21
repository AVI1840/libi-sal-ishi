"""
TTS provider factory.
"""

from typing import Literal

from shared.config import get_settings
from shared.voice.base import TTSProvider
from shared.exceptions import ValidationError


TTSProviderType = Literal["google", "elevenlabs"]


class TTSFactory:
    """Factory for creating TTS providers."""

    @classmethod
    def create(
        cls,
        provider: TTSProviderType | None = None,
        api_key: str | None = None,
        **kwargs,
    ) -> TTSProvider:
        """
        Create a TTS provider instance.

        Args:
            provider: Provider name (google, elevenlabs)
            api_key: API key (uses config if not specified)
            **kwargs: Provider-specific parameters

        Returns:
            TTS provider instance
        """
        settings = get_settings()
        provider = provider or settings.tts_provider

        if provider == "google":
            from shared.voice.google_tts import GoogleTTSProvider
            return GoogleTTSProvider(
                api_key=api_key or settings.google_tts_api_key,
                default_language=kwargs.get("language", settings.tts_language),
                default_voice=kwargs.get("voice", settings.tts_voice),
                default_speaking_rate=kwargs.get("speaking_rate", settings.tts_speaking_rate),
            )

        elif provider == "elevenlabs":
            from shared.voice.elevenlabs_tts import ElevenLabsProvider

            key = api_key or settings.elevenlabs_api_key
            if not key:
                raise ValidationError(
                    "ElevenLabs API key is required",
                    field="api_key",
                )

            return ElevenLabsProvider(
                api_key=key,
                default_voice=kwargs.get("voice_id", settings.elevenlabs_voice_id),
                default_speaking_rate=kwargs.get("speaking_rate", settings.tts_speaking_rate),
            )

        else:
            raise ValidationError(
                f"Unknown TTS provider: {provider}",
                field="provider",
                details={"supported": ["google", "elevenlabs"]},
            )


def create_tts(
    provider: TTSProviderType | None = None,
    **kwargs,
) -> TTSProvider:
    """
    Convenience function to create a TTS provider.

    Uses settings from environment variables by default.
    """
    return TTSFactory.create(provider=provider, **kwargs)
