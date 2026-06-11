from beanie import Document, PydanticObjectId

from app.schemas.workout import WorkoutLog, WorkoutPlan


class WorkoutPlanDocument(Document):
    user_id: PydanticObjectId
    data: WorkoutPlan

    class Settings:
        name = "workout_plans"
        indexes = ["user_id"]


class WorkoutLogDocument(Document):
    user_id: PydanticObjectId
    data: WorkoutLog

    class Settings:
        name = "workout_logs"
        indexes = ["user_id"]
