import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  FileText,
  Loader2,
  RefreshCw,
  Save,
  UploadCloud,
} from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { dseApi } from '../services/dseApi';
import {
  DataStatusResponse,
  DriveImportResponse,
  DriveStatusResponse,
  OhlcPreviewResponse,
} from '../types/api';

type ImportCategory = {
  name: string;
  format: string;
  required: string[];
  optional?: string[];
  example: string;
};

type Notice = {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
};

const categories: ImportCategory[] = [
  { name: 'DSE OHLC Data', format: 'CSV', required: ['symbol', 'date/trade_date', 'open', 'high', 'low', 'close', 'volume'], optional: ['trade', 'value'], example: 'GP,2026-07-16,280,286,278,284,510000' },
  { name: 'Sector Master List', format: 'CSV', required: ['symbol', 'sector'], optional: ['company'], example: 'SQURPHARMA,Pharmaceuticals & Chemicals,Square Pharmaceuticals Ltd.' },
  { name: 'Watchlist', format: 'CSV', required: ['symbol'], optional: ['company', 'sector', 'note'], example: 'GP,Grameenphone Ltd.,Telecommunication,Review near support' },
  { name: 'Portfolio Holdings', format: 'CSV', required: ['symbol', 'quantity', 'average_cost'], optional: ['company', 'sector', 'note'], example: 'BATBC,100,410.50,BAT Bangladesh,Food & Allied' },
  { name: 'Trade Journal', format: 'CSV', required: ['date', 'symbol', 'side', 'entry', 'stop', 'status'], optional: ['exit', 'quantity', 'fees', 'notes', 'setup', 'grade'], example: '2026-07-16,GP,LONG,284,274,PLANNED' },
  { name: 'Backtest Dataset', format: 'CSV', required: ['symbol', 'date', 'open', 'high', 'low', 'close'], optional: ['volume', 'trade', 'value'], example: 'BRACBANK,2026-07-16,38,39,37,38.5,1900000' },
];

const requiredByCategory: Record<string, string[]> = {
  'DSE OHLC Data': ['symbol', 'open', 'high', 'low', 'close', 'volume'],
  'Sector Master List': ['symbol', 'sector'],
  Watchlist: ['symbol'],
  'Portfolio Holdings': ['symbol', 'quantity', 'average_cost'],
  'Trade Journal': ['date', 'symbol', 'side', 'entry', 'stop', 'status'],
  'Backtest Dataset': ['symbol', 'date', 'open', 'high', 'low', 'close'],
};

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const next = line[index + 1];

    if (character === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      cells.push(value.trim());
      value = '';
    } else {
      value += character;
    }
  }

  cells.push(value.trim());
  return cells;
}

function formatCount(value: number | null | undefined): string {
  return typeof value === 'number' ? value.toLocaleString('en-US') : 'Unknown';
}

