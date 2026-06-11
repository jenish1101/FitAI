import { useCallback, useEffect, useRef, useState } from 'react';

import { env } from '@/config/env';
import {
  authApi,
  nutritionApi,
  progressApi,
  socialApi,
  userApi,
  workoutApi,
} from '@/services/api/endpoints';
import { canSyncWithApi, fetchRemoteAppData } from '@/services/api/sync';
import { clearAuthToken } from '@/services/storage/auth';
import { loadPersistedState, savePersistedState } from '@/services/storage';
import type {
  Achievement,
  AppNotification,
  BodyMetric,
  Challenge,
  Exercise,
  FoodEntry,
  FoodItem,
  ProgressPhoto,
  UserProfile,
  WorkoutLog,
  WorkoutPlan,
} from '@/types/models';
import { defaultAchievements } from '../data/achievements';
import { defaultChallenges } from '../data/challenges';
import { defaultNotifications, defaultProfile } from '../data/defaults';
import { exerciseDatabase } from '../data/exercises';
import { foodDatabase } from '../data/foods';
import {
  generateBodyMetrics,
  generateFoodLogs,
  generateWorkoutLogs,
  generateWorkoutPlans,
} from '../utils/generators';
import { computePersonalRecords } from '../utils/personal-records';

export function useAppState() {
  const [currentTab, setCurrentTab] = useState('home');
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodEntry[]>([]);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>(foodDatabase);
  const [exercises, setExercises] = useState<Exercise[]>(exerciseDatabase);
  const [achievements] = useState<Achievement[]>(defaultAchievements);
  const [challenges, setChallenges] = useState<Challenge[]>(defaultChallenges);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(defaultNotifications);
  const [waterByDate, setWaterByDate] = useState<Record<string, number>>({});
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const initDone = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const applyRemoteData = useCallback(
    (data: Awaited<ReturnType<typeof fetchRemoteAppData>>) => {
      setProfile(data.profile);
      setWorkoutPlans(data.workoutPlans);
      setWorkoutLogs(data.workoutLogs);
      setFoodLogs(data.foodLogs);
      setBodyMetrics(data.bodyMetrics);
      setChallenges(data.challenges);
      setFoods(data.foods);
      setExercises(data.exercises);
      initDone.current = true;
    },
    [],
  );

  useEffect(() => {
    loadPersistedState().then(async (saved) => {
      if (saved) {
        if (saved.profile) setProfile(saved.profile);
        if (saved.workoutPlans?.length) setWorkoutPlans(saved.workoutPlans);
        if (saved.workoutLogs?.length) setWorkoutLogs(saved.workoutLogs);
        if (saved.foodLogs?.length) setFoodLogs(saved.foodLogs);
        if (saved.bodyMetrics?.length) setBodyMetrics(saved.bodyMetrics);
        if (saved.challenges?.length) setChallenges(saved.challenges);
        if (saved.progressPhotos?.length) setProgressPhotos(saved.progressPhotos);
        if (saved.notifications?.length) setNotifications(saved.notifications);
        if (saved.waterByDate) setWaterByDate(saved.waterByDate);
        if (saved.isOnboarded) setIsOnboarded(saved.isOnboarded);
        if (saved.isLoggedIn) setIsLoggedIn(saved.isLoggedIn);
      }

      if (await canSyncWithApi()) {
        try {
          const remote = await fetchRemoteAppData();
          applyRemoteData(remote);
          setIsLoggedIn(true);
          setIsOnboarded(remote.profile.onboardingComplete !== false);
        } catch {
          // Fall back to local persisted state
        }
      }

      setHydrated(true);
    });
  }, [applyRemoteData]);

  useEffect(() => {
    if (!hydrated || !isOnboarded || initDone.current) return;
    if (env.enableMockApi && workoutPlans.length === 0) {
      setWorkoutPlans(generateWorkoutPlans(profile));
      setWorkoutLogs(generateWorkoutLogs());
      setBodyMetrics(generateBodyMetrics());
      setFoodLogs(generateFoodLogs());
      initDone.current = true;
    }
  }, [hydrated, isOnboarded, profile, workoutPlans.length]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      savePersistedState({
        profile,
        workoutPlans,
        workoutLogs,
        foodLogs,
        bodyMetrics,
        challenges,
        progressPhotos,
        notifications,
        waterByDate,
        isOnboarded,
        isLoggedIn,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [
    hydrated,
    profile,
    workoutPlans,
    workoutLogs,
    foodLogs,
    bodyMetrics,
    challenges,
    progressPhotos,
    notifications,
    waterByDate,
    isOnboarded,
    isLoggedIn,
  ]);

  const addFoodEntry = useCallback(async (entry: Omit<FoodEntry, 'id'>) => {
    if (env.enableMockApi) {
      setFoodLogs((prev) => [...prev, { ...entry, id: `food-${Date.now()}` }]);
      return;
    }
    const created = await nutritionApi.createLog(entry);
    setFoodLogs((prev) => [...prev, created]);
  }, []);

  const removeFoodEntry = useCallback(async (id: string) => {
    if (!env.enableMockApi) {
      await nutritionApi.deleteLog(id);
    }
    setFoodLogs((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const addProgressPhoto = useCallback((photo: ProgressPhoto) => {
    setProgressPhotos((prev) => [photo, ...prev]);
  }, []);

  const addBodyMetric = useCallback(async (metric: BodyMetric) => {
    if (env.enableMockApi) {
      setBodyMetrics((prev) => [...prev, metric].sort((a, b) => a.date.localeCompare(b.date)));
      return;
    }
    const created = await progressApi.createMetric(metric);
    setBodyMetrics((prev) => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
  }, []);

  const setWaterForToday = useCallback((glasses: number) => {
    const today = new Date().toISOString().split('T')[0];
    setWaterByDate((prev) => ({ ...prev, [today]: glasses }));
  }, []);

  const getWaterForToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return waterByDate[today] ?? 0;
  }, [waterByDate]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const updateChallengeProgress = useCallback(async (id: string, progress: number) => {
    if (!env.enableMockApi) {
      const updated = await socialApi.updateChallenge(id, progress);
      setChallenges((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return;
    }
    setChallenges((prev) => prev.map((c) => (c.id === id ? { ...c, progress } : c)));
  }, []);

  const personalRecords = computePersonalRecords(workoutLogs);

  const syncFromApi = useCallback(
    async (nextProfile?: UserProfile) => {
      const remote = await fetchRemoteAppData(nextProfile);
      applyRemoteData(remote);
      return remote;
    },
    [applyRemoteData],
  );

  const goHome = useCallback(() => {
    setCurrentTab('home');
  }, []);

  const handleAuthSuccess = useCallback(
    async (authProfile: UserProfile, mode: 'login' | 'register') => {
      setProfile(authProfile);
      setIsLoggedIn(true);
      goHome();

      if (mode === 'login') {
        if (!env.enableMockApi) {
          const remote = await syncFromApi(authProfile);
          setIsOnboarded(remote.profile.onboardingComplete !== false);
        } else {
          setIsOnboarded(authProfile.onboardingComplete !== false);
        }
        return;
      }

      setIsOnboarded(false);
    },
    [goHome, syncFromApi],
  );

  const persistProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      const merged = { ...profile, ...updates };
      if (env.enableMockApi) {
        setProfile(merged);
        return merged;
      }
      const saved = await userApi.updateProfile(updates);
      setProfile(saved);
      return saved;
    },
    [profile],
  );

  const completeOnboarding = useCallback(async () => {
    const saved = await persistProfile({
      age: profile.age,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      goal: profile.goal,
      experience: profile.experience,
      environment: profile.environment,
      frequency: profile.frequency,
      injuries: profile.injuries,
      calorieTarget: profile.calorieTarget,
      proteinTarget: profile.proteinTarget,
      carbsTarget: profile.carbsTarget,
      fatsTarget: profile.fatsTarget,
      workoutSplit: profile.workoutSplit,
      onboardingComplete: true,
    });

    if (!env.enableMockApi) {
      const plans = await workoutApi.generatePlans();
      const remote = await fetchRemoteAppData(saved);
      applyRemoteData({ ...remote, workoutPlans: plans });
    } else {
      setWorkoutPlans(generateWorkoutPlans(saved));
    }

    initDone.current = true;
    setIsOnboarded(true);
    goHome();
  }, [applyRemoteData, goHome, persistProfile, profile]);

  const finishWorkout = useCallback(
    async (plan: WorkoutPlan, log: WorkoutLog) => {
      if (env.enableMockApi) {
        setWorkoutLogs((prev) => [log, ...prev]);
        setWorkoutPlans((prev) =>
          prev.map((p) =>
            p.id === plan.id
              ? { ...p, completed: true, completedDate: new Date().toISOString() }
              : p,
          ),
        );
        setProfile((p) => ({
          ...p,
          totalWorkouts: p.totalWorkouts + 1,
          streak: p.streak + 1,
        }));
        return;
      }

      const [createdLog, updatedPlan] = await Promise.all([
        workoutApi.createLog({
          workoutName: log.workoutName,
          duration: log.duration,
          volume: log.volume,
          calories: log.calories,
          exercises: log.exercises,
          prs: log.prs,
          date: log.date,
        }),
        workoutApi.updatePlan(plan.id, {
          completed: true,
          completedDate: new Date().toISOString(),
        }),
      ]);

      const refreshedProfile = await authApi.me();
      setWorkoutLogs((prev) => [createdLog, ...prev]);
      setWorkoutPlans((prev) => prev.map((p) => (p.id === plan.id ? updatedPlan : p)));
      setProfile(refreshedProfile);
    },
    [],
  );

  const applyWorkoutProgram = useCallback(
    async (updates: Partial<UserProfile>) => {
      const saved = await persistProfile(updates);
      if (env.enableMockApi) {
        setWorkoutPlans(generateWorkoutPlans(saved));
        return;
      }
      const plans = await workoutApi.generatePlans();
      setWorkoutPlans(plans);
    },
    [persistProfile],
  );

  const signOut = useCallback(async () => {
    await clearAuthToken();
    setIsLoggedIn(false);
    setIsOnboarded(false);
    goHome();
  }, [goHome]);

  return {
    currentTab,
    setCurrentTab,
    profile,
    setProfile,
    workoutPlans,
    setWorkoutPlans,
    workoutLogs,
    setWorkoutLogs,
    foodLogs,
    setFoodLogs,
    foods,
    exercises,
    addFoodEntry,
    removeFoodEntry,
    bodyMetrics,
    setBodyMetrics,
    addBodyMetric,
    achievements,
    challenges,
    setChallenges,
    updateChallengeProgress,
    progressPhotos,
    addProgressPhoto,
    notifications,
    setNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    waterByDate,
    setWaterForToday,
    getWaterForToday,
    personalRecords,
    isOnboarded,
    setIsOnboarded,
    isLoggedIn,
    setIsLoggedIn,
    showSplash,
    setShowSplash,
    hydrated,
    syncFromApi,
    handleAuthSuccess,
    persistProfile,
    completeOnboarding,
    finishWorkout,
    applyWorkoutProgram,
    signOut,
  };
}
