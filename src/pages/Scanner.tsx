import { useState } from 'react';
import PageContainer from '../components/PageContainer';
import { useMarket } from '../store/marketStore';
import {
  ScannerFilterPanel,
  ScannerSummaryCard,
  ScannerResultsTable,
  ScannerDetailDrawer,
  ScannerEmptyState,
} from '../components/ScannerAndSignalsComponents';
import { RefreshCw, RotateCcw, Activity, Layers, Globe, Clock } from 'lucide-react';

export default function Scanner() {
  const {
    candidates,
    scannerFilters,
    resetScannerFilters,
    runDemoScan,
    isScanning,
    scanTimestamp,
    selectedScannerCandidateId,
    setSelectedScannerCandidateId,
    candidateDataSource,
    backendConnectionStatus,
    scannerUniverseCount,
    scannerEligibleCount,
  } = useMarket();

  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const hasRealData = candidateDataSource !== 'none';
  const sourceLabel = candidateDataSource === 'database'
    ? 'DATABASE DATA'
    : candidateDataSource === 'local_csv'
      ? 'BACKEND LOCAL CACHE'
      : 'NO LIVE DATA';

  const sectors = Array.from(new Set(candidates.map((c) => c.sector))).filter(Boolean);
  const setups = Array.from(new Set(candidates.map((c) => c.setup))).filter(Boolean);

  const filteredCandidates = candidates.filter((item) => {
    if (
      scannerFilters.search
      && !item.symbol.toLowerCase().includes(scannerFilters.search.toLowerCase())
      && !item.company.toLowerCase().includes(scannerFilters.search.toLowerCase())
    ) return false;
    if (scannerFilters.sector && item.sector !== scannerFilters.sector) return false;
    if (scannerFilters.setup && item.setup !== scannerFilters.setup) return false;
    if (scannerFilters.side && item.side !== scannerFilters.side) return false;
    if (scannerFilters.grade && item.grade !== scannerFilters.grade) return false;
    if (scannerFilters.trend && item.trend !== scannerFilters.trend) return false;
    if (scannerFilters.entryStatus && item.entryStatus !== scannerFilters.entryStatus) return false;
    if (scannerFilters.minPrice && item.price < Number(scannerFilters.minPrice)) return false;
    if (scannerFilters.maxPrice && item.price > Number(scannerFilters.maxPrice)) return false;
    if (scannerFilters.excludeLowLiquidity && item.relativeVolume < 1.0) return false;
    return true;
  });

  const aPlusCount = filteredCandidates.filter((c) => c.grade === 'A+').length;
  const aCount = filteredCandidates.filter((c) => c.grade === 'A').length;
  const bPlusCount = filteredCandidates.filter((c) => c.grade === 'B+').length;
  const rejectCount = filteredCandidates.filter((c) => c.grade === 'REJECT').length;

  return (
    <PageContainer id="scanner-route-stage">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border-dark pb-6 md:flex-row md:items-center">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold uppercase tracking-tight text-white">Market Scanner</h1>
            <span className="flex items-center gap-1 rounded border border-border-dark bg-[#161B22] px-2 py-0.5 font-mono text-[10px] font-bold text-text-secondary">
              <Activity className={`h-3 w-3 ${backendConnectionStatus === 'Connected' ? 'text-[#238636]' : 'text-[#D29922]'}`} />
              <span>STATUS: {backendConnectionStatus === 'Connected' ? 'API CONNECTED' : 'API NOT READY'}</span>
            </span>
            <span className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider ${hasRealData ? 'border-[#238636]/20 bg-[#238636]/10 text-[#238636]' : 'border-[#D29922]/20 bg-[#D29922]/10 text-[#D29922]'}`}>
              {sourceLabel}
            </span>
          </div>
          <p className="max-w-2xl text-xs leading-relaxed text-text-secondary">
            Scanner results are shown only from the connected backend using verified DSE data. No demo fallback is enabled.
          </p>
        </div>

        <div className="flex items-center gap-3 select-none">
          <button onClick={resetScannerFilters} className="flex cursor-pointer items-center gap-1.5 rounded border border-border-dark bg-[#161B22] px-3 py-1.5 font-mono text-xs font-semibold text-white transition-colors hover:bg-[#21262D]">
            <RotateCcw className="h-3.5 w-3.5 text-text-secondary" />
            <span>RESET FILTERS</span>
          </button>
          <button
            onClick={runDemoScan}
            disabled={isScanning || backendConnectionStatus !== 'Connected'}
            className="flex cursor-pointer items-center gap-1.5 rounded border border-[#238636] bg-[#238636] px-3.5 py-1.5 font-mono text-xs font-bold text-white transition-colors hover:bg-[#2EA043] disabled:cursor-not-allowed disabled:border-border-dark disabled:bg-border-dark disabled:text-text-secondary"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'SCANNING...' : 'RUN BACKEND SCAN'}</span>
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-2 rounded-lg border border-border-dark bg-[#161B22]/40 p-3 font-mono text-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#58A6FF]" /><span className="text-text-secondary">SCAN ENGINE TELEMETRY:</span><span className="font-bold text-white">{sourceLabel}</span></div>
        <div className="text-text-secondary">Last Scan: <span className="font-mono font-semibold text-white">{scanTimestamp}</span></div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <ScannerSummaryCard label="Universe" value={scannerUniverseCount} icon={<Globe className="h-3.5 w-3.5 text-[#58A6FF]" />} context="Backend scanned symbols" />
        <ScannerSummaryCard label="Eligible Stocks" value={scannerEligibleCount} icon={<Layers className="h-3.5 w-3.5 text-[#58A6FF]" />} context="Backend eligible symbols" />
        <ScannerSummaryCard label="A+ Grade" value={aPlusCount} icon={<span className="font-mono text-[10px] font-extrabold text-[#238636]">A+</span>} context="A+ Highly Qualified" />
        <ScannerSummaryCard label="A Grade" value={aCount} icon={<span className="font-mono text-[10px] font-extrabold text-[#58A6FF]">A</span>} context="A Qualified" />
        <ScannerSummaryCard label="B+ Watch" value={bPlusCount} icon={<span className="font-mono text-[10px] font-extrabold text-[#D29922]">B+</span>} context="B+ Watch Setups" />
        <ScannerSummaryCard label="Rejected" value={rejectCount} icon={<span className="font-mono text-[10px] font-extrabold text-[#DA3633]">X</span>} context="Under 85 Score" />
      </div>

      <div className="mb-6"><ScannerFilterPanel isCollapsed={isFilterCollapsed} setIsCollapsed={setIsFilterCollapsed} sectors={sectors} setups={setups} /></div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-dark/60 pb-2">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-white">Scanned Candidates</h2>
          <span className="font-mono text-xs text-text-secondary">Filtered Total: <span className="font-bold text-white">{filteredCandidates.length}</span></span>
        </div>
        {filteredCandidates.length === 0 ? <ScannerEmptyState onClear={resetScannerFilters} /> : <ScannerResultsTable items={filteredCandidates} onViewDetails={(id) => setSelectedScannerCandidateId(id)} />}
      </div>

      <ScannerDetailDrawer id={selectedScannerCandidateId} onClose={() => setSelectedScannerCandidateId(null)} />
    </PageContainer>
  );
}