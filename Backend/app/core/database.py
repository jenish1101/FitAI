import logging
from urllib.parse import urlparse

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import get_settings
from app.models.password_reset import PasswordResetDocument
from app.models.nutrition import FoodLogDocument
from app.models.progress import BodyMetricDocument
from app.models.reference import ChallengeDocument, ExerciseDocument, FoodDocument
from app.models.social import UserChallengeDocument
from app.models.user import UserDocument
from app.models.workout import WorkoutLogDocument, WorkoutPlanDocument

logger = logging.getLogger(__name__)

_client: AsyncIOMotorClient | None = None


def _safe_mongo_target(url: str, db_name: str) -> str:
    """Return a log-safe MongoDB target (no credentials)."""
    parsed = urlparse(url)
    host = parsed.hostname or "localhost"
    port = f":{parsed.port}" if parsed.port else ""
    return f"{host}{port}/{db_name}"


async def connect_to_database() -> None:
    global _client
    settings = get_settings()
    target = _safe_mongo_target(settings.mongodb_url, settings.mongodb_db_name)

    logger.info("Connecting to MongoDB at %s ...", target)
    _client = AsyncIOMotorClient(settings.mongodb_url)
    database = _client[settings.mongodb_db_name]

    await _client.admin.command("ping")
    logger.info("MongoDB connected successfully → %s", target)

    await init_beanie(
        database=database,
        document_models=[
            UserDocument,
            PasswordResetDocument,
            ExerciseDocument,
            FoodDocument,
            ChallengeDocument,
            WorkoutPlanDocument,
            WorkoutLogDocument,
            FoodLogDocument,
            BodyMetricDocument,
            UserChallengeDocument,
        ],
    )
    logger.info("Beanie ODM initialized (%d document models)", 10)


async def close_database_connection() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
        logger.info("MongoDB connection closed")
