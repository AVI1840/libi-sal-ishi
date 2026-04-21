"""
Text-to-Speech provider abstraction layer.

Supports Google TTS and ElevenLabs with unified interface.
"""

from shared.voice.base import TTSProvider, TTSResponse
from shared.voice.factory import TTSFactory, create_tts

__all__ = [
    "TTSProvider",
    "TTSResponse",
    "TTSFactory",
    "create_tts",
]
