import { apiGet, apiPost } from './apiClient';
import {
  ApiHealthResponse,
  DseScannerLatestResponse,
  DseSignalsResponse,
  DseStatusResponse,
} from '../types/api';

export const dseApi = {
  health: () => apiGet<ApiHealthResponse>('/health'),
  status: () => apiGet<DseStatusResponse>('/status'),
  signals: () => apiGet<DseSignalsResponse>('/signals'),
  scannerStatus: () => apiGet<Record<string, unknown>>('/scanner/status'),
  scannerLatest: () => apiGet<DseScannerLatestResponse>('/scanner/latest'),
  scannerRun: () => apiPost<DseScannerLatestResponse>('/scanner/run', 60000),
};
