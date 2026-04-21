"""
Anthropic (Claude) LLM provider implementation.
"""

from typing import Any, AsyncIterator

import anthropic

from shared.llm.base import LLMMessage, LLMProvider, LLMResponse, LLMStreamChunk
from shared.exceptions import LLMError


class AnthropicProvider(LLMProvider):
    """Anthropic Claude provider."""

    def __init__(
        self,
        api_key: str,
        model: str = "claude-3-5-sonnet-20241022",
        default_max_tokens: int = 2048,
        default_temperature: float = 0.7,
    ):
        super().__init__(api_key, model, default_max_tokens, default_temperature)
        self.client = anthropic.AsyncAnthropic(api_key=api_key)

    @property
    def provider_name(self) -> str:
        return "anthropic"

    def _convert_messages(
        self, messages: list[LLMMessage]
    ) -> tuple[str | None, list[dict[str, str]]]:
        """
        Convert messages to Anthropic format.

        Anthropic requires system message to be separate.
        """
        system_prompt = None
        converted = []

        for msg in messages:
            if msg.role == "system":
                system_prompt = msg.content
            else:
                converted.append({"role": msg.role, "content": msg.content})

        return system_prompt, converted

    async def complete(
        self,
        messages: list[LLMMessage],
        max_tokens: int | None = None,
        temperature: float | None = None,
        stop_sequences: list[str] | None = None,
        **kwargs,
    ) -> LLMResponse:
        """Generate a completion using Claude."""
        max_tokens, temperature = self._prepare_params(max_tokens, temperature)
        system_prompt, converted_messages = self._convert_messages(messages)

        try:
            params: dict[str, Any] = {
                "model": self.model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": converted_messages,
            }

            if system_prompt:
                params["system"] = system_prompt

            if stop_sequences:
                params["stop_sequences"] = stop_sequences

            # Add any extra kwargs
            params.update(kwargs)

            response = await self.client.messages.create(**params)

            return LLMResponse(
                content=response.content[0].text,
                model=response.model,
                provider=self.provider_name,
                usage={
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                },
                finish_reason=response.stop_reason,
                raw_response=response,
            )

        except anthropic.APIError as e:
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
        """Stream a completion using Claude."""
        max_tokens, temperature = self._prepare_params(max_tokens, temperature)
        system_prompt, converted_messages = self._convert_messages(messages)

        try:
            params: dict[str, Any] = {
                "model": self.model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "messages": converted_messages,
            }

            if system_prompt:
                params["system"] = system_prompt

            if stop_sequences:
                params["stop_sequences"] = stop_sequences

            params.update(kwargs)

            async with self.client.messages.stream(**params) as stream:
                async for text in stream.text_stream:
                    yield LLMStreamChunk(content=text, is_final=False)

                # Final chunk
                yield LLMStreamChunk(
                    content="",
                    is_final=True,
                    finish_reason="end_turn",
                )

        except anthropic.APIError as e:
            raise LLMError(
                provider=self.provider_name,
                message=str(e),
                details={"status_code": getattr(e, "status_code", None)},
            )
