import type { BodyMetric, FoodEntry, UserProfile, WorkoutLog, WorkoutPlan } from '@/types/models';
import { exerciseDatabase } from '../data/exercises';
import { foodDatabase } from '../data/foods';

function byId(...ids: string[]) {
  return ids.map((id) => {
    const exercise = exerciseDatabase.find((e) => e.id === id);
    if (!exercise) throw new Error(`Exercise not found: ${id}`);
    return { ...exercise };
  });
}

function planDuration(exercises: WorkoutPlan['exercises']) {
  const setMinutes = exercises.reduce((sum, ex) => sum + ex.sets * 2.5, 0);
  const restMinutes = exercises.reduce((sum, ex) => sum + ex.sets * (ex.restTime / 60), 0);
  return Math.round(setMinutes + restMinutes + 5);
}

export function generateWorkoutPlans(profile: UserProfile): WorkoutPlan[] {
  const split = profile.workoutSplit.toLowerCase();
  const isFullBody = split.includes('full body') || profile.frequency === '2-3 days';
  const isUpperLower = split.includes('upper') || split.includes('lower');

  if (isFullBody) {
    const exercises = byId('ex15', 'ex1', 'ex5', 'ex9', 'ex12', 'ex20');
    return [
      {
        id: 'plan-fb1',
        name: 'Full Body A',
        day: 'Monday',
        muscleGroups: ['Full Body'],
        exercises,
        duration: planDuration(exercises),
        calories: 320,
        completed: false,
      },
      {
        id: 'plan-fb2',
        name: 'Full Body B',
        day: 'Wednesday',
        muscleGroups: ['Full Body'],
        exercises: byId('ex22', 'ex2', 'ex6', 'ex10', 'ex14', 'ex21'),
        duration: planDuration(byId('ex22', 'ex2', 'ex6', 'ex10', 'ex14', 'ex21')),
        calories: 310,
        completed: false,
      },
      {
        id: 'plan-fb3',
        name: 'Full Body C',
        day: 'Friday',
        muscleGroups: ['Full Body'],
        exercises: byId('ex17', 'ex3', 'ex8', 'ex11', 'ex13', 'ex24'),
        duration: planDuration(byId('ex17', 'ex3', 'ex8', 'ex11', 'ex13', 'ex24')),
        calories: 300,
        completed: false,
      },
    ];
  }

  if (isUpperLower) {
    const upperA = byId('ex1', 'ex5', 'ex9', 'ex12', 'ex14');
    const lowerA = byId('ex15', 'ex17', 'ex18', 'ex19', 'ex20');
    const upperB = byId('ex2', 'ex6', 'ex10', 'ex13', 'ex14');
    const lowerB = byId('ex16', 'ex23', 'ex24', 'ex19', 'ex21');
    return [
      {
        id: 'plan-ul1',
        name: 'Upper A',
        day: 'Monday',
        muscleGroups: ['Chest', 'Back', 'Shoulders', 'Arms'],
        exercises: upperA,
        duration: planDuration(upperA),
        calories: 350,
        completed: false,
      },
      {
        id: 'plan-ul2',
        name: 'Lower A',
        day: 'Tuesday',
        muscleGroups: ['Legs', 'Core'],
        exercises: lowerA,
        duration: planDuration(lowerA),
        calories: 380,
        completed: false,
      },
      {
        id: 'plan-ul3',
        name: 'Upper B',
        day: 'Thursday',
        muscleGroups: ['Chest', 'Back', 'Shoulders', 'Arms'],
        exercises: upperB,
        duration: planDuration(upperB),
        calories: 340,
        completed: false,
      },
      {
        id: 'plan-ul4',
        name: 'Lower B',
        day: 'Friday',
        muscleGroups: ['Legs', 'Core'],
        exercises: lowerB,
        duration: planDuration(lowerB),
        calories: 370,
        completed: false,
      },
    ];
  }

  const push = byId('ex1', 'ex2', 'ex3', 'ex9', 'ex10', 'ex14');
  const pull = byId('ex5', 'ex6', 'ex7', 'ex8', 'ex12', 'ex13');
  const legs = byId('ex15', 'ex16', 'ex17', 'ex18', 'ex19', 'ex24');

  if (profile.frequency === '6 days') {
    return [
      {
        id: 'plan-push1',
        name: 'Push Day',
        day: 'Monday',
        muscleGroups: ['Chest', 'Shoulders', 'Arms'],
        exercises: push,
        duration: planDuration(push),
        calories: 380,
        completed: false,
      },
      {
        id: 'plan-pull1',
        name: 'Pull Day',
        day: 'Tuesday',
        muscleGroups: ['Back', 'Arms'],
        exercises: pull,
        duration: planDuration(pull),
        calories: 360,
        completed: false,
      },
      {
        id: 'plan-legs1',
        name: 'Leg Day',
        day: 'Wednesday',
        muscleGroups: ['Legs'],
        exercises: legs,
        duration: planDuration(legs),
        calories: 400,
        completed: false,
      },
      {
        id: 'plan-push2',
        name: 'Push Day B',
        day: 'Thursday',
        muscleGroups: ['Chest', 'Shoulders', 'Arms'],
        exercises: byId('ex1', 'ex4', 'ex9', 'ex11', 'ex14'),
        duration: planDuration(byId('ex1', 'ex4', 'ex9', 'ex11', 'ex14')),
        calories: 370,
        completed: false,
      },
      {
        id: 'plan-pull2',
        name: 'Pull Day B',
        day: 'Friday',
        muscleGroups: ['Back', 'Arms'],
        exercises: byId('ex22', 'ex6', 'ex8', 'ex12', 'ex13'),
        duration: planDuration(byId('ex22', 'ex6', 'ex8', 'ex12', 'ex13')),
        calories: 390,
        completed: false,
      },
      {
        id: 'plan-legs2',
        name: 'Leg Day B',
        day: 'Saturday',
        muscleGroups: ['Legs', 'Core'],
        exercises: byId('ex15', 'ex23', 'ex17', 'ex18', 'ex19', 'ex21'),
        duration: planDuration(byId('ex15', 'ex23', 'ex17', 'ex18', 'ex19', 'ex21')),
        calories: 410,
        completed: false,
      },
    ];
  }

  return [
    {
      id: 'plan-push',
      name: 'Push Day',
      day: 'Monday',
      muscleGroups: ['Chest', 'Shoulders', 'Arms'],
      exercises: push,
      duration: planDuration(push),
      calories: 380,
      completed: false,
    },
    {
      id: 'plan-pull',
      name: 'Pull Day',
      day: 'Wednesday',
      muscleGroups: ['Back', 'Arms'],
      exercises: pull,
      duration: planDuration(pull),
      calories: 360,
      completed: false,
    },
    {
      id: 'plan-legs',
      name: 'Leg Day',
      day: 'Friday',
      muscleGroups: ['Legs'],
      exercises: legs,
      duration: planDuration(legs),
      calories: 400,
      completed: false,
    },
  ];
}

