import { evaluateApiEnvironment, normalizeApiBaseUrl } from './envPolicy';

const dseApiBaseUrl = normalizeApiBaseUrl(import.meta.env.VITE_DSE_API_BASE_URL);
const isProd = import.meta.env.PROD;
const policy = evaluateApiEnvironment(dseApiBaseUrl, isProd);

export const env = Object.freeze({
  dseApiBaseUrl,
  mode: import.meta.env.MODE,
  isProd,
  isLocalBackend: policy.isLocalBackend,
});

export const envStatus = Object.freeze({
  configured: policy.configured,
  productionSafe: policy.productionSafe,
  error: policy.error,
});
