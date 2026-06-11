from app.schemas.common import APIModel, ErrorResponse, MessageResponse
from app.schemas.nutrition import FoodEntry, FoodEntryCreate, FoodItem
from app.schemas.progress import BodyMetric, BodyMetricCreate
from app.schemas.social import Challenge, ChallengeProgressUpdate
from app.schemas.user import (
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    UserProfile,
    UserProfileUpdate,
)
from app.schemas.workout import (
    Exercise,
    WorkoutLog,
    WorkoutLogCreate,
    WorkoutPlan,
    WorkoutPlanUpdate,
)

__all__ = [
    "APIModel",
    "MessageResponse",
    "ErrorResponse",
    "UserProfile",
    "UserProfileUpdate",
    "LoginRequest",
    "RegisterRequest",
    "AuthResponse",
    "Exercise",
    "WorkoutPlan",
    "WorkoutPlanUpdate",
    "WorkoutLog",
    "WorkoutLogCreate",
    "FoodItem",
    "FoodEntry",
    "FoodEntryCreate",
    "BodyMetric",
    "BodyMetricCreate",
    "Challenge",
    "ChallengeProgressUpdate",
]