export default function DataImport() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0].name);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [lastPreview, setLastPreview] = useState('Not loaded');
  const [backendConnected, setBackendConnected] = useState(false);
  const [driveStatus, setDriveStatus] = useState<DriveStatusResponse | null>(null);
  const [dataStatus, setDataStatus] = useState<DataStatusResponse | null>(null);
  const [backendPreview, setBackendPreview] = useState<OhlcPreviewResponse | null>(null);
  const [importResult, setImportResult] = useState<DriveImportResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  const required = requiredByCategory[selectedCategory] || [];
  const normalizedHeaders = headers.map((header) => header.trim().toLowerCase());
  const isOhlcImport = selectedCategory === 'DSE OHLC Data';

  const missingColumns = useMemo(() => {
    if (selectedCategory === 'DSE OHLC Data') {
      const dateOk = normalizedHeaders.includes('date') || normalizedHeaders.includes('trade_date');
      return required.filter((column) => !normalizedHeaders.includes(column)).concat(dateOk ? [] : ['date or trade_date']);
    }
    return required.filter((column) => !normalizedHeaders.includes(column));
  }, [normalizedHeaders, required, selectedCategory]);

  const extraColumns = headers.filter((header) => {
    const normalized = header.trim().toLowerCase();
    if (selectedCategory === 'DSE OHLC Data' && (normalized === 'date' || normalized === 'trade_date')) return false;
    return !required.includes(normalized);
  });

  const refreshStatus = useCallback(async () => {
    setStatusLoading(true);
    const [healthResult, driveResult, dataResult] = await Promise.all([
      dseApi.health(),
      dseApi.driveStatus(),
      dseApi.dataStatus(),
    ]);

    setBackendConnected(healthResult.ok);
    setBackendError(healthResult.ok ? null : healthResult.error || 'Backend is unavailable.');
    setDriveStatus(driveResult.ok ? driveResult.data : null);
    setDataStatus(dataResult.ok ? dataResult.data : null);
    setStatusLoading(false);
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const resetSelectedFile = () => {
    setSelectedFile(null);
    setFileName('');
    setHeaders([]);
    setRows([]);
    setTotalRows(0);
    setLastPreview('Not loaded');
    setBackendPreview(null);
    setImportResult(null);
    setNotice(null);
  };

  const handleCategory = (category: string) => {
    setSelectedCategory(category);
    resetSelectedFile();
  };

  const handleFile = async (file?: File) => {
    if (!file) return;

    setSelectedFile(file);
    setFileName(file.name);
    setBackendPreview(null);
    setImportResult(null);
    setNotice(null);

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const parsed = lines.map(parseCsvLine);
    setHeaders(parsed[0] || []);
    setRows(parsed.slice(1, 21));
    setTotalRows(Math.max(parsed.length - 1, 0));
    setLastPreview(new Date().toLocaleString('en-GB'));

    if (!isOhlcImport) {
      setNotice({ type: 'info', message: 'Local preview complete. Automatic Google Drive saving is currently enabled only for DSE OHLC Data.' });
      return;
    }

    setPreviewLoading(true);
    const previewResult = await dseApi.previewOhlc(file);
    setPreviewLoading(false);

    if (!previewResult.ok || !previewResult.data) {
      setNotice({ type: 'error', message: previewResult.error || 'Backend validation failed.' });
      return;
    }

    setBackendPreview(previewResult.data);
    if (previewResult.data.ok) {
      setNotice({
        type: previewResult.data.invalid_rows > 0 ? 'warning' : 'success',
        message: `Backend validation complete: ${formatCount(previewResult.data.valid_rows)} valid rows and ${formatCount(previewResult.data.invalid_rows)} invalid rows.`,
      });
    } else {
      setNotice({ type: 'error', message: previewResult.data.errors.join(' ') || 'The CSV did not pass backend validation.' });
    }
  };

  const saveToDrive = async () => {
    if (!selectedFile || !backendPreview?.ok) {
      setNotice({ type: 'error', message: 'Select and validate a DSE OHLC CSV first.' });
      return;
    }
    if (!driveStatus?.configured) {
      setNotice({ type: 'error', message: 'Google Drive storage is not configured on the backend yet.' });
      return;
    }
    if (!driveStatus.connected) {
      setNotice({ type: 'error', message: driveStatus.message || 'Google Drive storage is unavailable.' });
      return;
    }

    setSaving(true);
    setImportResult(null);
    setNotice({ type: 'info', message: 'Merging validated OHLC rows and saving the master dataset to Google Drive…' });

    const result = await dseApi.importOhlcToDrive(selectedFile);
    if (!result.ok || !result.data?.ok) {
      setSaving(false);
      setNotice({ type: 'error', message: result.data?.message || result.error || 'Google Drive save failed.' });
      return;
    }

    setImportResult(result.data);
    setNotice({
      type: 'success',
      message: `Saved to Google Drive: ${formatCount(result.data.inserted_rows)} inserted, ${formatCount(result.data.updated_rows)} updated, ${formatCount(result.data.invalid_rows)} invalid.`,
    });
    await refreshStatus();
    setSaving(false);
  };

  const driveReady = Boolean(driveStatus?.configured && driveStatus.connected);
  const fileReady = Boolean(selectedFile && isOhlcImport && backendPreview?.ok && missingColumns.length === 0);
  const canSave = fileReady && driveReady && !saving && !previewLoading;

  const pageBadge = importResult?.ok
    ? <StatusBadge status="positive" label="IMPORT COMPLETE" />
    : driveReady && backendConnected
      ? <StatusBadge status="positive" label="DRIVE STORAGE READY" />
      : backendConnected
        ? <StatusBadge status="warning" label="DRIVE NOT READY" />
        : <StatusBadge status="negative" label="BACKEND OFFLINE" />;

  const storageMessage = !backendConnected
    ? `Backend connection failed. ${backendError || ''}`.trim()
    : !driveStatus?.configured
      ? 'Backend is connected, but Google Drive storage credentials are not configured yet.'
      : !driveStatus.connected
        ? driveStatus.message
        : `Google Drive is connected to ${driveStatus.folder_name || 'the configured storage folder'}. Uploads will update ${driveStatus.master_filename}.`;

  const verifiedRows = importResult?.rows_count ?? dataStatus?.rows_count;
  const verifiedSymbols = importResult?.symbols_count ?? dataStatus?.symbols_count;
  const verifiedLatestDate = importResult?.latest_trade_date ?? dataStatus?.latest_trade_date;

  return (
    <PageContainer id="data-import-route">
      <PageHeader
        title="Data Import"
        description="Validate DSE OHLC files, save them through the backend, and automatically update the Google Drive master dataset."
        breadcrumbs={[{ label: 'Data Import', path: '/data-import' }]}
        action={pageBadge}
      />

      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void refreshStatus()}
            disabled={statusLoading}
            className="inline-flex items-center gap-2 rounded-md border border-border-dark bg-[#161B22] px-3 py-2 text-xs font-mono font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${statusLoading ? 'animate-spin' : ''}`} />
            Refresh Connection
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatusCard label="Backend API" value={statusLoading ? 'Checking…' : backendConnected ? 'Connected' : 'Offline'} tone={backendConnected ? 'positive' : 'negative'} />
          <StatusCard label="Google Drive" value={statusLoading ? 'Checking…' : driveReady ? 'Connected' : driveStatus?.configured ? 'Unavailable' : 'Not Configured'} tone={driveReady ? 'positive' : 'warning'} />
          <StatusCard label="Master Rows" value={formatCount(verifiedRows)} tone={verifiedRows ? 'positive' : 'neutral'} />
          <StatusCard label="Latest OHLC Date" value={verifiedLatestDate || 'Unknown'} tone={verifiedLatestDate ? 'positive' : 'neutral'} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => handleCategory(category.name)}
              className={`rounded-xl border p-4 text-left transition-colors ${selectedCategory === category.name ? 'border-[#58A6FF] bg-[#58A6FF]/10' : 'border-border-dark bg-[#0D1117] hover:border-[#484F58]'}`}
            >
              <div className="flex items-center gap-2 text-sm font-bold text-white"><FileText className="h-4 w-4" />{category.name}</div>
              <p className="mt-2 text-[11px] text-text-secondary">Format: {category.format}</p>
              <p className="mt-1 text-[11px] text-text-secondary">Required: {category.required.join(', ')}</p>
              <p className="mt-2 truncate rounded bg-[#161B22] p-2 font-mono text-[10px] text-text-secondary">{category.example}</p>
            </button>
          ))}
        </div>

        <div className="space-y-5 rounded-xl border border-border-dark bg-[#0D1117] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">CSV Validation & Google Drive Save</h3>
              <p className="text-xs text-text-secondary">The browser shows a quick preview. The backend validates, merges by symbol + trade_date, saves the master CSV to Drive, and refreshes its local cache.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#238636] px-4 py-2 text-xs font-mono font-bold text-white">
              <UploadCloud className="h-4 w-4" /> Select CSV
              <input type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <StatusCard label="Selected Type" value={selectedCategory} />
            <StatusCard label="File" value={fileName || 'None'} />
            <StatusCard label="Rows Detected" value={formatCount(totalRows)} />
            <StatusCard label="Last Preview" value={lastPreview} />
          </div>

          <div className="rounded-lg border border-border-dark bg-[#161B22]/40 p-4 text-xs">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="font-bold text-white">Validation Panel</h4>
              {previewLoading && <span className="inline-flex items-center gap-2 text-[#58A6FF]"><Loader2 className="h-4 w-4 animate-spin" />Backend validating…</span>}
            </div>
            <div className="grid grid-cols-1 gap-3 text-text-secondary md:grid-cols-2">
              <div>Detected headers: <span className="text-white">{headers.length ? headers.join(', ') : 'None'}</span></div>
              <div>Missing required columns: <span className={missingColumns.length ? 'text-[#F85149]' : 'text-[#3FB950]'}>{headers.length ? (missingColumns.join(', ') || 'None') : 'Upload file first'}</span></div>
              <div>Extra columns: <span className="text-white">{headers.length ? (extraColumns.join(', ') || 'None') : 'Upload file first'}</span></div>
              <div>Backend valid rows: <span className="text-white">{formatCount(backendPreview?.valid_rows)}</span></div>
              <div>Backend invalid rows: <span className={backendPreview?.invalid_rows ? 'text-[#F85149]' : 'text-white'}>{formatCount(backendPreview?.invalid_rows)}</span></div>
              <div>Symbols detected: <span className="text-white">{formatCount(backendPreview?.symbols_count)}</span></div>
              <div>Latest file date: <span className="text-white">{backendPreview?.latest_trade_date || 'Unknown'}</span></div>
              <div>Storage target: <span className="text-white">{driveStatus?.master_filename || 'Google Drive master CSV'}</span></div>
            </div>
            {backendPreview?.warnings.length ? <div className="mt-3 text-[#D29922]">Warnings: {backendPreview.warnings.join(' ')}</div> : null}
            {backendPreview?.errors.length ? <div className="mt-3 text-[#F85149]">Errors: {backendPreview.errors.join(' ')}</div> : null}
          </div>

          <div className="overflow-x-auto rounded-lg border border-border-dark">
            <table className="w-full min-w-[760px] text-left font-mono text-[11px]">
              <thead className="bg-[#161B22] uppercase text-text-secondary">
                <tr>{headers.map((header, index) => <th key={`${header}-${index}`} className="px-3 py-3">{header}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-border-dark/50">
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>{headers.map((header, cellIndex) => <td key={`${header}-${cellIndex}`} className="px-3 py-3 text-white">{row[cellIndex] || ''}</td>)}</tr>
                ))}
              </tbody>
            </table>
            {!headers.length && <div className="py-10 text-center text-xs text-text-secondary">Select a CSV to preview the first 20 rows.</div>}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border-dark bg-[#161B22]/40 p-4 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-text-secondary">
              <div className="font-bold text-white">Save destination: Google Drive</div>
              <div className="mt-1">Rows are upserted by <span className="font-mono text-white">symbol + trade_date</span>. Existing dates update; new dates append without duplicate keys.</div>
            </div>
            <button
              type="button"
              onClick={() => void saveToDrive()}
              disabled={!canSave}
              className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-md bg-[#238636] px-5 py-3 text-xs font-mono font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-[#21262D] disabled:text-text-secondary"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving…' : 'Save to Google Drive'}
            </button>
          </div>

          {!isOhlcImport && (
            <div className="rounded-lg border border-[#58A6FF]/30 bg-[#58A6FF]/5 p-4 text-xs text-[#58A6FF]">
              Automatic Drive saving is currently enabled for DSE OHLC Data. Other import categories remain preview-only until their storage schemas are added.
            </div>
          )}

          {notice && <NoticePanel notice={notice} />}

          {importResult?.ok && (
            <div className="rounded-xl border border-[#238636]/40 bg-[#238636]/10 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-[#3FB950]"><CheckCircle2 className="h-5 w-5" />Google Drive Import Verified</div>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-6">
                <ResultMetric label="Inserted" value={formatCount(importResult.inserted_rows)} />
                <ResultMetric label="Updated" value={formatCount(importResult.updated_rows)} />
                <ResultMetric label="Invalid" value={formatCount(importResult.invalid_rows)} />
                <ResultMetric label="Total Rows" value={formatCount(importResult.rows_count)} />
                <ResultMetric label="Symbols" value={formatCount(importResult.symbols_count)} />
                <ResultMetric label="Latest Date" value={importResult.latest_trade_date || 'Unknown'} />
              </div>
              <div className="mt-4 border-t border-[#238636]/20 pt-4 text-xs text-text-secondary">
                Canonical file: <span className="font-bold text-white">{importResult.master_filename}</span>. Google Drive master and the backend local cache were refreshed successfully.
              </div>
            </div>
          )}
        </div>

        <div className={`rounded-xl border p-4 text-xs ${driveReady ? 'border-[#238636]/30 bg-[#238636]/5 text-[#3FB950]' : 'border-[#D29922]/30 bg-[#D29922]/5 text-[#D29922]'}`}>
          <div className="flex items-start gap-2">
            {driveReady ? <Cloud className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{storageMessage}</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function StatusCard({ label, value, tone = 'neutral' }: { label: string; value: string | number; tone?: 'positive' | 'negative' | 'warning' | 'neutral' }) {
  const valueClass = tone === 'positive'
    ? 'text-[#3FB950]'
    : tone === 'negative'
      ? 'text-[#F85149]'
      : tone === 'warning'
        ? 'text-[#D29922]'
        : 'text-white';

  return (
    <div className="rounded-lg border border-border-dark bg-[#0D1117] p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">{label}</div>
      <div className={`mt-2 break-words text-sm font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}

function NoticePanel({ notice }: { notice: Notice }) {
  const classes = notice.type === 'success'
    ? 'border-[#238636]/40 bg-[#238636]/10 text-[#3FB950]'
    : notice.type === 'error'
      ? 'border-[#F85149]/40 bg-[#F85149]/10 text-[#F85149]'
      : notice.type === 'warning'
        ? 'border-[#D29922]/40 bg-[#D29922]/10 text-[#D29922]'
        : 'border-[#58A6FF]/40 bg-[#58A6FF]/10 text-[#58A6FF]';

  return (
    <div className={`rounded-lg border p-4 text-xs ${classes}`}>
      {notice.message}
    </div>
  );
}

function ResultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#238636]/20 bg-[#0D1117]/70 p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">{label}</div>
      <div className="mt-2 break-words text-sm font-bold text-white">{value}</div>
    </div>
  );
}
