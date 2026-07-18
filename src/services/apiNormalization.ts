import { ApiResult, DseScannerLatestResponse, DseSignalsResponse } from '../types/api';

const REAL_STORAGE_SOURCES = new Set(['database', 'local_csv', 'google_drive', 'vercel_blob', 'blob']);

function normalizeSource(value?: string): string | undefined {
  if (!value) return value;
  return REAL_STORAGE_SOURCES.has(value.toLowerCase())
    ? value.toLowerCase() === 'database' ? 'database' : 'local_csv'
    : value;
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
