import type { Candidate } from '../types/scanner';
import type { DseEntryStatus } from '../types/api';

const KNOWN_ENTRY_STATUSES = new Set<DseEntryStatus>(['READY', 'NEAR', 'WATCH', 'NOT_READY']);

export function mapEntryStatus(status?: DseEntryStatus): Candidate['entryStatus'] {
  if (status && KNOWN_ENTRY_STATUSES.has(status)) return status;
  return 'NOT_READY';
}
