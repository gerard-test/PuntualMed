import time
import uuid
from types import SimpleNamespace

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

import app.core.security as security
from app.core.config import get_settings
from app.core.security import (
    CurrentUser,
    decode_supabase_token,
    get_current_user,
)

# Issuer derivado de SUPABASE_URL en conftest (https://test.supabase.co)
_ISSUER = "https://test.supabase.co/auth/v1"
_KID = "test-key"
# Par de llaves EC P-256 de prueba: firma ES256 igual que las llaves de Supabase
_private_key = ec.generate_private_key(ec.SECP256R1())


class _FakeJWKClient:
    # Simula PyJWKClient: entrega la llave publica de prueba sin tocar la red
    def __init__(self, public_key) -> None:
        self._public_key = public_key

    def get_signing_key_from_jwt(self, token: str) -> SimpleNamespace:
        return SimpleNamespace(key=self._public_key)


_jwk_client = _FakeJWKClient(_private_key.public_key())


def _make_token(
    sub: str,
    *,
    exp_delta: int = 3600,
    aud: str = "authenticated",
    iss: str = _ISSUER,
    key=_private_key,
) -> str:
    payload = {
        "sub": sub,
        "aud": aud,
        "iss": iss,
        "email": "iris@example.com",
        "exp": int(time.time()) + exp_delta,
    }
    return jwt.encode(payload, key, algorithm="ES256", headers={"kid": _KID})


def test_decode_valid_token_returns_claims():
    sub = str(uuid.uuid4())
    payload = decode_supabase_token(_make_token(sub), _jwk_client, _ISSUER)
    assert payload["sub"] == sub


def test_decode_expired_token_raises():
    with pytest.raises(jwt.PyJWTError):
        decode_supabase_token(
            _make_token(str(uuid.uuid4()), exp_delta=-10), _jwk_client, _ISSUER
        )


def test_decode_bad_audience_raises():
    with pytest.raises(jwt.PyJWTError):
        decode_supabase_token(
            _make_token(str(uuid.uuid4()), aud="other"), _jwk_client, _ISSUER
        )


def test_decode_bad_issuer_raises():
    with pytest.raises(jwt.PyJWTError):
        decode_supabase_token(
            _make_token(str(uuid.uuid4()), iss="https://evil.example/auth/v1"),
            _jwk_client,
            _ISSUER,
        )


def test_decode_wrong_key_raises():
    other_key = ec.generate_private_key(ec.SECP256R1())
    with pytest.raises(jwt.PyJWTError):
        decode_supabase_token(
            _make_token(str(uuid.uuid4()), key=other_key), _jwk_client, _ISSUER
        )


async def test_get_current_user_valid(monkeypatch):
    get_settings.cache_clear()
    monkeypatch.setattr(security, "get_jwks_client", lambda: _jwk_client)
    sub = str(uuid.uuid4())
    creds = HTTPAuthorizationCredentials(
        scheme="Bearer", credentials=_make_token(sub)
    )
    user = await get_current_user(creds)
    assert isinstance(user, CurrentUser)
    assert user.id == uuid.UUID(sub)
    assert user.email == "iris@example.com"


async def test_get_current_user_missing_credentials_raises_401():
    with pytest.raises(HTTPException) as exc:
        await get_current_user(None)
    assert exc.value.status_code == 401


async def test_get_current_user_invalid_token_raises_401(monkeypatch):
    get_settings.cache_clear()
    monkeypatch.setattr(security, "get_jwks_client", lambda: _jwk_client)
    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="not-a-jwt")
    with pytest.raises(HTTPException) as exc:
        await get_current_user(creds)
    assert exc.value.status_code == 401


async def test_get_current_user_non_uuid_sub_raises_401(monkeypatch):
    # Firma valida pero sub no-UUID -> 401, no 500
    get_settings.cache_clear()
    monkeypatch.setattr(security, "get_jwks_client", lambda: _jwk_client)
    creds = HTTPAuthorizationCredentials(
        scheme="Bearer", credentials=_make_token("not-a-uuid")
    )
    with pytest.raises(HTTPException) as exc:
        await get_current_user(creds)
    assert exc.value.status_code == 401
