export interface UserProfile {
  name: string;
  email: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  goal: string;
  experience: string;
  environment: string;
  frequency: string;
  injuries: string[];
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  workoutSplit: string;
  avatar: string;
  streak: number;
  totalWorkouts: number;
  memberSince: string;
  isPremium: boolean;
  onboardingComplete?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  instructions: string;
  sets: number;
  reps: string;
  weight: number;
  restTime: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  day: string;
  muscleGroups: string[];
  exercises: Exercise[];
  duration: number;
  calories: number;
  completed: boolean;
  completedDate?: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  workoutName: string;
  duration: number;
  volume: number;
  calories: number;
  exercises: { name: string; sets: { reps: number; weight: number }[] }[];
  prs: string[];
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meal: string;
  portion: number;
  date: string;
}

export interface BodyMetric {
  date: string;
  weight: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  arms?: number;
  thighs?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
  category: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  duration: number;
  progress: number;
  total: number;
  participants: number;
  active: boolean;
  type: string;
}

export interface ProgressPhoto {
  id: string;
  uri: string;
  date: string;
  label: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'streak' | 'workout' | 'social' | 'coach' | 'nutrition';
}

export interface PersonalRecord {
  exercise: string;
  weight: number;
  reps: number;
  date: string;
  estimated1RM: number;
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  portion: string;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description: string;
  days: number;
  duration: string;
  icon: string;
  muscleGroups: string[];
}

export interface Friend {
  id: string;
  name: string;
  status: string;
  avatar: string;
  online: boolean;
  lastWorkout: string;
  workouts: number;
  streak: number;
  goal: string;
  memberSince: string;
}
