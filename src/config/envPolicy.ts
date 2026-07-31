export interface ApiEnvironmentPolicy {
  configured: boolean;
  productionSafe: boolean;
  isLocalBackend: boolean;
  error: string | null;
}

export function normalizeApiBaseUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/\/$/, '');
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export function evaluateApiEnvironment(
  apiBaseUrl: string | null,
  isProd: boolean,
): ApiEnvironmentPolicy {
  const isLocalBackend = Boolean(
    apiBaseUrl && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/i.test(apiBaseUrl),
  );
  const configured = Boolean(apiBaseUrl);
  const productionSafe = Boolean(apiBaseUrl && (!isProd || !isLocalBackend));

  return {
    configured,
    productionSafe,
    isLocalBackend,
    error: !apiBaseUrl
      ? 'VITE_DSE_API_BASE_URL is missing or invalid.'
      : isProd && isLocalBackend
        ? 'Production frontend cannot use a localhost backend URL.'
        : null,
  };
}
