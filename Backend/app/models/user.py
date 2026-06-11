from datetime import datetime, timezone

from beanie import Document
from pydantic import EmailStr, Field

from app.schemas.user import UserProfile


class UserDocument(Document):
    email: EmailStr
    password_hash: str
    profile: UserProfile = Field(default_factory=lambda: UserProfile())
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = ["email"]
