import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  RefreshCw,
  Eye,
  Shield,
  BarChart4
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { theme } from '../theme';
import {
  KpiData,
  ChartDataPoint,
  MoverItem,
  WatchlistStock,
  SectorItem
} from '../data/dashboardMockData';

// 1. Simple Demo Data Badge
export function DemoDataBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-[#D29922]/10 text-[#D29922] border border-[#D29922]/20 uppercase tracking-wider">
      Demo Data
    </span>
  );
}

// 2. Dashboard Panel Component
interface DashboardPanelProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  showBadge?: boolean;
  className?: string;
}

export function DashboardPanel({
  title,
  subtitle,
  children,
  action,
  showBadge = true,
  className = ''
}: DashboardPanelProps) {
  return (
    <div className={`rounded-xl border border-border-dark bg-[#0D1117]/50 overflow-hidden flex flex-col ${className}`}>
      {/* Header section */}
      <div className="p-4 border-b border-border-dark flex items-center justify-between gap-4 bg-[#0D1117]/70">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              {title}
            </h3>
            {showBadge && <DemoDataBadge />}
          </div>
          {subtitle && (
            <p className="text-[11px] text-text-secondary mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Content section */}
      <div className="p-4 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}

// 3. KPI Card Component
interface KpiCardProps {
  data: KpiData;
}

export function DashboardKpiCard({ data }: KpiCardProps) {
  let statusColor = 'text-text-primary';
  let badgeStyle = 'bg-text-muted/10 text-text-secondary border-text-muted/20';

  if (data.isPositive) {
    statusColor = 'text-[#238636]';
    badgeStyle = 'bg-[#238636]/10 text-[#238636] border-[#238636]/20';
  } else if (data.isNegative) {
    statusColor = 'text-[#DA3633]';
    badgeStyle = 'bg-[#DA3633]/10 text-[#DA3633] border-[#DA3633]/20';
  } else if (data.isNeutral) {
    statusColor = 'text-text-secondary';
    badgeStyle = 'bg-text-secondary/10 text-text-secondary border-text-secondary/20';
  }

  return (
    <div className="rounded-lg border border-border-dark bg-[#0D1117] p-3.5 flex flex-col justify-between hover:border-[#484F58] transition-all relative">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-text-secondary uppercase tracking-wider font-semibold truncate">
          {data.label}
        </span>
        <DemoDataBadge />
      </div>

      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <span className="text-lg md:text-xl font-bold text-white tracking-tight font-mono">
          {data.value}
        </span>
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${badgeStyle}`}>
          {data.change}
        </span>
      </div>

      <div className="mt-2 text-[10px] text-text-secondary truncate border-t border-border-dark/50 pt-1.5">
        {data.context}
      </div>
    </div>
  );
}

// 4. Custom Tooltip for Recharts that fits the terminal aesthetic
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: ChartDataPoint }>;
  label?: string;
}

const CustomChartTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0D1117] border border-border-dark p-2.5 rounded-md shadow-xl font-mono text-[11px]">
        <p className="text-text-secondary mb-1">Time/Period: <span className="text-white font-bold">{label}</span></p>
        <p className="text-[#58A6FF]">Index: <span className="text-white font-bold">{payload[0].value.toFixed(2)}</span></p>
        <p className="text-text-muted mt-0.5">Vol: <span className="text-text-secondary font-bold">{payload[0].payload.volume.toLocaleString()}</span></p>
      </div>
    );
  }
  return null;
};

// 5. Market Performance Component
interface MarketPerformanceProps {
  data: Record<string, ChartDataPoint[]>;
}

export function MarketPerformance({ data }: MarketPerformanceProps) {
  const [selectedRange, setSelectedRange] = useState<'1D' | '1W' | '1M' | '3M'>('1D');
  const chartPoints = data[selectedRange];

  // Calculate some simple dynamic aggregates for display
  const prices = chartPoints.map(p => p.value);
  const minPrice = Math.min(...prices) - 5;
  const maxPrice = Math.max(...prices) + 5;
  const latestPrice = chartPoints[chartPoints.length - 1].value;
  const initialPrice = chartPoints[0].value;
  const priceChange = latestPrice - initialPrice;
  const isUp = priceChange >= 0;

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Range controls and quick statistics */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-[#161B22]/50 p-2 rounded border border-border-dark">
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <span className="text-text-secondary">DSEX Index:</span>
          <span className="text-white font-bold">{latestPrice.toFixed(2)}</span>
          <span className={`flex items-center font-bold ${isUp ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
            {isUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {isUp ? '+' : ''}{priceChange.toFixed(2)}
          </span>
        </div>

        <div className="flex gap-1" role="tablist">
          {(['1D', '1W', '1M', '3M'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              role="tab"
              aria-selected={selectedRange === range}
              className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded border cursor-pointer focus:outline-none transition-colors ${
                selectedRange === range
                  ? 'bg-[#58A6FF]/10 text-[#58A6FF] border-[#58A6FF]/30'
                  : 'bg-transparent text-text-secondary border-transparent hover:border-border-dark hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Container */}
      <div className="h-48 w-full font-mono text-[10px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartPoints} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isUp ? '#238636' : '#DA3633'} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={isUp ? '#238636' : '#DA3633'} stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#161B22" />
            <XAxis
              dataKey="time"
              stroke="#8B949E"
              tickLine={false}
              axisLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              stroke="#8B949E"
              domain={[minPrice, maxPrice]}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => Math.round(val).toString()}
            />
            <Tooltip content={<CustomChartTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={isUp ? '#238636' : '#DA3633'}
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#chartGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-[10px] text-text-secondary flex justify-between font-mono border-t border-border-dark/30 pt-2">
        <span>Min: {minPrice.toFixed(1)}</span>
        <span>Max: {maxPrice.toFixed(1)}</span>
        <span>Period: Fixed Sandbox Ingestion</span>
      </div>
    </div>
  );
}

// 6. Market Breadth Component
interface MarketBreadthChartProps {
  advancers: number;
  decliners: number;
  unchanged: number;
}

export function MarketBreadthChart({ advancers, decliners, unchanged }: MarketBreadthChartProps) {
  const total = advancers + decliners + unchanged;
  const advPct = (advancers / total) * 100;
  const decPct = (decliners / total) * 100;
  const uncPct = (unchanged / total) * 100;
  const ratio = (advancers / decliners).toFixed(2);

  // Interpretation derived from values
  let interpretation = 'Neutral';
  let badgeStyle = 'bg-text-secondary/10 text-text-secondary border-text-secondary/20';

  if (advancers > decliners * 1.5) {
    interpretation = 'Bullish / Strong Breadth';
    badgeStyle = 'bg-[#238636]/10 text-[#238636] border-[#238636]/20';
  } else if (advancers > decliners) {
    interpretation = 'Mixed / Slightly Positive';
    badgeStyle = 'bg-[#58A6FF]/10 text-[#58A6FF] border-[#58A6FF]/20';
  } else if (decliners > advancers * 1.5) {
    interpretation = 'Bearish / Weak Breadth';
    badgeStyle = 'bg-[#DA3633]/10 text-[#DA3633] border-[#DA3633]/20';
  } else if (decliners > advancers) {
    interpretation = 'Mixed / Slightly Negative';
    badgeStyle = 'bg-[#D29922]/10 text-[#D29922] border-[#D29922]/20';
  }

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Statistics info */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#161B22]/50 p-2 rounded border border-border-dark">
            <span className="text-[10px] font-mono text-text-secondary uppercase block">Advancers</span>
            <span className="text-sm font-mono font-bold text-[#238636] mt-0.5 block">{advancers}</span>
            <span className="text-[9px] font-mono text-text-secondary mt-0.5 block">({advPct.toFixed(1)}%)</span>
          </div>
          <div className="bg-[#161B22]/50 p-2 rounded border border-border-dark">
            <span className="text-[10px] font-mono text-text-secondary uppercase block">Decliners</span>
            <span className="text-sm font-mono font-bold text-[#DA3633] mt-0.5 block">{decliners}</span>
            <span className="text-[9px] font-mono text-text-secondary mt-0.5 block">({decPct.toFixed(1)}%)</span>
          </div>
          <div className="bg-[#161B22]/50 p-2 rounded border border-border-dark">
            <span className="text-[10px] font-mono text-text-secondary uppercase block">Unchanged</span>
            <span className="text-sm font-mono font-bold text-text-secondary mt-0.5 block">{unchanged}</span>
            <span className="text-[9px] font-mono text-text-secondary mt-0.5 block">({uncPct.toFixed(1)}%)</span>
          </div>
        </div>

        {/* Multi-segmented horizontal progress bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[10px] font-mono text-text-secondary">
            <span>A/D Distribution Ratio</span>
            <span className="font-bold text-white">Ratio: {ratio}x</span>
          </div>
          <div className="w-full h-3 bg-border-dark rounded-full overflow-hidden flex">
            <div
              className="bg-[#238636] h-full transition-all duration-300"
              style={{ width: `${advPct}%` }}
              title={`Advancers: ${advPct.toFixed(1)}%`}
            />
            <div
              className="bg-text-secondary h-full transition-all duration-300"
              style={{ width: `${uncPct}%` }}
              title={`Unchanged: ${uncPct.toFixed(1)}%`}
            />
            <div
              className="bg-[#DA3633] h-full transition-all duration-300"
              style={{ width: `${decPct}%` }}
              title={`Decliners: ${decPct.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* Interpretation banner */}
        <div className="flex items-center justify-between p-2.5 rounded border bg-[#0D1117] border-border-dark">
          <span className="text-[10px] font-mono text-text-secondary uppercase">Breadth Assessment:</span>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeStyle}`}>
            {interpretation}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-2.5 border-t border-border-dark/30 flex justify-between items-center text-[10px] font-mono text-text-secondary">
        <span>Participation Rate:</span>
        <span className="text-white font-semibold">100.0% (Standalone Demo)</span>
      </div>
    </div>
  );
}

// 7. Movers Table Component
interface MoversTableProps {
  gainers: MoverItem[];
  losers: MoverItem[];
  active: MoverItem[];
}

export function MoversTable({ gainers, losers, active }: MoversTableProps) {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers' | 'active'>('gainers');
  const items = activeTab === 'gainers' ? gainers : activeTab === 'losers' ? losers : active;

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Table Navigation Header */}
      <div className="flex border-b border-border-dark mb-3" role="tablist">
        {(['gainers', 'losers', 'active'] as const).map((tab) => {
          let label = 'Gainers';
          if (tab === 'losers') label = 'Losers';
          if (tab === 'active') label = 'Most Active';

          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              role="tab"
              aria-selected={isSelected}
              className={`flex-1 py-1.5 text-center text-xs font-mono font-medium border-b-2 cursor-pointer focus:outline-none transition-all ${
                isSelected
                  ? 'border-[#58A6FF] text-white bg-[#58A6FF]/5'
                  : 'border-transparent text-text-secondary hover:text-white hover:bg-[#161B22]/40'
              }`}
            >
              {label.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Compact Responsive Table wrapper */}
      <div className="flex-1 overflow-x-auto select-none">
        <table className="w-full text-left border-collapse font-mono text-[11px]" aria-label="Top movers list">
          <thead>
            <tr className="border-b border-border-dark text-text-secondary text-[10px] uppercase">
              <th className="py-1.5 px-2 font-semibold">Symbol</th>
              <th className="py-1.5 px-2 font-semibold text-right">LTP</th>
              <th className="py-1.5 px-2 font-semibold text-right">Change %</th>
              <th className="py-1.5 px-2 font-semibold text-right hidden sm:table-cell">Volume</th>
              <th className="py-1.5 px-2 font-semibold text-right hidden md:table-cell">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark/40">
            {items.map((stock) => {
              const isUp = stock.change >= 0;
              return (
                <tr
                  key={stock.symbol}
                  className="hover:bg-[#161B22]/50 transition-colors cursor-pointer"
                >
                  <td className="py-2 px-2 text-white font-semibold">
                    <div>{stock.symbol}</div>
                    <div className="text-[9px] text-text-secondary font-sans font-normal truncate max-w-[120px] hidden sm:block">
                      {stock.name}
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right text-white font-medium">
                    ৳{stock.lastPrice.toFixed(2)}
                  </td>
                  <td className={`py-2 px-2 text-right font-bold ${isUp ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                    {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </td>
                  <td className="py-2 px-2 text-right text-text-secondary hidden sm:table-cell">
                    {stock.volume}
                  </td>
                  <td className="py-2 px-2 text-right text-text-secondary hidden md:table-cell">
                    {stock.turnover}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 8. Watchlist Snapshot Component
interface WatchlistSnapshotProps {
  stocks: WatchlistStock[];
}

export function WatchlistSnapshot({ stocks }: WatchlistSnapshotProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-2 flex-1 overflow-y-auto">
        {stocks.map((stock) => {
          const isUp = stock.trend === 'UP';
          return (
            <div
              key={stock.symbol}
              className="flex items-center justify-between p-2 rounded border border-border-dark/60 bg-[#0D1117] hover:border-text-secondary/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-white uppercase">{stock.symbol}</span>
                  <span className="text-[9px] font-mono text-text-secondary uppercase bg-[#161B22] px-1 rounded">
                    {stock.volumeStatus} VOL
                  </span>
                </div>
                <div className="text-[10px] text-text-secondary truncate pr-2 font-sans">
                  {stock.name}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-mono font-bold text-white">
                  ৳{stock.lastPrice.toFixed(2)}
                </div>
                <div className={`flex items-center justify-end text-[10px] font-mono font-bold mt-0.5 ${isUp ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                  {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/watchlist')}
        className="w-full mt-4 py-2 px-3 bg-[#161B22] border border-border-dark rounded-md text-xs font-sans font-semibold text-white hover:bg-[#21262D] transition-colors cursor-pointer text-center"
      >
        OPEN WATCHLIST
      </button>
    </div>
  );
}

// 9. Sector Performance Component
interface SectorPerformanceProps {
  sectors: SectorItem[];
}

export function SectorPerformanceList({ sectors }: SectorPerformanceProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-3.5 flex-1">
        {sectors.slice(0, 5).map((sector) => {
          const isPos = sector.changePercent >= 0;
          const strengthColor =
            sector.relativeStrength === 'STRONG'
              ? 'text-[#238636] bg-[#238636]/10 border-[#238636]/20'
              : sector.relativeStrength === 'WEAK'
              ? 'text-[#DA3633] bg-[#DA3633]/10 border-[#DA3633]/20'
              : 'text-[#D29922] bg-[#D29922]/10 border-[#D29922]/20';

          return (
            <div key={sector.name} className="space-y-1 select-none">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-medium text-white truncate max-w-[150px]" title={sector.name}>
                  {sector.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-mono font-bold px-1 rounded border ${strengthColor}`}>
                    {sector.relativeStrength}
                  </span>
                  <span className={`font-bold ${isPos ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                    {isPos ? '+' : ''}{sector.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Progress representation visual bar */}
              <div className="w-full h-1.5 bg-[#161B22] rounded-full overflow-hidden flex">
                <div
                  className={`h-full ${isPos ? 'bg-[#238636]' : 'bg-[#DA3633]'}`}
                  style={{ width: `${Math.min(Math.abs(sector.changePercent) * 20 + 20, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/sector-analysis')}
        className="w-full mt-4 py-2 px-3 bg-[#161B22] border border-border-dark rounded-md text-xs font-sans font-semibold text-white hover:bg-[#21262D] transition-colors cursor-pointer text-center"
      >
        OPEN SECTOR ANALYSIS
      </button>
    </div>
  );
}

// 10. Data Status Panel Component
interface DataStatusProps {
  lastUpdated: string;
}

export function DataStatusPanel({ lastUpdated }: DataStatusProps) {
  return (
    <div className="space-y-2.5 text-xs font-mono">
      <div className="grid grid-cols-2 gap-y-2 text-text-secondary border-b border-border-dark/40 pb-2.5">
        <span>Market Ingestion:</span>
        <span className="text-[#D29922] text-right font-bold">DEMO SANDBOX</span>

        <span>Database Connection:</span>
        <span className="text-[#DA3633] text-right font-bold">NOT CONNECTED</span>

        <span>Backend API Pipeline:</span>
        <span className="text-[#DA3633] text-right font-bold">NOT CONNECTED</span>

        <span>Timezone Standard:</span>
        <span className="text-white text-right">Asia/Dhaka (UTC+6)</span>
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-text-secondary">Last Local Update:</span>
        <span className="text-[#58A6FF] font-bold">{lastUpdated}</span>
      </div>
    </div>
  );
}

// Helper: Custom Metric Row
interface MetricRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export function MetricRow({ label, value, highlight = false }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border-dark/30 text-xs font-mono">
      <span className="text-text-secondary">{label}:</span>
      <span className={highlight ? 'text-white font-bold' : 'text-text-primary'}>
        {value}
      </span>
    </div>
  );
}
