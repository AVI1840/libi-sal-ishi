"""
Base classes and interfaces for LLM providers.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, AsyncIterator

from shared.constants import MessageRole


@dataclass
class LLMMessage:
    """Message in LLM conversation."""
    role: str  # "user", "assistant", "system"
    content: str
    name: str | None = None

    @classmethod
    def user(cls, content: str) -> "LLMMessage":
        """Create a user message."""
        return cls(role="user", content=content)

    @classmethod
    def assistant(cls, content: str) -> "LLMMessage":
        """Create an assistant message."""
        return cls(role="assistant", content=content)

    @classmethod
    def system(cls, content: str) -> "LLMMessage":
        """Create a system message."""
        return cls(role="system", content=content)

    def to_dict(self) -> dict[str, str]:
        """Convert to dictionary."""
        d = {"role": self.role, "content": self.content}
        if self.name:
            d["name"] = self.name
        return d


@dataclass
class LLMResponse:
    """Response from LLM provider."""
    content: str
    model: str
    provider: str
    usage: dict[str, int] = field(default_factory=dict)
    finish_reason: str | None = None
    raw_response: Any = None

    @property
    def input_tokens(self) -> int:
        """Get input token count."""
        return self.usage.get("input_tokens", 0)

    @property
    def output_tokens(self) -> int:
        """Get output token count."""
        return self.usage.get("output_tokens", 0)

    @property
    def total_tokens(self) -> int:
        """Get total token count."""
        return self.input_tokens + self.output_tokens


@dataclass
class LLMStreamChunk:
    """Streaming chunk from LLM provider."""
    content: str
    is_final: bool = False
    finish_reason: str | None = None


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    def __init__(
        self,
        api_key: str,
        model: str,
        default_max_tokens: int = 2048,
        default_temperature: float = 0.7,
    ):
        self.api_key = api_key
        self.model = model
        self.default_max_tokens = default_max_tokens
        self.default_temperature = default_temperature

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Get the provider name."""
        pass

    @abstractmethod
    async def complete(
        self,
        messages: list[LLMMessage],
        max_tokens: int | None = None,
        temperature: float | None = None,
        stop_sequences: list[str] | None = None,
        **kwargs,
    ) -> LLMResponse:
        """
        Generate a completion.

        Args:
            messages: List of messages in the conversation
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature (0-2)
            stop_sequences: Sequences that stop generation
            **kwargs: Provider-specific parameters

        Returns:
            LLM response
        """
        pass

    @abstractmethod
    async def stream(
        self,
        messages: list[LLMMessage],
        max_tokens: int | None = None,
        temperature: float | None = None,
        stop_sequences: list[str] | None = None,
        **kwargs,
    ) -> AsyncIterator[LLMStreamChunk]:
        """
        Stream a completion.

        Args:
            messages: List of messages in the conversation
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature (0-2)
            stop_sequences: Sequences that stop generation
            **kwargs: Provider-specific parameters

        Yields:
            Streaming chunks
        """
        pass

    def _prepare_params(
        self,
        max_tokens: int | None,
        temperature: float | None,
    ) -> tuple[int, float]:
        """Prepare parameters with defaults."""
        return (
            max_tokens if max_tokens is not None else self.default_max_tokens,
            temperature if temperature is not None else self.default_temperature,
        )

    async def simple_complete(
        self,
        prompt: str,
        system_prompt: str | None = None,
        **kwargs,
    ) -> str:
        """
        Simple completion with just a prompt.

        Args:
            prompt: User prompt
            system_prompt: Optional system prompt
            **kwargs: Additional parameters

        Returns:
            Generated text content
        """
        messages = []
        if system_prompt:
            messages.append(LLMMessage.system(system_prompt))
        messages.append(LLMMessage.user(prompt))

        response = await self.complete(messages, **kwargs)
        return response.content
