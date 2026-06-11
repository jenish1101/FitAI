import AsyncStorage from '@react-native-async-storage/async-storage';

import { StorageKeys } from '@/services/storage/keys';

export async function saveAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(StorageKeys.authToken, token);
}

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(StorageKeys.authToken);
}

export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(StorageKeys.authToken);
}
