# backend/app/services/llm_service.py
import os
import json
import requests
import re
from typing import Any, Dict, Optional
from functools import lru_cache
import hashlib

# --- OpenRouter / LLM config (tweak via .env) ---
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = os.getenv("OPENROUTER_URL", "https://openrouter.ai/api/v1/chat/completions")

# model to use for general evals; override via env or per-call
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", os.getenv("LLM_MODEL", "meta-llama/llama-3.3-70b-instruct"))

# fast (smaller / cheaper) model to use for follow-ups and quick tasks
OPENROUTER_FAST_MODEL = os.getenv("OPENROUTER_FAST_MODEL", os.getenv("LLM_FAST_MODEL", "mistral-small"))

# timeouts (seconds)
DEFAULT_TIMEOUT = int(os.getenv("LLM_TIMEOUT", "40"))
FAST_TIMEOUT = int(os.getenv("LLM_TIMEOUT_SHORT", "8"))   # shorter for follow-ups
LONG_TIMEOUT = int(os.getenv("LLM_TIMEOUT_LONG", "45"))   # for heavier tasks

if not OPENROUTER_API_KEY:
    print("WARNING: OPENROUTER_API_KEY not set. LLM calls will fail until set.")

class LLMError(RuntimeError):
    pass

def _clean_model_output(text: str) -> str:
    if not text:
        return ""
    t = text.strip()
    t = t.replace("```json", "").replace("```", "")
    # cut leading chatter
    first_idx_candidates = [i for i in (t.find("{"), t.find("[")) if i != -1]
    if first_idx_candidates:
        first_idx = min(first_idx_candidates)
        if first_idx > 0:
            t = t[first_idx:]
    # cut trailing after last brace/bracket
    last_curly = t.rfind("}")
    last_square = t.rfind("]")
    last = max(last_curly, last_square)
    if last != -1:
        t = t[: last + 1]
    return t.strip()

def _try_parse_json(text: str) -> Optional[Any]:
    if not text:
        return None
    # direct
    try:
        return json.loads(text)
    except Exception:
        pass
    # cleaned
    cleaned = _clean_model_output(text)
    try:
        return json.loads(cleaned)
    except Exception:
        pass
    # regex fallback
    m = re.search(r"(\{(?:.|\n)*\}|\[(?:.|\n)*\])", text)
    if m:
        candidate = m.group(1)
        try:
            return json.loads(candidate)
        except Exception:
            pass
    return None

# LRU cache for repeated prompts (very common for follow-up patterns)
@lru_cache(maxsize=256)
def _cached_openrouter_response(prompt_hash: str, model: str, timeout: int) -> str:
    """
    Internal helper used by generate_with_llm_cached to call OpenRouter.
    prompt_hash is actually a hex hash of (prompt + model) to make this cache keyable.
    """
    # We don't have the prompt text here (it's hashed) — in practice we call
    # generate_with_llm_cached which uses the full prompt and caches by prompt_hash.
    raise RuntimeError("This function is only a placeholder for cache keying.")

def _call_openrouter_raw(prompt: str, model: str, timeout: int) -> str:
    if not OPENROUTER_API_KEY:
        raise LLMError("OPENROUTER_API_KEY not configured in environment")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "deepseek-interview-backend/1.0"
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.0,
        # quick replies prefer fewer tokens, keep defaults minimal
    }

    try:
        r = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=timeout)
        if r.status_code >= 400:
            raise LLMError(f"HTTP {r.status_code} from OpenRouter: {r.text[:1000]}")
        json_obj = r.json()
        # typical shape: {"choices":[{"message":{"role":"assistant","content":"..."}}], ...}
        if "choices" in json_obj and isinstance(json_obj["choices"], list) and json_obj["choices"]:
            msg = json_obj["choices"][0].get("message", {})
            return msg.get("content", "").strip()
        # fallback: sometimes direct text in response
        if isinstance(json_obj, dict) and "response" in json_obj:
            return str(json_obj.get("response", "")).strip()
        raise LLMError(f"Unexpected OpenRouter format: {r.text[:500]}")
    except requests.exceptions.Timeout as e:
        raise LLMError(f"Timeout ({timeout}s) hitting OpenRouter")
    except requests.exceptions.ConnectionError as e:
        raise LLMError(f"Connection error reaching OpenRouter: {e}")
    except LLMError:
        raise
    except Exception as e:
        raise LLMError(f"Error contacting OpenRouter: {e}")

def generate_with_llm(prompt: str, model: Optional[str] = None, timeout: int = DEFAULT_TIMEOUT, use_cache: bool = True) -> Dict[str, Any]:
    """
    Standard wrapper for LLM calls.

    - prompt: user prompt (string)
    - model: override model; if None uses OPENROUTER_MODEL
    - timeout: request timeout in seconds
    - use_cache: whether to try LRU-cache for identical prompts (recommended True for follow-ups)

    Returns: {"ok": bool, "raw": str, "json": dict|list|None, "error": str|None}
    """
    chosen_model = model or OPENROUTER_MODEL
    raw = ""
    try:
        if use_cache:
            # create a stable key of prompt+model
            h = hashlib.sha256((chosen_model + "|" + prompt).encode("utf-8")).hexdigest()
            # Python's lru_cache needs a callable with same signature; we implement simple cache here:
            # try to read from global lru_cache by leveraging decorated dummy if set; simpler: use an in-memory dict
            # but to keep things simple and avoid global mutable, we use functools.lru_cache on a tiny wrapper below.
            # We will implement a quick ad-hoc caching: use a small module-level dict.
            # (This avoids pickling or caching large objects.)
            if not hasattr(generate_with_llm, "_simple_cache"):
                generate_with_llm._simple_cache = {}
            cached = generate_with_llm._simple_cache.get(h)
            if cached is not None:
                return {"ok": True, "raw": cached, "json": _try_parse_json(cached), "error": None}
            # not cached -> call remote
            raw = _call_openrouter_raw(prompt, chosen_model, timeout)
            # store (keep small)
            store = generate_with_llm._simple_cache
            if len(store) > 256:
                # drop oldest (not perfect LRU, but keeps memory stable)
                store.pop(next(iter(store)))
            store[h] = raw
        else:
            raw = _call_openrouter_raw(prompt, chosen_model, timeout)

        parsed = _try_parse_json(raw)
        if parsed:
            print("✅ OpenRouter JSON parsed successfully")
        else:
            print("⚠️ OpenRouter responded but JSON parsing failed — raw preview:", (raw or "")[:400])

        return {"ok": True, "raw": raw, "json": parsed, "error": None}
    except LLMError as e:
        print(f"❌ OpenRouter LLMError: {e}")
        return {"ok": False, "raw": raw or "", "json": None, "error": str(e)}
    except Exception as e:
        print(f"❌ Unexpected OpenRouter error: {e}")
        return {"ok": False, "raw": raw or "", "json": None, "error": str(e)}
