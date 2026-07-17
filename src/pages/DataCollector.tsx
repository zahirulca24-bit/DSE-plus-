import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Database,
  LoaderCircle,
  Play,
  RefreshCw,
  ShieldKeyhole,
} from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { dseApi } from '../services/dseApi';
import { CollectorRunResponse, CollectorStatus } from '../types/api';

const terminalStatuses: CollectorStatus[] = ['completed', 'failed'];

export default function DataCollector() {
  const [adminToken, setAdminToken] = useState('');
  const [tradeDate, setTradeDate] = useState('');
  const [collectMissing, setCollectMissing] = useState(true);
  const [job, setJob] = useState<CollectorRunResponse | null>(null);
  const [history, setHistory] = useState<CollectorRunResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState('Ready. The collector token is never saved in the browser.');

  const isActive = job?.status === 'queued' || job?.status === 'running';

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    const [latestResult, historyResult] = await Promise.all([
      dseApi.collectorLatest(),
      dseApi.collectorHistory(10),
    ]);
    if (latestResult.ok && latestResult.data) {
      setJob(latestResult.data);
    }
    if (historyResult.ok && historyResult.data) {
      setHistory(historyResult.data.jobs);
    }
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!job || terminalStatuses.includes(job.status)) return undefined;

    const interval = window.setInterval(async () => {
      const result = await dseApi.collectorStatus(job.job_id);
      if (!result.ok || !result.data) return;
      setJob(result.data);
      if (terminalStatuses.includes(result.data.status)) {
        setMessage(
          result.data.status === 'completed'
            ? 'Collection completed. Review the database counts and run a fresh scanner next.'
            : result.data.error_message || 'Collection failed. Review the job error below.',
        );
        const historyResult = await dseApi.collectorHistory(10);
        if (historyResult.ok && historyResult.data) setHistory(historyResult.data.jobs);
      }
    }, 2500);

    return () => window.clearInterval(interval);
  }, [job]);

  const runCollector = async () => {
    const token = adminToken.trim();
    if (!token) {
      setMessage('Enter the backend collector token before starting a protected run.');
      return;
    }

    setIsSubmitting(true);
    setMessage('Submitting protected collector job...');
    const result = await dseApi.collectorRun(
      { trade_date: tradeDate || null, collect_missing: collectMissing },
      token,
    );
    setIsSubmitting(false);

    if (!result.ok || !result.data) {
      setMessage(result.error || 'Collector request failed.');
      return;
    }

    setJob(result.data);
    setAdminToken('');
    setMessage(`Collector job ${result.data.job_id} accepted. Status will refresh automatically.`);
  };

  const badge = useMemo(() => statusBadge(job?.status), [job?.status]);

  return (
    <PageContainer id="data-collector-route">
      <PageHeader
        title="Data Collector"
        description="Run the protected backend Python collector, backfill missing DSE sessions, validate OHLC rows, and upsert approved symbols into Supabase/Postgres."
        breadcrumbs={[{ label: 'Data Collector', path: '/data-collector' }]}
        action={<StatusBadge status={badge.status} label={badge.label} />}
      />

      <div className="space-y-6">
        <div className="rounded-xl border border-border-dark bg-[#0D1117] p-5">
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-[#58A6FF]/30 bg-[#58A6FF]/10 p-2 text-[#58A6FF]">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Protected Manual Collection</h3>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-text-secondary">
                  The backend fetches DSE historical rows, keeps only the existing audited OHLC universe, rejects invalid prices, and upserts by symbol and trade date. No broker or order execution is included.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <label className="space-y-2">
                <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-text-secondary">
                  <ShieldKeyhole className="h-3.5 w-3.5" /> Collector Token
                </span>
                <input
                  type="password"
                  value={adminToken}
                  onChange={(event) => setAdminToken(event.target.value)}
                  autoComplete="off"
                  placeholder="Enter Render COLLECTOR_ADMIN_TOKEN"
                  className="w-full rounded-md border border-border-dark bg-[#161B22] px-3 py-2.5 text-sm text-white outline-none focus:border-[#58A6FF]"
                />
                <p className="text-[10px] text-text-secondary">Held in memory only and cleared after an accepted request.</p>
              </label>

              <label className="space-y-2">
                <span className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-text-secondary">
                  <CalendarDays className="h-3.5 w-3.5" /> Target Trade Date
                </span>
                <input
                  type="date"
                  value={tradeDate}
                  onChange={(event) => setTradeDate(event.target.value)}
                  className="w-full rounded-md border border-border-dark bg-[#161B22] px-3 py-2.5 text-sm text-white outline-none focus:border-[#58A6FF]"
                />
                <p className="text-[10px] text-text-secondary">Leave blank to use the latest completed Bangladesh trading-day candidate.</p>
              </label>

              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">Collection Mode</span>
                <label className="flex min-h-[42px] cursor-pointer items-center gap-3 rounded-md border border-border-dark bg-[#161B22] px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={collectMissing}
                    onChange={(event) => setCollectMissing(event.target.checked)}
                    className="h-4 w-4 accent-[#238636]"
                  />
                  <span className="text-xs text-white">Backfill missing dates through target</span>
                </label>
                <p className="text-[10px] text-text-secondary">Safe automatic backfill is limited to 45 calendar days.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border-dark pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-text-secondary">{message}</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void refresh()}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-2 rounded-md border border-border-dark bg-[#161B22] px-4 py-2 text-xs font-mono font-bold text-white disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <button
                  type="button"
                  onClick={() => void runCollector()}
                  disabled={isSubmitting || isActive}
                  className="inline-flex items-center gap-2 rounded-md bg-[#238636] px-4 py-2 text-xs font-mono font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting || isActive ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {isActive ? 'Collector Running' : 'Run Data Collector'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          <MetricCard label="Status" value={job?.status || 'No job'} />
          <MetricCard label="Target Date" value={job?.requested_trade_date || 'Automatic'} />
          <MetricCard label="Fetched Rows" value={job?.fetched_rows ?? 0} />
          <MetricCard label="Symbols" value={job?.collected_symbols ?? 0} />
          <MetricCard label="Inserted" value={job?.inserted_rows ?? 0} positive />
          <MetricCard label="Updated" value={job?.updated_rows ?? 0} />
          <MetricCard label="Invalid" value={job?.invalid_rows ?? 0} warning={(job?.invalid_rows ?? 0) > 0} />
        </div>

        {job && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border-dark bg-[#0D1117] p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                {job.status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-[#238636]" /> : <AlertTriangle className="h-4 w-4 text-[#D29922]" />}
                Latest Job Details
              </div>
              <dl className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                <Detail label="Job ID" value={job.job_id} />
                <Detail label="Source" value={job.source} />
                <Detail label="Created" value={formatDateTime(job.created_at)} />
                <Detail label="Completed" value={formatDateTime(job.completed_at)} />
                <Detail label="Scanner Refresh" value={job.scanner_refresh_required ? 'Required' : 'Not required'} />
                <Detail label="Missing Symbols" value={job.missing_symbols.length} />
              </dl>
              {job.error_message && (
                <div className="mt-4 rounded-lg border border-[#F85149]/30 bg-[#F85149]/10 p-3 text-xs text-[#F85149]">
                  {job.error_message}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border-dark bg-[#0D1117] p-5">
              <h3 className="text-sm font-bold text-white">Warnings & Missing Symbols</h3>
              <div className="mt-4 max-h-52 space-y-2 overflow-y-auto text-xs text-text-secondary">
                {!job.warnings.length && !job.missing_symbols.length && <p>No collector warnings reported.</p>}
                {job.warnings.map((warning) => (
                  <div key={warning} className="rounded border border-[#D29922]/20 bg-[#D29922]/5 p-2 text-[#D29922]">{warning}</div>
                ))}
                {!!job.missing_symbols.length && (
                  <div className="rounded border border-border-dark bg-[#161B22] p-3 font-mono text-[11px] text-white">
                    {job.missing_symbols.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-border-dark bg-[#0D1117] p-5">
          <h3 className="text-sm font-bold text-white">Recent Collector Jobs</h3>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border-dark">
            <table className="w-full min-w-[850px] text-left text-[11px] font-mono">
              <thead className="bg-[#161B22] uppercase text-text-secondary">
                <tr>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Source</th>
                  <th className="px-3 py-3">Fetched</th>
                  <th className="px-3 py-3">Inserted</th>
                  <th className="px-3 py-3">Updated</th>
                  <th className="px-3 py-3">Invalid</th>
                  <th className="px-3 py-3">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark/50">
                {history.map((item) => (
                  <tr key={item.job_id} className="text-white">
                    <td className="px-3 py-3">{item.requested_trade_date}</td>
                    <td className="px-3 py-3 uppercase">{item.status}</td>
                    <td className="px-3 py-3">{item.source}</td>
                    <td className="px-3 py-3">{item.fetched_rows}</td>
                    <td className="px-3 py-3 text-[#238636]">{item.inserted_rows}</td>
                    <td className="px-3 py-3">{item.updated_rows}</td>
                    <td className="px-3 py-3 text-[#D29922]">{item.invalid_rows}</td>
                    <td className="px-3 py-3 text-text-secondary">{formatDateTime(item.completed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!history.length && <div className="py-10 text-center text-xs text-text-secondary">No collector job history is available yet.</div>}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function statusBadge(status?: CollectorStatus) {
  if (status === 'completed') return { status: 'positive', label: 'COLLECTION COMPLETE' };
  if (status === 'failed') return { status: 'negative', label: 'COLLECTION FAILED' };
  if (status === 'queued' || status === 'running') return { status: 'warning', label: 'COLLECTOR RUNNING' };
  return { status: 'neutral', label: 'MANUAL COLLECTOR' };
}

function MetricCard({ label, value, positive = false, warning = false }: { label: string; value: string | number; positive?: boolean; warning?: boolean }) {
  const valueClass = warning ? 'text-[#D29922]' : positive ? 'text-[#238636]' : 'text-white';
  return (
    <div className="rounded-lg border border-border-dark bg-[#0D1117] p-4">
      <div className="text-[9px] font-mono uppercase tracking-wider text-text-secondary">{label}</div>
      <div className={`mt-2 break-words text-sm font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[9px] font-mono uppercase tracking-wider text-text-secondary">{label}</dt>
      <dd className="mt-1 break-all text-white">{value}</dd>
    </div>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return 'Not completed';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString('en-GB');
}
