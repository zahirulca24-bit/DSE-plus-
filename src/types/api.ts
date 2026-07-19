export type ApiConnectionStatus = 'Not Configured' | 'Testing' | 'Connected' | 'Error';

export interface ApiHealthResponse {
  status?: string;
  app?: string;
  version?: string;
  mode?: string;
  market?: string;
  market_open_now?: boolean;
  [key: string]: unknown;
}

export interface ApiResult<T> {
  ok: boolean;
  status: number | null;
  data: T | null;
  error: string | null;
}

export type DseSignalGrade = 'A+' | 'A' | 'B+' | 'REJECT';
export type DseSignalStatus = 'qualified' | 'watch' | 'rejected';
export type DseEntryStatus = 'READY' | 'NEAR' | 'WATCH' | 'NOT_READY';
export type DseTrend = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface DseBackendCandidate {
  symbol: string;
  company?: string | null;
  sector?: string | null;
  grade: DseSignalGrade;
  score: number;
  signal_status?: DseSignalStatus;
  entry_status?: DseEntryStatus;
  setup?: string;
  latest_close?: number;
  trade_date?: string;
  trend?: DseTrend;
  ema20?: number;
  ema50?: number;
  sma20?: number;
  sma50?: number;
  rsi14?: number;
  volume_ratio?: number;
  risk_reward?: number;
  reasons?: string[];
  warnings?: string[];
  data_mode?: string;
  entry_low?: number | null;
  entry_high?: number | null;
  stop_loss?: number | null;
  target1?: number | null;
  target2?: number | null;
  target3?: number | null;
  support?: number | null;
  resistance?: number | null;
  side?: 'LONG' | 'SHORT' | null;
  change_percent?: number | null;
}

export interface DseSignalsResponse {
  mode: string;
  data_source: string;
  signals: DseBackendCandidate[];
  rules?: Record<string, string>;
}

export interface DseScannerLatestResponse {
  ok: boolean;
  mode: string;
  data_source: string;
  scanned_symbols: number;
  eligible_symbols: number;
  qualified_count: number;
  watch_count: number;
  rejected_count: number;
  generated_at?: string | null;
  message?: string;
  candidates: DseBackendCandidate[];
}

export interface DseStatusResponse {
  status?: string;
  mode?: string;
  data_source?: string;
  backend_ready?: boolean;
  database_connected?: boolean;
  live_market_connected?: boolean;
  broker_connected?: boolean;
  last_data_date?: string | null;
  symbols_count?: number | null;
  rows_count?: number | null;
  message?: string;
}

export interface OhlcRow {
  symbol: string;
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  trade?: number | null;
  value?: number | null;
}

export interface OhlcPreviewResponse {
  ok: boolean;
  mode: 'local_preview';
  filename: string;
  detected_headers: string[];
  normalized_headers: string[];
  valid_rows: number;
  invalid_rows: number;
  symbols_count: number;
  latest_trade_date: string | null;
  preview_rows: OhlcRow[];
  warnings: string[];
  errors: string[];
}

export interface BlobStatusResponse {
  configured: boolean;
  connected: boolean;
  storage_type: 'vercel_blob';
  master_pathname: string;
  message: string;
}

export interface BlobImportResponse {
  ok: boolean;
  data_source: 'vercel_blob';
  inserted_rows: number;
  updated_rows: number;
  invalid_rows: number;
  symbols_count: number;
  rows_count: number;
  earliest_trade_date: string | null;
  latest_trade_date: string | null;
  master_pathname: string;
  message: string;
}

// Temporary compatibility names keep the existing Data Import component stable
// while all requests are redirected to Vercel Blob endpoints.
export interface DriveStatusResponse extends BlobStatusResponse {
  folder_name?: string | null;
  master_filename?: string;
}

export interface DriveImportResponse extends BlobImportResponse {
  master_filename?: string;
}

export interface DatabaseStatusResponse {
  configured: boolean;
  connected: boolean;
  database_type: 'postgres';
  message: string;
}

export interface DatabaseInitResponse {
  ok: boolean;
  message: string;
}

export interface DatabaseImportResponse {
  ok: boolean;
  data_source: 'database';
  inserted_rows: number;
  updated_rows: number;
  invalid_rows: number;
  symbols_count: number;
  latest_trade_date: string | null;
  message: string;
}

export interface DataStatusResponse {
  data_available: boolean;
  data_source: 'database' | 'local_csv' | 'none';
  stored_path: string | null;
  symbols_count: number | null;
  rows_count: number | null;
  latest_trade_date: string | null;
  earliest_trade_date: string | null;
  message: string;
}

export interface DataSourceResponse {
  preferred_source: 'database' | 'local_csv' | 'demo';
  database_available: boolean;
  local_csv_available: boolean;
  fallback_order: Array<'database' | 'local_csv' | 'demo'>;
}

export interface DataAuditResponse {
  ok: boolean;
  data_source: 'database' | 'none';
  rows_count: number;
  symbols_count: number;
  earliest_trade_date: string | null;
  latest_trade_date: string | null;
  duplicate_symbol_date_rows: number;
  zero_volume_rows: number;
  non_positive_price_rows: number;
  invalid_ohlc_rows: number;
  symbols_with_fewer_than_60_rows: number;
  latest_date_symbols_count: number;
  latest_date_coverage_percent: number;
  stale_symbols_count: number;
  scanner_ready: boolean;
  warnings: string[];
  audited_at: string;
}

export type CollectorStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface CollectorRunRequest {
  trade_date: string | null;
  collect_missing: boolean;
}

export interface CollectorRunResponse {
  job_id: string;
  status: CollectorStatus;
  requested_trade_date: string;
  source: string;
  fetched_rows: number;
  collected_symbols: number;
  inserted_rows: number;
  updated_rows: number;
  invalid_rows: number;
  missing_symbols: string[];
  warnings: string[];
  error_message: string | null;
  scanner_refresh_required: boolean;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface CollectorHistoryResponse {
  count: number;
  jobs: CollectorRunResponse[];
}