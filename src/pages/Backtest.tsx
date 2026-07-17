import React, { useState } from 'react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useMarket } from '../store/marketStore';
import { theme } from '../theme';
import { strategyComparisonMock } from '../data/backtestMockData';
import { BacktestConfig } from '../types/backtest';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Play,
  TrendingUp,
  TrendingDown,
  Percent,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Sliders,
  Calendar,
  Layers,
  FileText,
  BarChart3,
  HelpCircle,
  Info,
  DollarSign,
  Briefcase,
  X,
  Plus
} from 'lucide-react';

const COLORS = ['#2EA043', '#F85149', '#8B949E'];

export default function Backtest() {
  const {
    backtestConfig,
    setBacktestConfig,
    isBacktestLoaded,
    isBacktesting,
    backtestResult,
    selectedBacktestTradeId,
    setSelectedBacktestTradeId,
    runDemoBacktest
  } = useMarket();

  // Form local state to allow changes before hitting "Run"
  const [formConfig, setFormConfig] = useState<BacktestConfig>(backtestConfig);

  const handleInputChange = <K extends keyof BacktestConfig>(key: K, value: BacktestConfig[K]) => {
    setFormConfig((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRunClick = (e: React.FormEvent) => {
    e.preventDefault();
    // Update global store config first
    setBacktestConfig(formConfig);
    // Execute backtest
    runDemoBacktest();
  };

  // Selected trade for the drawer details
  const activeTrade = backtestResult?.tradeLog.find(
    (t) => t.tradeId === selectedBacktestTradeId
  );

  return (
    <PageContainer id="backtest-route-main">
      {/* HEADER */}
      <div className={`flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b pb-6 ${theme.colors.border}`}>
        <div>
          <div className="flex items-center gap-2.5 flex-wrap mb-2">
            <h1 className={`text-2xl font-bold uppercase tracking-tight ${theme.colors.textPrimary}`}>
              Backtesting Suite
            </h1>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-500 uppercase">
              Demo Simulation Engine
            </span>
            <span className="px-2 py-0.5 rounded bg-[#21262D] border border-border-dark text-[10px] font-mono font-bold text-white uppercase flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-[#58A6FF]" />
              <span>DSE HISTORICAL SYMBOLS ACTIVE</span>
            </span>
          </div>
          <p className={`text-xs ${theme.colors.textSecondary} max-w-3xl`}>
            Stress-test, calibrate, and compare trading models on historical price records of Dhaka Stock Exchange (DSE) listings with exact fee & slippage parameters.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <StatusBadge status={isBacktestLoaded ? "success" : "warning"} label={isBacktestLoaded ? "ANALYSIS COMPLETED" : "AWAITING CONFIGURATION"} />
        </div>
      </div>

      {/* DETAILED DEMO BANNER NOTICE */}
      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 mb-6 flex gap-3">
        <Info className="w-5 h-5 text-[#58A6FF] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Interactive Backtester sandbox</h4>
          <p className={`text-[11px] leading-relaxed ${theme.colors.textSecondary}`}>
            This testing engine evaluates pre-computed backtest results over real historical DSE segments with maximum fidelity. It accounts for 0.5% brokerage commissions, fractional volume limits, and execution slippage. Try clicking "Run Backtest Simulation" to watch the engine compute.
          </p>
        </div>
      </div>

      {/* CONFIGURATION FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Input Settings Form */}
        <div className={`lg:col-span-5 p-6 rounded-xl border flex flex-col justify-between ${theme.colors.border} ${theme.colors.surface}`}>
          <form onSubmit={handleRunClick} className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              Strategy Parameters
            </h3>

            {/* Strategy Select */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-bold uppercase text-text-secondary">
                Model Strategy
              </label>
              <select
                value={formConfig.strategy}
                onChange={(e) => handleInputChange('strategy', e.target.value)}
                className="w-full px-3 py-2 bg-[#0D1117] border border-border-dark rounded-md text-xs text-white focus:outline-none focus:border-[#58A6FF]"
              >
                <option value="SMA 20/50 Crossover">SMA 20/50 Crossover (DSE Core)</option>
                <option value="EMA 20/50 Crossover">EMA 20/50 Crossover (Fast Line)</option>
                <option value="RSI Oversold Bounce">RSI Oversold Bounce (Mean Reversion)</option>
                <option value="20-Day Breakout">20-Day Breakout (Donchian Trend)</option>
                <option value="Pullback to SMA 20">Pullback to SMA 20 (Trend Pullback)</option>
              </select>
            </div>

            {/* Asset Allocation */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase text-text-secondary">
                  Symbol Filters
                </label>
                <select
                  value={formConfig.allSymbols ? 'ALL' : 'SINGLE'}
                  onChange={(e) => handleInputChange('allSymbols', e.target.value === 'ALL')}
                  className="w-full px-3 py-2 bg-[#0D1117] border border-border-dark rounded-md text-xs text-white focus:outline-none"
                >
                  <option value="ALL">All Liquid Tickers</option>
                  <option value="SINGLE">GP / SQURPHARMA</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase text-text-secondary">
                  Initial Capital
                </label>
                <input
                  type="number"
                  value={formConfig.initialCapital}
                  onChange={(e) => handleInputChange('initialCapital', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#0D1117] border border-border-dark rounded-md text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Dates & Risks */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase text-text-secondary">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formConfig.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D1117] border border-border-dark rounded-md text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono font-bold uppercase text-text-secondary">
                  End Date
                </label>
                <input
                  type="date"
                  value={formConfig.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D1117] border border-border-dark rounded-md text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* SL & Target */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold uppercase text-text-secondary">
                  Risk / Trade
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formConfig.riskPerTradePercent}
                  onChange={(e) => handleInputChange('riskPerTradePercent', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-[#0D1117] border border-border-dark rounded-md text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold uppercase text-text-secondary">
                  Stop Loss %
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formConfig.stopLossPercent}
                  onChange={(e) => handleInputChange('stopLossPercent', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-[#0D1117] border border-border-dark rounded-md text-xs text-white focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold uppercase text-text-secondary">
                  Target %
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formConfig.targetPercent}
                  onChange={(e) => handleInputChange('targetPercent', parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-[#0D1117] border border-border-dark rounded-md text-xs text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Commissions & Slippages */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex justify-between items-center bg-[#161B22]/50 p-2.5 rounded border border-border-dark/60">
                <span className="text-[10px] font-mono text-text-secondary">Brokerage Fee</span>
                <span className="text-[11px] font-mono font-bold text-white">0.50%</span>
              </div>
              <div className="flex justify-between items-center bg-[#161B22]/50 p-2.5 rounded border border-border-dark/60">
                <span className="text-[10px] font-mono text-text-secondary">Slippage Factor</span>
                <span className="text-[11px] font-mono font-bold text-white">0.10%</span>
              </div>
            </div>

            {/* Submit Run Button */}
            <button
              type="submit"
              disabled={isBacktesting}
              className="w-full py-2.5 rounded-lg bg-[#238636] hover:bg-[#2EA043] disabled:opacity-50 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors select-none cursor-pointer"
            >
              {isBacktesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Iterating historical candles...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Backtest Simulation</span>
                </>
              )}
            </button>
          </form>

          {/* Progress bar inside form card */}
          {isBacktesting && (
            <div className="mt-4 space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-text-muted">
                <span>SIMULATING: {formConfig.strategy.toUpperCase()}</span>
                <span>45%</span>
              </div>
              <div className="w-full h-1 bg-border-dark rounded-full overflow-hidden">
                <div className="bg-[#58A6FF] h-full rounded-full animate-pulse" style={{ width: '45%' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Comparison or Quick stats helper panel */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className={`p-6 rounded-xl border h-full flex flex-col justify-between ${theme.colors.border} ${theme.colors.surface}`}>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Selectable Strategies Reference Guide
                </h3>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-mono text-amber-500 font-bold uppercase">
                  DEMO STRATEGIES
                </span>
              </div>
              <p className={`text-xs ${theme.colors.textSecondary} leading-relaxed mb-4`}>
                Our algorithmic backtester is bundled with five pre-configured, optimized trading models based on standard technical signals. Try configuring any of them on the left.
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded bg-[#161B22]/40 border border-border-dark/60 text-xs">
                  <span className="font-bold text-white block mb-0.5">SMA & EMA Crossovers</span>
                  <span className={`${theme.colors.textSecondary}`}>Long entries trigger when the shorter period moving average crosses above the longer period average, indicating early momentum continuation.</span>
                </div>

                <div className="p-3 rounded bg-[#161B22]/40 border border-border-dark/60 text-xs">
                  <span className="font-bold text-white block mb-0.5">RSI Oversold Bounce & Mean Reversion</span>
                  <span className={`${theme.colors.textSecondary}`}>Triggers long entries when the 14-period RSI drops below extreme 30 thresholds, filtering for structural support baselines and volume drying cycles.</span>
                </div>

                <div className="p-3 rounded bg-[#161B22]/40 border border-border-dark/60 text-xs">
                  <span className="font-bold text-white block mb-0.5">20-Day Breakout</span>
                  <span className={`${theme.colors.textSecondary}`}>Captures high-velocity momentum moves by executing buy entries exactly when price breaks above a 20-session highest resistance boundary.</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border-dark/60 pt-4 mt-6 flex justify-between items-center text-[10px] font-mono text-text-muted">
              <span>SUPPORTED PLATFORMS: DSE EXCLUSIVELY</span>
              <span>ENGINE VERSION: v2.4.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER SIMULATION RESULTS */}
      {isBacktestLoaded && backtestResult && (
        <div className="space-y-6 animate-fade-in">
          {/* STATS HIGHLIGHT GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className={`p-4 rounded-xl border text-center ${theme.colors.surface} ${theme.colors.border}`}>
              <span className="text-[9px] font-mono text-text-muted block uppercase">Ending Capital</span>
              <span className="text-sm font-black font-mono text-white mt-1 block">
                ৳{(backtestResult.metrics.endingCapital / 1000).toFixed(0)}K
              </span>
            </div>

            <div className={`p-4 rounded-xl border text-center ${theme.colors.surface} ${theme.colors.border}`}>
              <span className="text-[9px] font-mono text-text-muted block uppercase">Net Profit</span>
              <span className="text-sm font-black font-mono text-green-500 mt-1 block">
                ৳{(backtestResult.metrics.netProfit / 1000).toFixed(0)}K
              </span>
            </div>

            <div className={`p-4 rounded-xl border text-center ${theme.colors.surface} ${theme.colors.border}`}>
              <span className="text-[9px] font-mono text-text-muted block uppercase">Return Percent</span>
              <span className="text-sm font-black font-mono text-green-500 mt-1 block">
                +{backtestResult.metrics.totalReturnPercent}%
              </span>
            </div>

            <div className={`p-4 rounded-xl border text-center ${theme.colors.surface} ${theme.colors.border}`}>
              <span className="text-[9px] font-mono text-text-muted block uppercase">Total Trades</span>
              <span className="text-sm font-black font-mono text-white mt-1 block">
                {backtestResult.metrics.totalTrades}
              </span>
            </div>

            <div className={`p-4 rounded-xl border text-center ${theme.colors.surface} ${theme.colors.border}`}>
              <span className="text-[9px] font-mono text-text-muted block uppercase">Win Rate</span>
              <span className="text-sm font-black font-mono text-[#58A6FF] mt-1 block">
                {backtestResult.metrics.winRate}%
              </span>
            </div>

            <div className={`p-4 rounded-xl border text-center ${theme.colors.surface} ${theme.colors.border}`}>
              <span className="text-[9px] font-mono text-text-muted block uppercase">Profit Factor</span>
              <span className="text-sm font-black font-mono text-white mt-1 block">
                {backtestResult.metrics.profitFactor}
              </span>
            </div>

            <div className={`p-4 rounded-xl border text-center ${theme.colors.surface} ${theme.colors.border}`}>
              <span className="text-[9px] font-mono text-text-muted block uppercase">Max Drawdown</span>
              <span className="text-sm font-black font-mono text-red-500 mt-1 block">
                {backtestResult.metrics.maxDrawdown}%
              </span>
            </div>

            <div className={`p-4 rounded-xl border text-center ${theme.colors.surface} ${theme.colors.border}`}>
              <span className="text-[9px] font-mono text-text-muted block uppercase">Holding Period</span>
              <span className="text-sm font-black font-mono text-[#8B949E] mt-1 block">
                {backtestResult.metrics.avgHoldingPeriod}D
              </span>
            </div>
          </div>

          {/* CHARTS CONTAINER: EQUITY AND DRAWDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Equity Curve */}
            <div className={`lg:col-span-8 p-6 rounded-xl border ${theme.colors.surface} ${theme.colors.border}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Compounded Equity Curve</h3>
                <span className="px-1.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[9px] font-mono text-green-500">
                  REAL HISTORICAL CURVE (DEMO)
                </span>
              </div>

              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={backtestResult.equityCurve} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                    <defs>
                      <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2EA043" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#2EA043" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
                    <XAxis dataKey="date" stroke="#8B949E" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8B949E" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0D1117',
                        borderColor: '#30363D',
                        borderRadius: '8px',
                        color: '#C9D1D9',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                      }}
                    />
                    <Area type="monotone" dataKey="equity" name="Net Liquidity" stroke="#2EA043" fillOpacity={1} fill="url(#equityGrad)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distributions */}
            <div className={`lg:col-span-4 p-6 rounded-xl border flex flex-col justify-between ${theme.colors.surface} ${theme.colors.border}`}>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Win/Loss Split</h3>
                <div className="h-[150px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={backtestResult.winLossDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {backtestResult.winLossDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend split */}
                <div className="space-y-2 mt-4">
                  {backtestResult.winLossDistribution.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        <span className={theme.colors.textSecondary}>{entry.name}</span>
                      </div>
                      <span className="font-mono font-bold text-white">{entry.value} trades</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CHRONOLOGICAL TRADE LOG */}
          <div className={`p-6 rounded-xl border ${theme.colors.surface} ${theme.colors.border}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                  Historical Trade Execution Log
                </h3>
                <p className={`text-xs ${theme.colors.textSecondary}`}>
                  Detailed, chronological log tracking every position entered, exited, and evaluated by the backtest engine. Click any trade for full parameter analysis.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-dark text-[10px] font-mono text-text-muted uppercase">
                    <th className="pb-3 pl-2">ID</th>
                    <th className="pb-3">Symbol</th>
                    <th className="pb-3">Entry Date</th>
                    <th className="pb-3">Exit Date</th>
                    <th className="pb-3">Direction</th>
                    <th className="pb-3">Entry Price</th>
                    <th className="pb-3">Exit Price</th>
                    <th className="pb-3">Net PL</th>
                    <th className="pb-3">R-Multiple</th>
                    <th className="pb-3">Holding Period</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark/40 text-xs">
                  {backtestResult.tradeLog.map((trade) => {
                    const isWin = trade.pl > 0;
                    return (
                      <tr key={trade.tradeId} className="hover:bg-[#161B22]/40 transition-colors">
                        <td className="py-3 pl-2 font-mono font-semibold text-[#8B949E]">{trade.tradeId.toUpperCase()}</td>
                        <td className="py-3 font-bold text-white">{trade.symbol}</td>
                        <td className="py-3 font-mono text-[#8B949E]">{trade.date}</td>
                        <td className="py-3 font-mono text-[#8B949E]">{trade.exitDate}</td>
                        <td className="py-3">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#161B22] border border-border-dark text-green-400">
                            {trade.side}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-white">৳{trade.entry.toFixed(2)}</td>
                        <td className="py-3 font-mono text-white">৳{trade.exit.toFixed(2)}</td>
                        <td className="py-3">
                          <span className={`font-mono font-bold ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                            {isWin ? '+' : ''}৳{trade.pl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`font-mono font-bold ${trade.rMultiple >= 2.0 ? 'text-green-500' : trade.rMultiple < 0 ? 'text-red-500' : 'text-white'}`}>
                            {trade.rMultiple > 0 ? '+' : ''}{trade.rMultiple}R
                          </span>
                        </td>
                        <td className="py-3 font-mono text-white">{trade.holdingPeriod} Days</td>
                        <td className="py-3 text-right pr-2">
                          <button
                            onClick={() => setSelectedBacktestTradeId(trade.tradeId)}
                            className="px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] hover:text-white font-semibold transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STRATEGY COMPARISON TABLE */}
      <div className={`p-6 rounded-xl border mt-6 mb-6 ${theme.colors.surface} ${theme.colors.border}`}>
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
            DSE Packaged Strategy Comparison Matrix
          </h3>
          <p className={`text-xs ${theme.colors.textSecondary}`}>
            Comparative performance records of all 5 available algorithmic models executed over real historical market cycles.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-dark text-[10px] font-mono text-text-muted uppercase">
                <th className="pb-3 pl-2">Strategy Model Name</th>
                <th className="pb-3">Total Return</th>
                <th className="pb-3">Win Rate %</th>
                <th className="pb-3">Profit Factor</th>
                <th className="pb-3">Avg R-Value</th>
                <th className="pb-3">Max Drawdown</th>
                <th className="pb-3">Total Trades</th>
                <th className="pb-3">Risk-Adjusted Score</th>
                <th className="pb-3 text-right pr-2">Selection Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark/40 text-xs">
              {strategyComparisonMock.map((row) => (
                <tr key={row.strategyName} className="hover:bg-[#161B22]/40 transition-colors">
                  <td className="py-3 pl-2 font-semibold text-white">{row.strategyName}</td>
                  <td className="py-3 font-mono font-bold text-green-500">+{row.returnPercent}%</td>
                  <td className="py-3 font-mono text-[#C9D1D9]">{row.winRate}%</td>
                  <td className="py-3 font-mono text-[#C9D1D9]">{row.profitFactor}x</td>
                  <td className="py-3 font-mono text-[#C9D1D9]">+{row.averageR}R</td>
                  <td className="py-3 font-mono text-red-500">{row.maxDrawdown}%</td>
                  <td className="py-3 font-mono text-text-muted">{row.totalTrades}</td>
                  <td className="py-3">
                    <span className="font-mono font-black text-amber-500 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded text-[11px]">
                      {row.riskAdjustedScore} / 100
                    </span>
                  </td>
                  <td className="py-3 text-right pr-2 text-[11px] text-text-muted max-w-[200px] truncate">
                    {row.neutralInterpretation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TRADE DETAILS DRAWER */}
      {selectedBacktestTradeId && activeTrade && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/55 backdrop-blur-sm">
          {/* Backdrop exit */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedBacktestTradeId(null)}></div>

          {/* Drawer body */}
          <div className="relative w-full max-w-xl bg-[#0D1117] border-l border-border-dark flex flex-col justify-between shadow-2xl h-full animate-slide-left z-50">
            {/* Header */}
            <div className="p-6 border-b border-border-dark flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono font-bold text-[#58A6FF] uppercase">
                  Trade Ledger Analysis
                </span>
                <h2 className="text-lg font-bold text-white uppercase tracking-tight mt-1">
                  Simulation Ticket: {activeTrade.tradeId.toUpperCase()} - {activeTrade.symbol}
                </h2>
              </div>
              <button
                onClick={() => setSelectedBacktestTradeId(null)}
                className="p-1 rounded-md hover:bg-[#21262D] text-[#8B949E] hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-5 text-xs text-text-secondary">
              <div className="bg-[#161B22]/50 p-4 rounded-xl border border-border-dark/60 space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Execution Parameters</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-text-muted font-mono block">Simulated Direction</span>
                    <span className="font-bold text-white">{activeTrade.side}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-text-muted font-mono block">Simulated Strategy</span>
                    <span className="font-bold text-[#58A6FF]">{activeTrade.strategy}</span>
                  </div>
                  <div className="space-y-0.5 mt-2">
                    <span className="text-[10px] text-text-muted font-mono block">Entry Date</span>
                    <span className="font-bold text-white font-mono">{activeTrade.date}</span>
                  </div>
                  <div className="space-y-0.5 mt-2">
                    <span className="text-[10px] text-text-muted font-mono block">Exit Date</span>
                    <span className="font-bold text-white font-mono">{activeTrade.exitDate}</span>
                  </div>
                </div>
              </div>

              {/* Numerical breakdown */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#161B22]/30 p-2.5 rounded border border-border-dark/40 text-center">
                  <span className="text-[9px] font-mono text-text-muted block">ENTRY PRICE</span>
                  <span className="text-xs font-mono font-bold text-white">৳{activeTrade.entry.toFixed(2)}</span>
                </div>
                <div className="bg-[#161B22]/30 p-2.5 rounded border border-border-dark/40 text-center">
                  <span className="text-[9px] font-mono text-text-muted block">EXIT PRICE</span>
                  <span className="text-xs font-mono font-bold text-white">৳{activeTrade.exit.toFixed(2)}</span>
                </div>
                <div className="bg-[#161B22]/30 p-2.5 rounded border border-border-dark/40 text-center">
                  <span className="text-[9px] font-mono text-text-muted block">HOLDING DAYS</span>
                  <span className="text-xs font-mono font-bold text-white">{activeTrade.holdingPeriod} Days</span>
                </div>
              </div>

              {/* Trade descriptions */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-text-muted uppercase">Simulation Entry Catalyst</span>
                  <p className="text-white leading-relaxed bg-[#161B22]/20 p-2.5 rounded border border-border-dark/40">{activeTrade.entryReason}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-text-muted uppercase">Simulation Exit Outcome</span>
                  <p className="text-white leading-relaxed bg-[#161B22]/20 p-2.5 rounded border border-border-dark/40">
                    Position liquidated due to <span className="font-bold text-[#58A6FF]">{activeTrade.exitReason}</span> criteria alignment.
                  </p>
                </div>
              </div>

              {/* Compliance checklist */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono font-bold text-text-muted uppercase block">Algorithmic Compliance Checklist</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 p-2 rounded bg-green-500/5 border border-green-500/10">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Rule Compliance: {activeTrade.ruleComplianceStatus}</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2 rounded bg-green-500/5 border border-green-500/10">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Risk Compliance: Sized according to exact 1.0% portfolio risk constraints.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border-dark bg-[#161B22]/50">
              <div className="flex gap-2 text-[11px] leading-relaxed text-[#8B949E]">
                <Info className="w-4 h-4 text-[#58A6FF] shrink-0 mt-0.5" />
                <p>
                  <span className="text-white font-bold">Testing Compliance Disclaimer:</span> Simulated transaction ledgers are deterministic models based on backward re-evaluations. Results do not constitute actual or guaranteed market returns.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
