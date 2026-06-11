import { env } from '@/config/env';
import { apiClient } from '@/services/api/client';
import { ApiError } from '@/services/api/errors';
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
import { defaultChallenges } from '@/store/data/challenges';
import { defaultProfile } from '@/store/data/defaults';
import { exerciseDatabase } from '@/store/data/exercises';
import { foodDatabase } from '@/store/data/foods';
import {
  generateBodyMetrics,
  generateFoodLogs,
  generateWorkoutLogs,
  generateWorkoutPlans,
} from '@/store/utils/generators';

/** Simulates network latency for mock responses */
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  login: async (email: string, password: string) => {
    if (env.enableMockApi) {
      await delay();
      if (email !== 'demo@fitai.app' || password !== 'demo1234') {
        throw new ApiError(401, 'Invalid email or password. Please try again.');
      }
      return {
        token: 'mock-jwt-token',
        user: { ...defaultProfile, email, onboardingComplete: true },
      };
    }
    return apiClient<{ token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: { email, password },
      token: null,
    });
  },
  register: async (email: string, password: string, name: string) => {
    if (env.enableMockApi) {
      await delay();
      return {
        token: 'mock-jwt-token',
        user: { ...defaultProfile, email, name, onboardingComplete: false },
      };
    }
    return apiClient<{ token: string; user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
      token: null,
    });
  },
  me: async () => apiClient<UserProfile>('/auth/me'),
  forgotPassword: async (email: string) => {
    if (env.enableMockApi) {
      await delay();
      if (email !== 'demo@fitai.app') {
        return {
          message: 'If an account exists with that email, a reset code has been sent.',
        };
      }
      return {
        message: 'If an account exists with that email, a reset code has been sent.',
        resetCode: '123456',
      };
    }
    return apiClient<{ message: string; resetCode?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      token: null,
    });
  },
  resetPassword: async (email: string, code: string, newPassword: string) => {
    if (env.enableMockApi) {
      await delay();
      if (email !== 'demo@fitai.app' || code !== '123456') {
        throw new ApiError(400, 'Invalid or expired reset code');
      }
      return { message: 'Password updated successfully. You can sign in now.' };
    }
    return apiClient<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: { email, code, newPassword },
      token: null,
    });
  },
};

export const userApi = {
  updateProfile: async (updates: Partial<UserProfile>) => {
    if (env.enableMockApi) {
      await delay();
      return { ...defaultProfile, ...updates };
    }
    return apiClient<UserProfile>('/users/profile', {
      method: 'PUT',
      body: updates,
    });
  },
};

export const workoutApi = {
  getPlans: async (profile: UserProfile) => {
    if (env.enableMockApi) {
      await delay();
      return generateWorkoutPlans(profile);
    }
    return apiClient<WorkoutPlan[]>('/workouts/plans');
  },
  getLogs: async () => {
    if (env.enableMockApi) {
      await delay();
      return generateWorkoutLogs();
    }
    return apiClient<WorkoutLog[]>('/workouts/logs');
  },
  getExercises: async () => {
    if (env.enableMockApi) {
      await delay();
      return exerciseDatabase;
    }
    return apiClient<Exercise[]>('/exercises');
  },
  createLog: async (
    body: Omit<WorkoutLog, 'id'> & { date?: string },
  ) => {
    if (env.enableMockApi) {
      await delay();
      return { ...body, id: `log-${Date.now()}`, date: body.date ?? new Date().toISOString() };
    }
    return apiClient<WorkoutLog>('/workouts/logs', {
      method: 'POST',
      body,
    });
  },
  updatePlan: async (
    planId: string,
    body: { completed?: boolean; completedDate?: string },
  ) => {
    if (env.enableMockApi) {
      await delay();
      throw new Error('updatePlan requires a real API connection');
    }
    return apiClient<WorkoutPlan>(`/workouts/plans/${planId}`, {
      method: 'PATCH',
      body,
    });
  },
  generatePlans: async () => {
    if (env.enableMockApi) {
      await delay();
      return generateWorkoutPlans(defaultProfile);
    }
    return apiClient<WorkoutPlan[]>('/workouts/plans/generate', { method: 'POST' });
  },
};

export const nutritionApi = {
  getFoodDatabase: async () => {
    if (env.enableMockApi) {
      await delay();
      return foodDatabase;
    }
    return apiClient<FoodItem[]>('/nutrition/foods');
  },
  getFoodLogs: async () => {
    if (env.enableMockApi) {
      await delay();
      return generateFoodLogs();
    }
    return apiClient<FoodEntry[]>('/nutrition/logs');
  },
  createLog: async (body: Omit<FoodEntry, 'id'>) => {
    if (env.enableMockApi) {
      await delay();
      return { ...body, id: `food-${Date.now()}` };
    }
    return apiClient<FoodEntry>('/nutrition/logs', {
      method: 'POST',
      body,
    });
  },
  deleteLog: async (entryId: string) => {
    if (env.enableMockApi) {
      await delay();
      return;
    }
    await apiClient<void>(`/nutrition/logs/${entryId}`, { method: 'DELETE' });
  },
};

export const progressApi = {
  getBodyMetrics: async () => {
    if (env.enableMockApi) {
      await delay();
      return generateBodyMetrics();
    }
    return apiClient<BodyMetric[]>('/progress/metrics');
  },
  createMetric: async (body: BodyMetric) => {
    if (env.enableMockApi) {
      await delay();
      return body;
    }
    return apiClient<BodyMetric>('/progress/metrics', {
      method: 'POST',
      body,
    });
  },
};

export const socialApi = {
  getChallenges: async () => {
    if (env.enableMockApi) {
      await delay();
      return defaultChallenges;
    }
    return apiClient<Challenge[]>('/social/challenges');
  },
  updateChallenge: async (challengeId: string, progress: number) => {
    if (env.enableMockApi) {
      await delay();
      const challenge = defaultChallenges.find((c) => c.id === challengeId);
      if (!challenge) throw new Error('Challenge not found');
      return { ...challenge, progress };
    }
    return apiClient<Challenge>(`/social/challenges/${challengeId}`, {
      method: 'PATCH',
      body: { progress },
    });
  },
};
