export type ApiConnectionStatus = 'Not Configured' | 'Testing' | 'Connected' | 'Error';

export interface ApiHealthResponse {
  status?: string;
  app?: string;
  version?: string;
  mode?: string;
  market_open_now?: boolean;
  [key: string]: unknown;
}

export interface ApiResult<T> {
  ok: boolean;
  status: number | null;
  data: T | null;
  error: string | null;
}
