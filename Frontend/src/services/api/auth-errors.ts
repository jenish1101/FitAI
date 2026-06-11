import { ApiError, NetworkError } from '@/services/api/errors';

export function formatAuthError(error: unknown, mode: 'login' | 'register'): string {
  if (error instanceof ApiError) {
    if (error.status === 401 && mode === 'login') {
      return 'Invalid email or password. Please try again.';
    }
    if (error.status === 400 && mode === 'register') {
      return error.message || 'Could not create your account. Please try again.';
    }
    if (error.status === 422) {
      return error.message || 'Please check your email and password and try again.';
    }
    return error.message || (mode === 'login' ? 'Sign in failed.' : 'Registration failed.');
  }

  if (error instanceof NetworkError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return mode === 'login'
    ? 'Sign in failed. Please try again.'
    : 'Registration failed. Please try again.';
}
