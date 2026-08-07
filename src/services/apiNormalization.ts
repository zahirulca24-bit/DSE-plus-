import {
  ApiResult,
  DseApiSignalGrade,
  DseBackendCandidate,
  DseScannerLatestResponse,
  DseSignalGrade,
  DseSignalsResponse,
} from '../types/api';

const REAL_STORAGE_SOURCES = new Set(['database', 'local_csv', 'google_drive', 'vercel_blob', 'blob']);

function normalizeSource(value: string): string {
  const normalized = value.toLowerCase();
  if (!REAL_STORAGE_SOURCES.has(normalized)) return value;
  return normalized === 'database' ? 'database' : 'local_csv';
}

export function normalizeSignalGrade(value: DseApiSignalGrade | DseSignalGrade): DseSignalGrade {
  return value === 'Reject' ? 'REJECT' : value;
}

function normalizeCandidate(candidate: DseBackendCandidate): DseBackendCandidate {
  // Network JSON can contain the backend canonical `Reject` value even though
  // downstream frontend state only accepts normalized UI grades.
  const wireGrade = candidate.grade as DseApiSignalGrade | DseSignalGrade;
  return {
    ...candidate,
    grade: normalizeSignalGrade(wireGrade),
  };
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
      candidates: result.data.candidates.map(normalizeCandidate),
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
      signals: result.data.signals.map(normalizeCandidate),
    },
  };
}
