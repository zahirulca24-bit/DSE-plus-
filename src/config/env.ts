export const env = {
  dseApiBaseUrl: import.meta.env.VITE_DSE_API_BASE_URL as string | undefined,
  mode: import.meta.env.MODE,
  isProd: import.meta.env.PROD,
};

export const hasDseApiBaseUrl = Boolean(env.dseApiBaseUrl && env.dseApiBaseUrl.trim().length > 0);
