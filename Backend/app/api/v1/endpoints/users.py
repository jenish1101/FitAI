from fastapi import APIRouter

from app.core.deps import CurrentUser
from app.schemas.user import UserProfile, UserProfileUpdate
from app.services.user_service import update_user_profile

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: CurrentUser) -> UserProfile:
    return current_user.profile


@router.put("/profile", response_model=UserProfile)
async def put_profile(
    payload: UserProfileUpdate,
    current_user: CurrentUser,
) -> UserProfile:
    return await update_user_profile(current_user, payload)
