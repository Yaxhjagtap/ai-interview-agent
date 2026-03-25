# backend/app/services/llm_service.py
"""
LLM service module for OpenRouter API calls.
- Reads env vars dynamically on each call (survives .env reloads without restart).
- LRU-style in-memory response cache (256 entries) for repeated prompts.
- Retry logic with exponential back-off (2 retries).
- Structured return type: {ok, raw, json, error, cached, model_used}
"""

from __future__ import annotations

import os
import json
import re
import time
import hashlib
import logging
from typing import Any, Dict, List, Optional

import requests

logger = logging.getLogger(__name__)

# ─── Constants ────────────────────────────────────────────────────────────────
_OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
_DEFAULT_MODEL = "meta-llama/llama-3.3-70b-instruct"
_FAST_MODEL = "mistral-small"
_DEFAULT_TIMEOUT = 40   # seconds
_FAST_TIMEOUT = 12
_LONG_TIMEOUT = 60
_MAX_RETRIES = 2
_BACKOFF_BASE = 1.5     # seconds


# ─── Response cache (module-level, <256 entries) ───────────────────────────────
_response_cache: Dict[str, str] = {}


def _get_config() -> Dict[str, Any]:
    """Read config from env on every call so .env reloads are picked up."""
    return {
        "api_key":    os.getenv("OPENROUTER_API_KEY"),
        "url":        os.getenv("OPENROUTER_URL", _OPENROUTER_URL),
        "model":      os.getenv("OPENROUTER_MODEL", os.getenv("LLM_MODEL", _DEFAULT_MODEL)),
        "fast_model": os.getenv("OPENROUTER_FAST_MODEL", os.getenv("LLM_FAST_MODEL", _FAST_MODEL)),
        "timeout":         int(os.getenv("LLM_TIMEOUT", str(_DEFAULT_TIMEOUT))),
        "fast_timeout":    int(os.getenv("LLM_TIMEOUT_SHORT", str(_FAST_TIMEOUT))),
        "long_timeout":    int(os.getenv("LLM_TIMEOUT_LONG", str(_LONG_TIMEOUT))),
    }


class LLMError(RuntimeError):
    pass


# ─── JSON cleaning ─────────────────────────────────────────────────────────────
def _clean_llm_text(text: str) -> str:
    """Strip markdown fences and isolate first JSON object/array."""
    if not text:
        return ""
    t = text.strip()
    t = re.sub(r"^```(?:json)?\s*", "", t, flags=re.MULTILINE)
    t = re.sub(r"\s*```$", "", t, flags=re.MULTILINE)
    # find first { or [
    starts = [i for i in (t.find("{"), t.find("[")) if i != -1]
    if starts:
        first = min(starts)
        t = t[first:]
    # truncate after last matching brace
    last = max(t.rfind("}"), t.rfind("]"))
    if last != -1:
        t = t[: last + 1]
    return t.strip()


def try_parse_json(text: Optional[str]) -> Optional[Any]:
    """Best-effort JSON parse with multiple fallback strategies."""
    if not text:
        return None
    for candidate in (text, _clean_llm_text(text)):
        try:
            return json.loads(candidate)
        except Exception:
            pass
    # regex extraction fallback
    m = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", text)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            pass
    return None


