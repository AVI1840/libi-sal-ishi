"""
Google Text-to-Speech provider implementation.
"""

from shared.voice.base import TTSProvider, TTSResponse
from shared.exceptions import ServiceUnavailableError


class GoogleTTSProvider(TTSProvider):
    """Google Cloud Text-to-Speech provider."""

    # Hebrew voice options
    HEBREW_VOICES = {
        "he-IL-Wavenet-A": {"gender": "FEMALE", "type": "Wavenet"},
        "he-IL-Wavenet-B": {"gender": "MALE", "type": "Wavenet"},
        "he-IL-Wavenet-C": {"gender": "FEMALE", "type": "Wavenet"},
        "he-IL-Wavenet-D": {"gender": "MALE", "type": "Wavenet"},
        "he-IL-Standard-A": {"gender": "FEMALE", "type": "Standard"},
        "he-IL-Standard-B": {"gender": "MALE", "type": "Standard"},
        "he-IL-Standard-C": {"gender": "FEMALE", "type": "Standard"},
        "he-IL-Standard-D": {"gender": "MALE", "type": "Standard"},
    }

    def __init__(
        self,
        api_key: str | None = None,
        default_language: str = "he-IL",
        default_voice: str = "he-IL-Wavenet-A",
        default_speaking_rate: float = 0.85,
    ):
        super().__init__(
            api_key=api_key or "",
            default_language=default_language,
            default_voice=default_voice,
            default_speaking_rate=default_speaking_rate,
        )

        # Import and configure client
        from google.cloud import texttospeech
        self.client = texttospeech.TextToSpeechClient()
        self._texttospeech = texttospeech

    @property
    def provider_name(self) -> str:
        return "google"

    async def synthesize(
        self,
        text: str,
        language: str | None = None,
        voice: str | None = None,
        speaking_rate: float | None = None,
        audio_format: str = "mp3",
        **kwargs,
    ) -> TTSResponse:
        """Synthesize speech using Google TTS."""
        language, voice, speaking_rate = self._prepare_params(language, voice, speaking_rate)

        try:
            # Map audio format
            format_map = {
                "mp3": self._texttospeech.AudioEncoding.MP3,
                "wav": self._texttospeech.AudioEncoding.LINEAR16,
                "ogg": self._texttospeech.AudioEncoding.OGG_OPUS,
            }
            audio_encoding = format_map.get(audio_format, self._texttospeech.AudioEncoding.MP3)

            # Build request
            synthesis_input = self._texttospeech.SynthesisInput(text=text)

            voice_params = self._texttospeech.VoiceSelectionParams(
                language_code=language,
                name=voice,
            )

            audio_config = self._texttospeech.AudioConfig(
                audio_encoding=audio_encoding,
                speaking_rate=speaking_rate,
                pitch=kwargs.get("pitch", 0),
                volume_gain_db=kwargs.get("volume_gain_db", 0),
            )

            # Synthesize
            response = self.client.synthesize_speech(
                input=synthesis_input,
                voice=voice_params,
                audio_config=audio_config,
            )

            return TTSResponse(
                audio_bytes=response.audio_content,
                audio_format=audio_format,
                provider=self.provider_name,
            )

        except Exception as e:
            raise ServiceUnavailableError("Google TTS", str(e))

    async def list_voices(self, language: str | None = None) -> list[dict]:
        """List available Google TTS voices."""
        try:
            response = self.client.list_voices(language_code=language)

            voices = []
            for voice in response.voices:
                voices.append({
                    "name": voice.name,
                    "language_codes": list(voice.language_codes),
                    "gender": voice.ssml_gender.name,
                    "natural_sample_rate_hertz": voice.natural_sample_rate_hertz,
                })
            return voices

        except Exception as e:
            raise ServiceUnavailableError("Google TTS", str(e))
