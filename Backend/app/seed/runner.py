import logging
from datetime import datetime, timezone

from app.core.config import get_settings

logger = logging.getLogger(__name__)
from app.core.security import hash_password
from app.models.reference import ChallengeDocument, ExerciseDocument, FoodDocument
from app.models.user import UserDocument
from app.schemas.user import UserProfile
from app.seed.reference_data import CHALLENGES, EXERCISES, FOODS
from app.services.user_service import seed_user_data


async def seed_reference_data() -> None:
    exercise_count = await ExerciseDocument.count()
    if exercise_count == 0:
        for exercise in EXERCISES:
            await ExerciseDocument(exercise_id=exercise.id, data=exercise).insert()

    food_count = await FoodDocument.count()
    if food_count == 0:
        for food in FOODS:
            await FoodDocument(name=food.name, data=food).insert()

    challenge_count = await ChallengeDocument.count()
    if challenge_count == 0:
        for challenge in CHALLENGES:
            await ChallengeDocument(challenge_id=challenge.id, data=challenge).insert()


async def seed_demo_user() -> None:
    settings = get_settings()
    existing = await UserDocument.find_one(UserDocument.email == settings.demo_user_email)
    if existing:
        return

    profile = UserProfile(
        name="Demo User",
        email=settings.demo_user_email,
        member_since=datetime.now(timezone.utc).date().isoformat(),
    )
    user = UserDocument(
        email=settings.demo_user_email,
        password_hash=hash_password(settings.demo_user_password),
        profile=profile,
    )
    await user.insert()
    await seed_user_data(user)


async def run_seed() -> None:
    settings = get_settings()
    if settings.seed_reference_data:
        await seed_reference_data()
        logger.info("Reference data seed complete (exercises, foods, challenges)")
    if settings.seed_demo_user:
        await seed_demo_user()
        logger.info("Demo user ready → %s", settings.demo_user_email)
