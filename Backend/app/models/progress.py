from beanie import Document, PydanticObjectId

from app.schemas.progress import BodyMetric


class BodyMetricDocument(Document):
    user_id: PydanticObjectId
    data: BodyMetric

    class Settings:
        name = "body_metrics"
        indexes = ["user_id"]
