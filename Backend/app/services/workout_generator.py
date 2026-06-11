import random
from copy import deepcopy
from datetime import datetime, timezone, timedelta

from app.schemas.nutrition import FoodEntry
from app.schemas.progress import BodyMetric
from app.schemas.user import UserProfile
from app.schemas.workout import WorkoutExerciseLog, WorkoutLog, WorkoutPlan, WorkoutSetLog
from app.seed.reference_data import EXERCISE_BY_ID, EXERCISES, FOODS


def _by_id(*ids: str) -> list:
    return [deepcopy(EXERCISE_BY_ID[exercise_id]) for exercise_id in ids]


def _plan_duration(exercises) -> int:
    set_minutes = sum(exercise.sets * 2.5 for exercise in exercises)
    rest_minutes = sum(exercise.sets * (exercise.rest_time / 60) for exercise in exercises)
    return round(set_minutes + rest_minutes + 5)


def generate_workout_plans(profile: UserProfile) -> list[WorkoutPlan]:
    split = profile.workout_split.lower()
    is_full_body = "full body" in split or profile.frequency == "2-3 days"
    is_upper_lower = "upper" in split or "lower" in split

    if is_full_body:
        fb1 = _by_id("ex15", "ex1", "ex5", "ex9", "ex12", "ex20")
        fb2 = _by_id("ex22", "ex2", "ex6", "ex10", "ex14", "ex21")
        fb3 = _by_id("ex17", "ex3", "ex8", "ex11", "ex13", "ex24")
        return [
            WorkoutPlan(
                id="plan-fb1",
                name="Full Body A",
                day="Monday",
                muscle_groups=["Full Body"],
                exercises=fb1,
                duration=_plan_duration(fb1),
                calories=320,
            ),
            WorkoutPlan(
                id="plan-fb2",
                name="Full Body B",
                day="Wednesday",
                muscle_groups=["Full Body"],
                exercises=fb2,
                duration=_plan_duration(fb2),
                calories=310,
            ),
            WorkoutPlan(
                id="plan-fb3",
                name="Full Body C",
                day="Friday",
                muscle_groups=["Full Body"],
                exercises=fb3,
                duration=_plan_duration(fb3),
                calories=300,
            ),
        ]

    if is_upper_lower:
        upper_a = _by_id("ex1", "ex5", "ex9", "ex12", "ex14")
        lower_a = _by_id("ex15", "ex17", "ex18", "ex19", "ex20")
        upper_b = _by_id("ex2", "ex6", "ex10", "ex13", "ex14")
        lower_b = _by_id("ex16", "ex23", "ex24", "ex19", "ex21")
        return [
            WorkoutPlan(
                id="plan-ul1",
                name="Upper A",
                day="Monday",
                muscle_groups=["Chest", "Back", "Shoulders", "Arms"],
                exercises=upper_a,
                duration=_plan_duration(upper_a),
                calories=350,
            ),
            WorkoutPlan(
                id="plan-ul2",
                name="Lower A",
                day="Tuesday",
                muscle_groups=["Legs", "Core"],
                exercises=lower_a,
                duration=_plan_duration(lower_a),
                calories=380,
            ),
            WorkoutPlan(
                id="plan-ul3",
                name="Upper B",
                day="Thursday",
                muscle_groups=["Chest", "Back", "Shoulders", "Arms"],
                exercises=upper_b,
                duration=_plan_duration(upper_b),
                calories=340,
            ),
            WorkoutPlan(
                id="plan-ul4",
                name="Lower B",
                day="Friday",
                muscle_groups=["Legs", "Core"],
                exercises=lower_b,
                duration=_plan_duration(lower_b),
                calories=370,
            ),
        ]

    push = _by_id("ex1", "ex2", "ex3", "ex9", "ex10", "ex14")
    pull = _by_id("ex5", "ex6", "ex7", "ex8", "ex12", "ex13")
    legs = _by_id("ex15", "ex16", "ex17", "ex18", "ex19", "ex24")

    if profile.frequency == "6 days":
        push_b = _by_id("ex1", "ex4", "ex9", "ex11", "ex14")
        pull_b = _by_id("ex22", "ex6", "ex8", "ex12", "ex13")
        legs_b = _by_id("ex15", "ex23", "ex17", "ex18", "ex19", "ex21")
        return [
            WorkoutPlan(
                id="plan-push1",
                name="Push Day",
                day="Monday",
                muscle_groups=["Chest", "Shoulders", "Arms"],
                exercises=push,
                duration=_plan_duration(push),
                calories=380,
            ),
            WorkoutPlan(
                id="plan-pull1",
                name="Pull Day",
                day="Tuesday",
                muscle_groups=["Back", "Arms"],
                exercises=pull,
                duration=_plan_duration(pull),
                calories=360,
            ),
            WorkoutPlan(
                id="plan-legs1",
                name="Leg Day",
                day="Wednesday",
                muscle_groups=["Legs"],
                exercises=legs,
                duration=_plan_duration(legs),
                calories=400,
            ),
            WorkoutPlan(
                id="plan-push2",
                name="Push Day B",
                day="Thursday",
                muscle_groups=["Chest", "Shoulders", "Arms"],
                exercises=push_b,
                duration=_plan_duration(push_b),
                calories=370,
            ),
            WorkoutPlan(
                id="plan-pull2",
                name="Pull Day B",
                day="Friday",
                muscle_groups=["Back", "Arms"],
                exercises=pull_b,
                duration=_plan_duration(pull_b),
                calories=390,
            ),
            WorkoutPlan(
                id="plan-legs2",
                name="Leg Day B",
                day="Saturday",
                muscle_groups=["Legs", "Core"],
                exercises=legs_b,
                duration=_plan_duration(legs_b),
                calories=410,
            ),
        ]

    return [
        WorkoutPlan(
            id="plan-push",
            name="Push Day",
            day="Monday",
            muscle_groups=["Chest", "Shoulders", "Arms"],
            exercises=push,
            duration=_plan_duration(push),
            calories=380,
        ),
        WorkoutPlan(
            id="plan-pull",
            name="Pull Day",
            day="Wednesday",
            muscle_groups=["Back", "Arms"],
            exercises=pull,
            duration=_plan_duration(pull),
            calories=360,
        ),
        WorkoutPlan(
            id="plan-legs",
            name="Leg Day",
            day="Friday",
            muscle_groups=["Legs"],
            exercises=legs,
            duration=_plan_duration(legs),
            calories=400,
        ),
    ]


