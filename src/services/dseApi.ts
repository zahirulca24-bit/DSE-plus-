import { apiGet, apiPost, apiPostJson } from './apiClient';
import {
  ApiHealthResponse,
  CollectorHistoryResponse,
  CollectorRunRequest,
  CollectorRunResponse,
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
  collectorRun: (request: CollectorRunRequest, token: string) =>
    apiPostJson<CollectorRunResponse, CollectorRunRequest>(
      '/collector/run',
      request,
      { 'X-Collector-Token': token },
      30000,
    ),
  collectorLatest: () => apiGet<CollectorRunResponse>('/collector/latest'),
  collectorStatus: (jobId: string) =>
    apiGet<CollectorRunResponse>(`/collector/status/${encodeURIComponent(jobId)}`),
  collectorHistory: (limit = 20) =>
    apiGet<CollectorHistoryResponse>(`/collector/history?limit=${limit}`),
};
