import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Percent,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Lock
} from 'lucide-react';
import { Candidate } from '../types/scanner';
import { useMarket } from '../store/marketStore';

// 1. Unified Demo Data Badge
export function DemoDataBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-[#D29922]/10 text-[#D29922] border border-[#D29922]/20 uppercase tracking-wider">
      Demo Data
    </span>
  );
}

// 2. Grade Badge
export function GradeBadge({ grade }: { grade: 'A+' | 'A' | 'B+' | 'REJECT' }) {
  let styles = 'bg-[#238636]/10 text-[#238636] border-[#238636]/20';
  if (grade === 'A') {
    styles = 'bg-[#58A6FF]/10 text-[#58A6FF] border-[#58A6FF]/20';
  } else if (grade === 'B+') {
    styles = 'bg-[#D29922]/10 text-[#D29922] border-[#D29922]/20';
  } else if (grade === 'REJECT') {
    styles = 'bg-[#DA3633]/10 text-[#DA3633] border-[#DA3633]/20';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wider ${styles}`}>
      {grade}
    </span>
  );
}

// 3. Setup Badge
export function SetupBadge({ setup }: { setup: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-[#161B22] text-white border border-border-dark truncate max-w-[150px]">
      {setup}
    </span>
  );
}

// 4. Side Badge
export function SideBadge({ side }: { side: 'LONG' | 'SHORT' }) {
  const isLong = side === 'LONG';
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase ${
      isLong ? 'bg-[#238636]/10 text-[#238636] border-[#238636]/20' : 'bg-[#DA3633]/10 text-[#DA3633] border-[#DA3633]/20'
    }`}>
      {isLong ? 'LONG' : 'SHORT'}
    </span>
  );
}

