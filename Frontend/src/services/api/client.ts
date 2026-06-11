import { env } from '@/config/env';
import { ApiError, NetworkError } from '@/services/api/errors';
import { clearAuthToken, getAuthToken } from '@/services/storage/auth';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** Pass `null` to skip attaching a stored JWT (e.g. login/register). */
  token?: string | null;
  timeoutMs?: number;
}

function buildUrl(path: string): string {
  const base = env.apiBaseUrl.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, timeoutMs = env.requestTimeoutMs } = options;
  const token =
    options.token === null
      ? undefined
      : (options.token ?? (await getAuthToken()) ?? undefined);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildUrl(path), {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await response.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text) as unknown;
      } catch {
        if (!response.ok) {
          throw new ApiError(
            response.status,
            response.status === 401
              ? 'Invalid email or password. Please try again.'
              : `Server error (${response.status}). Please try again.`,
          );
        }
        throw new NetworkError('Unexpected server response. Please try again.');
      }
    }

    if (!response.ok) {
      if (response.status === 401 && token) {
        await clearAuthToken();
      }
      throw new ApiError(
        response.status,
        typeof data === 'object' && data && 'message' in data
          ? String((data as { message: string }).message)
          : `Request failed with status ${response.status}`,
        data,
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new NetworkError('Request timed out. Please try again.');
    }
    const raw = error instanceof Error ? error.message : '';
    if (raw.includes('Network request failed') || raw.includes('Failed to fetch')) {
      throw new NetworkError(
        'Unable to reach the server. Start Fitness-Backend and check your API URL in .env.',
      );
    }
    throw new NetworkError(raw || 'Network request failed. Please try again.');
  } finally {
    clearTimeout(timeout);
  }
}
