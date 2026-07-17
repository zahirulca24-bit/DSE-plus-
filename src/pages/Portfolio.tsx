import React, { useState } from 'react';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Edit2,
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserMinus,
  Activity,
  AlertTriangle,
  Info,
  DollarSign,
  PlusCircle,
  FileText,
  PieChart as PieIcon,
  X,
  AlertCircle
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import PageContainer from '../components/PageContainer';
import { useMarket } from '../store/marketStore';
import { PortfolioHolding } from '../types/portfolio';
import { GradeBadge, DemoDataBadge } from '../components/ScannerAndSignalsComponents';

export default function Portfolio() {
  const {
    isPortfolioConnected,
    portfolioHoldings,
    portfolioSummary,
    loadDemoPortfolio,
    disconnectPortfolio,
    addPortfolioHoldingNote,
    recordPortfolioExit
  } = useMarket();

  // Modals state
  const [activeExitSymbol, setActiveExitSymbol] = useState<string | null>(null);
  const [activeNoteSymbol, setActiveNoteSymbol] = useState<string | null>(null);

  // Form states
  const [exitPrice, setExitPrice] = useState('');
  const [exitQuantity, setExitQuantity] = useState('');
  const [exitReason, setExitReason] = useState('');
  const [noteText, setNoteText] = useState('');

  // Find active items for modals
  const activeExitHolding = portfolioHoldings.find((h) => h.symbol === activeExitSymbol);
  const activeNoteHolding = portfolioHoldings.find((h) => h.symbol === activeNoteSymbol);

  const openExitModal = (holding: PortfolioHolding) => {
    setActiveExitSymbol(holding.symbol);
    setExitPrice(holding.lastPrice.toString());
    setExitQuantity(holding.quantity.toString());
    setExitReason('');
  };

  const handleExecuteExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExitSymbol) return;
    const price = parseFloat(exitPrice);
    const qty = parseInt(exitQuantity, 10);

    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid exit price.');
      return;
    }
    if (isNaN(qty) || qty <= 0 || (activeExitHolding && qty > activeExitHolding.quantity)) {
      alert(`Please enter a valid quantity up to ${activeExitHolding?.quantity}.`);
      return;
    }

    recordPortfolioExit(activeExitSymbol, price, qty, exitReason || 'Manual recorded exit from portfolio dashboard.');
    setActiveExitSymbol(null);
  };

  const openNoteModal = (holding: PortfolioHolding) => {
    setActiveNoteSymbol(holding.symbol);
    setNoteText(holding.notes || '');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNoteSymbol) return;
    addPortfolioHoldingNote(activeNoteSymbol, noteText);
    setActiveNoteSymbol(null);
  };

  // Recharts Sector Weightings mapping
  const sectorWeights = portfolioHoldings.reduce((acc: Record<string, number>, hold) => {
    const val = hold.marketValue;
    acc[hold.sector] = (acc[hold.sector] || 0) + val;
    return acc;
  }, {});

  const totalMarketVal = portfolioHoldings.reduce((sum, h) => sum + h.marketValue, 0);

  const sectorChartData = Object.entries(sectorWeights).map(([name, value]) => ({
    name,
    value: parseFloat(((value / (totalMarketVal || 1)) * 100).toFixed(1)),
  }));

  const COLORS = ['#58A6FF', '#238636', '#D29922', '#BC8CFF', '#8B949E'];

  // Risk exposure calculations
  const highRiskWeight = portfolioHoldings
    .filter((h) => h.riskStatus === 'HIGH' || h.grade === 'REJECT')
    .reduce((sum, h) => sum + h.portfolioWeight, 0);

  const isUpToday = portfolioSummary.todayPL >= 0;
  const isUpOverall = portfolioSummary.unrealizedPL >= 0;

  return (
    <PageContainer id="portfolio-route">
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-dark/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-sans tracking-tight">Portfolio & Capital</h1>
              <DemoDataBadge />
            </div>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Monitor active DSE stock positions, broker integrations, allocation risk levels, and protective limits.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isPortfolioConnected ? (
              <button
                onClick={disconnectPortfolio}
                className="px-3.5 py-1.5 rounded-md bg-transparent hover:bg-[#DA3633]/10 text-[#DA3633] border border-border-dark hover:border-[#DA3633]/30 text-xs font-mono font-semibold transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none"
              >
                <UserMinus className="w-3.5 h-3.5" />
                DISCONNECT BROKER
              </button>
            ) : (
              <button
                onClick={loadDemoPortfolio}
                className="px-3.5 py-1.5 rounded-md bg-[#238636] hover:bg-[#2EA043] text-white border border-[#238636] text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none"
              >
                <UserCheck className="w-3.5 h-3.5" />
                CONNECT SIMULATOR BROKER
              </button>
            )}
          </div>
        </div>

        {/* State Conditional UI */}
        {!isPortfolioConnected ? (
          <div className="flex flex-col items-center justify-center p-20 text-center rounded-xl border border-dashed border-border-dark bg-[#0D1117]/40 max-w-2xl mx-auto my-12">
            <div className="p-3 bg-[#161B22] rounded-full text-text-secondary mb-4 border border-border-dark">
              <Briefcase className="w-6 h-6 opacity-85 text-[#8B949E]" />
            </div>
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-1">No Portfolio Connection</h4>
            <p className="text-xs text-text-secondary max-w-sm mb-6 leading-relaxed font-sans">
              No active trading accounts are connected. Click the button below to connect the DSE Sandbox simulator broker to populate dynamic metrics.
            </p>
            <button
              onClick={loadDemoPortfolio}
              className="px-4 py-2 rounded-md bg-[#238636] hover:bg-[#2EA043] border border-[#238636] text-xs font-mono font-bold text-white transition-colors cursor-pointer focus:outline-none"
            >
              LOAD DEMO PORTFOLIO
            </button>
          </div>
        ) : (
          <>
            {/* 1. High level stat summary grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Portfolio Value */}
              <div className="rounded-lg border border-border-dark bg-[#0D1117] p-4">
                <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider font-semibold">
                  Portfolio Value
                </span>
                <div className="mt-2 text-xl font-bold text-white tracking-tight font-mono">
                  ৳{portfolioSummary.portfolioValue.toLocaleString()}
                </div>
                <div className="mt-1 text-[10px] font-mono text-text-muted">
                  Cash Balance: ৳{portfolioSummary.cashValue.toLocaleString()} ({portfolioSummary.cashAllocation}%)
                </div>
              </div>

              {/* Unrealized P/L */}
              <div className="rounded-lg border border-border-dark bg-[#0D1117] p-4">
                <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider font-semibold">
                  Total Profit / Loss
                </span>
                <div className={`mt-2 text-xl font-bold tracking-tight font-mono ${isUpOverall ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                  ৳{portfolioSummary.unrealizedPL.toLocaleString()}
                </div>
                <div className={`mt-1 text-[10px] font-mono font-semibold ${isUpOverall ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                  {isUpOverall ? '▲' : '▼'} {portfolioSummary.unrealizedPLPercent.toFixed(2)}% Overall
                </div>
              </div>

              {/* Daily P/L */}
              <div className="rounded-lg border border-border-dark bg-[#0D1117] p-4">
                <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider font-semibold">
                  Today's Session P/L
                </span>
                <div className={`mt-2 text-xl font-bold tracking-tight font-mono ${isUpToday ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                  ৳{portfolioSummary.todayPL.toLocaleString()}
                </div>
                <div className={`mt-1 text-[10px] font-mono font-semibold ${isUpToday ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                  {isUpToday ? '▲' : '▼'} {portfolioSummary.todayPLPercent.toFixed(2)}% Today
                </div>
              </div>

              {/* Risk Exposure */}
              <div className="rounded-lg border border-border-dark bg-[#0D1117] p-4">
                <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider font-semibold">
                  Weighted Capital Exposure
                </span>
                <div className="mt-2 text-xl font-bold text-[#D29922] tracking-tight font-mono">
                  {highRiskWeight.toFixed(1)}% at High Risk
                </div>
                <div className="mt-1 text-[10px] font-mono text-text-muted">
                  Advisor Score: <span className="text-white font-bold">{portfolioSummary.healthScore}/100</span>
                </div>
              </div>
            </div>

            {/* 2. Interactive Positions Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-[#8B949E] uppercase tracking-wider">
                  Open Trading Positions ({portfolioHoldings.length})
                </h3>
                <span className="text-[9px] font-mono text-text-secondary">Hover row for quick action buttons</span>
              </div>

              <div className="rounded-xl border border-border-dark bg-[#0D1117] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-mono text-[11px]" aria-label="Open portfolio equity holdings">
                    <thead>
                      <tr className="bg-[#161B22]/50 text-[10px] uppercase border-b border-border-dark select-none">
                        <th className="py-3 px-3 text-text-secondary font-semibold">Symbol</th>
                        <th className="py-3 px-3 text-text-secondary font-semibold">Quantity</th>
                        <th className="py-3 px-3 text-text-secondary font-semibold">Avg Cost</th>
                        <th className="py-3 px-3 text-text-secondary font-semibold">Last Price</th>
                        <th className="py-3 px-3 text-text-secondary font-semibold">Market Value</th>
                        <th className="py-3 px-3 text-text-secondary font-semibold">Unrealized P/L</th>
                        <th className="py-3 px-3 text-text-secondary font-semibold">Today's Session</th>
                        <th className="py-3 px-3 text-text-secondary font-semibold">Weight</th>
                        <th className="py-3 px-3 text-text-secondary font-semibold">Grade</th>
                        <th className="py-3 px-3 text-text-secondary font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-dark/40">
                      {portfolioHoldings.map((hold) => {
                        const costBasis = hold.quantity * hold.averageCost;
                        const plUp = hold.unrealizedPL >= 0;
                        const todayUp = hold.todayChange >= 0;

                        return (
                          <tr key={hold.id} className="hover:bg-[#161B22]/60 transition-colors group">
                            {/* Symbol Info */}
                            <td className="py-3 px-3">
                              <div className="font-bold text-white uppercase">{hold.symbol}</div>
                              <div className="text-[9px] text-text-secondary font-sans truncate max-w-[130px]" title={hold.notes}>
                                {hold.company}
                              </div>
                            </td>

                            {/* Qty */}
                            <td className="py-3 px-3 text-white font-semibold">{hold.quantity.toLocaleString()}</td>

                            {/* Avg Cost */}
                            <td className="py-3 px-3 text-text-secondary">৳{hold.averageCost.toFixed(2)}</td>

                            {/* Last Price */}
                            <td className="py-3 px-3 text-white">৳{hold.lastPrice.toFixed(2)}</td>

                            {/* Market Value */}
                            <td className="py-3 px-3 text-white font-bold">
                              ৳{hold.marketValue.toLocaleString()}
                            </td>

                            {/* Unrealized P/L */}
                            <td className={`py-3 px-3 font-bold ${plUp ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                              <div>৳{hold.unrealizedPL.toLocaleString()}</div>
                              <div className="text-[9px]">
                                {plUp ? '+' : ''}
                                {hold.unrealizedPLPercent.toFixed(2)}%
                              </div>
                            </td>

                            {/* Today's Change */}
                            <td className={`py-3 px-3 font-bold ${todayUp ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                              {todayUp ? '+' : ''}
                              {hold.todayChange.toFixed(2)}%
                            </td>

                            {/* Portfolio Weight */}
                            <td className="py-3 px-3 text-white font-semibold">{hold.portfolioWeight}%</td>

                            {/* Setup Grade */}
                            <td className="py-3 px-3">
                              <GradeBadge grade={hold.grade} />
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                  onClick={() => openNoteModal(hold)}
                                  className="px-2 py-1 rounded bg-[#161B22] border border-border-dark text-[9px] font-sans font-bold text-text-secondary hover:text-white transition-colors cursor-pointer"
                                  title="Add technical note/stop levels"
                                >
                                  ADD NOTE
                                </button>
                                <button
                                  onClick={() => openExitModal(hold)}
                                  className="px-2 py-1 rounded bg-[#DA3633]/10 hover:bg-[#DA3633] text-[#DA3633] hover:text-white border border-[#DA3633]/20 text-[9px] font-sans font-bold transition-all cursor-pointer"
                                  title="Sell and record exit in Journal"
                                >
                                  RECORD EXIT
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 3. Bottom Grid: Visual Charts & Risk Readiness warnings */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Pie Chart of Allocation */}
              <div className="lg:col-span-4 rounded-xl border border-border-dark bg-[#0D1117] p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <PieIcon className="w-4 h-4 text-[#58A6FF]" />
                    Sector Diversification Weight
                  </h3>
                  <p className="text-[10px] text-text-secondary font-sans">
                    Sector allocation index to guard against sector overconcentration.
                  </p>
                </div>

                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {sectorChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0D1117',
                          border: '1px solid #30363D',
                          borderRadius: '6px',
                        }}
                        itemStyle={{ color: '#c9d1d9', fontFamily: 'monospace', fontSize: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center">
                  {sectorChartData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-[9px] font-mono">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-text-secondary">{entry.name}</span>
                      <span className="text-white font-bold">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Asset Weight Progress Bars */}
              <div className="lg:col-span-4 rounded-xl border border-border-dark bg-[#0D1117] p-4 space-y-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#58A6FF]" />
                  Asset Concentration weight
                </h3>
                <p className="text-[10px] text-text-secondary font-sans mb-3">
                  Check individual stock allocation weight relative to standard limit thresholds.
                </p>

                <div className="space-y-3">
                  {portfolioHoldings.map((hold, index) => {
                    const isOverLimit = hold.portfolioWeight > 25;
                    return (
                      <div key={hold.id} className="space-y-1 font-mono text-[10px]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-white">{hold.symbol}</span>
                          <span className={isOverLimit ? 'text-[#D29922] font-black' : 'text-text-secondary'}>
                            {hold.portfolioWeight}% {isOverLimit && '⚠️'}
                          </span>
                        </div>
                        <div className="h-2 w-full bg-[#161B22] border border-border-dark rounded overflow-hidden">
                          <div
                            className={`h-full rounded-sm ${isOverLimit ? 'bg-[#D29922]' : 'bg-[#58A6FF]'}`}
                            style={{ width: `${hold.portfolioWeight}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Risk Readiness Panel */}
              <div className="lg:col-span-4 rounded-xl border border-border-dark bg-[#0D1117] p-4 space-y-3.5">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#DA3633]" />
                  Risk Exposure Readiness
                </h3>
                <p className="text-[10px] text-text-secondary font-sans">
                  Active advisor warnings evaluating portfolio exposure safety metrics.
                </p>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {portfolioHoldings.map((hold) => {
                    const overLimit = hold.portfolioWeight > 25;
                    const isRejected = hold.grade === 'REJECT';
                    const hasNoNotes = !hold.notes || hold.notes.trim() === '';

                    return (
                      <div key={hold.id} className="space-y-1">
                        {isRejected && (
                          <div className="p-2 bg-[#DA3633]/10 border border-[#DA3633]/20 rounded text-[10px] font-mono text-[#DA3633] flex items-start gap-1.5 leading-snug">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>
                              <strong>CRITICAL ({hold.symbol}):</strong> Position is rated as REJECT grade. Exit suggested immediately to protect capital.
                            </span>
                          </div>
                        )}

                        {overLimit && (
                          <div className="p-2 bg-[#D29922]/10 border border-[#D29922]/20 rounded text-[10px] font-mono text-[#D29922] flex items-start gap-1.5 leading-snug">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>
                              <strong>WARNING ({hold.symbol}):</strong> Holds {hold.portfolioWeight}% allocation. Violates the 25% single-asset limit protocol.
                            </span>
                          </div>
                        )}

                        {hasNoNotes && (
                          <div className="p-2 bg-text-secondary/5 border border-border-dark rounded text-[10px] font-mono text-text-secondary flex items-start gap-1.5 leading-snug">
                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>
                              <strong>INFO ({hold.symbol}):</strong> Operating without written exit plans or note references. Add technical levels.
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {portfolioHoldings.length === 0 && (
                    <div className="text-center py-6 text-xs text-text-secondary font-mono">
                      No advisory alerts available. Connect simulator broker.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ==================== MODAL: RECORD PORTFOLIO EXIT ==================== */}
      {activeExitSymbol && activeExitHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-[#0B0E14]/75 backdrop-blur-sm" onClick={() => setActiveExitSymbol(null)} />

          <form
            onSubmit={handleExecuteExit}
            className="relative w-full max-w-md bg-[#0D1117] border border-border-dark rounded-xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs text-text-secondary"
          >
            {/* Header */}
            <div className="p-4 border-b border-border-dark flex items-center justify-between bg-[#161B22]/50">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Log Position Sale & Exit
                </h3>
                <DemoDataBadge />
              </div>
              <button
                type="button"
                onClick={() => setActiveExitSymbol(null)}
                className="p-1 text-text-secondary hover:text-white rounded-md focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="p-5 space-y-4">
              <div className="p-3 bg-[#161B22]/40 border border-border-dark rounded-lg flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-white font-bold block">{activeExitHolding.symbol}</span>
                  <span className="text-[10px] font-sans block">{activeExitHolding.company}</span>
                </div>
                <div className="text-right">
                  <span className="text-white block font-bold">Qty: {activeExitHolding.quantity}</span>
                  <span className="text-text-muted block">Avg Cost: ৳{activeExitHolding.averageCost.toFixed(1)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-text-secondary mb-1 uppercase font-bold">Exit Price (৳)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    className="w-full bg-[#161B22] border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-text-secondary mb-1 uppercase font-bold">Qty to Sell</label>
                  <input
                    type="number"
                    required
                    value={exitQuantity}
                    onChange={(e) => setExitQuantity(e.target.value)}
                    className="w-full bg-[#161B22] border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-text-secondary mb-1 uppercase font-bold">Exit Reason (Qualitative)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why you are exiting. Did price hit T1/T2? Did it break stop loss support levels?"
                  value={exitReason}
                  onChange={(e) => setExitReason(e.target.value)}
                  className="w-full bg-[#161B22] border border-border-dark rounded p-2.5 text-white focus:outline-none focus:border-accent font-sans text-xs"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="p-3 bg-[#161B22]/30 border-t border-border-dark flex items-center justify-between">
              <span className="text-[9px] text-text-muted">
                * Exit trade will be logged as CLOSED in Journal automatically.
              </span>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#DA3633] text-white hover:bg-[#B32421] font-bold text-[10px] tracking-wider uppercase cursor-pointer"
              >
                EXECUTE EXIT SALE
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODAL: ADD TECHNICAL NOTE ==================== */}
      {activeNoteSymbol && activeNoteHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-[#0B0E14]/75 backdrop-blur-sm" onClick={() => setActiveNoteSymbol(null)} />

          <form
            onSubmit={handleSaveNote}
            className="relative w-full max-w-md bg-[#0D1117] border border-border-dark rounded-xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs text-text-secondary"
          >
            {/* Header */}
            <div className="p-4 border-b border-border-dark flex items-center justify-between bg-[#161B22]/50">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Add/Update Technical Notes ({activeNoteHolding.symbol})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveNoteSymbol(null)}
                className="p-1 text-text-secondary hover:text-white rounded-md focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Text area */}
            <div className="p-5">
              <label className="block text-[9px] text-text-secondary mb-1.5 uppercase font-bold">
                Position Note, Alert levels or stop rules
              </label>
              <textarea
                rows={4}
                required
                placeholder="Specify precise stop loss level, exit triggers, horizontal support floors, or overall posture for this asset..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-[#161B22] border border-border-dark rounded p-2.5 text-white focus:outline-none focus:border-accent font-sans text-xs"
              />
            </div>

            {/* Actions */}
            <div className="p-3 bg-[#161B22]/30 border-t border-border-dark flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveNoteSymbol(null)}
                className="px-3.5 py-1.5 rounded border border-border-dark hover:bg-[#161B22] font-semibold text-[10px]"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#238636] text-white hover:bg-[#2EA043] font-bold text-[10px]"
              >
                SAVE NOTE
              </button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}
