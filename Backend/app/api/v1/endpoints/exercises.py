from fastapi import APIRouter

from app.models.reference import ExerciseDocument
from app.schemas.workout import Exercise

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("", response_model=list[Exercise])
async def list_exercises() -> list[Exercise]:
    docs = await ExerciseDocument.find_all().to_list()
    return [doc.data for doc in docs]
