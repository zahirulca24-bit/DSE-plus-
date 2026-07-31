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
    signalCandidates,
    activeSignalsTab,
    setActiveSignalsTab,
    selectedSignalCandidateId,
    setSelectedSignalCandidateId,
    signalsTimestamp,
    signalDataSource,
    backendConnectionStatus,
    backendMessage,
  } = useMarket();

  const hasRealData = signalDataSource !== 'none';
  const sourceLabel = signalDataSource === 'database'
    ? 'DATABASE DATA'
    : signalDataSource === 'local_csv'
      ? 'VERIFIED LOCAL CSV'
      : 'NO VERIFIED DATA';

  const totalQualifiedCount = signalCandidates.filter((c) => c.grade === 'A+' || c.grade === 'A').length;
  const totalAPlusCount = signalCandidates.filter((c) => c.grade === 'A+').length;
  const totalACount = signalCandidates.filter((c) => c.grade === 'A').length;
  const totalNearSetupsCount = signalCandidates.filter((c) => c.grade === 'B+').length;
  const rrValues = signalCandidates
    .filter((c) => c.grade !== 'REJECT' && typeof c.riskReward === 'number' && Number.isFinite(c.riskReward))
    .map((c) => c.riskReward as number);
  const averageRR = rrValues.length > 0 ? (rrValues.reduce((sum, value) => sum + value, 0) / rrValues.length).toFixed(2) : '—';

  const filteredCandidates = activeSignalsTab === 'qualified'
    ? signalCandidates.filter((c) => c.grade === 'A+' || c.grade === 'A')
    : activeSignalsTab === 'near'
      ? signalCandidates.filter((c) => c.grade === 'B+')
      : activeSignalsTab === 'rejected'
        ? signalCandidates.filter((c) => c.grade === 'REJECT')
        : signalCandidates;

  return (
    <PageContainer id="signals-route-stage">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border-dark pb-6 md:flex-row md:items-center">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold uppercase tracking-tight text-white">Qualified Signals</h1>
            <span className="flex items-center gap-1 rounded border border-border-dark bg-[#161B22] px-2 py-0.5 font-mono text-[10px] font-bold text-text-secondary">
              <Activity className={`h-3 w-3 ${backendConnectionStatus === 'Connected' ? 'text-[#238636]' : 'text-[#D29922]'}`} />
              <span>ENGINE: {backendConnectionStatus === 'Connected' ? 'API ACTIVE' : 'NOT READY'}</span>
            </span>
            <span className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider ${hasRealData ? 'border-[#238636]/20 bg-[#238636]/10 text-[#238636]' : 'border-[#D29922]/20 bg-[#D29922]/10 text-[#D29922]'}`}>
              {sourceLabel}
            </span>
          </div>
          <p className="max-w-2xl text-xs leading-relaxed text-text-secondary">Only backend-generated DSE candidates from verified closed-candle data are displayed. No demo fallback is enabled.</p>
        </div>
        <div className="max-w-xs rounded border border-border-dark bg-[#161B22]/20 p-2 font-mono text-[10px] leading-snug text-text-muted">
          Last signal response: <span className="font-bold text-white">{signalsTimestamp}</span>. Source: <span className="font-bold text-white">{sourceLabel}</span>.
        </div>
      </div>

      {backendConnectionStatus !== 'Connected' && (
        <div className="mb-6 rounded-lg border border-[#DA3633]/30 bg-[#DA3633]/5 p-4 text-sm text-[#FF7B72]">
          {backendMessage} Signal cards were cleared and no fallback signals were loaded.
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <ScannerSummaryCard label="Qualified" value={totalQualifiedCount} icon={<Compass className="h-4 w-4 text-[#238636]" />} context="A+ & A only" />
        <ScannerSummaryCard label="A+ Signals" value={totalAPlusCount} icon={<Award className="h-4 w-4 text-[#238636]" />} context="95–100 score" />
        <ScannerSummaryCard label="A Signals" value={totalACount} icon={<span className="font-mono text-xs font-black text-[#58A6FF]">A</span>} context="90–94 score" />
        <ScannerSummaryCard label="Watch Only" value={totalNearSetupsCount} icon={<BarChart4 className="h-4 w-4 text-[#D29922]" />} context="B+ 85–89" />
        <ScannerSummaryCard label="Average R/R" value={averageRR === '—' ? '—' : `${averageRR}x`} icon={<span className="font-mono text-xs font-black text-[#58A6FF]">R/R</span>} context="Non-rejected candidates" />
        <ScannerSummaryCard label="Data State" value={hasRealData ? 'VERIFIED' : 'EMPTY'} icon={<span className="font-mono text-[10px] text-text-secondary">SRC</span>} context={sourceLabel} />
      </div>

      <div className="mb-6 flex flex-col items-stretch justify-between gap-4 border-b border-border-dark pb-2 sm:flex-row sm:items-center select-none">
        <div className="flex self-start rounded-lg bg-[#161B22]/40 p-0.5 gap-1.5">
          <button onClick={() => setActiveSignalsTab('qualified')} className={`rounded-md px-3.5 py-1.5 font-mono text-xs font-semibold ${activeSignalsTab === 'qualified' ? 'bg-[#21262D] text-white' : 'text-text-secondary'}`}>QUALIFIED ({totalQualifiedCount})</button>
          <button onClick={() => setActiveSignalsTab('near')} className={`rounded-md px-3.5 py-1.5 font-mono text-xs font-semibold ${activeSignalsTab === 'near' ? 'bg-[#21262D] text-white' : 'text-text-secondary'}`}>WATCH ({totalNearSetupsCount})</button>
          <button onClick={() => setActiveSignalsTab('rejected')} className={`rounded-md px-3.5 py-1.5 font-mono text-xs font-semibold ${activeSignalsTab === 'rejected' ? 'bg-[#21262D] text-white' : 'text-text-secondary'}`}>REJECTED ({signalCandidates.filter((c) => c.grade === 'REJECT').length})</button>
          <button onClick={() => setActiveSignalsTab('all')} className={`rounded-md px-3.5 py-1.5 font-mono text-xs font-semibold ${activeSignalsTab === 'all' ? 'bg-[#21262D] text-white' : 'text-text-secondary'}`}>ALL</button>
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] text-text-secondary"><Info className="h-3.5 w-3.5 text-[#58A6FF]" /><span>A+/A qualified; B+ watch-only; failed hard gates reject.</span></div>
      </div>

      {filteredCandidates.length === 0 ? (
        <div className="mx-auto my-6 max-w-md rounded-xl border border-dashed border-border-dark bg-[#0D1117]/40 p-12 text-center">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-white">No verified signals available</p>
          <p className="text-xs text-text-secondary">Load verified market data and run the backend scanner. Mock signals are disabled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCandidates.map((candidate) => <SignalCard key={candidate.id} item={candidate} onViewAnalysis={(id) => setSelectedSignalCandidateId(id)} />)}
        </div>
      )}

      <SignalAnalysisDrawer id={selectedSignalCandidateId} onClose={() => setSelectedSignalCandidateId(null)} />
    </PageContainer>
  );
}
