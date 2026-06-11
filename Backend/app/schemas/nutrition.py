from pydantic import Field

from app.schemas.common import APIModel


class FoodItem(APIModel):
    name: str
    calories: float
    protein: float
    carbs: float
    fats: float
    portion: str


class FoodEntry(APIModel):
    id: str
    name: str
    calories: float
    protein: float
    carbs: float
    fats: float
    meal: str
    portion: float
    date: str


class FoodEntryCreate(APIModel):
    name: str
    calories: float = Field(ge=0)
    protein: float = Field(ge=0)
    carbs: float = Field(ge=0)
    fats: float = Field(ge=0)
    meal: str
    portion: float = Field(default=1, gt=0)
    date: str | None = None