// 5. Entry Status Badge
export function EntryStatusBadge({ status }: { status: 'READY' | 'NEAR' | 'WATCH' }) {
  let styles = 'bg-[#238636]/10 text-[#238636] border-[#238636]/20';
  if (status === 'NEAR') {
    styles = 'bg-[#58A6FF]/10 text-[#58A6FF] border-[#58A6FF]/20';
  } else if (status === 'WATCH') {
    styles = 'bg-text-secondary/10 text-text-secondary border-text-secondary/20';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold border uppercase tracking-wider ${styles}`}>
      {status}
    </span>
  );
}

// 6. Generic Summary Metrics Card
interface SummaryCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  context?: string;
}

export function ScannerSummaryCard({ label, value, icon, context }: SummaryCardProps) {
  return (
    <div className="rounded-lg border border-border-dark bg-[#0D1117] p-3.5 flex flex-col justify-between hover:border-[#484F58] transition-all">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest font-semibold truncate">
          {label}
        </span>
        {icon || <DemoDataBadge />}
      </div>
      <div className="mt-2.5 flex items-baseline justify-between">
        <span className="text-lg font-bold text-white tracking-tight font-mono">
          {value}
        </span>
      </div>
      {context && (
        <div className="mt-1.5 text-[9px] font-mono text-text-secondary truncate border-t border-border-dark/30 pt-1">
          {context}
        </div>
      )}
    </div>
  );
}

// 7. Reasons Renderer list
export function ReasonList({ reasons, title, icon, colorClass }: { reasons: string[]; title: string; icon?: React.ReactNode; colorClass?: string }) {
  if (reasons.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-mono font-semibold text-white flex items-center gap-1.5 uppercase tracking-wider">
        {icon}
        <span>{title}</span>
      </h4>
      <ul className="space-y-1 pl-4 list-disc text-[11px] text-text-secondary leading-relaxed font-sans">
        {reasons.map((reason, idx) => (
          <li key={idx} className={colorClass}>
            {reason}
          </li>
        ))}
      </ul>
    </div>
  );
}

// 8. Collapsible & Responsive Filter Panel
interface FilterPanelProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  sectors: string[];
  setups: string[];
}

export function ScannerFilterPanel({ isCollapsed, setIsCollapsed, sectors, setups }: FilterPanelProps) {
  const { scannerFilters, setScannerFilters, resetScannerFilters } = useMarket();

  const handleSelectChange = (key: keyof typeof scannerFilters, val: string) => {
    setScannerFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleInputChange = (key: keyof typeof scannerFilters, val: string) => {
    setScannerFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleCheckboxChange = (key: keyof typeof scannerFilters, val: boolean) => {
    setScannerFilters((prev) => ({ ...prev, [key]: val }));
  };

  // Count active non-empty filters
  const activeCount = Object.entries(scannerFilters).reduce((acc, [key, value]) => {
    if (key === 'excludeLowLiquidity' && value === true) return acc + 1;
    if (key !== 'excludeLowLiquidity' && value !== '') return acc + 1;
    return acc;
  }, 0);

  return (
    <div className="rounded-xl border border-border-dark bg-[#0D1117]/80 overflow-hidden select-none">
      <div className="p-4 border-b border-border-dark flex items-center justify-between bg-[#0D1117]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#58A6FF]" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Filter Conditions Matrix
          </h3>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-[#58A6FF]/10 text-[#58A6FF] border border-[#58A6FF]/20 text-[10px] font-mono font-bold">
              {activeCount} Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {activeCount > 0 && (
            <button
              onClick={resetScannerFilters}
              className="text-[10px] font-mono font-semibold text-[#DA3633] hover:underline cursor-pointer focus:outline-none"
            >
              CLEAR ALL
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#161B22] border border-border-dark text-xs text-text-secondary hover:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <span>{isCollapsed ? 'SHOW FILTERS' : 'HIDE FILTERS'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#0D1117]/40">
          {/* Section A: General Search & Selects */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-bold text-[#8B949E] uppercase tracking-wider border-b border-border-dark pb-1">
              General Identity
            </h4>

            <div>
              <label className="block text-[10px] font-mono text-text-secondary mb-1">Search Symbol</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-text-muted" />
                <input
                  type="text"
                  value={scannerFilters.search}
                  onChange={(e) => handleInputChange('search', e.target.value)}
                  placeholder="e.g. SQURPHARMA"
                  className="w-full bg-[#161B22] border border-border-dark rounded px-2.5 py-1.5 pl-8 text-xs text-white placeholder-text-muted focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-text-secondary mb-1">Sector Class</label>
              <select
                value={scannerFilters.sector}
                onChange={(e) => handleSelectChange('sector', e.target.value)}
                className="w-full bg-[#161B22] border border-border-dark rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
              >
                <option value="">-- ALL SECTORS --</option>
                {sectors.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section B: Signal Direction & Setup Filters */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-bold text-[#8B949E] uppercase tracking-wider border-b border-border-dark pb-1">
              Setup & Signals
            </h4>

            <div>
              <label className="block text-[10px] font-mono text-text-secondary mb-1">Setup Style</label>
              <select
                value={scannerFilters.setup}
                onChange={(e) => handleSelectChange('setup', e.target.value)}
                className="w-full bg-[#161B22] border border-border-dark rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
              >
                <option value="">-- ALL SETUPS --</option>
                {setups.map((set) => (
                  <option key={set} value={set}>{set}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-text-secondary mb-1">Bias Side</label>
                <select
                  value={scannerFilters.side}
                  onChange={(e) => handleSelectChange('side', e.target.value)}
                  className="w-full bg-[#161B22] border border-border-dark rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="">ALL</option>
                  <option value="LONG">LONG</option>
                  <option value="SHORT">SHORT</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-text-secondary mb-1">Setup Grade</label>
                <select
                  value={scannerFilters.grade}
                  onChange={(e) => handleSelectChange('grade', e.target.value)}
                  className="w-full bg-[#161B22] border border-border-dark rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="">ALL</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B+">B+</option>
                  <option value="REJECT">REJECT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section C: Numeric Technical Thresholds */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-bold text-[#8B949E] uppercase tracking-wider border-b border-border-dark pb-1">
              Technical Thresholds
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono text-text-secondary mb-1">Min Price (৳)</label>
                <input
                  type="number"
                  value={scannerFilters.minPrice}
                  onChange={(e) => handleInputChange('minPrice', e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full bg-[#161B22] border border-border-dark rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-text-secondary mb-1">Max Price (৳)</label>
                <input
                  type="number"
                  value={scannerFilters.maxPrice}
                  onChange={(e) => handleInputChange('maxPrice', e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-[#161B22] border border-border-dark rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-text-secondary mb-1">Trend Direction</label>
              <select
                value={scannerFilters.trend}
                onChange={(e) => handleSelectChange('trend', e.target.value)}
                className="w-full bg-[#161B22] border border-border-dark rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
              >
                <option value="">-- ALL TRENDS --</option>
                <option value="BULLISH">BULLISH</option>
                <option value="NEUTRAL">NEUTRAL</option>
                <option value="BEARISH">BEARISH</option>
              </select>
            </div>
          </div>

          {/* Section D: Liquidity & Readiness */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-bold text-[#8B949E] uppercase tracking-wider border-b border-border-dark pb-1">
              Risk & Readiness
            </h4>

            <div>
              <label className="block text-[10px] font-mono text-text-secondary mb-1">Entry Readiness</label>
              <select
                value={scannerFilters.entryStatus}
                onChange={(e) => handleSelectChange('entryStatus', e.target.value)}
                className="w-full bg-[#161B22] border border-border-dark rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
              >
                <option value="">-- ALL DEGREES --</option>
                <option value="READY">READY</option>
                <option value="NEAR">NEAR</option>
                <option value="WATCH">WATCH</option>
              </select>
            </div>

            <div className="flex items-center h-full pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[10px] font-mono text-text-secondary hover:text-white">
                <input
                  type="checkbox"
                  checked={scannerFilters.excludeLowLiquidity}
                  onChange={(e) => handleCheckboxChange('excludeLowLiquidity', e.target.checked)}
                  className="rounded border-border-dark text-[#58A6FF] bg-[#161B22] focus:ring-0 cursor-pointer h-3.5 w-3.5"
                />
                <span>EXCLUDE LOW LIQUIDITY</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 9. Reusable Table Pagination Component
interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

export function TablePagination({
  totalItems,
  itemsPerPage,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border-dark bg-[#0D1117] text-xs font-mono select-none">
      <div className="flex items-center gap-3">
        <span className="text-text-secondary">Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="bg-[#161B22] border border-border-dark rounded px-1.5 py-1 text-xs text-white focus:outline-none"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
        <span className="text-text-secondary">
          Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems} candidates
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1 rounded bg-[#161B22] border border-border-dark hover:text-white disabled:opacity-40 disabled:hover:text-text-secondary cursor-pointer focus:outline-none"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-text-secondary">
          Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white">{totalPages}</span>
        </span>

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1 rounded bg-[#161B22] border border-border-dark hover:text-white disabled:opacity-40 disabled:hover:text-text-secondary cursor-pointer focus:outline-none"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// 10. Empty State Layout
export function ScannerEmptyState({ onClear }: { onClear?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border-dark bg-[#0D1117]/30 max-w-xl mx-auto my-6">
      <div className="p-3 bg-[#161B22] rounded-full text-text-secondary mb-4 border border-border-dark">
        <Info className="w-6 h-6 opacity-85" />
      </div>
      <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-1">No Matching Candidates Found</h4>
      <p className="text-xs text-text-secondary max-w-sm mb-4 leading-relaxed font-sans">
        No equities satisfied the active filtering criteria. Re-adjust your price levels, RSI brackets, or liquidity parameters.
      </p>
      {onClear && (
        <button
          onClick={onClear}
          className="px-3.5 py-1.5 rounded bg-[#161B22] hover:bg-[#21262D] border border-border-dark text-xs font-mono font-semibold text-white transition-colors cursor-pointer"
        >
          RESET ALL FILTERS
        </button>
      )}
    </div>
  );
}

// 11. Scanner Results Table Component
interface ScannerResultsTableProps {
  items: Candidate[];
  onViewDetails: (id: string) => void;
}

export function ScannerResultsTable({ items, onViewDetails }: ScannerResultsTableProps) {
  const [sortField, setSortField] = React.useState<keyof Candidate>('score');
  const [sortAsc, setSortAsc] = React.useState<boolean>(false);

  const handleSort = (field: keyof Candidate) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sorted = [...items].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const [pageSize, setPageSize] = React.useState<number>(10);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const totalItems = sorted.length;
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Set page back to 1 if filter makes current page invalid
  useEffect(() => {
    const maxPages = Math.ceil(totalItems / pageSize) || 1;
    if (currentPage > maxPages) {
      setCurrentPage(1);
    }
  }, [totalItems, pageSize, currentPage]);

  if (totalItems === 0) {
    return <ScannerEmptyState />;
  }

  const SortHeader = ({ field, label }: { field: keyof Candidate; label: string }) => {
    const isActive = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className="py-3 px-3 font-semibold hover:text-white cursor-pointer select-none transition-colors border-b border-border-dark text-text-secondary"
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          {isActive && (
            <span className="text-[#58A6FF] font-black text-[9px]">
              {sortAsc ? '▲' : '▼'}
            </span>
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="rounded-xl border border-border-dark bg-[#0D1117] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-[11px]" aria-label="Market Scanner Candidates list">
          <thead>
            <tr className="bg-[#161B22]/50 text-[10px] uppercase select-none">
              <SortHeader field="rank" label="Rank" />
              <SortHeader field="symbol" label="Symbol" />
              <SortHeader field="sector" label="Sector" />
              <SortHeader field="setup" label="Setup Pattern" />
              <SortHeader field="side" label="Side" />
              <SortHeader field="grade" label="Grade" />
              <SortHeader field="score" label="Score" />
              <SortHeader field="price" label="Price" />
              <SortHeader field="changePercent" label="Chg %" />
              <SortHeader field="relativeVolume" label="RVol" />
              <SortHeader field="rsi" label="RSI" />
              <SortHeader field="trend" label="Trend" />
              <SortHeader field="entryStatus" label="Status" />
              <SortHeader field="riskReward" label="R/R" />
              <th className="py-3 px-3 font-semibold border-b border-border-dark text-text-secondary">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark/40">
            {paginated.map((cand) => {
              const isUp = cand.changePercent >= 0;
              return (
                <tr
                  key={cand.id}
                  className="hover:bg-[#161B22]/60 transition-colors"
                >
                  <td className="py-3 px-3 text-text-muted font-bold">
                    #{cand.rank}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-white uppercase">{cand.symbol}</div>
                    <div className="text-[9px] text-text-secondary font-sans truncate max-w-[120px]">
                      {cand.company}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-text-secondary">
                    {cand.sector}
                  </td>
                  <td className="py-3 px-3">
                    <SetupBadge setup={cand.setup} />
                  </td>
                  <td className="py-3 px-3">
                    <SideBadge side={cand.side} />
                  </td>
                  <td className="py-3 px-3">
                    <GradeBadge grade={cand.grade} />
                  </td>
                  <td className="py-3 px-3 text-white font-bold">
                    {cand.score}
                  </td>
                  <td className="py-3 px-3 text-white font-semibold">
                    ৳{cand.price.toFixed(2)}
                  </td>
                  <td className={`py-3 px-3 font-bold ${isUp ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                    {isUp ? '+' : ''}{cand.changePercent.toFixed(2)}%
                  </td>
                  <td className="py-3 px-3 text-text-secondary">
                    {cand.relativeVolume.toFixed(1)}x
                  </td>
                  <td className="py-3 px-3 text-text-secondary">
                    {cand.rsi}
                  </td>
                  <td className={`py-3 px-3 font-bold text-[10px] ${
                    cand.trend === 'BULLISH' ? 'text-[#238636]' : cand.trend === 'BEARISH' ? 'text-[#DA3633]' : 'text-text-secondary'
                  }`}>
                    {cand.trend}
                  </td>
                  <td className="py-3 px-3">
                    <EntryStatusBadge status={cand.entryStatus} />
                  </td>
                  <td className="py-3 px-3 text-white font-medium">
                    {cand.riskReward.toFixed(2)}x
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => onViewDetails(cand.id)}
                      className="px-2 py-1 rounded bg-[#161B22] border border-border-dark text-[10px] font-sans font-bold text-white hover:bg-[#21262D] transition-colors cursor-pointer focus:outline-none"
                    >
                      VIEW DETAILS
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <TablePagination
        totalItems={totalItems}
        itemsPerPage={pageSize}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />
    </div>
  );
}