const workoutNames = ['Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Lower Body', 'Full Body'];

export function generateWorkoutLogs(): WorkoutLog[] {
  const logs: WorkoutLog[] = [];
  const today = new Date();

  for (let i = 1; i <= 30; i++) {
    if (Math.random() > 0.65) continue;

    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const workoutName = workoutNames[Math.floor(Math.random() * workoutNames.length)];
    const pickCount = 4 + Math.floor(Math.random() * 3);
    const shuffled = [...exerciseDatabase].sort(() => Math.random() - 0.5).slice(0, pickCount);

    const exercises = shuffled.map((ex) => ({
      name: ex.name,
      sets: Array.from({ length: ex.sets }, () => ({
        reps: 6 + Math.floor(Math.random() * 6),
        weight: ex.weight > 0 ? ex.weight + Math.floor(Math.random() * 10) - 5 : 0,
      })),
    }));

    const volume = exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0),
      0,
    );

    const prs: string[] = [];
    if (Math.random() > 0.8 && exercises[0]) {
      prs.push(`PR: ${exercises[0].name}`);
    }

    logs.push({
      id: `log-${i}`,
      date: date.toISOString(),
      workoutName,
      duration: 40 + Math.floor(Math.random() * 25),
      volume,
      calories: 250 + Math.floor(Math.random() * 200),
      exercises,
      prs,
    });
  }

  return logs.sort((a, b) => b.date.localeCompare(a.date));
}

export function generateBodyMetrics(): BodyMetric[] {
  const metrics: BodyMetric[] = [];
  const today = new Date();
  let weight = 84;
  let bodyFat = 18;

  for (let i = 90; i >= 0; i -= 7) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    weight -= 0.15 + Math.random() * 0.1;
    bodyFat -= 0.05 + Math.random() * 0.05;

    metrics.push({
      date: date.toISOString().split('T')[0],
      weight: Math.round(weight * 10) / 10,
      bodyFat: Math.round(bodyFat * 10) / 10,
      chest: 102 + Math.random() * 2,
      waist: 82 - (90 - i) * 0.03,
      arms: 38 + Math.random(),
      thighs: 58 + Math.random() * 2,
    });
  }

  return metrics;
}

export function generateFoodLogs(): FoodEntry[] {
  const today = new Date().toISOString().split('T')[0];
  const picks = [
    { food: foodDatabase[4], meal: 'Breakfast', portion: 1 },
    { food: foodDatabase[8], meal: 'Breakfast', portion: 1 },
    { food: foodDatabase[0], meal: 'Lunch', portion: 1.5 },
    { food: foodDatabase[1], meal: 'Lunch', portion: 1 },
    { food: foodDatabase[13], meal: 'Lunch', portion: 1 },
    { food: foodDatabase[5], meal: 'Dinner', portion: 1 },
    { food: foodDatabase[6], meal: 'Dinner', portion: 1 },
    { food: foodDatabase[2], meal: 'Snack', portion: 1 },
  ];

  return picks.map((pick, i) => ({
    id: `food-init-${i}`,
    name: pick.food.name,
    calories: Math.round(pick.food.calories * pick.portion),
    protein: Math.round(pick.food.protein * pick.portion),
    carbs: Math.round(pick.food.carbs * pick.portion),
    fats: Math.round(pick.food.fats * pick.portion),
    meal: pick.meal,
    portion: pick.portion,
    date: today,
  }));
}
