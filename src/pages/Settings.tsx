import { useCallback, useEffect, useState } from 'react';
import { Activity, Cloud, Database, RefreshCw, ShieldAlert } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { dseApi } from '../services/dseApi';
import { DataStatusResponse, DriveStatusResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_DSE_API_BASE_URL as string | undefined;

export default function Settings() {
  const [backendConnected, setBackendConnected] = useState(false);
  const [driveStatus, setDriveStatus] = useState<DriveStatusResponse | null>(null);
  const [dataStatus, setDataStatus] = useState<DataStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [health, drive, data] = await Promise.all([dseApi.health(), dseApi.driveStatus(), dseApi.dataStatus()]);
    setBackendConnected(health.ok);
    setDriveStatus(drive.ok ? drive.data : null);
    setDataStatus(data.ok ? data.data : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const driveReady = Boolean(driveStatus?.configured && driveStatus.connected);

  return (
    <PageContainer id="settings-route">
      <PageHeader
        title="Settings"
        description="Production connection status, Drive storage configuration, and locked DSE signal rules."
        breadcrumbs={[{ label: 'Settings', path: '/settings' }]}
        action={<StatusBadge status={backendConnected && driveReady ? 'positive' : 'warning'} label={backendConnected && driveReady ? 'CONNECTED' : 'SETUP REQUIRED'} />}
      />

      <div className="space-y-6">
        <div className="flex justify-end">
          <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-md border border-border-dark bg-[#161B22] px-3 py-2 text-xs font-mono font-bold text-white disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh Status</button>
        </div>

        <Section title="Application" icon={<Activity className="h-4 w-4" />}>
          <Grid items={[
            ['App Name', 'DSE Pulse'],
            ['Environment', import.meta.env.PROD ? 'Production' : 'Development'],
            ['Timezone', 'Asia/Dhaka'],
            ['Market', 'Dhaka Stock Exchange'],
            ['Mock Market Data', 'Disabled'],
          ]} />
        </Section>

        <Section title="Backend & Storage" icon={<Cloud className="h-4 w-4" />}>
          <Grid items={[
            ['Frontend API URL', API_BASE_URL || 'Not Configured'],
            ['FastAPI Backend', backendConnected ? 'Connected' : 'Not Connected'],
            ['Google Drive', driveReady ? 'Connected' : driveStatus?.configured ? 'Unavailable' : 'Not Configured'],
            ['Storage Folder', driveStatus?.folder_name || 'Market Data & Backtest Storage'],
            ['Master File', driveStatus?.master_filename || 'DSE_OHLC_MASTER.csv'],
            ['Stored Rows', dataStatus?.rows_count?.toLocaleString('en-US') || '—'],
            ['Stored Symbols', dataStatus?.symbols_count?.toLocaleString('en-US') || '—'],
            ['Latest OHLC', dataStatus?.latest_trade_date || '—'],
          ]} />
        </Section>

        <Section title="Drive Access Boundary" icon={<ShieldAlert className="h-4 w-4" />}>
          <p className="text-xs leading-relaxed text-text-secondary">The DSE backend is designed around one configured Google Drive folder ID. The dedicated service account should be shared only to the DSE Pulse storage folder; Personal, Office, Finance, and unrelated Drive folders must not be shared with it.</p>
        </Section>

        <Section title="Locked Signal Rules" icon={<Database className="h-4 w-4" />}>
          <Grid items={[
            ['A+', '95–100'],
            ['A', '90–94'],
            ['B+', '85–89 · Watch Only'],
            ['Reject', 'Below 85'],
          ]} />
          <p className="text-xs text-text-secondary">Qualified action requires A+/A plus trend, volume, entry proximity, valid setup, no major rejection, and R/R ≥ 1.5. No broker order execution is included.</p>
        </Section>
      </div>
    </PageContainer>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="space-y-4 rounded-xl border border-border-dark bg-[#0D1117] p-5"><h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">{icon}{title}</h3>{children}</section>;
}

function Grid({ items }: { items: [string, string][] }) {
  return <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">{items.map(([label, value]) => <div key={label} className="rounded-lg border border-border-dark bg-[#161B22]/40 p-3"><div className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">{label}</div><div className="mt-1 break-words text-xs font-bold text-white">{value}</div></div>)}</div>;
}
