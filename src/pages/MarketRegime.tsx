import React from 'react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useMarket } from '../store/marketStore';
import { theme } from '../theme';
import { scorecardConfigs } from '../config/marketRegimeRules';
import { regimeConfigMock, regimeHistoryMock } from '../data/marketRegimeMockData';
import { RegimeState } from '../types/marketRegime';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Activity,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Gauge,
  Sliders,
  Sparkles,
  Zap,
  Volume2
} from 'lucide-react';

export default function MarketRegime() {
  const {
    regimePeriod,
    setRegimePeriod,
    activeRegimeState,
    setActiveRegimeState,
    regimeTimestamp,
    runRegimeRefresh,
    isRefreshingRegime
  } = useMarket();

  // Get active configurations
  const activeConfig = regimeConfigMock[activeRegimeState];
  const activeScores = scorecardConfigs[activeRegimeState];
  const chartData = regimeHistoryMock[activeRegimeState][regimePeriod];

  // Dynamic parameters based on state to ensure a rich cohesive interactive experience
  const getConfidenceScore = (state: RegimeState) => {
    switch (state) {
      case 'Bullish': return 88;
      case 'Bearish': return 92;
      case 'Neutral': return 74;
      case 'Recovery': return 65;
      case 'Distribution': return 58;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return theme.colors.positive;
    if (score >= 60) return theme.colors.accent;
    return theme.colors.warning;
  };

  const getRegimeColorClass = (state: RegimeState) => {
    switch (state) {
      case 'Bullish': return 'bg-[#238636]/10 text-[#238636] border-[#238636]/30';
      case 'Bearish': return 'bg-[#DA3633]/10 text-[#DA3633] border-[#DA3633]/30';
      case 'Neutral': return 'bg-[#484F58]/10 text-[#C9D1D9] border-[#484F58]/30';
      case 'Recovery': return 'bg-[#58A6FF]/10 text-[#58A6FF] border-[#58A6FF]/30';
      case 'Distribution': return 'bg-[#D29922]/10 text-[#D29922] border-[#D29922]/30';
    }
  };

  // Explanation Factors derived dynamically based on regime state
  const getRegimeFactors = (state: RegimeState) => {
    switch (state) {
      case 'Bullish':
        return {
          positives: [
            'DSEX trading firmly above all major moving averages (20, 50, 200 EMAs).',
            'Strong market breadth with advancers regularly exceeding decliners by 2.5:1.',
            'Volume expanding significantly on up-days, signaling strong accumulation.',
            'Pharma, Bank, and Power sectors exhibiting leadership clusters.'
          ],
          negatives: [
            'Some mid-cap stocks starting to trade at premium RSI valuations (>75).',
            'Slight margin loan tightening might cap aggressive leverage.'
          ],
          neutrals: [
            'Global macroeconomic interest rates holding stable.',
            'Exchange rate fluctuations remain within standard central bank brackets.'
          ],
          risks: 'Minor distribution risk if core blue-chip stocks hit historic multi-year resistance barriers.',
          improvement: 'A sustained breakout above the 6,500 index level with BDT 2,000 Crore daily turnover.',
          weakening: 'Descending below 20 EMA on the daily timeframe accompanied by thinning breadth.'
        };
      case 'Bearish':
        return {
          positives: [
            'High dividend yield listings are approaching highly attractive structural baselines.',
            'Extremely oversold RSI conditions (<20) often trigger sharp short-term relief rallies.'
          ],
          negatives: [
            'DSEX heavily locked beneath the descending 200 EMA with high downward momentum.',
            'Persistent net foreign fund outflows on primary index weight giants.',
            'Daily market turnover dried up by 45% compared to the quarterly average.',
            'Advancer ratio below 15% for seven consecutive sessions.'
          ],
          neutrals: [
            'Central bank policy rates are maintained with neutral commentary.',
            'Retail trader participation has hit a structural floor.'
          ],
          risks: 'Forced margin call liquidations and potential liquidity freeze on floor-price assets.',
          improvement: 'A positive divergence on the advance-decline ratio during consecutive down sessions.',
          weakening: 'DSEX breaking the multi-month support floor, triggering panic sellstops.'
        };
      case 'Neutral':
        return {
          positives: [
            'Low institutional selling pressure; major funds are maintaining current core holdings.',
            'Pharma and Insurance sectors exhibiting steady consolidation bases.'
          ],
          negatives: [
            'Absence of major market catalysts to stimulate fresh liquidity injection.',
            'Turnover remains below average, preventing a clear breakout velocity.',
            'High concentration of trading volume inside only 3-4 specific stocks.'
          ],
          neutrals: [
            'Advance/Decline ratio hovering around a balanced 1:1 ratio.',
            'RSI levels resting between 45 and 55 with minimal momentum bias.'
          ],
          risks: 'Chop and decay inside options/derivatives (if applicable) and range-bound false breakouts.',
          improvement: 'A clean close above the upper consolidation range on BDT 1,000M+ volume.',
          weakening: 'Index breaking down from the lower support boundary on expanding volume.'
        };
      case 'Recovery':
        return {
          positives: [
            'Positive momentum divergence; advancers are expanding ahead of index price changes.',
            'Institutional block trades picking up on high-quality blue chip financial assets.',
            'RSI steadily climbing out of oversold extremes back into neutral territories.'
          ],
          negatives: [
            'Moving average structure remains in a bearish alignment (20 < 50 < 200 EMAs).',
            'Retail participation is still skeptical, leading to low follow-through volume.'
          ],
          neutrals: [
            'Index consolidating directly on critical historical pivot zones.',
            'A/D ratio is positive but volatile session-to-session.'
          ],
          risks: 'Premature breakout attempts that pull back to test deeper support ranges.',
          improvement: 'Index crossing above the 50-day moving average on expanding market breadth.',
          weakening: 'A failure to hold the newly established higher-low base on daily candle closes.'
        };
      case 'Distribution':
        return {
          positives: [
            'Heavyweight telecom and pharma stocks holding the index level stable for now.',
            'Strong retail enthusiasm creating deep exit liquidity for institutional sellers.'
          ],
          negatives: [
            'Bearish divergence on RSI; index making minor new highs while momentum fails to follow.',
            'Decliners significantly leading advancers behind the scenes (thinning breadth).',
            'Frequent intraday reversals with heavy gap-downs on morning sessions.'
          ],
          neutrals: [
            'Slight macro currency adjustments are keeping corporate profit models variable.',
            'Average holding periods contracting as swing strategies dominate.'
          ],
          risks: 'Sudden trapdoor sell-offs once index-supporting heavyweight stocks stop absorbing bids.',
          improvement: 'Institutional buying returning to broad-market index components with strong follow-through.',
          weakening: 'DSEX cracking the 50 EMA baseline with broad-scale volume expansion.'
        };
    }
  };

  const factors = getRegimeFactors(activeRegimeState);

  return (
    <PageContainer id="market-regime-route-pane">
      {/* HEADER SECTION */}
      <div className={`flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b pb-6 ${theme.colors.border}`}>
        <div>
          <div className="flex items-center gap-2.5 flex-wrap mb-2">
            <h1 className={`text-2xl font-bold uppercase tracking-tight ${theme.colors.textPrimary}`}>
              Market Regime
            </h1>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-500 uppercase">
              Demo Data Analysis
            </span>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${getRegimeColorClass(activeRegimeState)}`}>
              <Activity className="w-3 h-3" />
              <span>REGIME: {activeRegimeState}</span>
            </span>
          </div>
          <p className={`text-xs ${theme.colors.textSecondary} max-w-3xl`}>
            Evaluate overall Dhaka Stock Exchange (DSE) trend, breadth, participation, momentum, liquidity, and market risk conditions using state-machine models.
          </p>
        </div>

        {/* Header Action & Timestamp */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-[#161B22]/50 ${theme.colors.border}`}>
            <Calendar className={`w-3.5 h-3.5 ${theme.colors.textSecondary}`} />
            <span className={`text-[11px] font-mono ${theme.colors.textSecondary}`}>
              DATE: <span className="text-white font-bold">16 Jul 2026</span>
            </span>
            <span className={`text-[11px] font-mono ${theme.colors.textSecondary} ml-1 border-l pl-2 border-border-dark`}>
              UPDATED: <span className="text-white font-bold">{regimeTimestamp.split(' ')[2] || 'Today'} {regimeTimestamp.split(' ')[3] || ''}</span>
            </span>
          </div>

          <button
            onClick={runRegimeRefresh}
            disabled={isRefreshingRegime}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-white border border-[#30363D] text-xs font-semibold cursor-pointer select-none transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingRegime ? 'animate-spin' : ''}`} />
            <span>{isRefreshingRegime ? 'Refreshing...' : 'Refresh Demo Analysis'}</span>
          </button>
        </div>
      </div>

      {/* REGIME CONTROLS: QUICK SELECT FOR INTERACTIVE PLAY */}
      <div className={`p-4 rounded-xl border mb-6 ${theme.colors.border} ${theme.colors.surface}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${theme.colors.textSecondary} mb-1 flex items-center gap-1.5`}>
              <Sliders className="w-3.5 h-3.5 text-[#58A6FF]" />
              <span>Interactive Regime Sandbox</span>
            </h3>
            <p className={`text-[11px] ${theme.colors.textMuted}`}>
              Toggle different regime states below to visualize how the entire scoring system, history profile, and guidance shifts instantly.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(['Bullish', 'Neutral', 'Bearish', 'Recovery', 'Distribution'] as RegimeState[]).map((state) => (
              <button
                key={state}
                onClick={() => setActiveRegimeState(state)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                  activeRegimeState === state
                    ? 'bg-[#21262D] text-white border-[#58A6FF] shadow-sm'
                    : 'text-[#8B949E] hover:text-white border-transparent hover:bg-[#1F242C]'
                }`}
              >
                {state.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PROMINENT REGIME SUMMARY PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Core Summary */}
        <div className={`lg:col-span-8 p-6 rounded-xl border flex flex-col justify-between ${theme.colors.border} ${theme.colors.surface}`}>
          <div>
            <div className="flex items-start justify-between mb-4 border-b border-border-dark/60 pb-4">
              <div className="space-y-1">
                <span className={`text-[10px] font-mono font-bold tracking-wider ${theme.colors.textSecondary} uppercase`}>
                  State Classification
                </span>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <span className={activeRegimeState === 'Bullish' || activeRegimeState === 'Recovery' ? 'text-green-500' : activeRegimeState === 'Bearish' ? 'text-red-500' : 'text-amber-500'}>
                      ●
                    </span>
                    {activeRegimeState}
                  </h2>
                </div>
              </div>

              <div className="text-right space-y-1">
                <span className={`text-[10px] font-mono font-bold tracking-wider ${theme.colors.textSecondary} uppercase`}>
                  Confidence Score
                </span>
                <div className="flex items-center justify-end gap-1.5">
                  <span className={`text-2xl font-black font-mono ${getConfidenceColor(getConfidenceScore(activeRegimeState))}`}>
                    {getConfidenceScore(activeRegimeState)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Matrix details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
              <div className="space-y-0.5">
                <span className={`text-[10px] font-mono uppercase ${theme.colors.textMuted}`}>Risk Level</span>
                <p className="text-sm font-bold text-white">{activeConfig.riskLevel}</p>
              </div>
              <div className="space-y-0.5">
                <span className={`text-[10px] font-mono uppercase ${theme.colors.textMuted}`}>Trend Bias</span>
                <p className="text-sm font-bold text-white">{activeConfig.trendBias}</p>
              </div>
              <div className="space-y-0.5">
                <span className={`text-[10px] font-mono uppercase ${theme.colors.textMuted}`}>Participation</span>
                <p className="text-sm font-bold text-white">{activeConfig.participation}</p>
              </div>
              <div className="space-y-0.5">
                <span className={`text-[10px] font-mono uppercase ${theme.colors.textMuted}`}>Market Breadth</span>
                <p className="text-sm font-bold text-white">{activeConfig.breadth}</p>
              </div>
              <div className="space-y-0.5 mt-2">
                <span className={`text-[10px] font-mono uppercase ${theme.colors.textMuted}`}>Volume Strength</span>
                <p className="text-sm font-bold text-white">{activeConfig.volume}</p>
              </div>
              <div className="space-y-0.5 mt-2">
                <span className={`text-[10px] font-mono uppercase ${theme.colors.textMuted}`}>Volatility Condition</span>
                <p className="text-sm font-bold text-white">{activeConfig.volatility}</p>
              </div>
              <div className="space-y-0.5 mt-2 col-span-2">
                <span className={`text-[10px] font-mono uppercase ${theme.colors.textMuted}`}>Current Posture</span>
                <p className="text-xs font-semibold text-white truncate">{activeConfig.operatingPosture}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border-dark/60 pt-4 mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#58A6FF] shrink-0 mt-0.5" />
              <p className={`text-[11px] ${theme.colors.textSecondary} leading-relaxed`}>
                <span className="text-white font-bold">Posture Rule:</span> {activeConfig.operatingPosture} Never assume trend continuation without volume backing.
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-500 font-bold tracking-wider shrink-0 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/20">
              DEMO DATASETS ACTIVE
            </span>
          </div>
        </div>

        {/* Operating Guidance Card */}
        <div className={`lg:col-span-4 p-6 rounded-xl border flex flex-col justify-between ${theme.colors.border} ${theme.colors.surface}`}>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-500" />
              Operating Guidance
            </h3>

            {/* Conditionally rendered operating guidance */}
            <div className="space-y-3">
              {activeRegimeState === 'Bullish' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#238636] font-bold text-xs font-mono">
                    <CheckCircle2 className="w-4 h-4" /> HIGHER OPPORTUNITY CYCLE
                  </div>
                  <p className={`text-xs ${theme.colors.textSecondary} leading-relaxed`}>
                    Trend-following setups are highly preferred. Long breakouts on high volumes possess strong follow-through capabilities. Maintain normal risk sizes and run winning positions.
                  </p>
                </div>
              )}
              {activeRegimeState === 'Bearish' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#DA3633] font-bold text-xs font-mono">
                    <AlertTriangle className="w-4 h-4" /> CAPITAL PROTECTION FIRST
                  </div>
                  <p className={`text-xs ${theme.colors.textSecondary} leading-relaxed`}>
                    Absolute priority is defensive cash preservation. Avoid weak long setups or attempting to catch falling knives on unconfirmed bounces. Reduce trade frequency and position sizes drastically.
                  </p>
                </div>
              )}
              {activeRegimeState === 'Neutral' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs font-mono">
                    <Sliders className="w-4 h-4 text-[#58A6FF]" /> SELECTIVE PARTICIPATION
                  </div>
                  <p className={`text-xs ${theme.colors.textSecondary} leading-relaxed`}>
                    Require extremely robust confirmation of volume before committing capital. Focus on specific stock-centric catalysts rather than index moves. Avoid marginal, questionable setups.
                  </p>
                </div>
              )}
              {activeRegimeState === 'Recovery' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#58A6FF] font-bold text-xs font-mono">
                    <Sparkles className="w-4 h-4" /> IMPROVING CONDITIONS
                  </div>
                  <p className={`text-xs ${theme.colors.textSecondary} leading-relaxed`}>
                    Accumulate leading sectors slowly as support ranges hold. Confirm market-wide breadth improvements before scaling up core trading sizes. Keep early stops protective.
                  </p>
                </div>
              )}
              {activeRegimeState === 'Distribution' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#D29922] font-bold text-xs font-mono">
                    <Zap className="w-4 h-4" /> WEAKENING PARTICIPATION
                  </div>
                  <p className={`text-xs ${theme.colors.textSecondary} leading-relaxed`}>
                    Protect existing capital gains proactively by raising trailing stops or liquidating late-stage entries. Avoid entering positions at major consolidation ceilings; protect your margin.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border-dark/60 pt-3 mt-4 text-[10px] font-mono text-text-muted">
            * This section represents educational logic and is strictly not direct financial advice.
          </div>
        </div>
      </div>

      {/* COMPACT REGIME SCORECARDS */}
      <h3 className={`text-xs font-mono font-bold uppercase tracking-widest ${theme.colors.textSecondary} mb-3`}>
        Regime Sub-Component Scores (0 - 100)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {activeScores.map((scoreCard) => {
          let scoreColor = 'text-green-500';
          let scoreBg = 'bg-green-500/5 border-green-500/20';
          if (scoreCard.score < 40) {
            scoreColor = 'text-red-500';
            scoreBg = 'bg-red-500/5 border-red-500/20';
          } else if (scoreCard.score < 65) {
            scoreColor = 'text-amber-500';
            scoreBg = 'bg-amber-500/5 border-amber-500/20';
          }

          return (
            <div
              key={scoreCard.id}
              className={`p-4 rounded-xl border flex flex-col justify-between ${theme.colors.surface} ${theme.colors.border}`}
            >
              <div className="space-y-1">
                <span className={`text-[10px] font-mono font-bold uppercase ${theme.colors.textSecondary}`}>
                  {scoreCard.label}
                </span>
                <p className={`text-[10px] font-mono font-semibold truncate ${scoreColor}`}>
                  {scoreCard.status}
                </p>
              </div>

              <div className="flex items-baseline justify-between mt-3">
                <span className={`text-2xl font-black font-mono leading-none ${scoreColor}`}>
                  {scoreCard.score}
                </span>
                <span className="text-[9px] font-mono font-bold bg-[#161B22] px-1.5 py-0.5 rounded border border-border-dark text-[#8B949E]">
                  DEMO
                </span>
              </div>

              <p className={`text-[10px] ${theme.colors.textSecondary} mt-2 pt-2 border-t border-border-dark/40 leading-relaxed`}>
                {scoreCard.interpretation}
              </p>
            </div>
          );
        })}
      </div>

      {/* DETAILED REGIME COMPONENT PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trend & Breadth Panel */}
        <div className={`p-6 rounded-xl border ${theme.colors.surface} ${theme.colors.border}`}>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#58A6FF]" />
            Trend Structure & Market Breadth
          </h3>

          <div className="space-y-4">
            {/* Trend values */}
            <div className="grid grid-cols-2 gap-4 border-b border-border-dark/50 pb-4">
              <div className="space-y-1">
                <span className={`text-[10px] font-mono text-text-muted`}>DSEX Short-Term Trend</span>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  {activeRegimeState === 'Bullish' || activeRegimeState === 'Recovery' ? (
                    <>
                      <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-green-500">BULLISH EXPANSION</span>
                    </>
                  ) : activeRegimeState === 'Bearish' ? (
                    <>
                      <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-red-500">BEARISH RETREAT</span>
                    </>
                  ) : (
                    <>
                      <Minus className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-amber-500">SIDEWAYS CONSOLIDATION</span>
                    </>
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <span className={`text-[10px] font-mono text-text-muted`}>Moving-Average Alignment</span>
                <p className="text-xs font-bold text-white font-mono">
                  {activeRegimeState === 'Bullish' ? 'EMA 20 > 50 > 200 (BULLISH)' : activeRegimeState === 'Bearish' ? 'EMA 20 < 50 < 200 (BEARISH)' : 'EMA CLUSTERING (CONGESTION)'}
                </p>
              </div>
            </div>

            {/* Breadth details */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#161B22]/60 p-2 rounded border border-border-dark/40 text-center">
                <span className="text-[9px] font-mono text-text-muted block">ADVANCING</span>
                <span className="text-xs font-mono font-bold text-green-500">
                  {activeRegimeState === 'Bullish' ? '254' : activeRegimeState === 'Bearish' ? '31' : '162'}
                </span>
              </div>
              <div className="bg-[#161B22]/60 p-2 rounded border border-border-dark/40 text-center">
                <span className="text-[9px] font-mono text-text-muted block">DECLINING</span>
                <span className="text-xs font-mono font-bold text-red-500">
                  {activeRegimeState === 'Bullish' ? '68' : activeRegimeState === 'Bearish' ? '294' : '158'}
                </span>
              </div>
              <div className="bg-[#161B22]/60 p-2 rounded border border-border-dark/40 text-center">
                <span className="text-[9px] font-mono text-text-muted block">UNCHANGED</span>
                <span className="text-xs font-mono font-bold text-[#8B949E]">
                  {activeRegimeState === 'Bullish' ? '41' : activeRegimeState === 'Bearish' ? '38' : '43'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className={theme.colors.textSecondary}>Advance/Decline Ratio</span>
                <span className="font-mono font-bold text-white">
                  {activeRegimeState === 'Bullish' ? '3.73x' : activeRegimeState === 'Bearish' ? '0.10x' : '1.02x'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={theme.colors.textSecondary}>Stocks Above Short-Term MA</span>
                <span className="font-mono font-bold text-white">
                  {activeRegimeState === 'Bullish' ? '82.5%' : activeRegimeState === 'Bearish' ? '9.1%' : '48.5%'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className={theme.colors.textSecondary}>Stocks Above Medium-Term MA</span>
                <span className="font-mono font-bold text-white">
                  {activeRegimeState === 'Bullish' ? '74.2%' : activeRegimeState === 'Bearish' ? '14.5%' : '42.0%'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Momentum & Volatility Panel */}
        <div className={`p-6 rounded-xl border ${theme.colors.surface} ${theme.colors.border}`}>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#58A6FF]" />
            Momentum, Volume & Risk Warnings
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 border-b border-border-dark/50 pb-4">
              <div className="space-y-1">
                <span className={`text-[10px] font-mono text-text-muted`}>Market Turnover (Daily)</span>
                <p className="text-xs font-bold text-white font-mono">
                  {activeRegimeState === 'Bullish' ? '৳1,520.4 Crore' : activeRegimeState === 'Bearish' ? '৳310.5 Crore' : '৳680.2 Crore'}
                </p>
              </div>

              <div className="space-y-1">
                <span className={`text-[10px] font-mono text-text-muted`}>Relative Turnover vs 20-Day Avg</span>
                <p className="text-xs font-bold text-white font-mono">
                  {activeRegimeState === 'Bullish' ? '1.45x (High)' : activeRegimeState === 'Bearish' ? '0.42x (Extremely Low)' : '0.92x (Normal)'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className={theme.colors.textSecondary}>Average 14-Period RSI</span>
                <span className="font-mono font-bold text-white">
                  {activeRegimeState === 'Bullish' ? '68.5 (Bullish Zone)' : activeRegimeState === 'Bearish' ? '28.2 (Oversold Zone)' : '51.4 (Neutral Range)'}
                </span>
              </div>

              {/* Warning markers */}
              <div className="space-y-1.5 pt-2">
                <span className={`text-[10px] font-mono font-bold uppercase ${theme.colors.textSecondary}`}>
                  Regime Warning Signals
                </span>
                
                {activeRegimeState === 'Bearish' && (
                  <div className="p-2.5 rounded bg-red-500/5 border border-red-500/20 text-[11px] text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>LIQUIDITY WARNING: High block selling; bids disappearing below major setups.</span>
                  </div>
                )}
                {activeRegimeState === 'Distribution' && (
                  <div className="p-2.5 rounded bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>CONCENTRATION WARNING: 4 heavyweight stocks keeping index level falsely stable.</span>
                  </div>
                )}
                {(activeRegimeState === 'Neutral' || activeRegimeState === 'Recovery' || activeRegimeState === 'Bullish') && (
                  <div className="p-2.5 rounded bg-[#161B22]/40 border border-border-dark/50 text-[11px] text-text-secondary flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#58A6FF] shrink-0" />
                    <span>No critical liquidity freeze warnings or panic distribution gaps detected.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REGIME HISTORY CHART (RECHARTS) */}
      <div className={`p-6 rounded-xl border mb-6 ${theme.colors.surface} ${theme.colors.border}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Regime History
              </h3>
              <span className="px-1.5 py-0.5 rounded bg-[#161B22] border border-border-dark text-[9px] font-mono text-text-secondary">
                DEMO RESULTS
              </span>
            </div>
            <p className={`text-xs ${theme.colors.textSecondary}`}>
              Historical trend chart comparing the aggregated algorithmic scoring index with the aggregate DSEX baseline levels.
            </p>
          </div>

          {/* Time range controller */}
          <div className="flex p-0.5 rounded-lg bg-[#161B22]/80 border border-border-dark/60 self-start">
            {(['1M', '3M', '6M', '1Y'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setRegimePeriod(p)}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${
                  regimePeriod === p
                    ? 'bg-[#21262D] text-[#58A6FF] shadow-sm'
                    : 'text-[#8B949E] hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Wrapper */}
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262D" />
              <XAxis
                dataKey="date"
                stroke="#8B949E"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#8B949E"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <YAxis
                yAxisId="right"
                stroke="#8B949E"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                orientation="right"
                domain={['auto', 'auto']}
              />
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
              <Legend
                verticalAlign="top"
                height={36}
                iconSize={10}
                wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                name="Regime Score (0-100)"
                dataKey="score"
                stroke="#58A6FF"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#58A6FF' }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                name="Aggregate Index"
                dataKey="trendValue"
                stroke="#D29922"
                strokeWidth={1.5}
                dot={{ r: 2, fill: '#D29922' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* WHY THIS REGIME WAS ASSIGNED (EXPLANATION PANEL) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Factors breakdown */}
        <div className={`lg:col-span-2 p-6 rounded-xl border ${theme.colors.surface} ${theme.colors.border}`}>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-500" />
            Why This Regime Was Assigned
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase text-green-500 block">
                Positive Pillars
              </span>
              <ul className="space-y-2 text-xs text-text-secondary">
                {factors.positives.map((pos, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-green-500 font-bold shrink-0">✓</span>
                    <span>{pos}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase text-red-500 block">
                Negative Barriers
              </span>
              <ul className="space-y-2 text-xs text-text-secondary">
                {factors.negatives.map((neg, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-red-500 font-bold shrink-0">⚠</span>
                    <span>{neg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Risks & Improvements */}
        <div className={`p-6 rounded-xl border ${theme.colors.surface} ${theme.colors.border}`}>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#DA3633]" />
            Conditions & Risks
          </h3>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase">Primary Risk Factor</span>
              <p className="text-white leading-relaxed">{factors.risks}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase">Triggers Required for Improvement</span>
              <p className="text-white leading-relaxed">{factors.improvement}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-text-muted uppercase">Triggers Pointing to Weakening</span>
              <p className="text-white leading-relaxed">{factors.weakening}</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
