import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  Database,
  History,
  KeyRound,
  Play,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { dseApi } from '../services/dseApi';
import {
  CollectorHistoryResponse,
  CollectorRunResponse,
  DatabaseStatusResponse,
  DataStatusResponse,
} from '../types/api';

function number(value: number | null | undefined): string {
  return typeof value === 'number' ? value.toLocaleString('en-US') : '—';
}

function dateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });
}

function jobTone(status?: CollectorRunResponse['status']): 'positive' | 'warning' | 'negative' | 'neutral' {
  if (status === 'completed') return 'positive';
  if (status === 'failed') return 'negative';
  if (status === 'queued' || status === 'running') return 'warning';
  return 'neutral';
}

export default function DataCollector() {
  const [database, setDatabase] = useState<DatabaseStatusResponse | null>(null);
  const [data, setData] = useState<DataStatusResponse | null>(null);
  const [latestJob, setLatestJob] = useState<CollectorRunResponse | null>(null);
  const [history, setHistory] = useState<CollectorHistoryResponse | null>(null);
  const [tradeDate, setTradeDate] = useState('');
  const [collectMissing, setCollectMissing] = useState(true);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [databaseResult, dataResult, latestResult, historyResult] = await Promise.all([
      dseApi.databaseStatus(),
      dseApi.dataStatus(),
      dseApi.collectorLatest(),
      dseApi.collectorHistory(10),
    ]);

    setDatabase(databaseResult.ok ? databaseResult.data : null);
    setData(dataResult.ok ? dataResult.data : null);
    setLatestJob(latestResult.ok ? latestResult.data : null);
    setHistory(historyResult.ok ? historyResult.data : null);

    const requiredFailure = [databaseResult, dataResult].find((result) => !result.ok);
    if (requiredFailure) {
      setError(requiredFailure.error || 'Collector readiness check failed.');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const databaseReady = Boolean(database?.connected);
  const collectorBusy = latestJob?.status === 'queued' || latestJob?.status === 'running';
  const collectorReady = databaseReady && token.trim().length > 0 && !collectorBusy && !running;
  const pageStatus = useMemo(() => {
    if (!databaseReady) return { status: 'negative' as const, label: 'DATABASE OFFLINE' };
    if (collectorBusy) return { status: 'warning' as const, label: 'COLLECTOR RUNNING' };
    return { status: 'positive' as const, label: 'COLLECTOR READY' };
  }, [collectorBusy, databaseReady]);

  async function runCollector() {
    if (!token.trim()) {
      setError('Collector token is required. It is kept only in this page state and is not stored.');
      return;
    }

    setRunning(true);
    setError(null);
    setMessage(null);

    const result = await dseApi.collectorRun(
      {
        trade_date: tradeDate || null,
        collect_missing: collectMissing,
      },
      token.trim(),
    );

    if (!result.ok || !result.data) {
      setError(result.error || 'Collector run request failed.');
      setRunning(false);
      return;
    }

    setLatestJob(result.data);
    setMessage(`Collector job ${result.data.job_id} accepted with status ${result.data.status}.`);
    setRunning(false);
    await refresh();
  }

  return (
    <PageContainer id="data-collector-route">
      <PageHeader
        title="Data Collector"
        description="Run and monitor the verified DSE market-data collector backed by Cloud SQL. No demo or fabricated rows are accepted."
        breadcrumbs={[{ label: 'Data Collector', path: '/data-collector' }]}
        action={<StatusBadge status={pageStatus.status} label={pageStatus.label} />}
      />

      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading || running}
            className="inline-flex items-center gap-2 rounded-md border border-border-dark bg-[#161B22] px-3 py-2 text-xs font-mono font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
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
          <MetricCard icon={<Activity className="h-4 w-4" />} label="Collector" value={latestJob?.status || 'Idle'} positive={latestJob?.status === 'completed'} />
          <MetricCard icon={<CalendarDays className="h-4 w-4" />} label="Latest OHLC" value={data?.latest_trade_date || '—'} positive={Boolean(data?.latest_trade_date)} />
          <MetricCard icon={<History className="h-4 w-4" />} label="Stored Rows" value={number(data?.rows_count)} positive={Boolean(data?.rows_count)} />
        </div>

        <section className="rounded-xl border border-border-dark bg-[#0D1117] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
            <label className="flex-1">
              <span className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-text-secondary">
                <KeyRound className="h-3.5 w-3.5" /> Collector token
              </span>
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                autoComplete="off"
                placeholder="Enter collector token"
                className="w-full rounded-md border border-border-dark bg-[#161B22] px-3 py-2.5 text-sm text-white outline-none focus:border-[#58A6FF]"
              />
              <span className="mt-2 block text-[10px] text-text-secondary">Token is used only for this request and is not persisted by this page.</span>
            </label>

            <label className="xl:w-56">
              <span className="mb-2 block text-[10px] font-mono uppercase tracking-wider text-text-secondary">Trade date (optional)</span>
              <input
                type="date"
                value={tradeDate}
                onChange={(event) => setTradeDate(event.target.value)}
                className="w-full rounded-md border border-border-dark bg-[#161B22] px-3 py-2.5 text-sm text-white outline-none focus:border-[#58A6FF]"
              />
            </label>

            <label className="flex items-center gap-2 rounded-md border border-border-dark bg-[#161B22] px-3 py-2.5 text-xs text-white">
              <input
                type="checkbox"
                checked={collectMissing}
                onChange={(event) => setCollectMissing(event.target.checked)}
              />
              Collect missing symbols
            </label>

            <button
              type="button"
              onClick={() => void runCollector()}
              disabled={!collectorReady}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#238636] px-4 py-2.5 text-xs font-mono font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play className="h-4 w-4" />
              {running ? 'Starting…' : collectorBusy ? 'Collector Busy' : 'Run Collection Now'}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-border-dark bg-[#0D1117] p-5">
          <h2 className="text-sm font-bold text-white">Latest collector job</h2>
          {latestJob ? (
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={jobTone(latestJob.status)} label={latestJob.status.toUpperCase()} />
                <span className="font-mono text-xs text-text-secondary">{latestJob.job_id}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SmallMetric label="Requested Date" value={latestJob.requested_trade_date || 'Automatic'} />
                <SmallMetric label="Source" value={latestJob.source || '—'} />
                <SmallMetric label="Collected Symbols" value={number(latestJob.collected_symbols)} />
                <SmallMetric label="Fetched Rows" value={number(latestJob.fetched_rows)} />
                <SmallMetric label="Inserted" value={number(latestJob.inserted_rows)} />
                <SmallMetric label="Updated" value={number(latestJob.updated_rows)} />
                <SmallMetric label="Invalid" value={number(latestJob.invalid_rows)} />
                <SmallMetric label="Completed" value={dateTime(latestJob.completed_at)} />
              </div>
              {latestJob.error_message && (
                <div className="rounded-lg border border-[#DA3633]/30 bg-[#DA3633]/5 p-3 text-xs text-[#FF7B72]">{latestJob.error_message}</div>
              )}
              {latestJob.warnings.length > 0 && (
                <div className="rounded-lg border border-[#D29922]/30 bg-[#D29922]/5 p-3 text-xs text-[#D29922]">{latestJob.warnings.join(' · ')}</div>
              )}
            </div>
          ) : (
            <p className="mt-3 text-xs text-text-secondary">No collector job has been returned by the backend yet.</p>
          )}
        </section>

        <section className="rounded-xl border border-border-dark bg-[#0D1117] p-5">
          <h2 className="text-sm font-bold text-white">Recent history</h2>
          {history?.jobs?.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="font-mono uppercase tracking-wider text-text-secondary">
                  <tr className="border-b border-border-dark">
                    <th className="px-3 py-3">Job</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Inserted</th>
                    <th className="px-3 py-3">Updated</th>
                    <th className="px-3 py-3">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {history.jobs.map((job) => (
                    <tr key={job.job_id} className="border-b border-border-dark/70 text-white last:border-0">
                      <td className="px-3 py-3 font-mono text-text-secondary">{job.job_id}</td>
                      <td className="px-3 py-3">{job.status}</td>
                      <td className="px-3 py-3">{job.requested_trade_date || 'Automatic'}</td>
                      <td className="px-3 py-3">{number(job.inserted_rows)}</td>
                      <td className="px-3 py-3">{number(job.updated_rows)}</td>
                      <td className="px-3 py-3 text-text-secondary">{dateTime(job.completed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-3 text-xs text-text-secondary">No collector history is available.</p>
          )}
        </section>

        <div className="rounded-xl border border-[#58A6FF]/25 bg-[#58A6FF]/5 p-5 text-xs leading-relaxed text-text-secondary">
          <div className="font-bold text-white">Production data flow</div>
          <div className="mt-2 font-mono">Verified DSE source → validate OHLCV → upsert by symbol + trade_date → Cloud SQL → refresh scanner</div>
          <div className="mt-2">The frontend does not create, simulate, or substitute market data. If the backend has no verified source adapter, the run request must fail closed with a clear error.</div>
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
