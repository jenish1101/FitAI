from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.common import APIModel

router = APIRouter(tags=["health"])


class HealthResponse(APIModel):
    status: str
    app: str
    env: str


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(status="ok", app=settings.app_name, env=settings.app_env)
