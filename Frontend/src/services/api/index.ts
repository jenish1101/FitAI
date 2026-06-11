export { apiClient } from '@/services/api/client';
export { ApiError, NetworkError } from '@/services/api/errors';
export {
  authApi,
  nutritionApi,
  progressApi,
  socialApi,
  userApi,
  workoutApi,
} from '@/services/api/endpoints';
export { canSyncWithApi, fetchRemoteAppData, type RemoteAppData } from '@/services/api/sync';
