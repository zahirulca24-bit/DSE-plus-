import { env, hasDseApiBaseUrl } from '../config/env';
import { ApiResult } from '../types/api';

const DEFAULT_TIMEOUT_MS = 15000;

async function apiRequest<T>(path: string, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<ApiResult<T>> {
  if (!hasDseApiBaseUrl || !env.dseApiBaseUrl) {
    return { ok: false, status: null, data: null, error: 'VITE_DSE_API_BASE_URL is not configured.' };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const base = env.dseApiBaseUrl.replace(/\/$/, '');
    const response = await fetch(`${base}${path}`, {
      ...init,
      signal: controller.signal,
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

    return { ok: response.ok, status: response.status, data, error: response.ok ? null : `HTTP ${response.status}` };
  } catch (error) {
    return { ok: false, status: null, data: null, error: error instanceof Error ? error.message : 'Unknown API error.' };
  } finally {
    window.clearTimeout(timeout);
  }
}

export function apiGet<T>(path: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<ApiResult<T>> {
  return apiRequest<T>(path, { method: 'GET' }, timeoutMs);
}

export function apiPost<T>(path: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<ApiResult<T>> {
  return apiRequest<T>(path, { method: 'POST' }, timeoutMs);
}
