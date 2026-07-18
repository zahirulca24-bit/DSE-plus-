import { env, hasDseApiBaseUrl } from '../config/env';
import { ApiResult } from '../types/api';

const DEFAULT_TIMEOUT_MS = 60000;
const RETRYABLE_METHODS = new Set(['GET']);

async function performRequest<T>(path: string, init: RequestInit, timeoutMs: number): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const base = env.dseApiBaseUrl!.replace(/\/$/, '');
    const response = await fetch(`${base}${path}`, {
      ...init,
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json', ...(init.headers || {}) },
    });
    const text = await response.text();
    let data: T | null = null;

    if (text) {
      try {
        data = JSON.parse(text) as T;
      } catch {
        data = text as T;
      }
    }

    let error: string | null = null;
    if (!response.ok) {
      const detail = data && typeof data === 'object' && 'detail' in data
        ? String((data as { detail?: unknown }).detail || '')
        : '';
      error = detail || `HTTP ${response.status}`;
    }

    return { ok: response.ok, status: response.status, data, error };
  } catch (error) {
    const message = error instanceof DOMException && error.name === 'AbortError'
      ? 'Request timed out while the backend was starting. Please retry.'
      : error instanceof Error
        ? error.message
        : 'Unknown API error.';
    return { ok: false, status: null, data: null, error: message };
  } finally {
    window.clearTimeout(timeout);
  }
}

async function apiRequest<T>(path: string, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<ApiResult<T>> {
  if (!hasDseApiBaseUrl || !env.dseApiBaseUrl) {
    return { ok: false, status: null, data: null, error: 'VITE_DSE_API_BASE_URL is not configured.' };
  }

  const first = await performRequest<T>(path, init, timeoutMs);
  const method = (init.method || 'GET').toUpperCase();
  const shouldRetry = !first.ok && first.status === null && RETRYABLE_METHODS.has(method);

  if (!shouldRetry) return first;

  await new Promise((resolve) => window.setTimeout(resolve, 1500));
  return performRequest<T>(path, init, timeoutMs);
}

export function apiGet<T>(path: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<ApiResult<T>> {
  return apiRequest<T>(path, { method: 'GET' }, timeoutMs);
}

export function apiPost<T>(path: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<ApiResult<T>> {
  return apiRequest<T>(path, { method: 'POST' }, timeoutMs);
}

export function apiPostJson<TResponse, TBody>(
  path: string,
  body: TBody,
  headers: Record<string, string> = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<ApiResult<TResponse>> {
  return apiRequest<TResponse>(
    path,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    },
    timeoutMs,
  );
}

export function apiPostForm<TResponse>(
  path: string,
  formData: FormData,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<ApiResult<TResponse>> {
  return apiRequest<TResponse>(
    path,
    {
      method: 'POST',
      body: formData,
    },
    timeoutMs,
  );
}
