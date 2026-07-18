import { Database, ShieldAlert } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';

export default function DataCollector() {
  return (
    <PageContainer id="data-collector-route">
      <PageHeader
        title="Data Collector"
        description="Collector persistence is being moved to the approved Google Drive master-data flow."
        breadcrumbs={[{ label: 'Data Collector', path: '/data-collector' }]}
        action={<StatusBadge status="warning" label="DRIVE FLOW PENDING" />}
      />

      <div className="space-y-6">
        <div className="rounded-xl border border-[#D29922]/30 bg-[#D29922]/5 p-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#D29922]" />
            <div>
              <h2 className="text-sm font-bold text-white">Collector controls are not active yet</h2>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">The previous database-based collector is not used by the approved DSE Pulse storage design. Collection will resume only after it writes through the Google Drive master-data adapter.</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border-dark bg-[#0D1117] p-6">
          <div className="flex items-start gap-3">
            <Database className="mt-0.5 h-5 w-5 shrink-0 text-[#58A6FF]" />
            <div>
              <h3 className="text-sm font-bold text-white">Approved data flow</h3>
              <p className="mt-2 font-mono text-xs leading-7 text-text-secondary">DSE source → validate OHLC → merge by symbol + trade_date → Google Drive DSE_OHLC_MASTER.csv → refresh backend cache → scanner</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
