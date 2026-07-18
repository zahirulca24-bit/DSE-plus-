import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Cloud, Database, RefreshCw, ShieldAlert } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { dseApi } from '../services/dseApi';
import { DataStatusResponse, DriveStatusResponse } from '../types/api';

export default function Backtest() {
  const [driveStatus, setDriveStatus] = useState<DriveStatusResponse | null>(null);
  const [dataStatus, setDataStatus] = useState<DataStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [drive, data] = await Promise.all([dseApi.driveStatus(), dseApi.dataStatus()]);
    setDriveStatus(drive.ok ? drive.data : null);
    setDataStatus(data.ok ? data.data : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const driveReady = Boolean(driveStatus?.connected);
  const dataReady = Boolean(dataStatus?.data_available && dataStatus.rows_count);

  return (
    <PageContainer id="backtest-route-main">
      <PageHeader
        title="Backtesting Suite"
        description="Historical strategy testing will run only on verified DSE OHLC data from the Google Drive-backed storage pipeline."
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatusCard icon={<Cloud className="h-4 w-4" />} label="Google Drive" value={driveReady ? 'Connected' : 'Not Connected'} />
          <StatusCard icon={<Database className="h-4 w-4" />} label="Historical Rows" value={dataStatus?.rows_count?.toLocaleString('en-US') || '—'} />
          <StatusCard icon={<BarChart3 className="h-4 w-4" />} label="Latest OHLC" value={dataStatus?.latest_trade_date || '—'} />
        </div>

        <div className="rounded-xl border border-[#D29922]/30 bg-[#D29922]/5 p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#D29922]" />
            <div>
              <h2 className="text-sm font-bold text-white">Real backtest engine required</h2>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                Previous demo/pre-computed backtest results have been disabled. This page will not show win rate, P/L, drawdown, trade logs, or equity curves until the Python backend backtest engine reads the verified Google Drive-backed OHLC dataset and returns calculated results.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border-dark bg-[#0D1117] p-6">
          <h3 className="text-sm font-bold text-white">Locked production flow</h3>
          <div className="mt-4 font-mono text-xs leading-7 text-text-secondary">
            App Data Import → Backend validation → Google Drive master CSV → Backend cache → Python backtest engine → Verified results
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
