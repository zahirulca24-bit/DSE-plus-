import { Database, Layers, ShieldAlert } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

export default function SectorAnalysis() {
  return (
    <PageContainer id="sector-analysis-route">
      <PageHeader
        title="Sector Analysis"
        description="Sector ranking and rotation will be calculated only from verified DSE market data."
        breadcrumbs={[{ label: 'Sector Analysis', path: '/sector-analysis' }]}
        action={<StatusBadge status="warning" label="ENGINE NOT CONNECTED" />}
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatusCard icon={<Layers className="h-4 w-4" />} label="Sector Rankings" value="Not calculated" />
          <StatusCard icon={<Database className="h-4 w-4" />} label="Data Source" value="Google Drive-backed OHLC" />
          <StatusCard icon={<ShieldAlert className="h-4 w-4" />} label="Mock Data" value="Disabled" />
        </div>

        <div className="rounded-xl border border-[#D29922]/30 bg-[#D29922]/5 p-6 text-xs leading-relaxed text-text-secondary">
          <div className="font-bold text-white">No demo sector leaders or stock scores are displayed.</div>
          <div className="mt-2">The page will populate after the backend sector engine calculates sector strength, breadth, rotation, and stock membership from the verified Drive-backed master dataset.</div>
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
