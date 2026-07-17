import { useMemo, useState } from 'react';
import { Bell, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useMarket } from '../store/marketStore';

type AlertType = 'Price Above' | 'Price Below' | 'Entry Ready' | 'Grade Changed' | 'Volume Spike' | 'RSI Condition' | 'Portfolio Review' | 'Sector Strength';

type LocalAlert = {
  id: string;
  symbol: string;
  company: string;
  sector: string;
  type: AlertType;
  condition: string;
  currentValue: string;
  targetValue: string;
  source: string;
  enabled: boolean;
  triggered: boolean;
  note: string;
  createdAt: string;
  lastChecked: string;
};

const alertTypes: AlertType[] = ['Price Above', 'Price Below', 'Entry Ready', 'Grade Changed', 'Volume Spike', 'RSI Condition', 'Portfolio Review', 'Sector Strength'];

export default function Alerts() {
  const { candidates } = useMarket();
  const [alerts, setAlerts] = useState<LocalAlert[]>(() =>
    candidates.slice(0, 4).map((item, index) => ({
      id: `local-alert-${item.symbol}`,
      symbol: item.symbol,
      company: item.company,
      sector: item.sector,
      type: index % 2 === 0 ? 'Entry Ready' : 'Price Above',
      condition: index % 2 === 0 ? 'Entry status equals READY' : 'Demo price crosses target',
      currentValue: index % 2 === 0 ? item.entryStatus : `৳${item.price.toFixed(2)}`,
      targetValue: index % 2 === 0 ? 'READY' : `৳${item.entryHigh.toFixed(2)}`,
      source: index % 2 === 0 ? 'Scanner' : 'Watchlist',
      enabled: index !== 3,
      triggered: index === 0,
      note: 'Local demo alert only. No backend delivery is active.',
      createdAt: '17 Jul 2026',
      lastChecked: 'Local preview only',
    }))
  );
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState<LocalAlert | null>(null);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch = `${alert.symbol} ${alert.company} ${alert.sector}`.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'ALL' || alert.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ENABLED' && alert.enabled) || (statusFilter === 'DISABLED' && !alert.enabled) || (statusFilter === 'TRIGGERED' && alert.triggered);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [alerts, search, statusFilter, typeFilter]);

  const enabledCount = alerts.filter((alert) => alert.enabled).length;
  const triggeredCount = alerts.filter((alert) => alert.triggered).length;

  const toggleAlert = (id: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, enabled: !alert.enabled } : alert)));
  };

  const deleteAlert = (id: string) => {
    if (!window.confirm('Delete this local demo alert?')) return;
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    setSelectedAlert(null);
  };

  const createDemoAlert = () => {
    const item = candidates[0];
    if (!item) return;
    setAlerts((prev) => [
      {
        id: `local-alert-${Date.now()}`,
        symbol: item.symbol,
        company: item.company,
        sector: item.sector,
        type: 'Price Above',
        condition: 'Demo price crosses local target',
        currentValue: `৳${item.price.toFixed(2)}`,
        targetValue: `৳${item.target1.toFixed(2)}`,
        source: 'Alerts',
        enabled: true,
        triggered: false,
        note: 'Created locally in browser state. No push, SMS, email, Telegram, or backend scheduler is active.',
        createdAt: new Date().toLocaleDateString('en-GB'),
        lastChecked: 'Local preview only',
      },
      ...prev,
    ]);
  };

  return (
    <PageContainer id="alerts-route">
      <PageHeader
        title="Alerts"
        description="Create and manage local demo alerts for price, signal readiness, volume, grade, and portfolio review conditions."
        breadcrumbs={[{ label: 'Alerts', path: '/alerts' }]}
        action={<StatusBadge status="warning" label="LOCAL ONLY" />}
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Metric label="Total Alerts" value={alerts.length} />
          <Metric label="Enabled" value={enabledCount} />
          <Metric label="Triggered Demo" value={triggeredCount} />
        </div>

        <div className="rounded-xl border border-border-dark bg-[#0D1117] p-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search symbol, company, sector"
                className="bg-[#161B22] border border-border-dark rounded-md px-3 py-2 text-xs text-white min-w-[240px] focus:outline-none focus:border-accent"
              />
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="bg-[#161B22] border border-border-dark rounded-md px-3 py-2 text-xs text-white">
                <option value="ALL">All Types</option>
                {alertTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="bg-[#161B22] border border-border-dark rounded-md px-3 py-2 text-xs text-white">
                <option value="ALL">All Status</option>
                <option value="ENABLED">Enabled</option>
                <option value="DISABLED">Disabled</option>
                <option value="TRIGGERED">Triggered</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={createDemoAlert} className="inline-flex items-center gap-2 rounded-md bg-[#238636] px-3 py-2 text-xs font-mono font-bold text-white">
                <Plus className="w-4 h-4" /> Create Alert
              </button>
              <button onClick={() => setAlerts([])} className="rounded-md border border-border-dark px-3 py-2 text-xs font-mono text-text-secondary hover:text-white">Clear Demo Alerts</button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border-dark">
            <table className="w-full min-w-[980px] text-left text-[11px] font-mono">
              <thead className="bg-[#161B22] text-text-secondary uppercase">
                <tr>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Symbol</th>
                  <th className="px-3 py-3">Sector</th>
                  <th className="px-3 py-3">Alert Type</th>
                  <th className="px-3 py-3">Condition</th>
                  <th className="px-3 py-3">Current Demo Value</th>
                  <th className="px-3 py-3">Target</th>
                  <th className="px-3 py-3">Source</th>
                  <th className="px-3 py-3">Last Checked</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark/50">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-[#161B22]/50">
                    <td className="px-3 py-3"><StatusBadge status={alert.triggered ? 'positive' : alert.enabled ? 'accent' : 'warning'} label={alert.triggered ? 'TRIGGERED' : alert.enabled ? 'ENABLED' : 'DISABLED'} /></td>
                    <td className="px-3 py-3"><div className="font-bold text-white">{alert.symbol}</div><div className="font-sans text-[10px] text-text-secondary truncate max-w-[180px]">{alert.company}</div></td>
                    <td className="px-3 py-3 text-text-secondary">{alert.sector}</td>
                    <td className="px-3 py-3 text-white">{alert.type}</td>
                    <td className="px-3 py-3 text-text-secondary">{alert.condition}</td>
                    <td className="px-3 py-3 text-white">{alert.currentValue}</td>
                    <td className="px-3 py-3 text-white">{alert.targetValue}</td>
                    <td className="px-3 py-3 text-text-secondary">{alert.source}</td>
                    <td className="px-3 py-3 text-text-secondary">{alert.lastChecked}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedAlert(alert)} title="View" className="text-text-secondary hover:text-white"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => toggleAlert(alert.id)} title="Enable or disable" className="text-text-secondary hover:text-white"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => deleteAlert(alert.id)} title="Delete" className="text-[#DA3633]"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAlerts.length === 0 && <div className="text-center text-xs text-text-secondary py-10">No local demo alerts match the selected filters.</div>}
        </div>

        <div className="rounded-xl border border-[#D29922]/30 bg-[#D29922]/5 p-4 text-xs text-[#D29922]">
          <Bell className="inline w-4 h-4 mr-2" /> Local demo alerts do not send Telegram, email, SMS, push, or backend notifications. Live alert delivery is not connected yet.
        </div>
      </div>

      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" role="dialog" aria-modal="true" onClick={() => setSelectedAlert(null)}>
          <div className="h-full w-full max-w-md bg-[#0D1117] border-l border-border-dark p-6 overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-lg font-bold text-white">{selectedAlert.symbol} Alert</h3><p className="text-xs text-text-secondary">Demo Data / Local Only</p></div>
              <button onClick={() => setSelectedAlert(null)} className="text-text-secondary hover:text-white">Close</button>
            </div>
            {Object.entries(selectedAlert).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 border-b border-border-dark/40 py-2 text-xs">
                <span className="text-text-secondary capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-white text-right">{String(value)}</span>
              </div>
            ))}
            <p className="mt-6 rounded-lg border border-border-dark bg-[#161B22] p-3 text-xs text-text-secondary">No live alert delivery is active. This drawer is for frontend validation only.</p>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border-dark bg-[#0D1117] p-4">
      <div className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">{label}</div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
