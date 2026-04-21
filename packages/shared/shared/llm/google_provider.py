"""
Google (Gemini) LLM provider implementation.
"""

from typing import Any, AsyncIterator

import google.generativeai as genai

from shared.llm.base import LLMMessage, LLMProvider, LLMResponse, LLMStreamChunk
from shared.exceptions import LLMError


class GoogleProvider(LLMProvider):
    """Google Gemini provider."""

    def __init__(
        self,
        api_key: str,
        model: str = "gemini-1.5-pro",
        default_max_tokens: int = 2048,
        default_temperature: float = 0.7,
    ):
        super().__init__(api_key, model, default_max_tokens, default_temperature)
        genai.configure(api_key=api_key)
        self.model_instance = genai.GenerativeModel(model)

    @property
    def provider_name(self) -> str:
        return "google"

    def _convert_messages(
        self, messages: list[LLMMessage]
    ) -> tuple[str | None, list[dict[str, Any]]]:
        """
        Convert messages to Gemini format.

        Gemini uses 'user' and 'model' roles, and system instruction is separate.
        """
        system_instruction = None
        converted = []

        for msg in messages:
            if msg.role == "system":
                system_instruction = msg.content
            elif msg.role == "assistant":
                converted.append({"role": "model", "parts": [msg.content]})
            else:
                converted.append({"role": "user", "parts": [msg.content]})

        return system_instruction, converted

    async def complete(
        self,
        messages: list[LLMMessage],
        max_tokens: int | None = None,
        temperature: float | None = None,
        stop_sequences: list[str] | None = None,
        **kwargs,
    ) -> LLMResponse:
        """Generate a completion using Gemini."""
        max_tokens, temperature = self._prepare_params(max_tokens, temperature)
        system_instruction, converted_messages = self._convert_messages(messages)

        try:
            # Create model with system instruction if provided
            if system_instruction:
                model = genai.GenerativeModel(
                    self.model,
                    system_instruction=system_instruction,
                )
            else:
                model = self.model_instance

            generation_config = genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=temperature,
                stop_sequences=stop_sequences,
            )

            # Start chat or generate content
            if len(converted_messages) > 1:
                chat = model.start_chat(history=converted_messages[:-1])
                response = await chat.send_message_async(
                    converted_messages[-1]["parts"][0],
                    generation_config=generation_config,
                )
            else:
                response = await model.generate_content_async(
                    converted_messages[0]["parts"][0] if converted_messages else "",
                    generation_config=generation_config,
                )

            # Extract usage info
            usage = {}
            if hasattr(response, "usage_metadata") and response.usage_metadata:
                usage = {
                    "input_tokens": response.usage_metadata.prompt_token_count or 0,
                    "output_tokens": response.usage_metadata.candidates_token_count or 0,
                }

            return LLMResponse(
                content=response.text,
                model=self.model,
                provider=self.provider_name,
                usage=usage,
                finish_reason=response.candidates[0].finish_reason.name if response.candidates else None,
                raw_response=response,
            )

        except Exception as e:
            raise LLMError(
                provider=self.provider_name,
                message=str(e),
                details={"error_type": type(e).__name__},
            )

    async def stream(
        self,
        messages: list[LLMMessage],
        max_tokens: int | None = None,
        temperature: float | None = None,
        stop_sequences: list[str] | None = None,
        **kwargs,
    ) -> AsyncIterator[LLMStreamChunk]:
        """Stream a completion using Gemini."""
        max_tokens, temperature = self._prepare_params(max_tokens, temperature)
        system_instruction, converted_messages = self._convert_messages(messages)

        try:
            if system_instruction:
                model = genai.GenerativeModel(
                    self.model,
                    system_instruction=system_instruction,
                )
            else:
                model = self.model_instance

            generation_config = genai.types.GenerationConfig(
                max_output_tokens=max_tokens,
                temperature=temperature,
                stop_sequences=stop_sequences,
            )

            # For streaming, use generate_content with stream=True
            if len(converted_messages) > 1:
                chat = model.start_chat(history=converted_messages[:-1])
                response = await chat.send_message_async(
                    converted_messages[-1]["parts"][0],
                    generation_config=generation_config,
                    stream=True,
                )
            else:
                response = await model.generate_content_async(
                    converted_messages[0]["parts"][0] if converted_messages else "",
                    generation_config=generation_config,
                    stream=True,
                )

            async for chunk in response:
                if chunk.text:
                    yield LLMStreamChunk(content=chunk.text, is_final=False)

            yield LLMStreamChunk(content="", is_final=True, finish_reason="stop")

        except Exception as e:
            raise LLMError(
                provider=self.provider_name,
                message=str(e),
                details={"error_type": type(e).__name__},
            )
