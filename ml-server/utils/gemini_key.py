"""
utils/gemini_key.py — Dynamic Gemini API key resolution.

Tries to fetch the active key from the Node.js admin API (cached for TTL seconds).
Falls back to GEMINI_API_KEY env var if Node is unavailable.

Resolves config from env directly to avoid bootstrap ordering issues.
"""

import os
import time
import threading
import requests
from dotenv import load_dotenv

# Ensure .env is loaded from ml-server/ and fallback to server/
_UTILS_DIR = os.path.dirname(os.path.abspath(__file__))
_ML_DIR = os.path.dirname(_UTILS_DIR)
_ROOT_DIR = os.path.dirname(_ML_DIR)
load_dotenv(os.path.join(_ML_DIR, ".env"))
load_dotenv(os.path.join(_ROOT_DIR, "server", ".env"))

_CACHE_TTL = int(os.getenv("GEMINI_API_KEY_TTL", "30"))

_lock:   threading.Lock = threading.Lock()
_cached: dict           = {"value": None, "ts": 0.0}


def _get_node_url() -> str:
    return os.getenv("NODE_SERVER_URL", "http://localhost:4000")


def _get_internal_secret() -> str:
    return os.getenv("INTERNAL_SERVICE_SECRET") or os.getenv("JWT_SECRET", "")


def _fetch_from_node() -> str | None:
    try:
        node_url = _get_node_url()
        secret = _get_internal_secret()
        resp = requests.get(
            f"{node_url}/api/admin/api-keys/internal/active-key/gemini",
            headers={"x-internal-secret": secret},
            timeout=3,
        )
        if resp.status_code == 200:
            return resp.json().get("value")
    except Exception:
        pass
    return None


def get_gemini_key() -> str | None:
    """Return the current active Gemini key, cached for _CACHE_TTL seconds."""
    with _lock:
        now = time.time()
        if _cached["value"] and (now - _cached["ts"]) < _CACHE_TTL:
            return _cached["value"]
        key = os.getenv("GEMINI_API_KEY") or _fetch_from_node()
        if key:
            _cached["value"] = key
            _cached["ts"]    = now
        return key


def get_gemini_client():
    """Return a configured google.genai client, raising if no key available."""
    from google import genai
    key = get_gemini_key()
    if not key:
        raise ValueError(
            "No active Gemini API key. Configure one via Admin Panel → API Keys."
        )
    return genai.Client(api_key=key)


def gemini_generate(prompt: str) -> str:
    """Single-shot text generation through Gemini's Interactions REST API."""
    key = get_gemini_key()
    if not key:
        raise ValueError("No active Gemini API key.")

    current_model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
    candidate_models = list(dict.fromkeys([
        current_model,
        "gemini-flash-lite-latest",
        "gemini-3.1-flash-lite-preview",
        "gemini-3.5-flash",
    ]))
    last_exc = None

    for model in candidate_models:
        try:
            response = requests.post(
                "https://generativelanguage.googleapis.com/v1beta/interactions",
                params={"key": key},
                json={"model": model, "input": prompt},
                timeout=30,
            )
            response.raise_for_status()
            payload = response.json()
            text = payload.get("output_text")
            if not isinstance(text, str) or not text.strip():
                for step in payload.get("steps") or []:
                    if step.get("type") == "model_output":
                        for c in step.get("content") or []:
                            if c.get("text"):
                                text = c["text"]
                                break
            if not isinstance(text, str) or not text.strip():
                text = (
                    payload.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                )
            if isinstance(text, str) and text.strip():
                return text
        except requests.RequestException as exc:
            last_exc = exc
            if exc.response is not None and exc.response.status_code in (503, 429, 404):
                continue
            detail = exc.response.text[:300] if exc.response is not None else str(exc)
            raise RuntimeError(f"Gemini request failed: {detail}") from exc

    detail = last_exc.response.text[:300] if (last_exc and last_exc.response is not None) else str(last_exc)
    raise RuntimeError(f"Gemini request failed: {detail}")
