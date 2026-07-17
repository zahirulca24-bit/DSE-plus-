import React, { useState, useMemo } from 'react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { theme } from '../theme';
import { useMarket } from '../store/marketStore';
import { dseSectorsMock, getSectorStocksMock } from '../data/sectorMockData';
import { SectorData, SectorStock } from '../types/sector';
import OrderModal from '../components/OrderModal';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Search,
  X,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp as TrendUp,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Sliders
} from 'lucide-react';

export default function SectorAnalysis() {
  const {
    selectedSectorId,
    setSelectedSectorId,
    sectorTimestamp,
    runSectorRefresh,
    isRefreshingSectors,
    addJournalEntry,
    portfolioHoldings,
    setPortfolioHoldings
  } = useMarket();

  // Search and Filter States for Sectors
  const [sectorSearch, setSectorSearch] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'changePercent' | 'volume'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Order Ticket states
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderSymbol, setOrderSymbol] = useState('');
  const [orderPrice, setOrderPrice] = useState(0);

  // Success Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Get selected sector data and stocks
  const selectedSector = useMemo(() => {
    if (!selectedSectorId) return null;
    return dseSectorsMock.find((s) => s.id === selectedSectorId) || null;
  }, [selectedSectorId]);

  const selectedSectorStocks = useMemo(() => {
    if (!selectedSectorId) return [];
    return getSectorStocksMock(selectedSectorId);
  }, [selectedSectorId]);

  // Handle Sector sorting and filtering
  const filteredAndSortedSectors = useMemo(() => {
    let result = dseSectorsMock.filter((s) =>
      s.name.toLowerCase().includes(sectorSearch.toLowerCase())
    );

    result.sort((a, b) => {
      let valA = a[sortBy] as number;
      let valB = b[sortBy] as number;
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return result;
  }, [sectorSearch, sortBy, sortOrder]);

  // Top Sector summary markers
  const topSectorsSummary = useMemo(() => {
    const sorted = [...dseSectorsMock].sort((a, b) => b.score - a.score);
    const highestVol = [...dseSectorsMock].sort((a, b) => b.volume - a.volume)[0];
    const advancingCount = dseSectorsMock.filter((s) => s.changePercent > 0).length;
    const decliningCount = dseSectorsMock.filter((s) => s.changePercent < 0).length;

    return {
      strongest: sorted[0],
      weakest: sorted[sorted.length - 1],
      highestVol,
      ratio: `${advancingCount} Adv / ${decliningCount} Dec`
    };
  }, []);

  // Sort toggle helper
  const handleSort = (field: 'score' | 'changePercent' | 'volume') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Sector Rotation Category helper
  // Leading: Score >= 75, Change >= 0.5%
  // Weakening: Score >= 60, Change < 0.5%
  // Lagging: Score < 50, Change < 0%
  // Improving: Score < 60, Change >= 0%
  const rotationMatrix = useMemo(() => {
    const leading: SectorData[] = [];
    const weakening: SectorData[] = [];
    const lagging: SectorData[] = [];
    const improving: SectorData[] = [];

    dseSectorsMock.forEach((sector) => {
      if (sector.score >= 75 && sector.changePercent >= 0.5) {
        leading.push(sector);
      } else if (sector.score >= 60 && sector.changePercent < 0.5) {
        weakening.push(sector);
      } else if (sector.score < 50 && sector.changePercent < 0) {
        lagging.push(sector);
      } else {
        improving.push(sector);
      }
    });

    return { leading, weakening, lagging, improving };
  }, []);

  // Trigger Order Modal
  const initiateOrder = (symbol: string, price: number) => {
    setOrderSymbol(symbol);
    setOrderPrice(price);
    setOrderOpen(true);
  };

  const handleOrderSubmit = (order: { symbol: string; action: 'BUY' | 'SELL'; quantity: number; price: number }) => {
    const totalCost = order.price * order.quantity;
    const brokerFee = totalCost * 0.005;
    const compName = order.symbol === 'SQURPHARMA' ? 'Square Pharmaceuticals PLC' : `${order.symbol} Corp PLC`;

    // Simulate entry in Journal
    addJournalEntry({
      symbol: order.symbol,
      company: compName,
      sector: selectedSector ? selectedSector.name : 'Sector Play',
      tradeDate: new Date().toLocaleDateString(),
      side: order.action === 'BUY' ? 'LONG' : 'SHORT',
      setup: 'Sector Analysis Catalyst',
      grade: 'A' as const,
      score: selectedSector ? selectedSector.score : 70,
      entryPrice: order.price,
      stopLoss: order.price * 0.95,
      target1: order.price * 1.15,
      target2: order.price * 1.30,
      quantity: order.quantity,
      plannedRisk: totalCost * 0.05,
      expectedRR: 3.0,
      status: 'OPEN',
      entryReason: `Simulated breakout on high sector strength score of ${selectedSector ? selectedSector.score : 70}`,
      exitReason: '',
      whatWentWell: '',
      whatWentWrong: '',
      ruleFollowed: true,
      mistakeTags: [],
      emotionalState: 'Neutral / Disciplined',
      notes: `Executed simulated ${order.action} order from Sector Analysis stocks list.`,
      tags: ['demo', 'sector-rotation'],
      fees: brokerFee
    });

    // Add to portfolio holdings or update quantity if exists
    const existingIndex = portfolioHoldings.findIndex(h => h.symbol === order.symbol);
    if (existingIndex > -1) {
      const updatedHoldings = [...portfolioHoldings];
      const existing = updatedHoldings[existingIndex];
      if (order.action === 'BUY') {
        const newQty = existing.quantity + order.quantity;
        const newAvg = ((existing.averageCost * existing.quantity) + (order.price * order.quantity)) / newQty;
        updatedHoldings[existingIndex] = {
          ...existing,
          quantity: newQty,
          averageCost: parseFloat(newAvg.toFixed(2)),
          lastPrice: order.price,
          marketValue: parseFloat((newQty * order.price).toFixed(2)),
          unrealizedPL: parseFloat(((order.price - newAvg) * newQty).toFixed(2)),
          unrealizedPLPercent: parseFloat((((order.price - newAvg) / newAvg) * 100).toFixed(2))
        };
      } else {
        const newQty = Math.max(0, existing.quantity - order.quantity);
        if (newQty === 0) {
          updatedHoldings.splice(existingIndex, 1);
        } else {
          updatedHoldings[existingIndex] = {
            ...existing,
            quantity: newQty,
            marketValue: parseFloat((newQty * order.price).toFixed(2)),
            unrealizedPL: parseFloat(((order.price - existing.averageCost) * newQty).toFixed(2)),
            unrealizedPLPercent: parseFloat((((order.price - existing.averageCost) / existing.averageCost) * 100).toFixed(2))
          };
        }
      }
      setPortfolioHoldings(updatedHoldings);
    } else if (order.action === 'BUY') {
      const newHolding = {
        id: `p-${Date.now()}`,
        symbol: order.symbol,
        company: compName,
        sector: selectedSector ? selectedSector.name : 'Sector Play',
        quantity: order.quantity,
        averageCost: order.price,
        lastPrice: order.price,
        marketValue: totalCost,
        unrealizedPL: 0,
        unrealizedPLPercent: 0,
        todayChange: 0,
        portfolioWeight: 5.5,
        grade: 'A' as const,
        riskStatus: 'LOW' as const,
        notes: 'Simulated position from Sector Catalyst Drawer.'
      };
      setPortfolioHoldings([...portfolioHoldings, newHolding]);
    }

    // Visual Notification Banner instead of window.alert
    setToastMessage(`Demo Order Executed Successfully!\nPlaced simulated order for ${order.quantity} shares of ${order.symbol} at ৳${order.price}. Entries were added to your Portfolio and Journal.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  return (
    <PageContainer id="sector-analysis-route-expanded">
      {/* SUCCESS TOAST BANNER */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-sm p-4 rounded-xl border border-green-500/30 bg-[#161B22] text-white shadow-2xl flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-green-500">Order Simulated</h4>
            <p className="text-[11px] leading-relaxed text-[#8B949E] whitespace-pre-line">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-[#21262D] rounded text-[#8B949E] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER */}
      <div className={`flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 border-b pb-6 ${theme.colors.border}`}>
        <div>
          <div className="flex items-center gap-2.5 flex-wrap mb-2">
            <h1 className={`text-2xl font-bold uppercase tracking-tight ${theme.colors.textPrimary}`}>
              Sector Analysis
            </h1>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-500 uppercase">
              Demo Datasets
            </span>
            <span className="px-2 py-0.5 rounded bg-[#21262D] border border-border-dark text-[10px] font-mono font-bold text-white uppercase flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#58A6FF]" />
              <span>18 SECTORS ACTIVE</span>
            </span>
          </div>
          <p className={`text-xs ${theme.colors.textSecondary} max-w-3xl`}>
            Track strength matrices, rotation velocity, capital allocation, and individual stock leadership components across all 18 primary stock sectors.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-[#161B22]/50 ${theme.colors.border}`}>
            <Calendar className={`w-3.5 h-3.5 ${theme.colors.textSecondary}`} />
            <span className={`text-[11px] font-mono ${theme.colors.textSecondary}`}>
              DATE: <span className="text-white font-bold">16 Jul 2026</span>
            </span>
            <span className={`text-[11px] font-mono ${theme.colors.textSecondary} ml-1 border-l pl-2 border-border-dark`}>
              UPDATED: <span className="text-white font-bold">{sectorTimestamp.split(' ')[2] || 'Today'} {sectorTimestamp.split(' ')[3] || ''}</span>
            </span>
          </div>

          <button
            onClick={runSectorRefresh}
            disabled={isRefreshingSectors}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-white border border-[#30363D] text-xs font-semibold cursor-pointer select-none transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingSectors ? 'animate-spin' : ''}`} />
            <span>{isRefreshingSectors ? 'Refreshing...' : 'Refresh Demo Analysis'}</span>
          </button>
        </div>
      </div>

      {/* DETAILED SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl border ${theme.colors.surface} ${theme.colors.border}`}>
          <span className={`text-[10px] font-mono font-bold text-text-muted block uppercase`}>
            Strongest Sector Base
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-sm font-bold text-white uppercase truncate max-w-[70%]">
              {topSectorsSummary.strongest.name}
            </h3>
            <span className="text-lg font-black font-mono text-green-500">
              {topSectorsSummary.strongest.score}
            </span>
          </div>
          <p className={`text-[10px] ${theme.colors.textSecondary} mt-1.5 border-t border-border-dark/40 pt-1.5 flex items-center gap-1`}>
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span>Relative strength leader on the index.</span>
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${theme.colors.surface} ${theme.colors.border}`}>
          <span className={`text-[10px] font-mono font-bold text-text-muted block uppercase`}>
            Weakest Sector Base
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-sm font-bold text-white uppercase truncate max-w-[70%]">
              {topSectorsSummary.weakest.name}
            </h3>
            <span className="text-lg font-black font-mono text-red-500">
              {topSectorsSummary.weakest.score}
            </span>
          </div>
          <p className={`text-[10px] ${theme.colors.textSecondary} mt-1.5 border-t border-border-dark/40 pt-1.5 flex items-center gap-1`}>
            <TrendingDown className="w-3 h-3 text-red-500" />
            <span>Anderperforming due to structural selling.</span>
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${theme.colors.surface} ${theme.colors.border}`}>
          <span className={`text-[10px] font-mono font-bold text-text-muted block uppercase`}>
            Highest Volume Sector
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-sm font-bold text-white uppercase truncate max-w-[70%]">
              {topSectorsSummary.highestVol.name}
            </h3>
            <span className="text-sm font-bold font-mono text-white">
              ৳{topSectorsSummary.highestVol.volume}M
            </span>
          </div>
          <p className={`text-[10px] ${theme.colors.textSecondary} mt-1.5 border-t border-border-dark/40 pt-1.5 flex items-center gap-1`}>
            <Briefcase className="w-3 h-3 text-[#58A6FF]" />
            <span>Accounts for primary market liquidity flow.</span>
          </p>
        </div>

        <div className={`p-4 rounded-xl border ${theme.colors.surface} ${theme.colors.border}`}>
          <span className={`text-[10px] font-mono font-bold text-text-muted block uppercase`}>
            Sectors Breadth Change
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-sm font-bold text-white">
              {topSectorsSummary.ratio}
            </h3>
            <span className="text-[10px] font-mono font-bold bg-[#161B22] border border-border-dark px-1.5 py-0.5 rounded text-[#8B949E]">
              DEMO
            </span>
          </div>
          <p className={`text-[10px] ${theme.colors.textSecondary} mt-1.5 border-t border-border-dark/40 pt-1.5 flex items-center gap-1`}>
            <Layers className="w-3 h-3 text-amber-500" />
            <span>Ratio of advancing to declining sectors.</span>
          </p>
        </div>
      </div>

      {/* SECTOR ROTATION MATRIX */}
      <div className={`p-6 rounded-xl border mb-6 ${theme.colors.surface} ${theme.colors.border}`}>
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[#58A6FF]" />
            Algorithmic Sector Rotation Matrix
          </h3>
          <p className={`text-xs ${theme.colors.textSecondary}`}>
            Sectors categorized dynamically into 4 rotation quadrants based on relative score (y-axis proxy) and change momentum (x-axis proxy).
          </p>
        </div>

        {/* Quadrant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEADING */}
          <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 min-h-[120px]">
            <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Quadrant 1: Leading (Strong Strength & Upward Change)</span>
              <span className="text-[10px] font-mono bg-green-500/10 px-1.5 py-0.2 rounded">Q1</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {rotationMatrix.leading.length === 0 ? (
                <span className="text-xs text-text-muted">No sectors currently in leading quadrant.</span>
              ) : (
                rotationMatrix.leading.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSectorId(s.id)}
                    className="px-2.5 py-1 rounded bg-[#0D1117]/60 border border-green-500/30 hover:border-green-500 text-xs font-semibold text-white cursor-pointer select-none"
                  >
                    {s.name} ({s.score})
                  </button>
                ))
              )}
            </div>
          </div>

          {/* WEAKENING */}
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 min-h-[120px]">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Quadrant 2: Weakening (Aggregated Holdings, Flat Change)</span>
              <span className="text-[10px] font-mono bg-amber-500/10 px-1.5 py-0.2 rounded">Q2</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {rotationMatrix.weakening.length === 0 ? (
                <span className="text-xs text-text-muted">No sectors currently in weakening quadrant.</span>
              ) : (
                rotationMatrix.weakening.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSectorId(s.id)}
                    className="px-2.5 py-1 rounded bg-[#0D1117]/60 border border-amber-500/30 hover:border-amber-500 text-xs font-semibold text-white cursor-pointer select-none"
                  >
                    {s.name} ({s.score})
                  </button>
                ))
              )}
            </div>
          </div>

          {/* IMPROVING */}
          <div className="p-4 rounded-xl border border-[#58A6FF]/20 bg-[#58A6FF]/5 min-h-[120px]">
            <h4 className="text-xs font-bold text-[#58A6FF] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Quadrant 3: Improving (Low Strength, Positive Momentum)</span>
              <span className="text-[10px] font-mono bg-[#58A6FF]/10 px-1.5 py-0.2 rounded">Q3</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {rotationMatrix.improving.length === 0 ? (
                <span className="text-xs text-text-muted">No sectors currently in improving quadrant.</span>
              ) : (
                rotationMatrix.improving.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSectorId(s.id)}
                    className="px-2.5 py-1 rounded bg-[#0D1117]/60 border border-[#58A6FF]/30 hover:border-[#58A6FF] text-xs font-semibold text-white cursor-pointer select-none"
                  >
                    {s.name} ({s.score})
                  </button>
                ))
              )}
            </div>
          </div>

          {/* LAGGING */}
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 min-h-[120px]">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Quadrant 4: Lagging (Weak Strength, Negative Change)</span>
              <span className="text-[10px] font-mono bg-red-500/10 px-1.5 py-0.2 rounded">Q4</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {rotationMatrix.lagging.length === 0 ? (
                <span className="text-xs text-text-muted">No sectors currently in lagging quadrant.</span>
              ) : (
                rotationMatrix.lagging.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSectorId(s.id)}
                    className="px-2.5 py-1 rounded bg-[#0D1117]/60 border border-red-500/30 hover:border-red-500 text-xs font-semibold text-white cursor-pointer select-none"
                  >
                    {s.name} ({s.score})
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTOR HEATMAP */}
      <div className={`p-6 rounded-xl border mb-6 ${theme.colors.border} ${theme.colors.surface}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Sector Heatmap
            </h2>
            <p className={`text-xs ${theme.colors.textSecondary}`}>
              Click on any sector card below to open its structural deep dive, including its corresponding stock tickers.
            </p>
          </div>
          <div className={`text-xs ${theme.colors.textSecondary} flex items-center gap-4`}>
            <span className="flex items-center gap-1">
              <TrendingUp className={`w-3.5 h-3.5 ${theme.colors.positive}`} /> Bullish (Score ≥ 80)
            </span>
            <span className="flex items-center gap-1">
              <Minus className={`w-3.5 h-3.5 ${theme.colors.textSecondary}`} /> Neutral (41 - 79)
            </span>
            <span className="flex items-center gap-1">
              <TrendingDown className={`w-3.5 h-3.5 ${theme.colors.negative}`} /> Bearish (Score ≤ 40)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredAndSortedSectors.map((sector) => {
            // Determine background intensity based on score (simulating a heatmap)
            let bgClass = 'bg-[#161B22]/50';
            let borderClass = 'border-border-dark/50 hover:border-[#8B949E]';
            
            if (sector.score >= 80) {
              bgClass = 'bg-[#238636]/10';
              borderClass = 'border-[#238636]/30 hover:border-[#2EA043]';
            } else if (sector.score <= 40) {
              bgClass = 'bg-[#DA3633]/10';
              borderClass = 'border-[#DA3633]/30 hover:border-[#F85149]';
            } else if (sector.score >= 60) {
              bgClass = 'bg-[#58A6FF]/10';
              borderClass = 'border-[#58A6FF]/30 hover:border-[#58A6FF]';
            }

            return (
              <button
                key={sector.id}
                onClick={() => setSelectedSectorId(sector.id)}
                className={`relative p-4 rounded-lg border text-left ${borderClass} ${bgClass} flex flex-col justify-between transition-colors cursor-pointer w-full`}
              >
                <div className="flex justify-between items-start mb-3 w-full">
                  <h3 className={`text-xs font-bold ${theme.colors.textPrimary} uppercase tracking-tight truncate max-w-[70%]`}>
                    {sector.name}
                  </h3>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full bg-[#21262D] border ${theme.colors.border}`}>
                    {sector.trend === 'UP' && <TrendingUp className={`w-3.5 h-3.5 ${theme.colors.positive}`} />}
                    {sector.trend === 'DOWN' && <TrendingDown className={`w-3.5 h-3.5 ${theme.colors.negative}`} />}
                    {sector.trend === 'NEUTRAL' && <Minus className={`w-3.5 h-3.5 ${theme.colors.textSecondary}`} />}
                  </div>
                </div>
                
                <div className="mt-auto space-y-1 w-full">
                  <div className="flex justify-between items-end">
                    <span className={`text-[10px] ${theme.colors.textMuted} font-mono uppercase`}>Score</span>
                    <span className={`text-lg font-black ${theme.colors.textPrimary} font-mono`}>
                      {sector.score}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <span className={`text-[10px] ${theme.colors.textMuted} font-mono uppercase`}>Change</span>
                    <span className={`text-xs font-bold font-mono ${sector.changePercent > 0 ? theme.colors.positive : sector.changePercent < 0 ? theme.colors.negative : theme.colors.textSecondary}`}>
                      {sector.changePercent > 0 ? '+' : ''}{sector.changePercent}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end pt-1 mt-1 border-t border-border-dark/30">
                    <span className={`text-[10px] ${theme.colors.textMuted} font-mono uppercase`}>Vol</span>
                    <span className={`text-[10px] ${theme.colors.textSecondary} font-mono`}>
                      {sector.volume}M
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTOR RANKING TABLE */}
      <div className={`p-6 rounded-xl border mb-6 ${theme.colors.surface} ${theme.colors.border}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Sector Rankings & Performance Metric Grid
            </h3>
            <p className={`text-xs ${theme.colors.textSecondary}`}>
              Detailed sortable grid tracking capital rotation and breadth metrics across all Dhaka Stock Exchange groupings.
            </p>
          </div>

          {/* Search bar and Sorting details */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search sectors..."
                value={sectorSearch}
                onChange={(e) => setSectorSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-[#0D1117] border border-border-dark hover:border-opacity-100 rounded-lg text-xs text-white placeholder-text-muted focus:outline-none focus:border-[#58A6FF] w-full sm:w-[180px]"
              />
            </div>
          </div>
        </div>

        {/* Table structure */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-dark text-[10px] font-mono text-text-muted uppercase">
                <th className="pb-3 pl-2">Rank</th>
                <th className="pb-3">Sector Name</th>
                <th className="pb-3 cursor-pointer select-none hover:text-white" onClick={() => handleSort('score')}>
                  Composite Score {sortBy === 'score' && (sortOrder === 'desc' ? '▼' : '▲')}
                </th>
                <th className="pb-3">Trend Status</th>
                <th className="pb-3">Market Breadth</th>
                <th className="pb-3 cursor-pointer select-none hover:text-white" onClick={() => handleSort('changePercent')}>
                  1-Day Change % {sortBy === 'changePercent' && (sortOrder === 'desc' ? '▼' : '▲')}
                </th>
                <th className="pb-3 cursor-pointer select-none hover:text-white" onClick={() => handleSort('volume')}>
                  Average Vol (M) {sortBy === 'volume' && (sortOrder === 'desc' ? '▼' : '▲')}
                </th>
                <th className="pb-3">Risk Level</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark/40 text-xs">
              {filteredAndSortedSectors.map((sector, idx) => {
                let scoreColor = 'text-green-500';
                if (sector.score < 40) scoreColor = 'text-red-500';
                else if (sector.score < 65) scoreColor = 'text-amber-500';

                return (
                  <tr key={sector.id} className="hover:bg-[#161B22]/40 transition-colors">
                    <td className="py-3 pl-2 font-mono font-bold text-white">#{idx + 1}</td>
                    <td className="py-3 font-semibold text-white">
                      <button
                        onClick={() => setSelectedSectorId(sector.id)}
                        className="hover:text-[#58A6FF] font-bold text-left hover:underline cursor-pointer"
                      >
                        {sector.name}
                      </button>
                    </td>
                    <td className="py-3">
                      <span className={`font-mono font-bold ${scoreColor}`}>{sector.score}</span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 font-semibold ${sector.trend === 'UP' ? 'text-green-500' : sector.trend === 'DOWN' ? 'text-red-500' : 'text-text-muted'}`}>
                        {sector.trend === 'UP' && <TrendingUp className="w-3.5 h-3.5" />}
                        {sector.trend === 'DOWN' && <TrendingDown className="w-3.5 h-3.5" />}
                        {sector.trend === 'NEUTRAL' && <Minus className="w-3.5 h-3.5" />}
                        {sector.trend}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-[#8B949E]">{sector.breadth}</td>
                    <td className="py-3">
                      <span className={`font-mono font-semibold ${sector.changePercent > 0 ? 'text-green-500' : sector.changePercent < 0 ? 'text-red-500' : 'text-text-muted'}`}>
                        {sector.changePercent > 0 ? '+' : ''}{sector.changePercent}%
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[#8B949E]">৳{sector.volume}M</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        sector.riskStatus === 'Low'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : sector.riskStatus === 'High'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {sector.riskStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={() => setSelectedSectorId(sector.id)}
                        className="px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#C9D1D9] hover:text-white font-semibold transition-colors cursor-pointer"
                      >
                        Deep Dive
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL DRAWER / BOTTOM EXPANDED DRAWER */}
      {selectedSector && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/55 backdrop-blur-sm">
          {/* Backdrop exit */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedSectorId(null)}></div>

          {/* Drawer content */}
          <div className={`relative w-full max-w-2xl bg-[#0D1117] border-l border-border-dark flex flex-col justify-between shadow-2xl h-full animate-slide-left z-50`}>
            
            {/* Header portion */}
            <div className="p-6 border-b border-border-dark">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-500 uppercase">
                    Demo Breakdown
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border bg-[#21262D] text-white border-border-dark`}>
                    SECTOR DETAILS
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSectorId(null)}
                  className="p-1 rounded-md hover:bg-[#21262D] text-[#8B949E] hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                    {selectedSector.name} Deep Dive
                  </h2>
                  <p className={`text-xs ${theme.colors.textSecondary} mt-1`}>
                    Composite sector modeling assessing {selectedSectorStocks.length} primary tracked stock listings.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-text-muted uppercase block">Composite Score</span>
                  <span className={`text-2xl font-black font-mono leading-none ${
                    selectedSector.score >= 80 ? 'text-green-500' : selectedSector.score <= 40 ? 'text-red-500' : 'text-amber-500'
                  }`}>
                    {selectedSector.score}
                  </span>
                </div>
              </div>

              {/* Sub-metrics inside Drawer */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-[#161B22]/50 p-2.5 rounded border border-border-dark/60">
                  <span className="text-[9px] font-mono text-text-muted uppercase block">Volume Factor</span>
                  <p className="text-xs font-bold text-white font-mono">৳{selectedSector.volume}M</p>
                </div>
                <div className="bg-[#161B22]/50 p-2.5 rounded border border-border-dark/60">
                  <span className="text-[9px] font-mono text-text-muted uppercase block">1D Change</span>
                  <p className={`text-xs font-bold font-mono ${selectedSector.changePercent > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedSector.changePercent > 0 ? '+' : ''}{selectedSector.changePercent}%
                  </p>
                </div>
                <div className="bg-[#161B22]/50 p-2.5 rounded border border-border-dark/60">
                  <span className="text-[9px] font-mono text-text-muted uppercase block">Breadth Ratio</span>
                  <p className="text-xs font-bold text-white font-mono">{selectedSector.breadth}</p>
                </div>
                <div className="bg-[#161B22]/50 p-2.5 rounded border border-border-dark/60">
                  <span className="text-[9px] font-mono text-text-muted uppercase block">RSI Avg</span>
                  <p className="text-xs font-bold text-white font-mono">{selectedSector.avgRsi}</p>
                </div>
              </div>
            </div>

            {/* List of Tickers inside Drawer */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Underlying Stock Components & Momentum Grades
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-dark text-[9px] font-mono text-text-muted uppercase">
                      <th className="pb-2">Symbol</th>
                      <th className="pb-2">Price</th>
                      <th className="pb-2">Change</th>
                      <th className="pb-2">RSI (14)</th>
                      <th className="pb-2">Relative Vol</th>
                      <th className="pb-2 text-right">Simulation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark/40 text-xs">
                    {selectedSectorStocks.map((stock) => (
                      <tr key={stock.symbol} className="hover:bg-[#161B22]/40">
                        <td className="py-2.5 font-bold text-white">
                          <span className="block">{stock.symbol}</span>
                          <span className="text-[10px] text-text-muted font-normal block max-w-[150px] truncate">
                            {stock.companyName}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-[#C9D1D9]">৳{stock.price}</td>
                        <td className="py-2.5 font-mono">
                          <span className={stock.changePercent > 0 ? 'text-green-500' : stock.changePercent < 0 ? 'text-red-500' : 'text-text-secondary'}>
                            {stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-[#C9D1D9]">
                          <span className={stock.rsi >= 70 ? 'text-amber-500 font-semibold' : stock.rsi <= 30 ? 'text-red-500 font-semibold' : ''}>
                            {stock.rsi}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-[#8B949E]">{stock.volume}K</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => initiateOrder(stock.symbol, stock.price)}
                            className="px-2 py-0.5 rounded bg-[#238636] hover:bg-[#2EA043] text-white text-[10px] font-bold tracking-wide uppercase transition-colors cursor-pointer"
                          >
                            Demo Trade
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer informational */}
            <div className="p-6 border-t border-border-dark bg-[#161B22]/50">
              <div className="flex gap-2 text-[11px] leading-relaxed text-[#8B949E]">
                <Info className="w-4 h-4 text-[#58A6FF] shrink-0 mt-0.5" />
                <p>
                  <span className="text-white font-bold">Rotation Weight Rule:</span> Individual listings contribute linearly to the composite sector scores. Use the 'Demo Trade' button above to simulate realistic order routing inside this sandbox.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RENDER ORDER MODAL IF TRIGGERED */}
      <OrderModal
        isOpen={orderOpen}
        onClose={() => setOrderOpen(false)}
        symbol={orderSymbol}
        currentPrice={orderPrice}
        initialAction="BUY"
        onSubmit={handleOrderSubmit}
      />
    </PageContainer>
  );
}
