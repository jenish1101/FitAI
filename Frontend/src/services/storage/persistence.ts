import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageKeys } from '@/services/storage/keys';
import type {
  AppNotification,
  BodyMetric,
  Challenge,
  FoodEntry,
  ProgressPhoto,
  UserProfile,
  WorkoutLog,
  WorkoutPlan,
} from '@/types/models';

export interface PersistedAppState {
  profile: UserProfile;
  workoutPlans: WorkoutPlan[];
  workoutLogs: WorkoutLog[];
  foodLogs: FoodEntry[];
  bodyMetrics: BodyMetric[];
  challenges: Challenge[];
  progressPhotos: ProgressPhoto[];
  notifications: AppNotification[];
  waterByDate: Record<string, number>;
  isOnboarded: boolean;
  isLoggedIn: boolean;
}

export async function loadPersistedState(): Promise<Partial<PersistedAppState> | null> {
  try {
    const raw = await AsyncStorage.getItem(StorageKeys.appState);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAppState;
  } catch {
    return null;
  }
}

export async function savePersistedState(state: PersistedAppState): Promise<void> {
  try {
    await AsyncStorage.setItem(StorageKeys.appState, JSON.stringify(state));
  } catch {
    // Non-fatal: app continues with in-memory state
  }
}
