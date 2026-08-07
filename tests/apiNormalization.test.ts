import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeScannerResult,
  normalizeSignalGrade,
  normalizeSignalsResult,
} from '../src/services/apiNormalization';
import type {
  ApiResult,
  DseBackendCandidate,
  DseScannerLatestResponse,
  DseSignalsResponse,
} from '../src/types/api';

function scannerResult(source: string, candidates: DseBackendCandidate[] = []): ApiResult<DseScannerLatestResponse> {
  return {
    ok: true,
    status: 200,
    error: null,
    data: {
      ok: true,
      mode: 'production',
      data_source: source,
      scanned_symbols: candidates.length || 1,
      eligible_symbols: candidates.length || 1,
      qualified_count: 1,
      watch_count: 0,
      rejected_count: 0,
      candidates,
    },
  };
}

function signalsResult(source: string, signals: DseBackendCandidate[] = []): ApiResult<DseSignalsResponse> {
  return {
    ok: true,
    status: 200,
    error: null,
    data: {
      mode: 'production',
      data_source: source,
      signals,
    },
  };
}

test('database source remains database', () => {
  assert.equal(normalizeScannerResult(scannerResult('database')).data?.data_source, 'database');
  assert.equal(normalizeSignalsResult(signalsResult('database')).data?.data_source, 'database');
});

test('verified file-storage aliases normalize to local_csv', () => {
  for (const source of ['local_csv', 'google_drive', 'vercel_blob', 'blob']) {
    assert.equal(normalizeScannerResult(scannerResult(source)).data?.data_source, 'local_csv');
    assert.equal(normalizeSignalsResult(signalsResult(source)).data?.data_source, 'local_csv');
  }
});

test('unknown and none sources are not promoted to a verified source', () => {
  for (const source of ['none', 'demo', 'synthetic', 'unknown']) {
    assert.equal(normalizeScannerResult(scannerResult(source)).data?.data_source, source);
    assert.equal(normalizeSignalsResult(signalsResult(source)).data?.data_source, source);
  }
});

test('backend canonical Reject grade normalizes to UI REJECT', () => {
  const rejected = { symbol: 'ACI', grade: 'Reject', score: 40 } as unknown as DseBackendCandidate;

  assert.equal(normalizeSignalGrade('Reject'), 'REJECT');
  assert.equal(normalizeSignalGrade('A+'), 'A+');
  assert.equal(normalizeScannerResult(scannerResult('database', [rejected])).data?.candidates[0]?.grade, 'REJECT');
  assert.equal(normalizeSignalsResult(signalsResult('database', [rejected])).data?.signals[0]?.grade, 'REJECT');
});

test('null payloads remain unchanged', () => {
  const result = { ok: false, status: 503, data: null, error: 'Unavailable' } as ApiResult<DseScannerLatestResponse>;
  assert.deepEqual(normalizeScannerResult(result), result);
});
