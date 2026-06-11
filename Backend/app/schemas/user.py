from pydantic import EmailStr, Field, field_validator

from app.schemas.common import APIModel
from app.schemas.fields import CamelField


class UserProfile(APIModel):
    name: str = Field(default="Alex Johnson", min_length=1, max_length=120)
    email: str = Field(default="alex@fitai.app", min_length=3)
    age: int = Field(default=28, ge=13, le=120)
    gender: str = "Male"
    height: float = 178
    weight: float = 82
    goal: str = "Gain muscle"
    experience: str = "Intermediate"
    environment: str = "Gym"
    frequency: str = "4-5 days"
    injuries: list[str] = Field(default_factory=list)
    calorie_target: int = CamelField(default=2800, alias="calorieTarget")
    protein_target: int = CamelField(default=164, alias="proteinTarget")
    carbs_target: int = CamelField(default=315, alias="carbsTarget")
    fats_target: int = CamelField(default=78, alias="fatsTarget")
    workout_split: str = CamelField(default="Push/Pull/Legs", alias="workoutSplit")
    avatar: str = "💪"
    streak: int = 12
    total_workouts: int = CamelField(default=47, alias="totalWorkouts")
    member_since: str = CamelField(default="2025-01-15", alias="memberSince")
    is_premium: bool = CamelField(default=True, alias="isPremium")
    onboarding_complete: bool = CamelField(default=True, alias="onboardingComplete")


class UserProfileUpdate(APIModel):
    name: str | None = None
    age: int | None = None
    gender: str | None = None
    height: float | None = None
    weight: float | None = None
    goal: str | None = None
    experience: str | None = None
    environment: str | None = None
    frequency: str | None = None
    injuries: list[str] | None = None
    calorie_target: int | None = CamelField(default=None, alias="calorieTarget")
    protein_target: int | None = CamelField(default=None, alias="proteinTarget")
    carbs_target: int | None = CamelField(default=None, alias="carbsTarget")
    fats_target: int | None = CamelField(default=None, alias="fatsTarget")
    workout_split: str | None = CamelField(default=None, alias="workoutSplit")
    avatar: str | None = None
    streak: int | None = None
    total_workouts: int | None = CamelField(default=None, alias="totalWorkouts")
    is_premium: bool | None = CamelField(default=None, alias="isPremium")
    onboarding_complete: bool | None = CamelField(default=None, alias="onboardingComplete")


class LoginRequest(APIModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class RegisterRequest(APIModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=120)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        return value.strip()


class AuthResponse(APIModel):
    token: str
    user: UserProfile


class ForgotPasswordRequest(APIModel):
    email: EmailStr


class ForgotPasswordResponse(APIModel):
    message: str
    reset_code: str | None = CamelField(default=None, alias="resetCode")


class ResetPasswordRequest(APIModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")
    new_password: str = Field(
        min_length=6,
        max_length=128,
        validation_alias="newPassword",
        serialization_alias="newPassword",
    )
