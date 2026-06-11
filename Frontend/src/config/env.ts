/**
 * Centralized environment configuration.
 * Expo exposes only EXPO_PUBLIC_* variables to the client bundle.
 */
const withFallback = (value: string | undefined, fallback: string): string =>
  value && value.length > 0 ? value : fallback;

export const env = {
  apiBaseUrl: withFallback(process.env.EXPO_PUBLIC_API_BASE_URL, 'https://api.fitai.com/v1'),
  appEnv: withFallback(process.env.EXPO_PUBLIC_APP_ENV, 'development') as
    | 'development'
    | 'staging'
    | 'production',
  appName: withFallback(process.env.EXPO_PUBLIC_APP_NAME, 'FitAI'),
  enableMockApi: withFallback(process.env.EXPO_PUBLIC_ENABLE_MOCK_API, 'true') === 'true',
  requestTimeoutMs: Number(withFallback(process.env.EXPO_PUBLIC_API_TIMEOUT_MS, '15000')),
} as const;

export const isDev = env.appEnv === 'development';
export const isProd = env.appEnv === 'production';
