export function extractApiError(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const payload = data as Record<string, unknown>;
    for (const key of ['detail', 'message', 'error']) {
      const value = payload[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
  }

  return `Backend request failed with HTTP ${status}.`;
}
