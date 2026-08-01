import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Database, FileText, KeyRound, Loader2, RefreshCw, UploadCloud } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { dseApi } from '../services/dseApi';
import { DatabaseStatusResponse, DataStatusResponse, OhlcPreviewResponse } from '../types/api';
import { ProductionDataImportResponse } from '../types/dataImport';

function formatCount(value: number | null | undefined): string {
  return typeof value === 'number' ? value.toLocaleString('en-US') : '—';
}

export default function DataImport() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<OhlcPreviewResponse | null>(null);
  const [database, setDatabase] = useState<DatabaseStatusResponse | null>(null);
  const [data, setData] = useState<DataStatusResponse | null>(null);
  const [result, setResult] = useState<ProductionDataImportResponse | null>(null);
  const [adminToken, setAdminToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [databaseResult, dataResult] = await Promise.all([dseApi.databaseStatus(), dseApi.dataStatus()]);
    setDatabase(databaseResult.ok ? databaseResult.data : null);
    setData(dataResult.ok ? dataResult.data : null);
    const failure = [databaseResult, dataResult].find((item) => !item.ok);
    if (failure) setError(failure.error || 'Backend readiness check failed.');
    setLoading(false);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const databaseReady = Boolean(database?.configured && database?.connected);
  const previewReady = Boolean(preview?.ok && preview.valid_rows > 0);
  const canImport = databaseReady && adminToken.trim().length > 0 && previewReady && Boolean(file) && !importing;

  const pageStatus = useMemo(() => {
    if (!databaseReady) return <StatusBadge status="negative" label="DATABASE OFFLINE" />;
    if (result?.ok) return <StatusBadge status="positive" label="IMPORT COMPLETE" />;
    if (previewReady) return <StatusBadge status="positive" label="READY TO IMPORT" />;
    return <StatusBadge status="warning" label="CSV REQUIRED" />;
  }, [databaseReady, previewReady, result]);

  async function selectFile(selected?: File) {
    if (!selected) return;
    setFile(selected);
    setPreview(null);
    setResult(null);
    setError(null);
    setValidating(true);
    const response = await dseApi.previewOhlc(selected);
    setValidating(false);
    if (!response.ok || !response.data) {
      setError(response.error || 'Backend CSV validation failed.');
      return;
    }
    setPreview(response.data);
    if (!response.data.ok) setError(response.data.errors.join(' ') || 'CSV validation failed.');
  }

  async function importToDatabase() {
    if (!file || !canImport) return;
    setImporting(true);
    setResult(null);
    setError(null);
    const response = await dseApi.importProductionData(file, adminToken.trim());
    setImporting(false);
    if (!response.ok || !response.data?.ok) {
      setResult(response.data || null);
      setError(response.data?.errors?.join(' ') || response.data?.message || response.error || 'Cloud SQL import failed.');
      return;
    }
    setResult(response.data);
    await refresh();
  }

  return (
    <PageContainer id="data-import-route">
      <PageHeader title="Data Import" description="Validate verified DSE OHLCV CSV files and import them directly into Cloud SQL. No Blob, Drive, demo, or synthetic fallback is used." breadcrumbs={[{ label: 'Data Import', path: '/data-import' }]} action={pageStatus} />
      <div className="space-y-6">
        <div className="flex justify-end"><button type="button" onClick={() => void refresh()} disabled={loading || importing} className="inline-flex items-center gap-2 rounded-md border border-border-dark bg-[#161B22] px-3 py-2 text-xs font-mono font-bold text-white disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Status</button></div>
        {error && <div className="flex items-start gap-3 rounded-xl border border-[#DA3633]/30 bg-[#DA3633]/5 p-4 text-sm text-[#FF7B72]"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />{error}</div>}
        {result?.ok && <div className="flex items-start gap-3 rounded-xl border border-[#3FB950]/30 bg-[#3FB950]/5 p-4 text-sm text-[#56D364]"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />{result.message}</div>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatusCard label="Cloud SQL" value={loading ? 'Checking…' : databaseReady ? 'Connected' : 'Unavailable'} positive={databaseReady} />
          <StatusCard label="Stored Rows" value={formatCount(data?.rows_count)} positive={Boolean(data?.rows_count)} />
          <StatusCard label="Symbols" value={formatCount(data?.symbols_count)} positive={Boolean(data?.symbols_count)} />
          <StatusCard label="Latest OHLC" value={data?.latest_trade_date || '—'} positive={Boolean(data?.latest_trade_date)} />
        </div>
        <section className="rounded-xl border border-border-dark bg-[#0D1117] p-5">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr_auto] xl:items-end">
            <label><span className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-text-secondary"><FileText className="h-3.5 w-3.5" /> Verified DSE OHLCV CSV</span><label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[#58A6FF]/50 bg-[#58A6FF]/5 px-4 py-3 text-sm font-bold text-white"><UploadCloud className="h-4 w-4" /> {file?.name || 'Select CSV'}<input type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => void selectFile(event.target.files?.[0])} /></label></label>
            <label><span className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-text-secondary"><KeyRound className="h-3.5 w-3.5" /> Backend admin token</span><input type="password" value={adminToken} onChange={(event) => setAdminToken(event.target.value)} autoComplete="off" placeholder="Enter BACKEND_ADMIN_TOKEN" className="w-full rounded-md border border-border-dark bg-[#161B22] px-3 py-3 text-sm text-white outline-none focus:border-[#58A6FF]" /><span className="mt-2 block text-[10px] text-text-secondary">Sent only as X-Admin-Token for this request. It is not stored.</span></label>
            <button type="button" onClick={() => void importToDatabase()} disabled={!canImport} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#238636] px-5 py-3 text-xs font-mono font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}{importing ? 'Importing…' : 'Import to Cloud SQL'}</button>
          </div>
        </section>
        <section className="rounded-xl border border-border-dark bg-[#0D1117] p-5"><h2 className="text-sm font-bold text-white">Validation</h2>{validating ? <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary"><Loader2 className="h-4 w-4 animate-spin" />Validating CSV with backend…</div> : preview ? <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"><SmallMetric label="Valid Rows" value={formatCount(preview.valid_rows)} /><SmallMetric label="Invalid Rows" value={formatCount(preview.invalid_rows)} /><SmallMetric label="Symbols" value={formatCount(preview.symbols_count)} /><SmallMetric label="Latest Date" value={preview.latest_trade_date || '—'} /></div> : <p className="mt-3 text-xs text-text-secondary">Select a CSV to run backend validation.</p>}</section>
        {result && <section className="rounded-xl border border-border-dark bg-[#0D1117] p-5"><h2 className="text-sm font-bold text-white">Import result</h2><div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"><SmallMetric label="Inserted" value={formatCount(result.inserted)} /><SmallMetric label="Updated" value={formatCount(result.updated)} /><SmallMetric label="Rejected" value={formatCount(result.rejected)} /><SmallMetric label="Duplicates" value={formatCount(result.duplicate)} /></div></section>}
      </div>
    </PageContainer>
  );
}

function StatusCard({ label, value, positive }: { label: string; value: string; positive: boolean }) { return <div className="rounded-xl border border-border-dark bg-[#0D1117] p-5"><div className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">{label}</div><div className={`mt-3 text-lg font-bold ${positive ? 'text-[#3FB950]' : 'text-[#D29922]'}`}>{value}</div></div>; }
function SmallMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-border-dark bg-[#161B22]/40 p-3"><div className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">{label}</div><div className="mt-1 text-xs font-bold text-white">{value}</div></div>; }
