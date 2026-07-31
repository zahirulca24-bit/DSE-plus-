import { useCallback, useEffect, useState } from 'react';
import { Activity, Database, RefreshCw, Server, ShieldCheck } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { dseApi } from '../services/dseApi';
import { DatabaseStatusResponse, DataSourceResponse, DataStatusResponse } from '../types/api';

function formatCount(value: number | null | undefined): string {
  return typeof value === 'number' ? value.toLocaleString('en-US') : '—';
}

function sourceLabel(source?: string): string {
  if (source === 'database') return 'Cloud SQL / Database';
  if (source === 'local_csv') return 'Verified Local CSV';
  return 'No verified source';
}

export default function Dashboard() {
  const [backendConnected, setBackendConnected] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatusResponse | null>(null);
  const [dataSource, setDataSource] = useState<DataSourceResponse | null>(null);
  const [dataStatus, setDataStatus] = useState<DataStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [health, database, source, data] = await Promise.all([
      dseApi.health(),
      dseApi.databaseStatus(),
      dseApi.dataSource(),
      dseApi.dataStatus(),
    ]);

    setBackendConnected(health.ok);
    setDatabaseStatus(database.ok ? database.data : null);
    setDataSource(source.ok ? source.data : null);
    setDataStatus(data.ok ? data.data : null);

    const failure = [health, source, data].find((result) => !result.ok);
    if (failure) setError(failure.error || 'Backend readiness check failed.');
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const dataReady = Boolean(dataStatus?.data_available && dataSource?.preferred_source !== 'none');
  const systemReady = backendConnected && dataReady;

  return (
    <PageContainer id="dashboard-route">
      <PageHeader
        title="DSE Pulse Dashboard"
        description="Verified backend, database, and DSE market-data readiness. No mock market values are displayed."
        breadcrumbs={[{ label: 'Dashboard', path: '/' }]}
        action={<StatusBadge status={systemReady ? 'positive' : 'warning'} label={systemReady ? 'SYSTEM READY' : 'SETUP REQUIRED'} />}
      />

      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-border-dark bg-[#161B22] px-3 py-2 text-xs font-mono font-bold text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Live Status
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-[#DA3633]/30 bg-[#DA3633]/5 p-4 text-sm text-[#FF7B72]">
            {error} No fallback or fabricated values were loaded.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatusCard icon={<Activity className="h-4 w-4" />} label="Backend API" value={loading ? 'Checking…' : backendConnected ? 'Connected' : 'Offline'} positive={backendConnected} />
          <StatusCard icon={<Database className="h-4 w-4" />} label="Cloud SQL" value={loading ? 'Checking…' : databaseStatus?.connected ? 'Connected' : databaseStatus?.configured ? 'Unavailable' : 'Not Configured'} positive={Boolean(databaseStatus?.connected)} />
          <StatusCard icon={<Server className="h-4 w-4" />} label="Verified Source" value={loading ? 'Checking…' : sourceLabel(dataSource?.preferred_source)} positive={dataReady} />
          <StatusCard icon={<ShieldCheck className="h-4 w-4" />} label="Latest OHLC Date" value={dataStatus?.latest_trade_date || '—'} positive={Boolean(dataStatus?.latest_trade_date)} />
        </div>

        <div className="rounded-xl border border-border-dark bg-[#0D1117] p-6">
          <h2 className="text-sm font-bold text-white">Market Data Integrity</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 text-xs text-text-secondary md:grid-cols-3">
            <Metric label="Rows" value={formatCount(dataStatus?.rows_count)} />
            <Metric label="Symbols" value={formatCount(dataStatus?.symbols_count)} />
            <Metric label="Date Range" value={dataStatus?.earliest_trade_date && dataStatus?.latest_trade_date ? `${dataStatus.earliest_trade_date} → ${dataStatus.latest_trade_date}` : '—'} />
          </div>
          <div className="mt-4 rounded-lg border border-border-dark bg-[#161B22]/40 p-4">
            <div className="font-bold text-white">Active source: {sourceLabel(dataSource?.preferred_source)}</div>
            <div className="mt-1">{dataStatus?.message || 'No verified market-data status returned.'}</div>
            <div className="mt-1">Database-first fallback is allowed only when the selected source contains verified rows.</div>
          </div>
        </div>

        {!dataReady && (
          <div className="rounded-xl border border-[#D29922]/30 bg-[#D29922]/5 p-5 text-sm text-[#D29922]">
            Load verified DSE OHLC data before using Scanner or Signals. Empty database tables, unavailable storage, and missing API configuration fail closed.
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border-dark bg-[#161B22]/40 p-4"><div className="font-mono text-[10px] uppercase tracking-wider">{label}</div><div className="mt-2 font-bold text-white">{value}</div></div>;
}

function StatusCard({ icon, label, value, positive }: { icon: React.ReactNode; label: string; value: string; positive: boolean }) {
  return (
    <div className="rounded-xl border border-border-dark bg-[#0D1117] p-5">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-text-secondary">{icon}{label}</div>
      <div className={`mt-3 text-lg font-bold ${positive ? 'text-[#3FB950]' : 'text-[#D29922]'}`}>{value}</div>
    </div>
  );
}
