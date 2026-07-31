import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateApiEnvironment, normalizeApiBaseUrl } from '../src/config/envPolicy';

test('API base URL normalization accepts HTTP(S), trims whitespace, and removes trailing slash', () => {
  assert.equal(normalizeApiBaseUrl(' https://api.example.com/ '), 'https://api.example.com');
  assert.equal(normalizeApiBaseUrl('http://127.0.0.1:8000/'), 'http://127.0.0.1:8000');
});

test('API base URL normalization rejects missing, malformed, and unsupported protocols', () => {
  assert.equal(normalizeApiBaseUrl(undefined), null);
  assert.equal(normalizeApiBaseUrl(''), null);
  assert.equal(normalizeApiBaseUrl('not-a-url'), null);
  assert.equal(normalizeApiBaseUrl('ftp://example.com'), null);
});

test('production policy blocks localhost and loopback backend URLs', () => {
  for (const url of ['http://localhost:8000', 'http://127.0.0.1:8000']) {
    const policy = evaluateApiEnvironment(url, true);
    assert.equal(policy.configured, true);
    assert.equal(policy.isLocalBackend, true);
    assert.equal(policy.productionSafe, false);
    assert.equal(policy.error, 'Production frontend cannot use a localhost backend URL.');
  }
});

test('development may use localhost while production accepts a remote HTTPS backend', () => {
  const development = evaluateApiEnvironment('http://localhost:8000', false);
  assert.equal(development.productionSafe, true);
  assert.equal(development.error, null);

  const production = evaluateApiEnvironment('https://dse-api.example.com', true);
  assert.equal(production.configured, true);
  assert.equal(production.isLocalBackend, false);
  assert.equal(production.productionSafe, true);
  assert.equal(production.error, null);
});

test('missing API URL always fails closed', () => {
  const policy = evaluateApiEnvironment(null, true);
  assert.equal(policy.configured, false);
  assert.equal(policy.productionSafe, false);
  assert.equal(policy.error, 'VITE_DSE_API_BASE_URL is missing or invalid.');
});
