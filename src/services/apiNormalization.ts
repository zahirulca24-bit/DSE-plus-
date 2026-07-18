import { ApiResult, DseScannerLatestResponse, DseSignalsResponse } from '../types/api';

const REAL_STORAGE_SOURCES = new Set(['database', 'local_csv', 'google_drive', 'vercel_blob', 'blob']);

function normalizeSource(value: string): string {
  const normalized = value.toLowerCase();
  if (!REAL_STORAGE_SOURCES.has(normalized)) return value;
  return normalized === 'database' ? 'database' : 'local_csv';
}

export function normalizeScannerResult(
  result: ApiResult<DseScannerLatestResponse>,
): ApiResult<DseScannerLatestResponse> {
  if (!result.data || typeof result.data !== 'object') return result;
  return {
    ...result,
    data: {
      ...result.data,
      data_source: normalizeSource(result.data.data_source),
    },
  };
}

export function normalizeSignalsResult(
  result: ApiResult<DseSignalsResponse>,
): ApiResult<DseSignalsResponse> {
  if (!result.data || typeof result.data !== 'object') return result;
  return {
    ...result,
    data: {
      ...result.data,
      data_source: normalizeSource(result.data.data_source),
    },
  };
}
