from fastapi import APIRouter, status

from app.core.deps import CurrentUser
from app.core.ids import doc_id
from app.models.progress import BodyMetricDocument
from app.schemas.progress import BodyMetric, BodyMetricCreate

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/metrics", response_model=list[BodyMetric])
async def list_body_metrics(current_user: CurrentUser) -> list[BodyMetric]:
    docs = await BodyMetricDocument.find(BodyMetricDocument.user_id == current_user.id).to_list()
    metrics = [doc.data for doc in docs]
    metrics.sort(key=lambda metric: metric.date)
    return metrics


@router.post("/metrics", response_model=BodyMetric, status_code=status.HTTP_201_CREATED)
async def create_body_metric(
    payload: BodyMetricCreate,
    current_user: CurrentUser,
) -> BodyMetric:
    metric = BodyMetric.model_validate(payload.model_dump(by_alias=True))
    await BodyMetricDocument(user_id=doc_id(current_user), data=metric).insert()
    return metric
