import { env } from '@/config/env';
import {
  authApi,
  nutritionApi,
  progressApi,
  socialApi,
  workoutApi,
} from '@/services/api/endpoints';
import { getAuthToken } from '@/services/storage/auth';
import type {
  BodyMetric,
  Challenge,
  Exercise,
  FoodEntry,
  FoodItem,
  UserProfile,
  WorkoutLog,
  WorkoutPlan,
} from '@/types/models';

export interface RemoteAppData {
  profile: UserProfile;
  workoutPlans: WorkoutPlan[];
  workoutLogs: WorkoutLog[];
  foodLogs: FoodEntry[];
  bodyMetrics: BodyMetric[];
  challenges: Challenge[];
  foods: FoodItem[];
  exercises: Exercise[];
}

export async function fetchRemoteAppData(
  profile?: UserProfile,
): Promise<RemoteAppData> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error('Missing auth token');
  }

  const currentProfile = profile ?? (await authApi.me());

  const [
    workoutPlans,
    workoutLogs,
    foodLogs,
    bodyMetrics,
    challenges,
    foods,
    exercises,
  ] = await Promise.all([
    workoutApi.getPlans(currentProfile),
    workoutApi.getLogs(),
    nutritionApi.getFoodLogs(),
    progressApi.getBodyMetrics(),
    socialApi.getChallenges(),
    nutritionApi.getFoodDatabase(),
    workoutApi.getExercises(),
  ]);

  return {
    profile: currentProfile,
    workoutPlans,
    workoutLogs,
    foodLogs,
    bodyMetrics,
    challenges,
    foods,
    exercises,
  };
}

export async function canSyncWithApi(): Promise<boolean> {
  if (env.enableMockApi) return false;
  const token = await getAuthToken();
  return Boolean(token);
}
