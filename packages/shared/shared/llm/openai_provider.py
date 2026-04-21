"""
OpenAI (GPT) LLM provider implementation.
"""

from typing import Any, AsyncIterator

import openai

from shared.llm.base import LLMMessage, LLMProvider, LLMResponse, LLMStreamChunk
from shared.exceptions import LLMError


class OpenAIProvider(LLMProvider):
    """OpenAI GPT provider."""

    def __init__(
        self,
        api_key: str,
        model: str = "gpt-4o",
        default_max_tokens: int = 2048,
        default_temperature: float = 0.7,
    ):
        super().__init__(api_key, model, default_max_tokens, default_temperature)
        self.client = openai.AsyncOpenAI(api_key=api_key)

    @property
    def provider_name(self) -> str:
        return "openai"

    def _convert_messages(self, messages: list[LLMMessage]) -> list[dict[str, str]]:
        """Convert messages to OpenAI format."""
        return [msg.to_dict() for msg in messages]

    async def complete(
        self,
        messages: list[LLMMessage],
        max_tokens: int | None = None,
        temperature: float | None = None,
        stop_sequences: list[str] | None = None,
        **kwargs,
    ) -> LLMResponse:
        """Generate a completion using GPT."""
        max_tokens, temperature = self._prepare_params(max_tokens, temperature)
        converted_messages = self._convert_messages(messages)

        try:
            params: dict[str, Any] = {
                "model": self.model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": converted_messages,
            }

            if stop_sequences:
                params["stop"] = stop_sequences

            params.update(kwargs)

            response = await self.client.chat.completions.create(**params)

            choice = response.choices[0]
            usage = response.usage

            return LLMResponse(
                content=choice.message.content or "",
                model=response.model,
                provider=self.provider_name,
                usage={
                    "input_tokens": usage.prompt_tokens if usage else 0,
                    "output_tokens": usage.completion_tokens if usage else 0,
                },
                finish_reason=choice.finish_reason,
                raw_response=response,
            )

        except openai.APIError as e:
            raise LLMError(
                provider=self.provider_name,
                message=str(e),
                details={"status_code": getattr(e, "status_code", None)},
            )

    async def stream(
        self,
        messages: list[LLMMessage],
        max_tokens: int | None = None,
        temperature: float | None = None,
        stop_sequences: list[str] | None = None,
        **kwargs,
    ) -> AsyncIterator[LLMStreamChunk]:
        """Stream a completion using GPT."""
        max_tokens, temperature = self._prepare_params(max_tokens, temperature)
        converted_messages = self._convert_messages(messages)

        try:
            params: dict[str, Any] = {
                "model": self.model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": converted_messages,
                "stream": True,
            }

            if stop_sequences:
                params["stop"] = stop_sequences

            params.update(kwargs)

            stream = await self.client.chat.completions.create(**params)

            async for chunk in stream:
                if chunk.choices:
                    choice = chunk.choices[0]
                    delta = choice.delta

                    if delta.content:
                        yield LLMStreamChunk(
                            content=delta.content,
                            is_final=False,
                        )

                    if choice.finish_reason:
                        yield LLMStreamChunk(
                            content="",
                            is_final=True,
                            finish_reason=choice.finish_reason,
                        )

        except openai.APIError as e:
            raise LLMError(
                provider=self.provider_name,
                message=str(e),
                details={"status_code": getattr(e, "status_code", None)},
            )