// 12. Side-Drawer or Full-Screen Overlay Component (Scanner Details Drawer)
interface ScannerDetailDrawerProps {
  id: string | null;
  onClose: () => void;
}

export function ScannerDetailDrawer({ id, onClose }: ScannerDetailDrawerProps) {
  const { candidates, addToWatchlist, watchlistSymbols } = useMarket();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);

  const item = candidates.find((c) => c.id === id);

  // Close on Escape Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const isAlreadyInWatchlist = watchlistSymbols.includes(item.symbol);

  const handleOpenSignal = () => {
    onClose();
    navigate('/signals');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none" role="dialog" aria-modal="true">
      {/* Dark overlay backdrop */}
      <div
        className="absolute inset-0 bg-[#0B0E14]/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md bg-[#0D1117] border-l border-border-dark flex flex-col shadow-2xl relative"
        >
          {/* Drawer Toolbar Header */}
          <div className="h-16 px-6 border-b border-border-dark flex items-center justify-between bg-[#0D1117]/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
                Candidate Specs
              </span>
              <DemoDataBadge />
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-text-secondary hover:text-white hover:bg-[#161B22] focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              title="Close Drawer [Esc]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer content (Scrollable container) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Header info card */}
            <div className="bg-[#161B22]/50 p-4 rounded-lg border border-border-dark space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono font-black text-white uppercase">{item.symbol}</span>
                <GradeBadge grade={item.grade} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{item.company}</h3>
                <p className="text-xs text-text-secondary">{item.sector} sector class</p>
              </div>
            </div>

            {/* Price and score stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#161B22]/30 p-3 rounded-md border border-border-dark/60 text-center">
                <span className="text-[10px] font-mono text-text-secondary block uppercase">LTP / Current Price</span>
                <span className="text-lg font-mono font-black text-white mt-1 block">৳{item.price.toFixed(2)}</span>
                <span className={`text-[10px] font-mono font-bold mt-1 inline-flex ${item.changePercent >= 0 ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                  {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                </span>
              </div>

              <div className="bg-[#161B22]/30 p-3 rounded-md border border-border-dark/60 text-center">
                <span className="text-[10px] font-mono text-text-secondary block uppercase">Technical Score</span>
                <span className="text-lg font-mono font-black text-[#58A6FF] mt-1 block">{item.score}/100</span>
                <span className="text-[10px] font-mono text-text-muted mt-1 block uppercase">Grade Rank #{item.rank}</span>
              </div>
            </div>

            {/* Structure metrics layout */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono font-bold text-[#8B949E] uppercase tracking-widest border-b border-border-dark pb-1">
                Setup Trade Blueprint
              </h4>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-border-dark/20 pb-1.5">
                  <span className="text-text-secondary">Bias Side:</span>
                  <SideBadge side={item.side} />
                </div>
                <div className="flex items-center justify-between border-b border-border-dark/20 pb-1.5">
                  <span className="text-text-secondary">RSI (Daily):</span>
                  <span className="text-white font-bold">{item.rsi}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border-dark/20 pb-1.5 col-span-2">
                  <span className="text-text-secondary">Setup Type:</span>
                  <span className="text-white font-bold">{item.setup}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border-dark/20 pb-1.5">
                  <span className="text-text-secondary">Entry Low:</span>
                  <span className="text-white font-semibold">৳{item.entryLow.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border-dark/20 pb-1.5">
                  <span className="text-text-secondary">Entry High:</span>
                  <span className="text-white font-semibold">৳{item.entryHigh.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border-dark/20 pb-1.5">
                  <span className="text-text-secondary">Stop Loss:</span>
                  <span className="text-[#DA3633] font-bold">৳{item.stopLoss.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border-dark/20 pb-1.5">
                  <span className="text-text-secondary">Target 1:</span>
                  <span className="text-[#238636] font-bold">৳{item.target1.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border-dark/20 pb-1.5">
                  <span className="text-text-secondary">Target 2:</span>
                  <span className="text-[#238636] font-bold">৳{item.target2.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border-dark/20 pb-1.5">
                  <span className="text-text-secondary">Risk / Reward:</span>
                  <span className="text-[#58A6FF] font-black">{item.riskReward.toFixed(2)}x</span>
                </div>
              </div>
            </div>

            {/* Condition assessment lists */}
            <div className="space-y-4 border-t border-border-dark/60 pt-4">
              <ReasonList
                reasons={item.qualificationReasons}
                title="Qualified Strengths"
                icon={<ThumbsUp className="w-3.5 h-3.5 text-[#238636]" />}
                colorClass="text-[#c9d1d9]"
              />

              <ReasonList
                reasons={item.missingConditions}
                title="Pending Confirmations (B+ Setup Only)"
                icon={<AlertTriangle className="w-3.5 h-3.5 text-[#D29922]" />}
                colorClass="text-[#D29922]"
              />

              <ReasonList
                reasons={item.rejectionReasons}
                title="Rejection Criteria Failures"
                icon={<ThumbsDown className="w-3.5 h-3.5 text-[#DA3633]" />}
                colorClass="text-[#DA3633]"
              />
            </div>
          </div>

          {/* Drawer Actions panel */}
          <div className="p-4 bg-[#161B22]/40 border-t border-border-dark space-y-3.5 select-none">
            <button
              onClick={handleOpenSignal}
              className="w-full py-2.5 px-4 bg-[#161B22] border border-border-dark rounded-md text-xs font-sans font-bold text-white hover:bg-[#21262D] transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>OPEN QUALIFIED SIGNAL VIEW</span>
            </button>

            <button
              onClick={() => {
                addToWatchlist(item.symbol);
              }}
              disabled={isAlreadyInWatchlist}
              className={`w-full py-2.5 px-4 rounded-md text-xs font-sans font-bold transition-colors flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer ${
                isAlreadyInWatchlist
                  ? 'bg-border-dark border border-border-dark text-text-secondary cursor-not-allowed'
                  : 'bg-[#238636] hover:bg-[#2EA043] border border-[#238636] text-white'
              }`}
            >
              {isAlreadyInWatchlist ? <Check className="w-3.5 h-3.5 text-[#238636]" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isAlreadyInWatchlist ? 'ALREADY WATCHED' : 'ADD TO ACTIVE WATCHLIST'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 13. Signal Card Component
interface SignalCardProps {
  item: Candidate;
  onViewAnalysis: (id: string) => void;
}

export function SignalCard({ item, onViewAnalysis }: SignalCardProps) {
  const { addToWatchlist, watchlistSymbols } = useMarket();
  const isAlreadyInWatchlist = watchlistSymbols.includes(item.symbol);

  const isBPlus = item.grade === 'B+';
  const isReject = item.grade === 'REJECT';

  let borderStyle = 'border-border-dark';
  let headerBg = 'bg-[#161B22]/25';

  if (isBPlus) {
    borderStyle = 'border-[#D29922]/20 hover:border-[#D29922]/45';
  } else if (isReject) {
    borderStyle = 'border-[#DA3633]/20 opacity-70 hover:opacity-100';
  } else {
    borderStyle = 'border-border-dark hover:border-[#484F58]';
  }

  return (
    <div className={`rounded-xl border bg-[#0D1117] overflow-hidden flex flex-col justify-between transition-all duration-200 select-none ${borderStyle}`}>
      
      {/* Top Card Section */}
      <div>
        {/* Card Header Row */}
        <div className={`p-4 border-b border-border-dark/60 flex items-center justify-between gap-4 ${headerBg}`}>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm font-mono font-black text-white uppercase tracking-tight">{item.symbol}</span>
              <DemoDataBadge />
            </div>
            <div className="text-[11px] text-text-secondary truncate font-sans">
              {item.company}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <GradeBadge grade={item.grade} />
            <span className="text-[10px] font-mono text-text-muted">Score: {item.score}</span>
          </div>
        </div>

        {/* Card Specs Matrix */}
        <div className="p-4 space-y-3.5 border-b border-border-dark/40">
          <div className="grid grid-cols-2 gap-y-2 text-xs font-mono">
            <div className="text-text-secondary">Setup:</div>
            <div className="text-white text-right font-semibold truncate uppercase">{item.setup}</div>

            <div className="text-text-secondary">Direction Bias:</div>
            <div className="text-right"><SideBadge side={item.side} /></div>

            <div className="text-text-secondary">Current price:</div>
            <div className="text-white text-right font-bold font-mono">৳{item.price.toFixed(2)}</div>

            <div className="text-text-secondary">Risk / Reward:</div>
            <div className="text-[#58A6FF] text-right font-black font-mono">{item.riskReward.toFixed(2)}x</div>

            <div className="text-text-secondary">Entry Status:</div>
            <div className="text-right"><EntryStatusBadge status={item.entryStatus} /></div>
          </div>

          {/* Core levels banner */}
          <div className="p-2.5 rounded-lg border border-border-dark/50 bg-[#161B22]/30 text-[11px] font-mono grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-text-secondary uppercase block text-[9px]">Entry Zone</span>
              <span className="text-white font-bold block mt-0.5 truncate">৳{item.entryLow.toFixed(1)}-{item.entryHigh.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-text-secondary uppercase block text-[9px]">Stop Loss</span>
              <span className="text-[#DA3633] font-bold block mt-0.5">৳{item.stopLoss.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-text-secondary uppercase block text-[9px]">Target 1</span>
              <span className="text-[#238636] font-bold block mt-0.5">৳{item.target1.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Bullet points area for reasons/confirmations */}
        <div className="p-4 space-y-3 bg-[#161B22]/10 min-h-[90px] flex flex-col justify-center">
          {isBPlus && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-[#D29922] uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Missing Confirmations:
              </span>
              <ul className="text-[10px] text-[#D29922]/90 list-disc pl-3.5 space-y-0.5 font-sans">
                {item.missingConditions.slice(0, 2).map((cond, index) => (
                  <li key={index} className="leading-snug">{cond}</li>
                ))}
              </ul>
            </div>
          )}

          {isReject && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-[#DA3633] uppercase tracking-wider flex items-center gap-1">
                <ThumbsDown className="w-3.5 h-3.5" /> REJECTION CRITERIA MET:
              </span>
              <ul className="text-[10px] text-[#DA3633]/95 list-disc pl-3.5 space-y-0.5 font-sans">
                {item.rejectionReasons.slice(0, 2).map((rej, index) => (
                  <li key={index} className="leading-snug">{rej}</li>
                ))}
              </ul>
            </div>
          )}

          {!isBPlus && !isReject && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-[#238636] uppercase tracking-wider flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" /> Setup Strengths:
              </span>
              <ul className="text-[10px] text-[#c9d1d9] list-disc pl-3.5 space-y-0.5 font-sans">
                {item.qualificationReasons.slice(0, 2).map((reason, index) => (
                  <li key={index} className="leading-snug">{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Action panel footer */}
      <div className="p-3 bg-[#0D1117] border-t border-border-dark/60 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onViewAnalysis(item.id)}
          className="w-full py-1.5 px-2 bg-[#161B22] border border-border-dark text-[10px] font-mono font-bold text-white hover:bg-[#21262D] rounded transition-colors text-center cursor-pointer focus:outline-none"
        >
          VIEW ANALYSIS
        </button>

        <button
          onClick={() => addToWatchlist(item.symbol)}
          disabled={isAlreadyInWatchlist}
          className={`w-full py-1.5 px-2 text-[10px] font-mono font-bold rounded transition-all text-center flex items-center justify-center gap-1 focus:outline-none cursor-pointer ${
            isAlreadyInWatchlist
              ? 'bg-border-dark text-text-secondary cursor-not-allowed'
              : 'bg-[#238636] hover:bg-[#2EA043] text-white'
          }`}
        >
          {isAlreadyInWatchlist ? <Check className="w-3 h-3 text-[#238636]" /> : <Plus className="w-3 h-3" />}
          <span>{isAlreadyInWatchlist ? 'WATCHED' : 'ADD WATCH'}</span>
        </button>
      </div>

    </div>
  );
}

// 14. Detailed Signal Analysis Modal Drawer
interface SignalAnalysisDrawerProps {
  id: string | null;
  onClose: () => void;
}

export function SignalAnalysisDrawer({ id, onClose }: SignalAnalysisDrawerProps) {
  const { candidates, addToWatchlist, watchlistSymbols } = useMarket();
  const item = candidates.find((c) => c.id === id);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const isAlreadyInWatchlist = watchlistSymbols.includes(item.symbol);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[#0B0E14]/70 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-[#0D1117] border-l border-border-dark flex flex-col shadow-2xl relative">
          
          {/* Drawer Toolbar Header */}
          <div className="h-16 px-6 border-b border-border-dark flex items-center justify-between bg-[#0D1117]/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
                Full Technical Case Study
              </span>
              <DemoDataBadge />
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-text-secondary hover:text-white hover:bg-[#161B22] focus:outline-none cursor-pointer"
              title="Close Drawer [Esc]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main content body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Header Box */}
            <div className="bg-[#161B22]/50 p-5 rounded-lg border border-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-semibold text-text-secondary uppercase">Dhaka Stock Exchange</span>
                <h3 className="text-xl font-mono font-black text-white uppercase tracking-tight mt-0.5">{item.symbol}</h3>
                <p className="text-xs text-text-secondary font-sans mt-0.5">{item.company}</p>
                <p className="text-[10px] text-[#58A6FF] font-mono mt-1 uppercase tracking-wider">Sector: {item.sector}</p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1 shrink-0 bg-[#0D1117] p-2.5 rounded border border-border-dark">
                <span className="text-[10px] font-mono text-text-secondary block">GRADE & SCORE</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <GradeBadge grade={item.grade} />
                  <span className="text-sm font-mono font-bold text-white">{item.score}/100</span>
                </div>
              </div>
            </div>

            {/* Price context summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#161B22]/20 p-2.5 rounded border border-border-dark/60 text-center">
                <span className="text-[9px] font-mono text-text-secondary uppercase block">LTP Price</span>
                <span className="text-xs font-mono font-bold text-white block mt-1">৳{item.price.toFixed(2)}</span>
              </div>
              <div className="bg-[#161B22]/20 p-2.5 rounded border border-border-dark/60 text-center">
                <span className="text-[9px] font-mono text-text-secondary uppercase block">Relative Vol</span>
                <span className="text-xs font-mono font-bold text-[#58A6FF] block mt-1">{item.relativeVolume.toFixed(1)}x</span>
              </div>
              <div className="bg-[#161B22]/20 p-2.5 rounded border border-border-dark/60 text-center">
                <span className="text-[9px] font-mono text-text-secondary uppercase block">Daily RSI</span>
                <span className="text-xs font-mono font-bold text-white block mt-1">{item.rsi}</span>
              </div>
              <div className="bg-[#161B22]/20 p-2.5 rounded border border-border-dark/60 text-center">
                <span className="text-[9px] font-mono text-text-secondary uppercase block">Trend Vector</span>
                <span className="text-xs font-mono font-bold text-white block mt-1 uppercase">{item.trend}</span>
              </div>
            </div>

            {/* Target & Execution level card */}
            <div className="bg-[#0D1117] border border-border-dark rounded-lg p-4 space-y-3">
              <h4 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-border-dark/60 pb-1.5">
                <TrendingUp className="w-4 h-4 text-[#238636]" />
                <span>Trade Structure Blueprint</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <div className="flex justify-between border-b border-border-dark/20 pb-1">
                    <span className="text-text-secondary">Bias Bias:</span>
                    <SideBadge side={item.side} />
                  </div>
                  <div className="flex justify-between border-b border-border-dark/20 pb-1">
                    <span className="text-text-secondary">Preferred Entry Range:</span>
                    <span className="text-white font-bold">৳{item.entryLow.toFixed(1)} - ৳{item.entryHigh.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-dark/20 pb-1">
                    <span className="text-text-secondary">Conservative Stop Loss:</span>
                    <span className="text-[#DA3633] font-bold">৳{item.stopLoss.toFixed(1)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between border-b border-border-dark/20 pb-1">
                    <span className="text-text-secondary">Target Objective 1:</span>
                    <span className="text-[#238636] font-bold">৳{item.target1.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-dark/20 pb-1">
                    <span className="text-text-secondary">Target Objective 2:</span>
                    <span className="text-[#238636] font-bold">৳{item.target2.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border-dark/20 pb-1">
                    <span className="text-text-secondary">Risk / Reward (R:R):</span>
                    <span className="text-[#58A6FF] font-black">{item.riskReward.toFixed(2)}x</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Context Table */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono font-bold text-[#8B949E] uppercase tracking-wider border-b border-border-dark pb-1.5">
                Technical Context Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-border-dark/20 pb-1">
                  <span className="text-text-secondary">Higher Timeframe Trend:</span>
                  <span className="text-white uppercase">{item.trend}</span>
                </div>
                <div className="flex justify-between border-b border-border-dark/20 pb-1">
                  <span className="text-text-secondary">EMA Alignment (10/20/50):</span>
                  <span className="text-white uppercase">{item.emaAlignment}</span>
                </div>
                <div className="flex justify-between border-b border-border-dark/20 pb-1">
                  <span className="text-text-secondary">RSI Overbought Check:</span>
                  <span className="text-white">{item.rsi > 70 ? 'Warning Overbought' : 'Clear Zone'}</span>
                </div>
                <div className="flex justify-between border-b border-border-dark/20 pb-1">
                  <span className="text-text-secondary">Identified Support Shelf:</span>
                  <span className="text-white">৳{item.support.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-border-dark/20 pb-1">
                  <span className="text-text-secondary">Respective Resistance Shelf:</span>
                  <span className="text-white">৳{item.resistance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-border-dark/20 pb-1">
                  <span className="text-text-secondary">Average Daily Volume:</span>
                  <span className="text-white">{item.averageVolume}</span>
                </div>
              </div>
            </div>

            {/* Bullet reasons analysis */}
            <div className="space-y-4 border-t border-border-dark/60 pt-4">
              <ReasonList
                reasons={item.qualificationReasons}
                title="Reasoning Behind Qualification"
                icon={<ThumbsUp className="w-3.5 h-3.5 text-[#238636]" />}
                colorClass="text-[#c9d1d9]"
              />

              <ReasonList
                reasons={item.missingConditions}
                title="Missing Confirmations (Watch Status)"
                icon={<AlertTriangle className="w-3.5 h-3.5 text-[#D29922]" />}
                colorClass="text-[#D29922]"
              />

              <ReasonList
                reasons={item.rejectionReasons}
                title="Primary Failure Reasons"
                icon={<ThumbsDown className="w-3.5 h-3.5 text-[#DA3633]" />}
                colorClass="text-[#DA3633]"
              />
            </div>

            {/* Financial Disclaimer Banner */}
            <div className="p-3 bg-[#161B22]/30 border border-border-dark rounded-lg text-[10px] font-sans text-text-secondary leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-[#58A6FF] shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-semibold">Regulatory Standard Disclaimer:</span> This is demo frontend data and not financial advice. Live qualified signals require verified brokerage feed pipeline connections and server side calculation engine integration during Phase 2.
              </div>
            </div>

          </div>

          {/* Drawer bottom actions panel */}
          <div className="p-4 border-t border-border-dark bg-[#161B22]/40 select-none">
            <button
              onClick={() => addToWatchlist(item.symbol)}
              disabled={isAlreadyInWatchlist}
              className={`w-full py-2.5 px-4 rounded-md text-xs font-sans font-bold transition-colors flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer ${
                isAlreadyInWatchlist
                  ? 'bg-border-dark border border-border-dark text-text-secondary cursor-not-allowed'
                  : 'bg-[#238636] hover:bg-[#2EA043] border border-[#238636] text-white'
              }`}
            >
              {isAlreadyInWatchlist ? <Check className="w-3.5 h-3.5 text-[#238636]" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isAlreadyInWatchlist ? 'ALREADY WATCHED' : 'ADD CANDIDATE TO WATCHLIST'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
