import { apiGet } from './apiClient';
import { ApiHealthResponse } from '../types/api';

export const dseApi = {
  health: () => apiGet<ApiHealthResponse>('/health'),
  status: () => apiGet<Record<string, unknown>>('/status'),
  signals: () => apiGet<Record<string, unknown>>('/signals'),
  scannerStatus: () => apiGet<Record<string, unknown>>('/scanner/status'),
};
