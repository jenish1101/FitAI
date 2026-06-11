from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUser
from app.core.ids import doc_id
from app.models.workout import WorkoutLogDocument, WorkoutPlanDocument
from app.schemas.workout import WorkoutLog, WorkoutLogCreate, WorkoutPlan, WorkoutPlanUpdate
from app.services.workout_generator import generate_workout_plans

router = APIRouter(prefix="/workouts", tags=["workouts"])


@router.get("/plans", response_model=list[WorkoutPlan])
async def list_workout_plans(current_user: CurrentUser) -> list[WorkoutPlan]:
    docs = await WorkoutPlanDocument.find(WorkoutPlanDocument.user_id == current_user.id).to_list()
    return [doc.data for doc in docs]


@router.post("/plans/generate", response_model=list[WorkoutPlan])
async def regenerate_workout_plans(current_user: CurrentUser) -> list[WorkoutPlan]:
    await WorkoutPlanDocument.find(WorkoutPlanDocument.user_id == current_user.id).delete()
    plans = generate_workout_plans(current_user.profile)
    for plan in plans:
        await WorkoutPlanDocument(user_id=doc_id(current_user), data=plan).insert()
    return plans


@router.patch("/plans/{plan_id}", response_model=WorkoutPlan)
async def update_workout_plan(
    plan_id: str,
    payload: WorkoutPlanUpdate,
    current_user: CurrentUser,
) -> WorkoutPlan:
    doc = await WorkoutPlanDocument.find_one(
        WorkoutPlanDocument.user_id == current_user.id,
        WorkoutPlanDocument.data.id == plan_id,
    )
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail={"message": "Plan not found"})

    updates = payload.model_dump(by_alias=True, exclude_none=True)
    plan_data = doc.data.model_dump(by_alias=True)
    plan_data.update(updates)
    doc.data = WorkoutPlan.model_validate(plan_data)
    await doc.save()
    return doc.data


@router.get("/logs", response_model=list[WorkoutLog])
async def list_workout_logs(current_user: CurrentUser) -> list[WorkoutLog]:
    docs = await WorkoutLogDocument.find(WorkoutLogDocument.user_id == current_user.id).to_list()
    logs = [doc.data for doc in docs]
    logs.sort(key=lambda log: log.date, reverse=True)
    return logs


@router.post("/logs", response_model=WorkoutLog, status_code=status.HTTP_201_CREATED)
async def create_workout_log(
    payload: WorkoutLogCreate,
    current_user: CurrentUser,
) -> WorkoutLog:
    log = WorkoutLog(
        id=f"log-{uuid4().hex[:8]}",
        date=payload.date or datetime.now(timezone.utc).isoformat(),
        workout_name=payload.workout_name,
        duration=payload.duration,
        volume=payload.volume,
        calories=payload.calories,
        exercises=payload.exercises,
        prs=payload.prs,
    )
    await WorkoutLogDocument(user_id=doc_id(current_user), data=log).insert()

    current_user.profile.total_workouts += 1
    current_user.profile.streak += 1
    await current_user.save()

    return log
