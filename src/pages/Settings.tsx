import { useState } from 'react';
import { Activity, CheckCircle2, Settings as SettingsIcon, ShieldAlert } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

const API_BASE_URL = import.meta.env.VITE_DSE_API_BASE_URL as string | undefined;

type TestState = {
  status: 'Not Configured' | 'Not Tested' | 'Testing' | 'Connected' | 'Error';
  message: string;
  checkedAt: string;
};

export default function Settings() {
  const [testState, setTestState] = useState<TestState>({ status: API_BASE_URL ? 'Not Tested' : 'Not Configured', message: API_BASE_URL ? 'API URL detected but not tested.' : 'VITE_DSE_API_BASE_URL is not configured.', checkedAt: 'Never' });
  const [compactTables, setCompactTables] = useState(true);
  const [stickyHeaders, setStickyHeaders] = useState(true);
  const [demoBadges, setDemoBadges] = useState(true);
  const [chartAnimation, setChartAnimation] = useState(false);

  const testConnection = async () => {
    if (!API_BASE_URL) {
      setTestState({ status: 'Not Configured', message: 'Set VITE_DSE_API_BASE_URL before testing backend health.', checkedAt: new Date().toLocaleString('en-GB') });
      return;
    }
    setTestState({ status: 'Testing', message: 'Testing read-only /health endpoint...', checkedAt: new Date().toLocaleString('en-GB') });
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 8000);
      const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/health`, { signal: controller.signal });
      window.clearTimeout(timeout);
      const text = await response.text();
      setTestState({ status: response.ok ? 'Connected' : 'Error', message: response.ok ? `Health endpoint responded: ${text.slice(0, 160)}` : `Health check failed with HTTP ${response.status}.`, checkedAt: new Date().toLocaleString('en-GB') });
    } catch (error) {
      setTestState({ status: 'Error', message: error instanceof Error ? error.message : 'Unknown connection error.', checkedAt: new Date().toLocaleString('en-GB') });
    }
  };

  return (
    <PageContainer id="settings-route">
      <PageHeader
        title="Settings"
        description="Configure local frontend preferences, API endpoint placeholders, data mode, and diagnostics."
        breadcrumbs={[{ label: 'Settings', path: '/settings' }]}
        action={<StatusBadge status={testState.status === 'Connected' ? 'positive' : 'warning'} label={testState.status === 'Connected' ? 'API CONNECTED' : 'DEMO MODE'} />}
      />

      <div className="space-y-6">
        <Section title="Application" icon={<SettingsIcon className="w-4 h-4" />}>
          <InfoGrid items={[
            ['App Name', 'DSE Pulse'],
            ['Version', '0.1.0'],
            ['Mode', 'Demo / Local Only'],
            ['Timezone', 'Asia/Dhaka'],
            ['Market', 'Dhaka Stock Exchange'],
          ]} />
        </Section>

        <Section title="Data Source" icon={<Activity className="w-4 h-4" />}>
          <InfoGrid items={[
            ['Market Data', 'Not Connected'],
            ['Supabase', 'Not Connected'],
            ['FastAPI Backend', testState.status],
            ['Local Mock Data', 'Active'],
            ['CSV Local Preview', 'Available'],
          ]} />
        </Section>

        <Section title="API Endpoint">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <InfoCard label="Env Variable" value="VITE_DSE_API_BASE_URL" />
              <InfoCard label="Current Value" value={API_BASE_URL || 'Not Configured'} />
              <InfoCard label="Last Test" value={testState.checkedAt} />
            </div>
            <div className="rounded-lg border border-border-dark bg-[#161B22]/40 p-4 text-xs text-text-secondary">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div><span className="font-bold text-white">Connection Diagnostic:</span> {testState.message}</div>
                <button onClick={testConnection} className="rounded-md bg-[#238636] px-4 py-2 text-xs font-mono font-bold text-white disabled:opacity-50" disabled={testState.status === 'Testing'}>{testState.status === 'Testing' ? 'Testing...' : 'Test Connection'}</button>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Signal Rules">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <InfoCard label="A+" value="95–100" />
            <InfoCard label="A" value="90–94" />
            <InfoCard label="B+" value="85–89 Watch Only" />
            <InfoCard label="Reject" value="Below 85" />
          </div>
          <p className="mt-3 text-xs text-text-secondary">Read-only rule: A+/A = Qualified Signal, B+ = Watch / Near Setup only, Reject = Rejected. No order execution is included.</p>
        </Section>

        <Section title="Portfolio Display">
          <Toggle label="Show demo portfolio values" checked={true} disabled />
          <Toggle label="Show BDT formatting" checked={true} disabled />
          <Toggle label="Show local notes" checked={true} disabled />
          <Toggle label="Show demo concentration warnings" checked={true} disabled />
        </Section>

        <Section title="Alert Preferences">
          <Toggle label="Enable local alert badges" checked={true} disabled />
          <Toggle label="Show triggered demo alerts" checked={true} disabled />
          <Toggle label="Show disabled alerts" checked={true} disabled />
          <Toggle label="Alert sound placeholder" checked={false} disabled />
          <p className="mt-3 text-xs text-text-secondary">Telegram, email, SMS, and push notification delivery are not active.</p>
        </Section>

        <Section title="Theme / Interface">
          <Toggle label="Compact table density" checked={compactTables} onChange={setCompactTables} />
          <Toggle label="Sticky table headers" checked={stickyHeaders} onChange={setStickyHeaders} />
          <Toggle label="Show demo badges" checked={demoBadges} onChange={setDemoBadges} />
          <Toggle label="Chart animation" checked={chartAnimation} onChange={setChartAnimation} />
        </Section>

        <Section title="System Diagnostics" icon={<ShieldAlert className="w-4 h-4" />}>
          <InfoGrid items={[
            ['Browser Runtime', 'Available'],
            ['Build Mode', import.meta.env.MODE],
            ['Environment', import.meta.env.PROD ? 'Production' : 'Development'],
            ['Backend API Status', testState.status],
            ['Route List', 'Dashboard, Scanner, Signals, Watchlist, Portfolio, Journal, Market Regime, Sector Analysis, Backtest, Alerts, Data Import, Settings'],
            ['Missing Env Warnings', API_BASE_URL ? 'None for frontend demo' : 'VITE_DSE_API_BASE_URL missing; demo mode active'],
          ]} />
        </Section>

        <div className="rounded-xl border border-[#D29922]/30 bg-[#D29922]/5 p-4 text-xs text-[#D29922]">
          DSE Pulse never displays API keys or secrets. Backend health testing is read-only and does not call scanner execution, portfolio sync, or order endpoints.
        </div>
      </div>
    </PageContainer>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border-dark bg-[#0D1117] p-5 space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">{icon || <CheckCircle2 className="w-4 h-4 text-[#58A6FF]" />}{title}</h3>
      {children}
    </section>
  );
}

function InfoGrid({ items }: { items: [string, string][] }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{items.map(([label, value]) => <InfoCard key={label} label={label} value={value} />)}</div>;
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border-dark bg-[#161B22]/40 p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">{label}</div>
      <div className="mt-1 text-xs font-bold text-white break-words">{value}</div>
    </div>
  );
}

function Toggle({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange?: (value: boolean) => void; disabled?: boolean }) {
  return (
    <label className="flex items-center justify-between gap-3 border-b border-border-dark/40 py-2 text-xs text-text-secondary">
      <span>{label}</span>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange?.(event.target.checked)} className="h-4 w-4" />
    </label>
  );
}
