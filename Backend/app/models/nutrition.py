from beanie import Document, PydanticObjectId

from app.schemas.nutrition import FoodEntry


class FoodLogDocument(Document):
    user_id: PydanticObjectId
    data: FoodEntry

    class Settings:
        name = "food_logs"
        indexes = ["user_id"]
