from fastapi import APIRouter, HTTPException, status

from app.core.config import get_settings
from app.core.deps import CurrentUser
from app.schemas.common import MessageResponse
from app.schemas.user import (
    AuthResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UserProfile,
)
from app.services.password_reset_service import (
    GENERIC_RESET_MESSAGE,
    request_password_reset,
    reset_password_with_code,
)
from app.services.user_service import (
    authenticate_user,
    build_auth_response,
    ensure_user_has_data,
    register_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
async def register(payload: RegisterRequest) -> AuthResponse:
    try:
        user = await register_user(payload)
        return build_auth_response(user)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": str(exc)},
        ) from exc


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest) -> AuthResponse:
    try:
        user = await authenticate_user(payload.email, payload.password)
        await ensure_user_has_data(user)
        return build_auth_response(user)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"message": str(exc)},
        ) from exc


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: CurrentUser) -> UserProfile:
    return current_user.profile


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(payload: ForgotPasswordRequest) -> ForgotPasswordResponse:
    settings = get_settings()
    code = await request_password_reset(payload.email)

    response = ForgotPasswordResponse(message=GENERIC_RESET_MESSAGE)
    if settings.is_development and code is not None:
        response.reset_code = code
    return response


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(payload: ResetPasswordRequest) -> MessageResponse:
    try:
        await reset_password_with_code(payload.email, payload.code, payload.new_password)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": str(exc)},
        ) from exc
    return MessageResponse(message="Password updated successfully. You can sign in now.")
