from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment / .env via Pydantic Settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = Field(default="FitAI API", min_length=1)
    app_env: Literal["development", "staging", "production"] = "development"
    api_v1_prefix: str = Field(default="/v1", pattern=r"^/")
    debug: bool = True

    host: str = Field(default="0.0.0.0")
    port: int = Field(default=8000, ge=1, le=65535)

    mongodb_url: str = Field(default="mongodb://localhost:27017", min_length=1)
    mongodb_db_name: str = Field(default="fitai", min_length=1)

    secret_key: str = Field(default="dev-secret-change-in-production", min_length=16)
    access_token_expire_minutes: int = Field(default=60 * 24 * 7, ge=5, le=60 * 24 * 30)

    cors_origins: str = (
        "http://localhost:8081,http://localhost:19006,"
        "http://127.0.0.1:8081,http://127.0.0.1:19006"
    )

    seed_reference_data: bool = True
    seed_demo_user: bool = True
    demo_user_email: str = Field(default="demo@fitai.app")
    demo_user_password: str = Field(default="demo1234", min_length=6)

    @field_validator("api_v1_prefix")
    @classmethod
    def normalize_api_prefix(cls, value: str) -> str:
        return value.rstrip("/") or "/v1"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()
