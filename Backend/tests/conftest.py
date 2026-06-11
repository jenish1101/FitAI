from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.core.config import get_settings
from app.core.database import close_database_connection, connect_to_database
from app.main import app
from app.models.password_reset import PasswordResetDocument
from app.models.nutrition import FoodLogDocument
from app.models.progress import BodyMetricDocument
from app.models.reference import ChallengeDocument, ExerciseDocument, FoodDocument
from app.models.social import UserChallengeDocument
from app.models.user import UserDocument
from app.models.workout import WorkoutLogDocument, WorkoutPlanDocument
from app.seed.runner import run_seed


@pytest_asyncio.fixture(autouse=True)
async def setup_database() -> AsyncGenerator[None, None]:
    get_settings.cache_clear()
    await connect_to_database()

    collections = [
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
    ]
    for collection in collections:
        await collection.get_motor_collection().delete_many({})

    await run_seed()
    yield
    await close_database_connection()
    get_settings.cache_clear()


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as async_client:
        yield async_client
