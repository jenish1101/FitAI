from datetime import datetime, timezone

from beanie import Document
from pydantic import EmailStr, Field


class PasswordResetDocument(Document):
    email: EmailStr
    code_hash: str
    expires_at: datetime
    used: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "password_resets"
        indexes = ["email", "expires_at"]
