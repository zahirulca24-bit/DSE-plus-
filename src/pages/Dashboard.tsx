import { useCallback, useEffect, useState } from 'react';
import { Activity, Cloud, Database, RefreshCw, ShieldCheck } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { dseApi } from '../services/dseApi';
import { DataStatusResponse, DriveStatusResponse } from '../types/api';

function formatCount(value: number | null | undefined): string {
  return typeof value === 'number' ? value.toLocaleString('en-US') : '—';
}

export default function Dashboard() {
  const [backendConnected, setBackendConnected] = useState(false);
  const [driveStatus, setDriveStatus] = useState<DriveStatusResponse | null>(null);
  const [dataStatus, setDataStatus] = useState<DataStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [health, drive, data] = await Promise.all([
      dseApi.health(),
      dseApi.driveStatus(),
      dseApi.dataStatus(),
    ]);
    setBackendConnected(health.ok);
    setDriveStatus(drive.ok ? drive.data : null);
    setDataStatus(data.ok ? data.data : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const driveReady = Boolean(driveStatus?.configured && driveStatus.connected);
  const dataReady = Boolean(dataStatus?.data_available);

  return (
    <PageContainer id="dashboard-route">
      <PageHeader
        title="DSE Pulse Dashboard"
        description="Live system readiness and market-data storage status. No mock market values are displayed."
        breadcrumbs={[{ label: 'Dashboard', path: '/' }]}
        action={<StatusBadge status={backendConnected && driveReady ? 'positive' : 'warning'} label={backendConnected && driveReady ? 'SYSTEM READY' : 'SETUP REQUIRED'} />}
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatusCard icon={<Activity className="h-4 w-4" />} label="Backend API" value={loading ? 'Checking…' : backendConnected ? 'Connected' : 'Offline'} positive={backendConnected} />
          <StatusCard icon={<Cloud className="h-4 w-4" />} label="Google Drive" value={loading ? 'Checking…' : driveReady ? 'Connected' : driveStatus?.configured ? 'Unavailable' : 'Not Configured'} positive={driveReady} />
          <StatusCard icon={<Database className="h-4 w-4" />} label="Master Rows" value={formatCount(dataStatus?.rows_count)} positive={dataReady} />
          <StatusCard icon={<ShieldCheck className="h-4 w-4" />} label="Latest OHLC Date" value={dataStatus?.latest_trade_date || '—'} positive={Boolean(dataStatus?.latest_trade_date)} />
        </div>

        <div className="rounded-xl border border-border-dark bg-[#0D1117] p-6">
          <h2 className="text-sm font-bold text-white">Production Data Policy</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 text-xs text-text-secondary md:grid-cols-2">
            <div className="rounded-lg border border-border-dark bg-[#161B22]/40 p-4">
              <div className="font-bold text-white">Storage Root</div>
              <div className="mt-2">{driveStatus?.folder_name || 'DSE Pulse / Market Data & Backtest Storage'}</div>
              <div className="mt-1 font-mono text-[11px]">{driveStatus?.master_filename || 'DSE_OHLC_MASTER.csv'}</div>
            </div>
            <div className="rounded-lg border border-border-dark bg-[#161B22]/40 p-4">
              <div className="font-bold text-white">Data Source</div>
              <div className="mt-2">{dataReady ? 'Backend local cache' : 'No real market dataset loaded'}</div>
              <div className="mt-1">Mock/demo market values are disabled.</div>
            </div>
          </div>
        </div>

        {!dataReady && (
          <div className="rounded-xl border border-[#D29922]/30 bg-[#D29922]/5 p-5 text-sm text-[#D29922]">
            Upload and save the verified DSE OHLC master CSV from Data Import after Google Drive credentials are connected. Until then, Scanner, Signals, Backtest, Market Regime, and Sector Analysis must not present fabricated results.
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function StatusCard({ icon, label, value, positive }: { icon: React.ReactNode; label: string; value: string; positive: boolean }) {
  return (
    <div className="rounded-xl border border-border-dark bg-[#0D1117] p-5">
      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-text-secondary">{icon}{label}</div>
      <div className={`mt-3 text-lg font-bold ${positive ? 'text-[#3FB950]' : 'text-[#D29922]'}`}>{value}</div>
    </div>
  );
}