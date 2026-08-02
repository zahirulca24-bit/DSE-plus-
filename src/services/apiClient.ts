import { env, envStatus } from '../config/env';
import { ApiResult } from '../types/api';
import { extractApiError } from './apiError';

const DEFAULT_TIMEOUT_MS = 60000;
const RETRYABLE_METHODS = new Set(['GET']);

async function performRequest<T>(path: string, init: RequestInit, timeoutMs: number): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${env.dseApiBaseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json', ...(init.headers || {}) },
    });
    const text = await response.text();
    let data: T | null = null;
    if (text) {
      try { data = JSON.parse(text) as T; } catch { data = text as T; }
    }
    return { ok: response.ok, status: response.status, data, error: response.ok ? null : extractApiError(data, response.status) };
  } catch (error) {
    const message = error instanceof DOMException && error.name === 'AbortError'
      ? 'Backend request timed out. Please retry after the service is ready.'
      : error instanceof TypeError
        ? 'Backend is unreachable or blocked by CORS.'
        : error instanceof Error ? error.message : 'Unknown API error.';
    return { ok: false, status: null, data: null, error: message };
  } finally {
    window.clearTimeout(timeout);
  }
}

async function apiRequest<T>(path: string, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<ApiResult<T>> {
  if (!envStatus.productionSafe || !env.dseApiBaseUrl) {
    return { ok: false, status: null, data: null, error: envStatus.error || 'Backend URL is not configured.' };
  }
  const first = await performRequest<T>(path, init, timeoutMs);
  const method = (init.method || 'GET').toUpperCase();
  if (first.ok || first.status !== null || !RETRYABLE_METHODS.has(method)) return first;
  await new Promise((resolve) => window.setTimeout(resolve, 1500));
  return performRequest<T>(path, init, timeoutMs);
}

export function apiGet<T>(path: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<ApiResult<T>> {
  return apiRequest<T>(path, { method: 'GET' }, timeoutMs);
}

export function apiPost<T>(path: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<ApiResult<T>> {
  return apiRequest<T>(path, { method: 'POST' }, timeoutMs);
}

export function apiPostJson<TResponse, TBody>(path: string, body: TBody, headers: Record<string, string> = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<ApiResult<TResponse>> {
  return apiRequest<TResponse>(path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) }, timeoutMs);
}

export function apiPostForm<TResponse>(path: string, formData: FormData, timeoutMs = DEFAULT_TIMEOUT_MS, headers: Record<string, string> = {}): Promise<ApiResult<TResponse>> {
  return apiRequest<TResponse>(path, { method: 'POST', headers, body: formData }, timeoutMs);
}
