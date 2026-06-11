from beanie import Document

from app.schemas.nutrition import FoodItem
from app.schemas.social import Challenge
from app.schemas.workout import Exercise


class ExerciseDocument(Document):
    exercise_id: str
    data: Exercise

    class Settings:
        name = "exercises"
        indexes = ["exercise_id"]


class FoodDocument(Document):
    name: str
    data: FoodItem

    class Settings:
        name = "foods"
        indexes = ["name"]


class ChallengeDocument(Document):
    challenge_id: str
    data: Challenge

    class Settings:
        name = "challenges"
        indexes = ["challenge_id"]
