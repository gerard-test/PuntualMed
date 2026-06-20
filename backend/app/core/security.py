import uuid
from dataclasses import dataclass
from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import get_settings

_ALGORITHM = "ES256"
_AUDIENCE = "authenticated"
_bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class CurrentUser:
    # Identidad derivada del JWT verificado de Supabase
    id: uuid.UUID
    email: str | None


@lru_cache
def get_jwks_client() -> jwt.PyJWKClient:
    # Cliente JWKS cacheado: descarga y cachea las llaves publicas de Supabase.
    return jwt.PyJWKClient(get_settings().supabase_jwks_url)


def decode_supabase_token(token: str, jwk_client: jwt.PyJWKClient, issuer: str) -> dict:
    # Verifica firma ES256 (llave publica elegida por el `kid`), audience e issuer.
    signing_key = jwk_client.get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=[_ALGORITHM],
        audience=_AUDIENCE,
        issuer=issuer,
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> CurrentUser:
    # Contrato de auth: token valido -> CurrentUser; cualquier fallo -> 401
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="missing token"
        )
    settings = get_settings()
    try:
        payload = decode_supabase_token(
            credentials.credentials, get_jwks_client(), settings.supabase_issuer
        )
    except jwt.PyJWTError as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token"
        ) from err
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token"
        )
    try:
        user_id = uuid.UUID(sub)
    except ValueError as err:
        # Un sub con firma valida pero formato no-UUID es un token invalido
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token"
        ) from err
    return CurrentUser(id=user_id, email=payload.get("email"))
