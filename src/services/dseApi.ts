import { apiGet, apiPost, apiPostForm, apiPostJson } from './apiClient';
import { normalizeScannerResult, normalizeSignalsResult } from './apiNormalization';
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
  health: () => apiGet<ApiHealthResponse>('/health', 60000),
  status: () => apiGet<DseStatusResponse>('/status', 60000),
  signals: async () => normalizeSignalsResult(await apiGet<DseSignalsResponse>('/signals', 60000)),
  scannerStatus: () => apiGet<Record<string, unknown>>('/scanner/status', 60000),
  scannerLatest: async () => normalizeScannerResult(await apiGet<DseScannerLatestResponse>('/scanner/latest', 60000)),
  scannerRun: async () => normalizeScannerResult(await apiPost<DseScannerLatestResponse>('/scanner/run', 120000)),
  storageStatus: () => apiGet<BlobStatusResponse>('/storage/status', 60000),
  driveStatus: () => apiGet<BlobStatusResponse>('/storage/status', 60000),
  dataStatus: () => apiGet<DataStatusResponse>('/data/status', 60000),
  previewOhlc: (file: File) =>
    apiPostForm<OhlcPreviewResponse>('/data/ohlc/preview', fileForm(file), 120000),
  importOhlcToBlob: (file: File) =>
    apiPostForm<BlobImportResponse>('/data/ohlc/import-blob', fileForm(file), 300000),
  importOhlcToDrive: (file: File) =>
    apiPostForm<BlobImportResponse>('/data/ohlc/import-blob', fileForm(file), 300000),
  databaseStatus: () => apiGet<DatabaseStatusResponse>('/db/status', 60000),
  initializeDatabase: () => apiPost<DatabaseInitResponse>('/db/init', 60000),
  dataSource: () => apiGet<DataSourceResponse>('/data/source', 60000),
  dataAudit: () => apiGet<DataAuditResponse>('/data/audit', 120000),
  importOhlcToDatabase: (file: File) =>
    apiPostForm<DatabaseImportResponse>('/data/ohlc/import-db', fileForm(file), 300000),
  collectorRun: (request: CollectorRunRequest, token: string) =>
    apiPostJson<CollectorRunResponse, CollectorRunRequest>(
      '/collector/run',
      request,
      { 'X-Collector-Token': token },
      60000,
    ),
  collectorLatest: () => apiGet<CollectorRunResponse>('/collector/latest', 60000),
  collectorStatus: (jobId: string) =>
    apiGet<CollectorRunResponse>(`/collector/status/${encodeURIComponent(jobId)}`, 60000),
  collectorHistory: (limit = 20) =>
    apiGet<CollectorHistoryResponse>(`/collector/history?limit=${limit}`, 60000),
};