WORKOUT_NAMES = ["Push Day", "Pull Day", "Leg Day", "Upper Body", "Lower Body", "Full Body"]


def generate_workout_logs() -> list[WorkoutLog]:
    logs: list[WorkoutLog] = []
    today = datetime.now(timezone.utc)

    for i in range(1, 31):
        if random.random() > 0.65:
            continue

        date = today - timedelta(days=i)
        workout_name = random.choice(WORKOUT_NAMES)
        pick_count = random.randint(4, 6)
        shuffled = random.sample(EXERCISES, k=min(pick_count, len(EXERCISES)))

        exercises: list[WorkoutExerciseLog] = []
        for exercise in shuffled:
            sets = [
                WorkoutSetLog(
                    reps=random.randint(6, 11),
                    weight=max(0, exercise.weight + random.randint(-5, 4)),
                )
                for _ in range(exercise.sets)
            ]
            exercises.append(WorkoutExerciseLog(name=exercise.name, sets=sets))

        volume = sum(
            set_log.reps * set_log.weight
            for exercise_log in exercises
            for set_log in exercise_log.sets
        )

        prs: list[str] = []
        if random.random() > 0.8 and exercises:
            prs.append(f"PR: {exercises[0].name}")

        logs.append(
            WorkoutLog(
                id=f"log-{i}",
                date=date.isoformat(),
                workout_name=workout_name,
                duration=random.randint(40, 64),
                volume=volume,
                calories=random.randint(250, 449),
                exercises=exercises,
                prs=prs,
            )
        )

    logs.sort(key=lambda log: log.date, reverse=True)
    return logs


def generate_body_metrics() -> list[BodyMetric]:
    metrics: list[BodyMetric] = []
    today = datetime.now(timezone.utc)
    weight = 84.0
    body_fat = 18.0

    for i in range(90, -1, -7):
        date = (today - timedelta(days=i)).date().isoformat()
        weight -= 0.15 + random.random() * 0.1
        body_fat -= 0.05 + random.random() * 0.05
        metrics.append(
            BodyMetric(
                date=date,
                weight=round(weight, 1),
                body_fat=round(body_fat, 1),
                chest=102 + random.random() * 2,
                waist=82 - (90 - i) * 0.03,
                arms=38 + random.random(),
                thighs=58 + random.random() * 2,
            )
        )

    return metrics


def generate_food_logs() -> list[FoodEntry]:
    today = datetime.now(timezone.utc).date().isoformat()
    picks = [
        (FOODS[4], "Breakfast", 1),
        (FOODS[8], "Breakfast", 1),
        (FOODS[0], "Lunch", 1.5),
        (FOODS[1], "Lunch", 1),
        (FOODS[13], "Lunch", 1),
        (FOODS[5], "Dinner", 1),
        (FOODS[6], "Dinner", 1),
        (FOODS[2], "Snack", 1),
    ]

    entries: list[FoodEntry] = []
    for index, (food, meal, portion) in enumerate(picks):
        entries.append(
            FoodEntry(
                id=f"food-init-{index}",
                name=food.name,
                calories=round(food.calories * portion),
                protein=round(food.protein * portion),
                carbs=round(food.carbs * portion),
                fats=round(food.fats * portion),
                meal=meal,
                portion=portion,
                date=today,
            )
        )
    return entries
