import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  Database,
  KeyRound,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { dseApi } from '../services/dseApi';
import { CollectorRunRequest, DatabaseStatusResponse, DataStatusResponse } from '../types/api';
import { ProductionCollectorStatusResponse } from '../types/collector';

function number(value: number | null | undefined): string {
  return typeof value === 'number' ? value.toLocaleString('en-US') : '—';
}

function dateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });
}

export default function DataCollector() {
  const [database, setDatabase] = useState<DatabaseStatusResponse | null>(null);
  const [data, setData] = useState<DataStatusResponse | null>(null);
  const [collector, setCollector] = useState<ProductionCollectorStatusResponse | null>(null);
  const [tradeDate, setTradeDate] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [databaseResult, dataResult, collectorResult] = await Promise.all([
      dseApi.databaseStatus(),
      dseApi.dataStatus(),
      dseApi.collectorStatus(),
    ]);

    setDatabase(databaseResult.ok ? databaseResult.data : null);
    setData(dataResult.ok ? dataResult.data : null);
    setCollector(collectorResult.ok ? collectorResult.data : null);

    const failure = [databaseResult, dataResult, collectorResult].find((result) => !result.ok);
    if (failure) setError(failure.error || 'Collector readiness check failed.');
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const databaseReady = Boolean(database?.connected);
  const tokenReady = adminToken.trim().length > 0;
  const actionReady = databaseReady && tokenReady && !mutating && !collector?.running;
  const pageStatus = useMemo(() => {
    if (!databaseReady) return { status: 'negative' as const, label: 'DATABASE OFFLINE' };
    if (collector?.running) return { status: 'warning' as const, label: 'COLLECTOR RUNNING' };
    if (!collector?.source) return { status: 'warning' as const, label: 'SOURCE NOT CONFIGURED' };
    return { status: 'positive' as const, label: collector.enabled ? 'COLLECTOR ENABLED' : 'COLLECTOR READY' };
  }, [collector, databaseReady]);

  async function runCollector() {
    if (!tokenReady) {
      setError('Backend admin token is required. It is kept only in this page state and is not stored.');
      return;
    }

    setMutating(true);
    setError(null);
    setMessage(null);

    const request: CollectorRunRequest = {
      trade_date: tradeDate || null,
      collect_missing: true,
    };
    const result = await dseApi.collectorRun(request, adminToken.trim());

    if (!result.ok || !result.data) {
      setError(result.error || 'Collector run failed.');
    } else {
      setCollector(result.data);
      setMessage('Collector run completed and the production status was refreshed.');
    }

    setMutating(false);
    await refresh();
  }

  async function setCollectorEnabled(enabled: boolean) {
    if (!tokenReady) {
      setError('Backend admin token is required.');
      return;
    }

    setMutating(true);
    setError(null);
    setMessage(null);
    const result = enabled
      ? await dseApi.collectorStart(adminToken.trim())
      : await dseApi.collectorStop(adminToken.trim());

    if (!result.ok || !result.data) {
      setError(result.error || `Collector ${enabled ? 'start' : 'stop'} failed.`);
    } else {
      setCollector(result.data);
      setMessage(`Collector scheduling state ${enabled ? 'enabled' : 'disabled'}.`);
    }
    setMutating(false);
  }

  return (
    <PageContainer id="data-collector-route">
      <PageHeader
        title="Data Collector"
        description="Control the verified DSE collector backed by Cloud SQL. No demo, random, or fabricated market rows are accepted."
        breadcrumbs={[{ label: 'Data Collector', path: '/data-collector' }]}
        action={<StatusBadge status={pageStatus.status} label={pageStatus.label} />}
      />

      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading || mutating}
            className="inline-flex items-center gap-2 rounded-md border border-border-dark bg-[#161B22] px-3 py-2 text-xs font-mono font-bold text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-[#DA3633]/30 bg-[#DA3633]/5 p-4 text-sm text-[#FF7B72]">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="flex items-start gap-3 rounded-xl border border-[#3FB950]/30 bg-[#3FB950]/5 p-4 text-sm text-[#56D364]">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={<Database className="h-4 w-4" />} label="Cloud SQL" value={loading ? 'Checking…' : databaseReady ? 'Connected' : 'Unavailable'} positive={databaseReady} />
          <MetricCard icon={<Activity className="h-4 w-4" />} label="Collector" value={collector?.running ? 'Running' : collector?.enabled ? 'Enabled' : 'Stopped'} positive={Boolean(collector?.enabled)} />
          <MetricCard icon={<CalendarDays className="h-4 w-4" />} label="Latest OHLC" value={collector?.latest_trade_date || data?.latest_trade_date || '—'} positive={Boolean(collector?.latest_trade_date || data?.latest_trade_date)} />
          <MetricCard icon={<Activity className="h-4 w-4" />} label="Stored Rows" value={number(data?.rows_count)} positive={Boolean(data?.rows_count)} />
        </div>

        <section className="rounded-xl border border-border-dark bg-[#0D1117] p-5">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_220px_auto_auto_auto] xl:items-end">
            <label>
              <span className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-text-secondary">
                <KeyRound className="h-3.5 w-3.5" /> Backend admin token
              </span>
              <input
                type="password"
                value={adminToken}
                onChange={(event) => setAdminToken(event.target.value)}
                autoComplete="off"
                placeholder="Enter BACKEND_ADMIN_TOKEN"
                className="w-full rounded-md border border-border-dark bg-[#161B22] px-3 py-2.5 text-sm text-white outline-none focus:border-[#58A6FF]"
              />
              <span className="mt-2 block text-[10px] text-text-secondary">Used as X-Admin-Token for this request only. The page does not persist it.</span>
            </label>

            <label>
              <span className="mb-2 block text-[10px] font-mono uppercase tracking-wider text-text-secondary">Trade date (optional)</span>
              <input
                type="date"
                value={tradeDate}
                onChange={(event) => setTradeDate(event.target.value)}
                className="w-full rounded-md border border-border-dark bg-[#161B22] px-3 py-2.5 text-sm text-white outline-none focus:border-[#58A6FF]"
              />
            </label>

            <button
              type="button"
              onClick={() => void setCollectorEnabled(true)}
              disabled={!databaseReady || !tokenReady || mutating || Boolean(collector?.enabled)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#238636] px-4 py-2.5 text-xs font-mono font-bold text-[#56D364] disabled:opacity-40"
            >
              <Play className="h-4 w-4" /> Enable
            </button>

            <button
              type="button"
              onClick={() => void setCollectorEnabled(false)}
              disabled={!databaseReady || !tokenReady || mutating || !collector?.enabled}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#DA3633] px-4 py-2.5 text-xs font-mono font-bold text-[#FF7B72] disabled:opacity-40"
            >
              <Pause className="h-4 w-4" /> Disable
            </button>

            <button
              type="button"
              onClick={() => void runCollector()}
              disabled={!actionReady}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#238636] px-4 py-2.5 text-xs font-mono font-bold text-white disabled:opacity-40"
            >
              <Play className="h-4 w-4" /> {mutating ? 'Working…' : 'Run Now'}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-border-dark bg-[#0D1117] p-5">
          <h2 className="text-sm font-bold text-white">Production collector status</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SmallMetric label="Source" value={collector?.source || 'Not configured'} />
            <SmallMetric label="Symbols Updated" value={number(collector?.symbols_updated)} />
            <SmallMetric label="Inserted Rows" value={number(collector?.inserted_rows)} />
            <SmallMetric label="Updated Rows" value={number(collector?.updated_rows)} />
            <SmallMetric label="Rejected Rows" value={number(collector?.rejected_rows)} />
            <SmallMetric label="Last Started" value={dateTime(collector?.last_started_at)} />
            <SmallMetric label="Last Completed" value={dateTime(collector?.last_completed_at)} />
            <SmallMetric label="Latest Trade Date" value={collector?.latest_trade_date || '—'} />
          </div>
          {collector?.last_error && (
            <div className="mt-4 rounded-lg border border-[#DA3633]/30 bg-[#DA3633]/5 p-3 text-xs text-[#FF7B72]">{collector.last_error}</div>
          )}
        </section>

        <div className="rounded-xl border border-[#58A6FF]/25 bg-[#58A6FF]/5 p-5 text-xs leading-relaxed text-text-secondary">
          <div className="font-bold text-white">Production data flow</div>
          <div className="mt-2 font-mono">Verified DSE source → validate OHLCV → upsert by symbol + trade_date → Cloud SQL → scanner</div>
          <div className="mt-2">When no verified collector source is configured, Run Now fails closed and validated CSV import remains the approved ingestion path.</div>
        </div>
      </div>
    </PageContainer>
  );
}

function MetricCard({ icon, label, value, positive }: { icon: React.ReactNode; label: string; value: string; positive: boolean }) {
  return (
    <div className="rounded-xl border border-border-dark bg-[#0D1117] p-5">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-text-secondary">{icon}{label}</div>
      <div className={`mt-3 text-lg font-bold ${positive ? 'text-[#3FB950]' : 'text-[#D29922]'}`}>{value}</div>
    </div>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border-dark bg-[#161B22]/40 p-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">{label}</div>
      <div className="mt-1 break-words text-xs font-bold text-white">{value}</div>
    </div>
  );
}
