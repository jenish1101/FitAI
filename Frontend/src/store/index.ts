export { exerciseDatabase } from './data/exercises';
export { foodDatabase } from './data/foods';
export { defaultAchievements } from './data/achievements';
export { defaultChallenges } from './data/challenges';
export { defaultProfile, defaultNotifications } from './data/defaults';
export { workoutPrograms } from './data/programs';

export {
  generateWorkoutPlans,
  generateWorkoutLogs,
  generateBodyMetrics,
  generateFoodLogs,
} from './utils/generators';
export { computePersonalRecords } from './utils/personal-records';

export { useAppState } from './hooks/use-app-state';

export type {
  Achievement,
  AppNotification,
  BodyMetric,
  Challenge,
  Exercise,
  FoodEntry,
  FoodItem,
  Friend,
  PersonalRecord,
  ProgressPhoto,
  UserProfile,
  WorkoutLog,
  WorkoutPlan,
  WorkoutProgram,
} from '@/types/models';
