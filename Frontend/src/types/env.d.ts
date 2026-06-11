declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_BASE_URL?: string;
    EXPO_PUBLIC_APP_ENV?: 'development' | 'staging' | 'production';
    EXPO_PUBLIC_APP_NAME?: string;
    EXPO_PUBLIC_ENABLE_MOCK_API?: string;
    EXPO_PUBLIC_API_TIMEOUT_MS?: string;
  }
}
