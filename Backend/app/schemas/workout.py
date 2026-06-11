from pydantic import Field

from app.schemas.common import APIModel
from app.schemas.fields import CamelField


class Exercise(APIModel):
    id: str
    name: str
    muscle_group: str = CamelField(alias="muscleGroup")
    equipment: str
    difficulty: str
    instructions: str
    sets: int
    reps: str
    weight: float
    rest_time: int = CamelField(alias="restTime")


class WorkoutPlan(APIModel):
    id: str
    name: str
    day: str
    muscle_groups: list[str] = CamelField(default_factory=list, alias="muscleGroups")
    exercises: list[Exercise]
    duration: int
    calories: int
    completed: bool = False
    completed_date: str | None = CamelField(default=None, alias="completedDate")


class WorkoutPlanUpdate(APIModel):
    completed: bool | None = None
    completed_date: str | None = CamelField(default=None, alias="completedDate")


class WorkoutSetLog(APIModel):
    reps: int
    weight: float


class WorkoutExerciseLog(APIModel):
    name: str
    sets: list[WorkoutSetLog]


class WorkoutLog(APIModel):
    id: str
    date: str
    workout_name: str = CamelField(alias="workoutName")
    duration: int
    volume: float
    calories: int
    exercises: list[WorkoutExerciseLog]
    prs: list[str] = Field(default_factory=list)


class WorkoutLogCreate(APIModel):
    workout_name: str = CamelField(alias="workoutName")
    duration: int
    volume: float
    calories: int
    exercises: list[WorkoutExerciseLog]
    prs: list[str] = Field(default_factory=list)
    date: str | None = None
