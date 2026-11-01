"""Gemini API Client with structured generation, rate limiting, and exponential backoff."""
import os
import time
import json
import logging
from typing import Dict, Any, Optional, Tuple, Type
from pydantic import BaseModel

from vidyaflow_generator.config import (
    GEMINI_API_KEY,
    DEFAULT_MODEL,
    FALLBACK_MODEL,
    GEMINI_REQUEST_DELAY_SECONDS,
    MAX_RETRIES,
    RETRY_BACKOFF_BASE
)
from vidyaflow_generator.models.report import TokenUsage

logger = logging.getLogger(__name__)


class GeminiClient:
    """Robust Gemini client handling authentication, rate limiting, token tracking, and retries."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or GEMINI_API_KEY
        self.primary_model = model or DEFAULT_MODEL
        self.fallback_model = FALLBACK_MODEL
        self.token_usage = TokenUsage()
        self.has_api_key = bool(self.api_key and len(self.api_key.strip()) > 5)
        self._last_request_time = 0.0

    def generate_structured(
        self,
        prompt: str,
        system_instruction: str,
        response_schema: Type[BaseModel],
        use_fallback_model: bool = False
    ) -> Optional[Dict[str, Any]]:
        """
        Invokes Gemini with structured JSON output enforcing response_schema.
        Returns parsed JSON dictionary.
        """
        if not self.has_api_key:
            logger.debug("No GEMINI_API_KEY available; skipping live API call.")
            return None

        model_to_use = self.fallback_model if use_fallback_model else self.primary_model

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                # Rate limit pacing
                elapsed = time.time() - self._last_request_time
                if elapsed < GEMINI_REQUEST_DELAY_SECONDS:
                    time.sleep(GEMINI_REQUEST_DELAY_SECONDS - elapsed)

                result_json = self._call_gemini_api(
                    prompt=prompt,
                    system_instruction=system_instruction,
                    response_schema=response_schema,
                    model_name=model_to_use
                )
                self._last_request_time = time.time()

                if result_json:
                    return result_json

            except Exception as e:
                wait_time = RETRY_BACKOFF_BASE ** attempt
                logger.warning(
                    f"Gemini API attempt {attempt}/{MAX_RETRIES} failed with model '{model_to_use}': {e}. "
                    f"Retrying in {wait_time:.1f}s..."
                )
                time.sleep(wait_time)

        # If primary failed, try fallback model once
        if not use_fallback_model and self.fallback_model != self.primary_model:
            logger.info(f"Retrying with stronger fallback model: {self.fallback_model}")
            return self.generate_structured(
                prompt=prompt,
                system_instruction=system_instruction,
                response_schema=response_schema,
                use_fallback_model=True
            )

        return None

    def _call_gemini_api(
        self,
        prompt: str,
        system_instruction: str,
        response_schema: Type[BaseModel],
        model_name: str
    ) -> Optional[Dict[str, Any]]:
        """Internal call using google-genai or google-generativeai."""
        # Try modern google-genai SDK first
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=self.api_key)
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=response_schema,
                temperature=0.2
            )
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config
            )

            # Record approximate token usage if available
            if hasattr(response, "usage_metadata") and response.usage_metadata:
                pt = getattr(response.usage_metadata, "prompt_token_count", 0) or 0
                ct = getattr(response.usage_metadata, "candidates_token_count", 0) or 0
                self._track_tokens(pt, ct, model_name)

            if response.text:
                return json.loads(response.text)

        except ImportError:
            # Fallback to google.generativeai SDK
            import google.generativeai as gai

            gai.configure(api_key=self.api_key)
            model = gai.GenerativeModel(
                model_name=model_name,
                system_instruction=system_instruction,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.2
                }
            )
            response = model.generate_content(prompt)
            if response.text:
                return json.loads(response.text)

        return None

    def _track_tokens(self, prompt_tokens: int, completion_tokens: int, model_name: str):
        """Track token consumption and calculate approximate costs."""
        self.token_usage.prompt_tokens += prompt_tokens
        self.token_usage.completion_tokens += completion_tokens
        self.token_usage.total_tokens += (prompt_tokens + completion_tokens)

        # Approximate pricing per 1M tokens
        # Flash: $0.075 / $0.30 per 1M tokens
        # Pro: $1.25 / $5.00 per 1M tokens
        is_pro = "pro" in model_name.lower()
        prompt_rate = 1.25 if is_pro else 0.075
        completion_rate = 5.00 if is_pro else 0.30

        cost = (prompt_tokens * prompt_rate + completion_tokens * completion_rate) / 1_000_000
        self.token_usage.estimated_cost_usd += round(cost, 6)
