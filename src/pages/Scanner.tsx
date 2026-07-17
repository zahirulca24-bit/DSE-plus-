import { useState } from 'react';
import PageContainer from '../components/PageContainer';
import { useMarket } from '../store/marketStore';
import {
  ScannerFilterPanel,
  ScannerSummaryCard,
  ScannerResultsTable,
  ScannerDetailDrawer,
  ScannerEmptyState
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
    scannerEligibleCount
  } = useMarket();

  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const isApiData = candidateDataSource !== 'demo';
  const sourceLabel = candidateDataSource === 'database' ? 'DATABASE DATA' : candidateDataSource === 'local_csv' ? 'LOCAL CSV DATA' : 'DEMO DATA';

  const sectors = Array.from(new Set(candidates.map((c) => c.sector))).filter(Boolean);
  const setups = Array.from(new Set(candidates.map((c) => c.setup))).filter(Boolean);

  const filteredCandidates = candidates.filter((item) => {
    if (
      scannerFilters.search &&
      !item.symbol.toLowerCase().includes(scannerFilters.search.toLowerCase()) &&
      !item.company.toLowerCase().includes(scannerFilters.search.toLowerCase())
    ) {
      return false;
    }

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

  const universeCount = isApiData ? scannerUniverseCount : 395;
  const eligibleCount = isApiData ? scannerEligibleCount : filteredCandidates.length;
  const aPlusCount = filteredCandidates.filter((c) => c.grade === 'A+').length;
  const aCount = filteredCandidates.filter((c) => c.grade === 'A').length;
  const bPlusCount = filteredCandidates.filter((c) => c.grade === 'B+').length;
  const rejectCount = filteredCandidates.filter((c) => c.grade === 'REJECT').length;

  return (
    <PageContainer id="scanner-route-stage">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-border-dark pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Market Scanner</h1>
            <span className="px-2 py-0.5 rounded bg-[#161B22] border border-border-dark text-[10px] font-mono font-bold text-text-secondary flex items-center gap-1">
              <Activity className={`w-3 h-3 ${backendConnectionStatus === 'Connected' ? 'text-[#238636]' : 'text-[#D29922]'}`} />
              <span>STATUS: {backendConnectionStatus === 'Connected' ? 'API CONNECTED' : 'DEMO FALLBACK'}</span>
            </span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border uppercase tracking-wider ${isApiData ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/20' : 'bg-[#D29922]/10 text-[#D29922] border-[#D29922]/20'}`}>
              {sourceLabel}
            </span>
          </div>
          <p className="text-xs text-text-secondary max-w-2xl font-sans leading-relaxed">
            Filter and rank DSE stocks using backend scanner output when connected. Demo fallback remains available if the API is unavailable.
          </p>
        </div>

        <div className="flex items-center gap-3 select-none">
          <button
            onClick={resetScannerFilters}
            className="px-3 py-1.5 rounded bg-[#161B22] hover:bg-[#21262D] border border-border-dark text-xs font-mono font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
            title="Reset Filters back to default matrix"
          >
            <RotateCcw className="w-3.5 h-3.5 text-text-secondary" />
            <span>RESET FILTERS</span>
          </button>

          <button
            onClick={runDemoScan}
            disabled={isScanning}
            className="px-3.5 py-1.5 rounded bg-[#238636] hover:bg-[#2EA043] border border-[#238636] disabled:bg-border-dark disabled:border-border-dark disabled:text-text-secondary disabled:cursor-not-allowed text-xs font-mono font-bold text-white transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'SCANNING...' : backendConnectionStatus === 'Connected' ? 'RUN BACKEND SCAN' : 'RUN DEMO SCAN'}</span>
          </button>
        </div>
      </div>

      <div className="mb-6 p-3 rounded-lg border border-border-dark bg-[#161B22]/40 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#58A6FF]" />
          <span className="text-text-secondary">SCAN ENGINE TELEMETRY:</span>
          <span className="text-white font-bold">{sourceLabel}</span>
        </div>
        <div className="text-text-secondary">
          Last Scan: <span className="text-white font-semibold font-mono">{scanTimestamp}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <ScannerSummaryCard label="Universe" value={universeCount} icon={<Globe className="w-3.5 h-3.5 text-[#58A6FF]" />} context={isApiData ? 'Backend scanned symbols' : 'Total Tracked DSE'} />
        <ScannerSummaryCard label="Eligible Stocks" value={eligibleCount} icon={<Layers className="w-3.5 h-3.5 text-[#58A6FF]" />} context={isApiData ? 'Backend eligible symbols' : 'Matches Active Filters'} />
        <ScannerSummaryCard label="A+ Grade" value={aPlusCount} icon={<span className="text-[10px] font-mono text-[#238636] font-extrabold">A+</span>} context="A+ Highly Qualified" />
        <ScannerSummaryCard label="A Grade" value={aCount} icon={<span className="text-[10px] font-mono text-[#58A6FF] font-extrabold">A</span>} context="A Qualified" />
        <ScannerSummaryCard label="B+ Watch" value={bPlusCount} icon={<span className="text-[10px] font-mono text-[#D29922] font-extrabold">B+</span>} context="B+ Watch Setups" />
        <ScannerSummaryCard label="Rejected" value={rejectCount} icon={<span className="text-[10px] font-mono text-[#DA3633] font-extrabold">X</span>} context="Under 85 Score" />
      </div>

      <div className="mb-6">
        <ScannerFilterPanel isCollapsed={isFilterCollapsed} setIsCollapsed={setIsFilterCollapsed} sectors={sectors} setups={setups} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-dark/60 pb-2">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Scanned Candidates Match Array</h2>
          <span className="text-xs text-text-secondary font-mono">
            Filtered Total: <span className="text-white font-bold">{filteredCandidates.length}</span>
          </span>
        </div>

        {filteredCandidates.length === 0 ? (
          <ScannerEmptyState onClear={resetScannerFilters} />
        ) : (
          <ScannerResultsTable items={filteredCandidates} onViewDetails={(id) => setSelectedScannerCandidateId(id)} />
        )}
      </div>

      <ScannerDetailDrawer id={selectedScannerCandidateId} onClose={() => setSelectedScannerCandidateId(null)} />
    </PageContainer>
  );
}
