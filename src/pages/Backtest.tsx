import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Database, RefreshCw, Server, ShieldAlert } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { dseApi } from '../services/dseApi';
import { DataSourceResponse, DataStatusResponse } from '../types/api';

function sourceLabel(source?: string): string {
  if (source === 'database') return 'Cloud SQL / Database';
  if (source === 'local_csv') return 'Verified Local CSV';
  return 'No verified source';
}

export default function Backtest() {
  const [dataSource, setDataSource] = useState<DataSourceResponse | null>(null);
  const [dataStatus, setDataStatus] = useState<DataStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [source, data] = await Promise.all([
      dseApi.dataSource(),
      dseApi.dataStatus(),
    ]);

    setDataSource(source.ok ? source.data : null);
    setDataStatus(data.ok ? data.data : null);

    const failure = [source, data].find((result) => !result.ok);
    if (failure) setError(failure.error || 'Backtest data readiness check failed.');
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const dataReady = Boolean(
    dataStatus?.data_available
    && dataStatus.rows_count
    && dataSource?.preferred_source !== 'none',
  );

  return (
    <PageContainer id="backtest-route-main">
      <PageHeader
        title="Backtesting Suite"
        description="Historical strategy testing will use only verified DSE OHLC data selected by the backend source contract."
        breadcrumbs={[{ label: 'Backtest', path: '/backtest' }]}
        action={<StatusBadge status={dataReady ? 'warning' : 'negative'} label={dataReady ? 'ENGINE NOT CONNECTED' : 'DATA NOT READY'} />}
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
            Refresh Data Status
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-[#DA3633]/30 bg-[#DA3633]/5 p-4 text-sm text-[#FF7B72]">
            {error} No fallback or fabricated backtest result was loaded.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatusCard icon={<Server className="h-4 w-4" />} label="Verified Source" value={sourceLabel(dataSource?.preferred_source)} />
          <StatusCard icon={<Database className="h-4 w-4" />} label="Historical Rows" value={dataStatus?.rows_count?.toLocaleString('en-US') || '—'} />
          <StatusCard icon={<BarChart3 className="h-4 w-4" />} label="Latest OHLC" value={dataStatus?.latest_trade_date || '—'} />
        </div>

        <div className="rounded-xl border border-[#D29922]/30 bg-[#D29922]/5 p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#D29922]" />
            <div>
              <h2 className="text-sm font-bold text-white">Backend backtest engine required</h2>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                Demo and pre-computed results remain disabled. Win rate, P/L, drawdown, trade logs, and equity curves will appear only after the backend calculates them from the verified active OHLC source.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border-dark bg-[#0D1117] p-6">
          <h3 className="text-sm font-bold text-white">Locked production flow</h3>
          <div className="mt-4 font-mono text-xs leading-7 text-text-secondary">
            Verified import → backend validation → database-first source selection → backtest engine → calculated results
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function StatusCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-dark bg-[#0D1117] p-5">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-text-secondary">{icon}{label}</div>
      <div className="mt-3 text-base font-bold text-white">{value}</div>
    </div>
  );
}
