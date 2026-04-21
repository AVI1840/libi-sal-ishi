"""
Base classes and interfaces for TTS providers.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class TTSResponse:
    """Response from TTS provider."""
    audio_bytes: bytes
    audio_format: str  # mp3, wav, ogg
    duration_seconds: float | None = None
    provider: str = ""

    def to_base64(self) -> str:
        """Convert audio bytes to base64 string."""
        import base64
        return base64.b64encode(self.audio_bytes).decode("utf-8")


class TTSProvider(ABC):
    """Abstract base class for TTS providers."""

    def __init__(
        self,
        api_key: str,
        default_language: str = "he-IL",
        default_voice: str | None = None,
        default_speaking_rate: float = 0.85,
    ):
        self.api_key = api_key
        self.default_language = default_language
        self.default_voice = default_voice
        self.default_speaking_rate = default_speaking_rate

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Get the provider name."""
        pass

    @abstractmethod
    async def synthesize(
        self,
        text: str,
        language: str | None = None,
        voice: str | None = None,
        speaking_rate: float | None = None,
        audio_format: str = "mp3",
        **kwargs,
    ) -> TTSResponse:
        """
        Synthesize speech from text.

        Args:
            text: Text to synthesize
            language: Language code (e.g., "he-IL")
            voice: Voice ID or name
            speaking_rate: Speaking rate multiplier (0.5-1.5)
            audio_format: Output format (mp3, wav, ogg)
            **kwargs: Provider-specific parameters

        Returns:
            TTS response with audio bytes
        """
        pass

    @abstractmethod
    async def list_voices(self, language: str | None = None) -> list[dict]:
        """
        List available voices.

        Args:
            language: Filter by language code

        Returns:
            List of voice info dictionaries
        """
        pass

    def _prepare_params(
        self,
        language: str | None,
        voice: str | None,
        speaking_rate: float | None,
    ) -> tuple[str, str | None, float]:
        """Prepare parameters with defaults."""
        return (
            language or self.default_language,
            voice or self.default_voice,
            speaking_rate if speaking_rate is not None else self.default_speaking_rate,
        )
