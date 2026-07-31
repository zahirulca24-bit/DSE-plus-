function normalizeUrl(value: unknown): string | null {
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

const dseApiBaseUrl = normalizeUrl(import.meta.env.VITE_DSE_API_BASE_URL);
const isProd = import.meta.env.PROD;
const isLocalBackend = Boolean(
  dseApiBaseUrl && /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/i.test(dseApiBaseUrl),
);

export const env = Object.freeze({
  dseApiBaseUrl,
  mode: import.meta.env.MODE,
  isProd,
  isLocalBackend,
});

export const envStatus = Object.freeze({
  configured: Boolean(dseApiBaseUrl),
  productionSafe: Boolean(dseApiBaseUrl && (!isProd || !isLocalBackend)),
  error: !dseApiBaseUrl
    ? 'VITE_DSE_API_BASE_URL is missing or invalid.'
    : isProd && isLocalBackend
      ? 'Production frontend cannot use a localhost backend URL.'
      : null,
});
