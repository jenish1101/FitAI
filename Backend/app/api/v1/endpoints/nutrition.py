from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUser
from app.core.ids import doc_id
from app.models.nutrition import FoodLogDocument
from app.models.reference import FoodDocument
from app.schemas.nutrition import FoodEntry, FoodEntryCreate, FoodItem

router = APIRouter(prefix="/nutrition", tags=["nutrition"])


@router.get("/foods", response_model=list[FoodItem])
async def list_foods() -> list[FoodItem]:
    docs = await FoodDocument.find_all().to_list()
    return [doc.data for doc in docs]


@router.get("/logs", response_model=list[FoodEntry])
async def list_food_logs(current_user: CurrentUser) -> list[FoodEntry]:
    docs = await FoodLogDocument.find(FoodLogDocument.user_id == current_user.id).to_list()
    entries = [doc.data for doc in docs]
    entries.sort(key=lambda entry: entry.date, reverse=True)
    return entries


@router.post("/logs", response_model=FoodEntry, status_code=status.HTTP_201_CREATED)
async def create_food_log(
    payload: FoodEntryCreate,
    current_user: CurrentUser,
) -> FoodEntry:
    entry = FoodEntry(
        id=f"food-{uuid4().hex[:8]}",
        name=payload.name,
        calories=payload.calories,
        protein=payload.protein,
        carbs=payload.carbs,
        fats=payload.fats,
        meal=payload.meal,
        portion=payload.portion,
        date=payload.date or datetime.now(timezone.utc).date().isoformat(),
    )
    await FoodLogDocument(user_id=doc_id(current_user), data=entry).insert()
    return entry


@router.delete("/logs/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_food_log(entry_id: str, current_user: CurrentUser) -> None:
    doc = await FoodLogDocument.find_one(
        FoodLogDocument.user_id == current_user.id,
        FoodLogDocument.data.id == entry_id,
    )
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"message": "Entry not found"})
    await doc.delete()
