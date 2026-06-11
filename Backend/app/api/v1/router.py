from fastapi import APIRouter

from app.api.v1.endpoints import auth, exercises, health, nutrition, progress, social, users, workouts
from app.core.config import get_settings
from app.schemas.common import APIModel

api_router = APIRouter()


class ApiInfoResponse(APIModel):
    name: str
    version: str
    env: str
    docs: str
    health: str
    openapi: str


@api_router.get("", response_model=ApiInfoResponse, tags=["health"])
async def api_info() -> ApiInfoResponse:
    settings = get_settings()
    prefix = settings.api_v1_prefix
    return ApiInfoResponse(
        name=settings.app_name,
        version="1.0.0",
        env=settings.app_env,
        docs="/docs",
        health=f"{prefix}/health",
        openapi="/openapi.json",
    )


api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(workouts.router)
api_router.include_router(exercises.router)
api_router.include_router(nutrition.router)
api_router.include_router(progress.router)
api_router.include_router(social.router)
