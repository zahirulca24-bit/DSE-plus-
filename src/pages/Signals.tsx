import PageContainer from '../components/PageContainer';
import { useMarket } from '../store/marketStore';
import {
  SignalCard,
  SignalAnalysisDrawer,
  ScannerSummaryCard,
} from '../components/ScannerAndSignalsComponents';
import { Activity, Info, BarChart4, Compass, Award } from 'lucide-react';

export default function Signals() {
  const {
    candidates,
    activeSignalsTab,
    setActiveSignalsTab,
    selectedSignalCandidateId,
    setSelectedSignalCandidateId,
    scanTimestamp,
    candidateDataSource,
    backendConnectionStatus,
  } = useMarket();

  const hasRealData = candidateDataSource !== 'none';
  const sourceLabel = candidateDataSource === 'database'
    ? 'DATABASE DATA'
    : candidateDataSource === 'local_csv'
      ? 'BACKEND LOCAL CACHE'
      : 'NO LIVE DATA';

  const totalQualifiedCount = candidates.filter((c) => c.grade === 'A+' || c.grade === 'A').length;
  const totalAPlusCount = candidates.filter((c) => c.grade === 'A+').length;
  const totalACount = candidates.filter((c) => c.grade === 'A').length;
  const totalNearSetupsCount = candidates.filter((c) => c.grade === 'B+').length;
  const rrValues = candidates.filter((c) => c.grade !== 'REJECT').map((c) => c.riskReward);
  const averageRR = rrValues.length > 0 ? (rrValues.reduce((sum, val) => sum + val, 0) / rrValues.length).toFixed(2) : '0.00';

  const filteredCandidates = activeSignalsTab === 'qualified'
    ? candidates.filter((c) => c.grade === 'A+' || c.grade === 'A')
    : activeSignalsTab === 'near'
      ? candidates.filter((c) => c.grade === 'B+')
      : activeSignalsTab === 'rejected'
        ? candidates.filter((c) => c.grade === 'REJECT')
        : candidates;

  return (
    <PageContainer id="signals-route-stage">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border-dark pb-6 md:flex-row md:items-center">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold uppercase tracking-tight text-white">Qualified Signals</h1>
            <span className="flex items-center gap-1 rounded border border-border-dark bg-[#161B22] px-2 py-0.5 font-mono text-[10px] font-bold text-text-secondary">
              <Activity className={`h-3 w-3 ${backendConnectionStatus === 'Connected' ? 'text-[#238636]' : 'text-[#D29922]'}`} />
              <span>ALGO ENGINE: {backendConnectionStatus === 'Connected' ? 'API ACTIVE' : 'NOT READY'}</span>
            </span>
            <span className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider ${hasRealData ? 'border-[#238636]/20 bg-[#238636]/10 text-[#238636]' : 'border-[#D29922]/20 bg-[#D29922]/10 text-[#D29922]'}`}>
              {sourceLabel}
            </span>
          </div>
          <p className="max-w-2xl text-xs leading-relaxed text-text-secondary">Review only backend-generated DSE signal candidates from verified market data. No demo fallback is enabled.</p>
        </div>
        <div className="max-w-xs rounded border border-border-dark bg-[#161B22]/20 p-2 font-mono text-[10px] leading-snug text-text-muted">
          Last processed signal wave: <span className="font-bold text-white">{scanTimestamp}</span>. Source: <span className="font-bold text-white">{sourceLabel}</span>.
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <ScannerSummaryCard label="Qualified" value={totalQualifiedCount} icon={<Compass className="h-4 w-4 text-[#238636]" />} context="A+ & A Grades Only" />
        <ScannerSummaryCard label="A+ Signals" value={totalAPlusCount} icon={<Award className="h-4 w-4 text-[#238636]" />} context="95-100 Score Band" />
        <ScannerSummaryCard label="A Signals" value={totalACount} icon={<span className="font-mono text-xs font-black text-[#58A6FF]">A</span>} context="90-94 Score Band" />
        <ScannerSummaryCard label="Near Setups" value={totalNearSetupsCount} icon={<BarChart4 className="h-4 w-4 text-[#D29922]" />} context="B+ Watch List (85-89)" />
        <ScannerSummaryCard label="Average R/R" value={`${averageRR}x`} icon={<span className="font-mono text-xs font-black text-[#58A6FF]">R/R</span>} context="Qualified & Near Avg" />
        <ScannerSummaryCard label="Data State" value={hasRealData ? 'LIVE' : 'EMPTY'} icon={<span className="font-mono text-[10px] text-text-secondary">SRC</span>} context={sourceLabel} />
      </div>

      <div className="mb-6 flex flex-col items-stretch justify-between gap-4 border-b border-border-dark pb-2 sm:flex-row sm:items-center select-none">
        <div className="flex self-start rounded-lg bg-[#161B22]/40 p-0.5 gap-1.5">
          <button onClick={() => setActiveSignalsTab('qualified')} className={`rounded-md px-3.5 py-1.5 font-mono text-xs font-semibold ${activeSignalsTab === 'qualified' ? 'bg-[#21262D] text-white' : 'text-text-secondary'}`}>QUALIFIED ({totalQualifiedCount})</button>
          <button onClick={() => setActiveSignalsTab('near')} className={`rounded-md px-3.5 py-1.5 font-mono text-xs font-semibold ${activeSignalsTab === 'near' ? 'bg-[#21262D] text-white' : 'text-text-secondary'}`}>NEAR SETUP ({totalNearSetupsCount})</button>
          <button onClick={() => setActiveSignalsTab('rejected')} className={`rounded-md px-3.5 py-1.5 font-mono text-xs font-semibold ${activeSignalsTab === 'rejected' ? 'bg-[#21262D] text-white' : 'text-text-secondary'}`}>REJECTED ({candidates.filter((c) => c.grade === 'REJECT').length})</button>
          <button onClick={() => setActiveSignalsTab('all')} className={`rounded-md px-3.5 py-1.5 font-mono text-xs font-semibold ${activeSignalsTab === 'all' ? 'bg-[#21262D] text-white' : 'text-text-secondary'}`}>ALL</button>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] text-text-secondary"><Info className="h-3.5 w-3.5 text-[#58A6FF]" /><span>A+/A Qualified, B+ Watch, Reject &lt;85.</span></div>
      </div>

      {filteredCandidates.length === 0 ? (
        <div className="mx-auto my-6 max-w-md rounded-xl border border-dashed border-border-dark bg-[#0D1117]/40 p-12 text-center">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-white">No real signals available</p>
          <p className="text-xs text-text-secondary">Connect backend local cache and run the backend scanner. Mock signals are disabled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCandidates.map((cand) => <SignalCard key={cand.id} item={cand} onViewAnalysis={(id) => setSelectedSignalCandidateId(id)} />)}
        </div>
      )}

      <SignalAnalysisDrawer id={selectedSignalCandidateId} onClose={() => setSelectedSignalCandidateId(null)} />
    </PageContainer>
  );
}