import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Calendar, Clock, Sparkles, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import {
  DashboardKpiCard,
  DashboardPanel,
  MarketPerformance,
  MarketBreadthChart,
  MoversTable,
  WatchlistSnapshot,
  SectorPerformanceList,
  DataStatusPanel,
  MetricRow,
  DemoDataBadge
} from '../components/DashboardComponents';
import {
  kpiMockData,
  chartTrendMockData,
  moversMockData,
  watchlistMockData,
  sectorMockData,
  marketRegimeMockData,
  portfolioRiskMockData
} from '../data/dashboardMockData';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Format current date & initial time for state
  const getFormattedDateTime = () => {
    const d = new Date();
    // Use fixed 2026 year for DSE Pulse alignment
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    return `${day} ${month} 2026, ${hours}:${minutes}:${seconds}`;
  };

  const [lastUpdated, setLastUpdated] = useState<string>(getFormattedDateTime());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Mimic quick visual update without real API call
    setTimeout(() => {
      setLastUpdated(getFormattedDateTime());
      setIsRefreshing(false);
    }, 300);
  };

  return (
    <PageContainer id="dashboard-route">
      {/* 1. Page Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-border-dark pb-5 mb-6 gap-4 select-none">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary bg-[#161B22] px-2 py-0.5 rounded border border-border-dark">
              Dhaka Stock Exchange Terminal
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#D29922]/10 text-[#D29922] border border-[#D29922]/20 uppercase">
              Demo Sandbox
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Market Dashboard
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1 font-sans">
            Overview of DSE market conditions, breadth, watchlist activity, and portfolio risk.
          </p>
        </div>

        {/* Dashboard Status Controls */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-center bg-[#0D1117]/80 p-3 rounded-lg border border-border-dark">
          <div className="flex items-center gap-2 text-xs font-mono border-r border-border-dark/60 pr-3">
            <Calendar className="w-3.5 h-3.5 text-text-secondary" />
            <span className="text-text-secondary">Trading Date:</span>
            <span className="text-white font-semibold">16 July 2026</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono border-r border-border-dark/60 pr-3">
            <Clock className="w-3.5 h-3.5 text-text-secondary" />
            <span className="text-text-secondary">Refreshed:</span>
            <span className="text-white font-bold">{lastUpdated.split(', ')[1]}</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161B22] border border-border-dark text-xs font-sans font-semibold text-white hover:bg-[#21262D] transition-all cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-accent`}
            title="Refresh local timestamp"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#58A6FF]' : 'text-text-secondary'}`} />
            <span>{isRefreshing ? 'REFRESHING...' : 'REFRESH'}</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {kpiMockData.map((kpi, idx) => (
          <DashboardKpiCard key={idx} data={kpi} />
        ))}
      </div>

      {/* 3. Main Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PANEL 1: DSEX Market Performance (Chart) - 8 columns width on desktop */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <DashboardPanel
            title="Market Performance"
            subtitle="Intraday DSE index movements with user-selected interval viewports"
          >
            <MarketPerformance data={chartTrendMockData} />
          </DashboardPanel>
        </div>

        {/* PANEL 2: Market Breadth - 4 columns width on desktop */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <DashboardPanel
            title="Market Breadth"
            subtitle="Advancers, decliners, and unchanged ratio distribution metrics"
          >
            <MarketBreadthChart
              advancers={184}
              decliners={142}
              unchanged={68}
            />
          </DashboardPanel>
        </div>

        {/* PANEL 3: Top Movers (Tabbed Gainers/Losers/Active) - 8 columns on desktop */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <DashboardPanel
            title="Top Movers"
            subtitle="Current daily movers of Dhaka Stock Exchange equities"
          >
            <MoversTable
              gainers={moversMockData.gainers}
              losers={moversMockData.losers}
              active={moversMockData.active}
            />
          </DashboardPanel>
        </div>

        {/* PANEL 4: Watchlist Snapshot - 4 columns on desktop */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <DashboardPanel
            title="Watchlist Snapshot"
            subtitle="Quick overview of your core watched equities tracking"
          >
            <WatchlistSnapshot stocks={watchlistMockData} />
          </DashboardPanel>
        </div>

        {/* PANEL 5: Sector Performance - 4 columns on desktop */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <DashboardPanel
            title="Sector Performance"
            subtitle="Dhaka Stock Exchange sector relative strength analysis rankings"
          >
            <SectorPerformanceList sectors={sectorMockData} />
          </DashboardPanel>
        </div>

        {/* PANEL 6: Market Regime - 4 columns on desktop */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <DashboardPanel
            title="Market Regime"
            subtitle="Market phase classification and overall technical score metrics"
          >
            <div className="flex flex-col justify-between h-full space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border-dark bg-[#161B22]/40">
                  <span className="text-xs text-text-secondary font-mono">Current State:</span>
                  <span className="text-sm font-mono font-bold text-[#D29922] bg-[#D29922]/10 border border-[#D29922]/20 px-2.5 py-0.5 rounded uppercase tracking-wider">
                    {marketRegimeMockData.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <MetricRow label="Breadth Score" value={`${marketRegimeMockData.breadthScore}/100`} />
                  <MetricRow label="Trend Score" value={`${marketRegimeMockData.trendScore}/100`} />
                  <MetricRow label="Volume Score" value={`${marketRegimeMockData.volumeScore}/100`} />
                  <MetricRow label="Participation Score" value={`${marketRegimeMockData.participationScore}/100`} />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] text-text-secondary leading-normal italic bg-[#161B22]/30 p-2.5 rounded border border-border-dark font-sans">
                  {marketRegimeMockData.note}
                </p>
                <button
                  onClick={() => navigate('/market-regime')}
                  className="w-full py-2 px-3 bg-[#161B22] border border-border-dark rounded-md text-xs font-sans font-semibold text-white hover:bg-[#21262D] transition-colors cursor-pointer text-center"
                >
                  OPEN REGIME CLASSIFIER
                </button>
              </div>
            </div>
          </DashboardPanel>
        </div>

        {/* PANEL 7: Portfolio Risk Snapshot - 4 columns on desktop */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <DashboardPanel
            title="Portfolio Risk Snapshot"
            subtitle="Connected brokerage accounts risk summary analytics"
          >
            <div className="flex flex-col justify-between h-full space-y-4">
              {/* Not Connected Empty State Container */}
              <div className="rounded-lg border border-dashed border-border-dark bg-[#161B22]/10 p-3.5 text-center flex flex-col items-center justify-center py-6">
                <AlertCircle className="w-6 h-6 text-text-muted mb-2" strokeWidth={1.5} />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Not Connected</span>
                <p className="text-[10px] text-text-secondary max-w-xs mt-1 leading-normal font-sans">
                  {portfolioRiskMockData.note}
                </p>
              </div>

              <div className="space-y-1.5">
                <MetricRow label="Portfolio Value" value="--" />
                <MetricRow label="Today's P/L" value="--" />
                <MetricRow label="Cash Exposure" value="--" />
                <MetricRow label="Portfolio Health" value="--" />
              </div>

              <button
                onClick={() => navigate('/portfolio')}
                className="w-full py-2 px-3 bg-[#238636] hover:bg-[#2ea043] border border-[#238636] rounded-md text-xs font-sans font-semibold text-white transition-colors cursor-pointer text-center"
              >
                CONNECT PORTFOLIO
              </button>
            </div>
          </DashboardPanel>
        </div>

        {/* PANEL 8: Data Freshness / System Status Panel - Full Width on bottom for elegant layout */}
        <div className="lg:col-span-12 flex flex-col">
          <DashboardPanel
            title="Data Status & Terminal Pipeline Diagnostics"
            subtitle="Real-time check on core ingestion pipelines, server bounds, and authentication layers"
            showBadge={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <DataStatusPanel lastUpdated={lastUpdated} />
              
              <div className="p-3 bg-[#161B22]/30 border border-border-dark/60 rounded-lg text-[11px] text-text-secondary leading-normal font-sans space-y-2">
                <div className="flex items-center gap-2 text-white font-bold font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-[#58A6FF]" />
                  <span>DSE PULSE PHASE 1 SANDBOX</span>
                </div>
                <p>
                  You are exploring the DSE Pulse Terminal in standalone demonstration mode. Front-end panels are connected to a high-fidelity local state matrix which ensures layout precision, contrast accessibility, and responsive fluidity.
                </p>
                <p className="font-mono text-[9px] text-[#D29922]">
                  Live Dhaka Stock Exchange broker API pipelines will be established during Phase 2.
                </p>
              </div>
            </div>
          </DashboardPanel>
        </div>

      </div>
    </PageContainer>
  );
}
