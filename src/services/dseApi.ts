import { apiGet, apiPost, apiPostForm, apiPostJson } from './apiClient';
import { API_ENDPOINTS } from './apiEndpoints';
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
import { ProductionCollectorStatusResponse } from '../types/collector';
import { ProductionDataImportResponse } from '../types/dataImport';

function fileForm(file: File): FormData {
  const formData = new FormData();
  formData.append('file', file, file.name);
  return formData;
}

const storageStatus = () => apiGet<BlobStatusResponse>(API_ENDPOINTS.storageStatus, 60000);
const importOhlcToLocal = (file: File) =>
  apiPostForm<BlobImportResponse>(API_ENDPOINTS.importOhlcToLocal, fileForm(file), 300000);
const adminHeaders = (token: string) => ({ 'X-Admin-Token': token });

export const dseApi = {
  health: () => apiGet<ApiHealthResponse>(API_ENDPOINTS.health, 60000),
  status: () => apiGet<DseStatusResponse>(API_ENDPOINTS.status, 60000),
  signals: async () => normalizeSignalsResult(await apiGet<DseSignalsResponse>(API_ENDPOINTS.signals, 60000)),
  scannerStatus: () => apiGet<Record<string, unknown>>(API_ENDPOINTS.scannerStatus, 60000),
  scannerLatest: async () => normalizeScannerResult(await apiGet<DseScannerLatestResponse>(API_ENDPOINTS.scannerLatest, 60000)),
  // Browser UI must never execute the protected scanner route or carry an admin secret.
  // Keep the existing store contract read-only by refreshing the latest persisted scanner result.
  scannerRun: async () => normalizeScannerResult(await apiGet<DseScannerLatestResponse>(API_ENDPOINTS.scannerLatest, 60000)),
  storageStatus,
  dataStatus: () => apiGet<DataStatusResponse>(API_ENDPOINTS.dataStatus, 60000),
  previewOhlc: (file: File, token: string) =>
    apiPostForm<OhlcPreviewResponse>(API_ENDPOINTS.previewOhlc, fileForm(file), 120000, adminHeaders(token)),
  importProductionData: (file: File, token: string) =>
    apiPostForm<ProductionDataImportResponse>(API_ENDPOINTS.dataImport, fileForm(file), 300000, adminHeaders(token)),
  importOhlcToLocal,
  databaseStatus: () => apiGet<DatabaseStatusResponse>(API_ENDPOINTS.databaseStatus, 60000),
  initializeDatabase: () => apiPost<DatabaseInitResponse>(API_ENDPOINTS.initializeDatabase, 60000),
  dataSource: () => apiGet<DataSourceResponse>(API_ENDPOINTS.dataSource, 60000),
  dataAudit: () => apiGet<DataAuditResponse>(API_ENDPOINTS.dataAudit, 120000),
  importOhlcToDatabase: (file: File) =>
    apiPostForm<DatabaseImportResponse>(API_ENDPOINTS.importOhlcToDatabase, fileForm(file), 300000),
  collectorRun: (request: CollectorRunRequest, token: string) =>
    apiPostJson<ProductionCollectorStatusResponse, CollectorRunRequest>(API_ENDPOINTS.collectorRun, request, adminHeaders(token), 120000),
  collectorStatus: () => apiGet<ProductionCollectorStatusResponse>(API_ENDPOINTS.collectorProductionStatus, 60000),
  collectorStart: (token: string) =>
    apiPostJson<ProductionCollectorStatusResponse, Record<string, never>>(API_ENDPOINTS.collectorStart, {}, adminHeaders(token), 60000),
  collectorStop: (token: string) =>
    apiPostJson<ProductionCollectorStatusResponse, Record<string, never>>(API_ENDPOINTS.collectorStop, {}, adminHeaders(token), 60000),
  collectorLatest: () => apiGet<CollectorRunResponse>(API_ENDPOINTS.collectorLatest, 60000),
  collectorJobStatus: (jobId: string) => apiGet<CollectorRunResponse>(API_ENDPOINTS.collectorStatus(jobId), 60000),
  collectorHistory: (limit = 20) => apiGet<CollectorHistoryResponse>(API_ENDPOINTS.collectorHistory(limit), 60000),
  driveStatus: storageStatus,
  importOhlcToBlob: importOhlcToLocal,
  importOhlcToDrive: importOhlcToLocal,
};
