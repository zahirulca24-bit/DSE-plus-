import { apiGet, apiPost, apiPostForm, apiPostJson } from './apiClient';
import {
  ApiHealthResponse,
  BlobImportResponse,
  BlobStatusResponse,
  CollectorHistoryResponse,
  CollectorRunRequest,
  CollectorRunResponse,
  DatabaseImportResponse,
  DatabaseInitResponse,
  DatabaseStatusResponse,
  DataAuditResponse,
  DataSourceResponse,
  DataStatusResponse,
  DseScannerLatestResponse,
  DseSignalsResponse,
  DseStatusResponse,
  OhlcPreviewResponse,
} from '../types/api';

function fileForm(file: File): FormData {
  const formData = new FormData();
  formData.append('file', file, file.name);
  return formData;
}

export const dseApi = {
  health: () => apiGet<ApiHealthResponse>('/health'),
  status: () => apiGet<DseStatusResponse>('/status'),
  signals: () => apiGet<DseSignalsResponse>('/signals'),
  scannerStatus: () => apiGet<Record<string, unknown>>('/scanner/status'),
  scannerLatest: () => apiGet<DseScannerLatestResponse>('/scanner/latest'),
  scannerRun: () => apiPost<DseScannerLatestResponse>('/scanner/run', 60000),
  storageStatus: () => apiGet<BlobStatusResponse>('/storage/status'),
  dataStatus: () => apiGet<DataStatusResponse>('/data/status'),
  previewOhlc: (file: File) =>
    apiPostForm<OhlcPreviewResponse>('/data/ohlc/preview', fileForm(file), 60000),
  importOhlcToBlob: (file: File) =>
    apiPostForm<BlobImportResponse>('/data/ohlc/import-blob', fileForm(file), 300000),
  databaseStatus: () => apiGet<DatabaseStatusResponse>('/db/status'),
  initializeDatabase: () => apiPost<DatabaseInitResponse>('/db/init', 30000),
  dataSource: () => apiGet<DataSourceResponse>('/data/source'),
  dataAudit: () => apiGet<DataAuditResponse>('/data/audit', 60000),
  importOhlcToDatabase: (file: File) =>
    apiPostForm<DatabaseImportResponse>('/data/ohlc/import-db', fileForm(file), 300000),
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
