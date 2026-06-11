from datetime import datetime, timezone

from app.core.ids import doc_id
from app.core.security import create_access_token, hash_password, verify_password
from app.models.nutrition import FoodLogDocument
from app.models.progress import BodyMetricDocument
from app.models.social import UserChallengeDocument
from app.models.user import UserDocument
from app.models.workout import WorkoutLogDocument, WorkoutPlanDocument
from app.schemas.user import AuthResponse, RegisterRequest, UserProfile, UserProfileUpdate
from app.seed.reference_data import CHALLENGES
from app.services.workout_generator import (
    generate_body_metrics,
    generate_food_logs,
    generate_workout_logs,
    generate_workout_plans,
)


def build_auth_response(user: UserDocument) -> AuthResponse:
    token = create_access_token(str(user.id))
    return AuthResponse(token=token, user=user.profile)


async def register_user(payload: RegisterRequest) -> UserDocument:
    existing = await UserDocument.find_one(UserDocument.email == payload.email)
    if existing:
        raise ValueError("Email already registered")

    profile = UserProfile(
        name=payload.name,
        email=str(payload.email),
        member_since=datetime.now(timezone.utc).date().isoformat(),
        onboarding_complete=False,
        total_workouts=0,
        streak=0,
    )
    user = UserDocument(
        email=payload.email,
        password_hash=hash_password(payload.password),
        profile=profile,
    )
    await user.insert()
    await seed_user_data(user)
    return user


async def authenticate_user(email: str, password: str) -> UserDocument:
    user = await UserDocument.find_one(UserDocument.email == email)
    if user is None or not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")
    return user


async def update_user_profile(user: UserDocument, payload: UserProfileUpdate) -> UserProfile:
    updates = payload.model_dump(by_alias=True, exclude_none=True)
    profile_data = user.profile.model_dump(by_alias=True)
    profile_data.update(updates)
    user.profile = UserProfile.model_validate(profile_data)
    await user.save()
    return user.profile


async def seed_user_data(user: UserDocument) -> None:
    plans = generate_workout_plans(user.profile)
    for plan in plans:
        await WorkoutPlanDocument(user_id=doc_id(user), data=plan).insert()

    for log in generate_workout_logs():
        await WorkoutLogDocument(user_id=doc_id(user), data=log).insert()

    for entry in generate_food_logs():
        await FoodLogDocument(user_id=doc_id(user), data=entry).insert()

    for metric in generate_body_metrics():
        await BodyMetricDocument(user_id=doc_id(user), data=metric).insert()

    for challenge in CHALLENGES:
        await UserChallengeDocument(
            user_id=doc_id(user),
            challenge_id=challenge.id,
            progress=challenge.progress,
        ).insert()


async def ensure_user_has_data(user: UserDocument) -> None:
    plan_count = await WorkoutPlanDocument.find(WorkoutPlanDocument.user_id == user.id).count()
    if plan_count == 0:
        await seed_user_data(user)
