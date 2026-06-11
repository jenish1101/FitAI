import type { Challenge, Exercise, WorkoutPlan } from '@/types/models';

export type OverlayScreen =
  | 'profile'
  | 'streak'
  | 'notifications'
  | 'settings'
  | 'ai-coach'
  | 'workout-history'
  | 'edit-profile'
  | 'weekly-report'
  | 'recovery'
  | 'measurements'
  | 'leaderboard'
  | 'prs'
  | 'programs'
  | null;

export type ModalType =
  | 'workout-preview'
  | 'workout-builder'
  | 'exercise-detail'
  | 'challenge-detail'
  | 'comments'
  | 'info'
  | 'photo-picker';

export interface ModalState {
  type: ModalType;
  workout?: WorkoutPlan;
  exercise?: Exercise;
  challenge?: Challenge;
  postId?: string;
  postUser?: string;
  title?: string;
  message?: string;
}

export interface AppNavigation {
  overlay: OverlayScreen;
  modal: ModalState | null;
  openOverlay: (screen: NonNullable<OverlayScreen>) => void;
  closeOverlay: () => void;
  openModal: (modal: ModalState) => void;
  closeModal: () => void;
  openMessages: () => void;
  startWorkout: (workout: WorkoutPlan) => void;
}
