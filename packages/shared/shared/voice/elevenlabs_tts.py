"""
ElevenLabs Text-to-Speech provider implementation.
"""

import httpx

from shared.voice.base import TTSProvider, TTSResponse
from shared.exceptions import ServiceUnavailableError


class ElevenLabsProvider(TTSProvider):
    """ElevenLabs TTS provider."""

    BASE_URL = "https://api.elevenlabs.io/v1"

    def __init__(
        self,
        api_key: str,
        default_voice: str | None = None,
        default_speaking_rate: float = 0.85,
    ):
        super().__init__(
            api_key=api_key,
            default_language="he-IL",  # ElevenLabs handles language automatically
            default_voice=default_voice,
            default_speaking_rate=default_speaking_rate,
        )

        self.headers = {
            "xi-api-key": api_key,
            "Content-Type": "application/json",
        }

    @property
    def provider_name(self) -> str:
        return "elevenlabs"

    async def synthesize(
        self,
        text: str,
        language: str | None = None,
        voice: str | None = None,
        speaking_rate: float | None = None,
        audio_format: str = "mp3",
        **kwargs,
    ) -> TTSResponse:
        """Synthesize speech using ElevenLabs."""
        _, voice, speaking_rate = self._prepare_params(language, voice, speaking_rate)

        if not voice:
            raise ServiceUnavailableError(
                "ElevenLabs",
                "Voice ID is required for ElevenLabs",
            )

        try:
            # Map audio format to output_format parameter
            format_map = {
                "mp3": "mp3_44100_128",
                "wav": "pcm_44100",
                "ogg": "opus_44100",
            }
            output_format = format_map.get(audio_format, "mp3_44100_128")

            # Convert speaking rate to stability/similarity boost
            # ElevenLabs uses stability (0-1) and similarity_boost (0-1)
            # Lower speaking rate = higher stability for clearer speech
            stability = min(1.0, 0.5 + (1 - speaking_rate) * 0.5)

            url = f"{self.BASE_URL}/text-to-speech/{voice}"

            payload = {
                "text": text,
                "model_id": kwargs.get("model_id", "eleven_multilingual_v2"),
                "voice_settings": {
                    "stability": kwargs.get("stability", stability),
                    "similarity_boost": kwargs.get("similarity_boost", 0.75),
                    "style": kwargs.get("style", 0.0),
                    "use_speaker_boost": kwargs.get("use_speaker_boost", True),
                },
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    headers=self.headers,
                    json=payload,
                    params={"output_format": output_format},
                    timeout=30.0,
                )

                if response.status_code != 200:
                    raise ServiceUnavailableError(
                        "ElevenLabs",
                        f"API error: {response.status_code} - {response.text}",
                    )

                return TTSResponse(
                    audio_bytes=response.content,
                    audio_format=audio_format,
                    provider=self.provider_name,
                )

        except httpx.HTTPError as e:
            raise ServiceUnavailableError("ElevenLabs", str(e))

    async def list_voices(self, language: str | None = None) -> list[dict]:
        """List available ElevenLabs voices."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/voices",
                    headers=self.headers,
                    timeout=10.0,
                )

                if response.status_code != 200:
                    raise ServiceUnavailableError(
                        "ElevenLabs",
                        f"API error: {response.status_code}",
                    )

                data = response.json()

                voices = []
                for voice in data.get("voices", []):
                    # Filter by language if specified
                    labels = voice.get("labels", {})
                    voice_language = labels.get("language", "")

                    if language and language.lower() not in voice_language.lower():
                        continue

                    voices.append({
                        "voice_id": voice.get("voice_id"),
                        "name": voice.get("name"),
                        "category": voice.get("category"),
                        "labels": labels,
                        "preview_url": voice.get("preview_url"),
                    })

                return voices

        except httpx.HTTPError as e:
            raise ServiceUnavailableError("ElevenLabs", str(e))

    async def get_voice_settings(self, voice_id: str) -> dict:
        """Get current settings for a voice."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/voices/{voice_id}/settings",
                    headers=self.headers,
                    timeout=10.0,
                )

                if response.status_code != 200:
                    raise ServiceUnavailableError(
                        "ElevenLabs",
                        f"API error: {response.status_code}",
                    )

                return response.json()

        except httpx.HTTPError as e:
            raise ServiceUnavailableError("ElevenLabs", str(e))
