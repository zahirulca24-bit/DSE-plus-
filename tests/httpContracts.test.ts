import assert from 'node:assert/strict';
import test from 'node:test';
import { extractApiError } from '../src/services/apiError';
import { API_ENDPOINTS } from '../src/services/apiEndpoints';

test('API error parser follows backend envelope precedence', () => {
  assert.equal(extractApiError({ detail: ' Detailed failure ' }, 400), 'Detailed failure');
  assert.equal(extractApiError({ message: 'Message failure', error: 'Error failure' }, 422), 'Message failure');
  assert.equal(extractApiError({ error: 'Error failure' }, 500), 'Error failure');
});

test('API error parser rejects empty or non-string fields', () => {
  assert.equal(extractApiError({ detail: '  ', message: 123 }, 503), 'Backend request failed with HTTP 503.');
  assert.equal(extractApiError('plain text', 502), 'Backend request failed with HTTP 502.');
  assert.equal(extractApiError(null, 404), 'Backend request failed with HTTP 404.');
});

test('core browser API endpoints remain read-only for scanner execution', () => {
  assert.equal(API_ENDPOINTS.health, '/health');
  assert.equal(API_ENDPOINTS.signals, '/signals');
  assert.equal(API_ENDPOINTS.scannerLatest, '/scanner/latest');
  assert.equal('scannerRun' in API_ENDPOINTS, false);
  assert.equal(API_ENDPOINTS.dataStatus, '/data/status');
  assert.equal(API_ENDPOINTS.dataSource, '/data/source');
  assert.equal(API_ENDPOINTS.databaseStatus, '/db/status');
});

test('dynamic collector endpoints encode identifiers and preserve limits', () => {
  assert.equal(API_ENDPOINTS.collectorStatus('job/with space'), '/collector/status/job%2Fwith%20space');
  assert.equal(API_ENDPOINTS.collectorHistory(25), '/collector/history?limit=25');
});
