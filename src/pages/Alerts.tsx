import { Bell } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

export default function Alerts() {
  return (
    <PageContainer id="alerts-route">
      <PageHeader
        title="Alerts"
        description="Alerts will be generated only from connected real market data and persisted alert rules."
        breadcrumbs={[{ label: 'Alerts', path: '/alerts' }]}
        action={<StatusBadge status="warning" label="ENGINE NOT CONNECTED" />}
      />

      <div className="mx-auto my-12 flex max-w-2xl flex-col items-center justify-center rounded-xl border border-dashed border-border-dark bg-[#0D1117]/40 p-12 text-center">
        <div className="mb-4 rounded-full border border-border-dark bg-[#161B22] p-3 text-text-secondary"><Bell className="h-6 w-6" /></div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-white">No alert engine connected</h3>
        <p className="mt-2 max-w-md text-xs leading-relaxed text-text-secondary">Demo alerts, simulated triggers, and fabricated timestamps have been removed. Alert creation will be enabled after backend rule persistence and real-data evaluation are connected.</p>
      </div>
    </PageContainer>
  );
}
