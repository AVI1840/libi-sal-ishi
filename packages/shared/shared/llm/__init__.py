"""
Multi-LLM provider abstraction layer.

Supports Anthropic (Claude), OpenAI (GPT), and Google (Gemini).
Provider can be switched via environment variables.
"""

from shared.llm.base import (
    LLMProvider,
    LLMMessage,
    LLMResponse,
    LLMStreamChunk,
)
from shared.llm.factory import LLMFactory, create_llm

__all__ = [
    "LLMProvider",
    "LLMMessage",
    "LLMResponse",
    "LLMStreamChunk",
    "LLMFactory",
    "create_llm",
]
