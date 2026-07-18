import { Activity, Database, ShieldAlert } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

export default function MarketRegime() {
  return (
    <PageContainer id="market-regime-route">
      <PageHeader
        title="Market Regime"
        description="Regime classification will use verified DSE historical data only."
        breadcrumbs={[{ label: 'Market Regime', path: '/market-regime' }]}
        action={<StatusBadge status="warning" label="ENGINE NOT CONNECTED" />}
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatusCard icon={<Activity className="h-4 w-4" />} label="Regime State" value="Not calculated" />
          <StatusCard icon={<Database className="h-4 w-4" />} label="Data Source" value="Google Drive-backed OHLC" />
          <StatusCard icon={<ShieldAlert className="h-4 w-4" />} label="Mock Data" value="Disabled" />
        </div>

        <div className="rounded-xl border border-[#D29922]/30 bg-[#D29922]/5 p-6 text-xs leading-relaxed text-text-secondary">
          <div className="font-bold text-white">No fabricated regime score is shown.</div>
          <div className="mt-2">Bullish, Bearish, Neutral, Recovery, and Distribution states will appear only after a real backend regime engine calculates them from the verified DSE dataset.</div>
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
