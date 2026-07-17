import PageContainer from '../components/PageContainer';
import { useMarket } from '../store/marketStore';
import {
  SignalCard,
  SignalAnalysisDrawer,
  ScannerSummaryCard
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
    backendConnectionStatus
  } = useMarket();

  const isApiData = candidateDataSource !== 'demo';
  const sourceLabel = candidateDataSource === 'database' ? 'DATABASE DATA' : candidateDataSource === 'local_csv' ? 'LOCAL CSV DATA' : 'DEMO DATA';

  const totalQualifiedCount = candidates.filter((c) => c.grade === 'A+' || c.grade === 'A').length;
  const totalAPlusCount = candidates.filter((c) => c.grade === 'A+').length;
  const totalACount = candidates.filter((c) => c.grade === 'A').length;
  const totalNearSetupsCount = candidates.filter((c) => c.grade === 'B+').length;

  const rrValues = candidates.filter((c) => c.grade !== 'REJECT').map((c) => c.riskReward);
  const averageRR = rrValues.length > 0 ? (rrValues.reduce((sum, val) => sum + val, 0) / rrValues.length).toFixed(2) : '0.00';

  const getFilteredItems = () => {
    switch (activeSignalsTab) {
      case 'qualified':
        return candidates.filter((c) => c.grade === 'A+' || c.grade === 'A');
      case 'near':
        return candidates.filter((c) => c.grade === 'B+');
      case 'rejected':
        return candidates.filter((c) => c.grade === 'REJECT');
      case 'all':
      default:
        return candidates;
    }
  };

  const filteredCandidates = getFilteredItems();

  return (
    <PageContainer id="signals-route-stage">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-border-dark pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Qualified Signals</h1>
            <span className="px-2 py-0.5 rounded bg-[#161B22] border border-border-dark text-[10px] font-mono font-bold text-text-secondary flex items-center gap-1">
              <Activity className={`w-3 h-3 ${backendConnectionStatus === 'Connected' ? 'text-[#238636]' : 'text-[#58A6FF]'}`} />
              <span>ALGO ENGINE: {backendConnectionStatus === 'Connected' ? 'API ACTIVE' : 'DEMO FALLBACK'}</span>
            </span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border uppercase tracking-wider ${isApiData ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/20' : 'bg-[#D29922]/10 text-[#D29922] border-[#D29922]/20'}`}>
              {sourceLabel}
            </span>
          </div>
          <p className="text-xs text-text-secondary max-w-2xl font-sans leading-relaxed">
            Review A+ and A grade DSE signal candidates from the active backend scanner when connected. B+ setups remain watch-only.
          </p>
        </div>

        <div className="text-[10px] text-text-muted font-mono max-w-xs bg-[#161B22]/20 border border-border-dark p-2 rounded leading-snug">
          Last processed signal wave: <span className="text-white font-bold">{scanTimestamp}</span>. Source: <span className="text-white font-bold">{sourceLabel}</span>.
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <ScannerSummaryCard label="Qualified" value={totalQualifiedCount} icon={<Compass className="w-4 h-4 text-[#238636]" />} context="A+ & A Grades Only" />
        <ScannerSummaryCard label="A+ Signals" value={totalAPlusCount} icon={<Award className="w-4 h-4 text-[#238636]" />} context="95-100 Score Band" />
        <ScannerSummaryCard label="A Signals" value={totalACount} icon={<span className="text-xs font-mono text-[#58A6FF] font-black">A</span>} context="90-94 Score Band" />
        <ScannerSummaryCard label="Near Setups" value={totalNearSetupsCount} icon={<BarChart4 className="w-4 h-4 text-[#D29922]" />} context="B+ Watch List (85-89)" />
        <ScannerSummaryCard label="Average R/R" value={`${averageRR}x`} icon={<span className="text-xs font-mono text-[#58A6FF] font-black">R/R</span>} context="Qualified & Near Avg" />
        <ScannerSummaryCard label="Last Update" value={scanTimestamp.split(',')[1]?.trim() || scanTimestamp.split(' ')[3] || 'Live'} icon={<span className="text-[10px] font-mono text-text-secondary">UTC+6</span>} context={isApiData ? 'Backend scanner' : 'Demo fallback'} />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-border-dark pb-2 mb-6 gap-4 select-none">
        <div className="flex border-b sm:border-b-0 border-border-dark/60 p-0.5 bg-[#161B22]/40 rounded-lg gap-1.5 self-start">
          <button onClick={() => setActiveSignalsTab('qualified')} className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${activeSignalsTab === 'qualified' ? 'bg-[#21262D] text-white border-b border-b-[#58A6FF]' : 'text-text-secondary hover:text-white'}`}>
            QUALIFIED ({totalQualifiedCount})
          </button>
          <button onClick={() => setActiveSignalsTab('near')} className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${activeSignalsTab === 'near' ? 'bg-[#21262D] text-white border-b border-b-[#D29922]' : 'text-text-secondary hover:text-white'}`}>
            NEAR SETUP ({totalNearSetupsCount})
          </button>
          <button onClick={() => setActiveSignalsTab('rejected')} className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${activeSignalsTab === 'rejected' ? 'bg-[#21262D] text-white border-b border-b-[#DA3633]' : 'text-text-secondary hover:text-white'}`}>
            REJECTED ({candidates.filter((c) => c.grade === 'REJECT').length})
          </button>
          <button onClick={() => setActiveSignalsTab('all')} className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer ${activeSignalsTab === 'all' ? 'bg-[#21262D] text-white' : 'text-text-secondary hover:text-white'}`}>
            ALL CANDIDATES
          </button>
        </div>

        <div className="text-[10px] font-mono text-text-secondary flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-[#58A6FF]" />
          <span>Locked displays: A+/A Qualified, B+ Watch, Reject &lt; 85 score.</span>
        </div>
      </div>

      {filteredCandidates.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-border-dark rounded-xl bg-[#0D1117]/40 max-w-md mx-auto my-6 font-sans">
          <p className="text-sm font-semibold text-white uppercase tracking-wider mb-1">No Signals in this view</p>
          <p className="text-xs text-text-secondary">No backend candidates matched the selected display tier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((cand) => (
            <SignalCard key={cand.id} item={cand} onViewAnalysis={(id) => setSelectedSignalCandidateId(id)} />
          ))}
        </div>
      )}

      <SignalAnalysisDrawer id={selectedSignalCandidateId} onClose={() => setSelectedSignalCandidateId(null)} />
    </PageContainer>
  );
}
