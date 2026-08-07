import assert from 'node:assert/strict';
import test from 'node:test';
import { mapEntryStatus } from '../src/services/entryStatus';

test('backend NOT_READY remains NOT_READY in the UI contract', () => {
  assert.equal(mapEntryStatus('NOT_READY'), 'NOT_READY');
});

test('known entry statuses remain unchanged', () => {
  assert.equal(mapEntryStatus('READY'), 'READY');
  assert.equal(mapEntryStatus('NEAR'), 'NEAR');
  assert.equal(mapEntryStatus('WATCH'), 'WATCH');
});

test('missing entry status fails closed as NOT_READY', () => {
  assert.equal(mapEntryStatus(undefined), 'NOT_READY');
});