# ─── Raw HTTP call with retry ─────────────────────────────────────────────────
def _call_raw(prompt: str, model: str, timeout: int, api_key: str, url: str) -> str:
    """Single HTTP call to OpenRouter. Raises LLMError on any failure."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://deepseek-interview-bot/1.0",
        "X-Title": "DeepSeek Interview Bot",
    }
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 1024,
    }
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=timeout)
    except requests.exceptions.Timeout:
        raise LLMError(f"Request timed out after {timeout}s")
    except requests.exceptions.ConnectionError as exc:
        raise LLMError(f"Connection error: {exc}")

    if resp.status_code >= 400:
        raise LLMError(f"HTTP {resp.status_code}: {resp.text[:600]}")

    try:
        data = resp.json()
    except Exception:
        raise LLMError(f"Non-JSON response: {resp.text[:300]}")

    # standard OpenAI-compatible shape
    if "choices" in data and data["choices"]:
        return data["choices"][0].get("message", {}).get("content", "").strip()
    # fallback: direct "response" key
    if isinstance(data.get("response"), str):
        return data["response"].strip()

    raise LLMError(f"Unexpected response shape: {list(data.keys())}")


def _call_with_retry(prompt: str, model: str, timeout: int, api_key: str, url: str) -> str:
    """Wrap _call_raw with exponential back-off retries."""
    last_exc: Optional[Exception] = None
    for attempt in range(1 + _MAX_RETRIES):
        try:
            return _call_raw(prompt, model, timeout, api_key, url)
        except LLMError as exc:
            last_exc = exc
            if attempt < _MAX_RETRIES:
                wait = _BACKOFF_BASE * (2 ** attempt)
                logger.warning("[llm] attempt %d failed (%s), retrying in %.1fs", attempt + 1, exc, wait)
                time.sleep(wait)
    raise LLMError(str(last_exc))


# ─── Cache helpers ─────────────────────────────────────────────────────────────
def _cache_key(prompt: str, model: str) -> str:
    return hashlib.sha256(f"{model}|{prompt}".encode()).hexdigest()


def _cache_get(key: str) -> Optional[str]:
    return _response_cache.get(key)


def _cache_set(key: str, value: str) -> None:
    global _response_cache
    if len(_response_cache) >= 256:
        # evict oldest (FIFO)
        oldest_key = next(iter(_response_cache))
        del _response_cache[oldest_key]
    _response_cache[key] = value


# ─── Public API ───────────────────────────────────────────────────────────────
def generate_with_llm(
    prompt: str,
    *,
    model: Optional[str] = None,
    timeout: Optional[int] = None,
    use_cache: bool = True,
    fast: bool = False,
) -> Dict[str, Any]:
    """
    Call OpenRouter and return a structured result.

    Returns:
        {
            "ok":         bool,
            "raw":        str,
            "json":       dict | list | None,
            "error":      str | None,
            "cached":     bool,
            "model_used": str,
        }
    """
    cfg = _get_config()
    api_key = cfg["api_key"]
    if not api_key:
        msg = "OPENROUTER_API_KEY not configured in environment"
        logger.error("[llm] %s", msg)
        return {"ok": False, "raw": "", "json": None, "error": msg, "cached": False, "model_used": ""}

    chosen_model = model or (cfg["fast_model"] if fast else cfg["model"])
    chosen_timeout = timeout or (cfg["fast_timeout"] if fast else cfg["timeout"])

    cache_key = _cache_key(prompt, chosen_model) if use_cache else ""

    # Cache hit
    if use_cache:
        cached_raw = _cache_get(cache_key)
        if cached_raw is not None:
            logger.debug("[llm] cache hit model=%s", chosen_model)
            return {
                "ok": True,
                "raw": cached_raw,
                "json": try_parse_json(cached_raw),
                "error": None,
                "cached": True,
                "model_used": chosen_model,
            }

    # Remote call
    raw = ""
    try:
        raw = _call_with_retry(prompt, chosen_model, chosen_timeout, api_key, cfg["url"])
        if use_cache and cache_key:
            _cache_set(cache_key, raw)

        parsed = try_parse_json(raw)
        if parsed:
            logger.info("[llm] OK model=%s (json parsed)", chosen_model)
        else:
            logger.warning("[llm] OK model=%s but JSON parse failed; raw[:200]=%s", chosen_model, raw[:200])

        return {
            "ok": True,
            "raw": raw,
            "json": parsed,
            "error": None,
            "cached": False,
            "model_used": chosen_model,
        }
    except LLMError as exc:
        logger.error("[llm] LLMError model=%s: %s", chosen_model, exc)
        return {"ok": False, "raw": raw, "json": None, "error": str(exc), "cached": False, "model_used": chosen_model}
    except Exception as exc:
        logger.exception("[llm] unexpected error model=%s", chosen_model)
        return {"ok": False, "raw": raw, "json": None, "error": str(exc), "cached": False, "model_used": chosen_model}


def unwrap_llm_json(llm_resp: Dict[str, Any]) -> Optional[Any]:
    """
    Extract the structured JSON payload from a generate_with_llm result.
    Handles deeply-nested OpenRouter wrapper formats gracefully.
    """
    if not isinstance(llm_resp, dict):
        return None

    parsed = llm_resp.get("json")
    raw = llm_resp.get("raw", "") or ""

    KNOWN_KEYS = {"core_skills", "projects", "questions", "follow_up",
                  "expected_answer", "comparison", "overall_score"}

    if isinstance(parsed, dict):
        if KNOWN_KEYS & set(parsed.keys()):
            return parsed
        # unwrap nested message/response
        for key in ("message", "result", "output"):
            sub = parsed.get(key)
            if isinstance(sub, dict):
                for content_key in ("content", "text", "response"):
                    content = sub.get(content_key)
                    if isinstance(content, str):
                        inner = try_parse_json(content)
                        if inner is not None:
                            return inner
        if isinstance(parsed.get("response"), str):
            inner = try_parse_json(parsed["response"])
            if inner is not None:
                return inner
        # OpenAI choices wrapper
        choices = parsed.get("choices")
        if isinstance(choices, list) and choices:
            first = choices[0]
            if isinstance(first, dict):
                content = (first.get("message") or {}).get("content") or first.get("text")
                if isinstance(content, str):
                    inner = try_parse_json(content)
                    if inner is not None:
                        return inner

    if isinstance(parsed, (list, dict)):
        return parsed

    # fall back to raw
    return try_parse_json(raw)
