import base64
import hashlib
import json
from datetime import date
from decimal import Decimal
from typing import Any, Generic, TypeVar

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from sqlalchemy.types import Text, TypeDecorator

from .config import settings

T = TypeVar("T")
PREFIX = "v1:"


def _key() -> bytes:
    configured = settings.encryption_key.strip()
    if not configured:
        if settings.environment == "production":
            raise RuntimeError("MONEYFLOW_ENCRYPTION_KEY must be configured in production")
        return hashlib.sha256(settings.jwt_secret.encode()).digest()
    try:
        key = base64.urlsafe_b64decode(configured.encode())
    except Exception as cause:
        raise RuntimeError("MONEYFLOW_ENCRYPTION_KEY must be URL-safe base64") from cause
    if len(key) != 32:
        raise RuntimeError("MONEYFLOW_ENCRYPTION_KEY must decode to exactly 32 bytes")
    return key


def encrypt(value: Any) -> str:
    payload = json.dumps(value, separators=(",", ":"), ensure_ascii=False).encode()
    # The nonce must be unique for every value under one key.
    import os
    nonce = os.urandom(12)
    ciphertext = AESGCM(_key()).encrypt(nonce, payload, None)
    return PREFIX + base64.urlsafe_b64encode(nonce + ciphertext).decode()


def decrypt(raw: str | None) -> Any:
    if raw is None:
        return None
    if not raw.startswith(PREFIX):
        return raw  # Allows the one-time backfill to read legacy plaintext safely.
    encoded = base64.urlsafe_b64decode(raw[len(PREFIX):].encode())
    return json.loads(AESGCM(_key()).decrypt(encoded[:12], encoded[12:], None).decode())


class EncryptedValue(TypeDecorator, Generic[T]):
    impl = Text
    cache_ok = True

    def process_bind_param(self, value: T | None, dialect: Any) -> str | None:
        if value is None:
            return None
        return encrypt(self.to_json(value))

    def process_result_value(self, value: str | None, dialect: Any) -> T | None:
        if value is None:
            return None
        return self.from_json(decrypt(value))

    def to_json(self, value: T) -> Any:
        return value

    def from_json(self, value: Any) -> T:
        return value


class EncryptedString(EncryptedValue[str]):
    pass


class EncryptedDecimal(EncryptedValue[Decimal]):
    def to_json(self, value: Decimal) -> str:
        return str(value)

    def from_json(self, value: Any) -> Decimal:
        return Decimal(str(value))


class EncryptedDate(EncryptedValue[date]):
    def to_json(self, value: date) -> str:
        return value.isoformat()

    def from_json(self, value: Any) -> date:
        return date.fromisoformat(str(value))
