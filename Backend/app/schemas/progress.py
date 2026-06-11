from app.schemas.common import APIModel
from app.schemas.fields import CamelField


class BodyMetric(APIModel):
    date: str
    weight: float
    body_fat: float | None = CamelField(default=None, alias="bodyFat")
    chest: float | None = None
    waist: float | None = None
    arms: float | None = None
    thighs: float | None = None


class BodyMetricCreate(APIModel):
    date: str
    weight: float
    body_fat: float | None = CamelField(default=None, alias="bodyFat")
    chest: float | None = None
    waist: float | None = None
    arms: float | None = None
    thighs: float | None = None
