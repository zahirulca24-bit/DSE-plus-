import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Bell,
  Search,
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  User,
  Settings,
  BellRing,
  Info
} from 'lucide-react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import { useMarket } from '../store/marketStore';
import { Candidate } from '../types/scanner';
import { WatchlistItemAlert } from '../types/watchlist';
import {
  DemoDataBadge,
  GradeBadge,
  SetupBadge,
  SideBadge,
  EntryStatusBadge
} from '../components/ScannerAndSignalsComponents';

export default function Watchlist() {
  const {
    candidates,
    watchlistSymbols,
    addToWatchlist,
    removeFromWatchlist,
    watchlistAlerts,
    addWatchlistAlert,
    removeWatchlistAlert,
    clearWatchlist
  } = useMarket();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSymbolDetails, setSelectedSymbolDetails] = useState<string | null>(null);
  const [drawerActiveTab, setDrawerActiveTab] = useState<'tech' | 'alerts'>('tech');

  // Filter out candidates that correspond to watchlist symbols
  const watchlistCandidates = candidates.filter((c) => watchlistSymbols.includes(c.symbol));

  const handleOpenAlertsTab = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering row details click
    setSelectedSymbolDetails(symbol);
    setDrawerActiveTab('alerts');
  };

  const handleOpenTechTab = (symbol: string) => {
    setSelectedSymbolDetails(symbol);
    setDrawerActiveTab('tech');
  };

  const lastUpdatedTime = '16 Jul 2026 14:25';

  return (
    <PageContainer id="watchlist-route">
      <div className="space-y-6">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-dark/60 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-sans tracking-tight">Market Watchlist</h1>
              <DemoDataBadge />
            </div>
            <p className="text-xs text-text-secondary mt-1 font-sans">
              Track selected DSE stocks, signal readiness, price movement, and key technical conditions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#161B22] border border-border-dark px-3 py-1.5 rounded-md flex items-center gap-4 text-xs font-mono">
              <div className="text-text-secondary">
                Items: <span className="text-white font-bold">{watchlistSymbols.length}</span>
              </div>
              <div className="text-border-dark">|</div>
              <div className="text-text-secondary">
                Updated: <span className="text-white">{lastUpdatedTime}</span>
              </div>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-md bg-[#238636] hover:bg-[#2EA043] text-white border border-[#238636] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer focus:outline-none"
            >
              <Plus className="w-3.5 h-3.5" />
              ADD SYMBOL
            </button>

            {watchlistSymbols.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your demo watchlist? This will reset all active alerts.')) {
                    clearWatchlist();
                  }
                }}
                className="px-3.5 py-1.5 rounded-md bg-transparent hover:bg-[#DA3633]/10 text-[#DA3633] border border-border-dark hover:border-[#DA3633]/30 text-xs font-mono font-semibold transition-all cursor-pointer focus:outline-none"
              >
                CLEAR LIST
              </button>
            )}
          </div>
        </div>

        {/* Watchlist State Indicator */}
        <div className="bg-[#161B22]/40 border border-border-dark/60 p-3 rounded-lg text-[11px] font-mono text-text-secondary flex items-center gap-2">
          <Info className="w-4 h-4 text-[#58A6FF]" />
          <span>
            Watchlist changes are stored only in local frontend state. Alerts will fire simulations when their triggers are met.
          </span>
        </div>

        {/* Watchlist Table / Main UI */}
        {watchlistCandidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center rounded-xl border border-dashed border-border-dark bg-[#0D1117]/40 max-w-2xl mx-auto my-12">
            <div className="p-3 bg-[#161B22] rounded-full text-text-secondary mb-4 border border-border-dark">
              <Bell className="w-6 h-6 opacity-85" />
            </div>
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-1">Your Watchlist is Empty</h4>
            <p className="text-xs text-text-secondary max-w-sm mb-6 leading-relaxed font-sans">
              No equities are currently listed. Add securities directly from our technical scanner or click the button below to search candidate list.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-md bg-[#161B22] hover:bg-[#21262D] border border-border-dark text-xs font-mono font-bold text-white transition-colors cursor-pointer"
            >
              SEARCH & ADD SYMBOL
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-border-dark bg-[#0D1117] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-[11px]" aria-label="Selected DSE watchlist">
                <thead>
                  <tr className="bg-[#161B22]/50 text-[10px] uppercase select-none border-b border-border-dark">
                    <th className="py-3 px-3 text-text-secondary font-semibold">Symbol</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold">Sector</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold">Last Price</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold">Today's Chg</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold">Volume</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold">RVol</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold text-center">Trend</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold text-center">Setup Grade</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold text-center">Readiness</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold text-center">Alerts</th>
                    <th className="py-3 px-3 text-text-secondary font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark/40">
                  {watchlistCandidates.map((cand) => {
                    const isUp = cand.changePercent >= 0;
                    const alerts = watchlistAlerts[cand.symbol] || [];
                    const activeAlertsCount = alerts.filter((a) => a.enabled).length;

                    return (
                      <tr
                        key={cand.id}
                        onClick={() => handleOpenTechTab(cand.symbol)}
                        className="hover:bg-[#161B22]/60 transition-colors cursor-pointer group"
                      >
                        {/* Symbol */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-white uppercase group-hover:text-[#58A6FF] transition-colors">
                            {cand.symbol}
                          </div>
                          <div className="text-[9px] text-text-secondary font-sans truncate max-w-[120px]">
                            {cand.company}
                          </div>
                        </td>

                        {/* Sector */}
                        <td className="py-3 px-3 text-text-secondary">{cand.sector}</td>

                        {/* Last Price */}
                        <td className="py-3 px-3 text-white font-bold">৳{cand.price.toFixed(2)}</td>

                        {/* Change */}
                        <td className={`py-3 px-3 font-bold ${isUp ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                          <span className="flex items-center gap-0.5">
                            {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {isUp ? '+' : ''}
                            {cand.changePercent.toFixed(2)}%
                          </span>
                        </td>

                        {/* Volume */}
                        <td className="py-3 px-3 text-text-secondary">{cand.averageVolume}</td>

                        {/* RVol */}
                        <td className="py-3 px-3 text-text-secondary">{cand.relativeVolume.toFixed(1)}x</td>

                        {/* Trend */}
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-bold text-[9px] px-1.5 py-0.5 rounded uppercase ${
                              cand.trend === 'BULLISH'
                                ? 'bg-[#238636]/10 text-[#238636]'
                                : cand.trend === 'BEARISH'
                                ? 'bg-[#DA3633]/10 text-[#DA3633]'
                                : 'bg-text-secondary/10 text-text-secondary'
                            }`}
                          >
                            {cand.trend}
                          </span>
                        </td>

                        {/* Grade */}
                        <td className="py-3 px-3 text-center">
                          <GradeBadge grade={cand.grade} />
                        </td>

                        {/* Entry Readiness */}
                        <td className="py-3 px-3 text-center">
                          <EntryStatusBadge status={cand.entryStatus} />
                        </td>

                        {/* Alerts bell */}
                        <td className="py-3 px-3 text-center" onClick={(e) => handleOpenAlertsTab(cand.symbol, e)}>
                          <button className="relative p-1 rounded hover:bg-[#161B22] text-text-secondary hover:text-[#58A6FF] transition-colors focus:outline-none">
                            <Bell className={`w-4 h-4 ${activeAlertsCount > 0 ? 'text-[#D29922] fill-[#D29922]/10' : ''}`} />
                            {activeAlertsCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-[#D29922] text-black text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-[#0D1117]">
                                {activeAlertsCount}
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Actions / Delete */}
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => removeFromWatchlist(cand.symbol)}
                            className="p-1.5 rounded text-text-secondary hover:text-[#DA3633] hover:bg-[#DA3633]/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer focus:outline-none focus:opacity-100"
                            title={`Remove ${cand.symbol} from watchlist`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Symbol Modal */}
      {isAddModalOpen && (
        <AddSymbolModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(symbol) => {
            addToWatchlist(symbol);
          }}
          watchlistSymbols={watchlistSymbols}
          candidates={candidates}
        />
      )}

      {/* Detail / Alert Drawer */}
      {selectedSymbolDetails && (
        <WatchlistDetailDrawer
          symbol={selectedSymbolDetails}
          activeTab={drawerActiveTab}
          setActiveTab={setDrawerActiveTab}
          onClose={() => setSelectedSymbolDetails(null)}
          candidates={candidates}
          watchlistAlerts={watchlistAlerts}
          addWatchlistAlert={addWatchlistAlert}
          removeWatchlistAlert={removeWatchlistAlert}
        />
      )}
    </PageContainer>
  );
}

// ======================== SUB-COMPONENT: ADD SYMBOL MODAL ========================

interface AddSymbolModalProps {
  onClose: () => void;
  onAdd: (symbol: string) => void;
  watchlistSymbols: string[];
  candidates: Candidate[];
}

function AddSymbolModal({ onClose, onAdd, watchlistSymbols, candidates }: AddSymbolModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filtered = candidates.filter(
    (c) =>
      c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-[#0B0E14]/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#0D1117] border border-border-dark rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-border-dark flex items-center justify-between bg-[#161B22]/50">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              Add Securities to Watchlist
            </h3>
            <DemoDataBadge />
          </div>
          <button
            onClick={onClose}
            className="p-1 text-text-secondary hover:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar inside modal */}
        <div className="p-4 border-b border-border-dark/60 bg-[#0D1117]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Symbol (e.g. GP) or Company name..."
              className="w-full bg-[#161B22] border border-border-dark rounded-md px-3 py-2 pl-9 text-xs text-white placeholder-text-muted focus:outline-none focus:border-accent font-mono"
            />
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-text-secondary font-sans">
              No matching equities found in our database.
            </div>
          ) : (
            filtered.map((c) => {
              const isAdded = watchlistSymbols.includes(c.symbol);
              return (
                <div
                  key={c.id}
                  className="p-2.5 hover:bg-[#161B22]/60 rounded-md border border-transparent hover:border-border-dark flex items-center justify-between gap-4 font-mono text-xs transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white uppercase">{c.symbol}</span>
                      <GradeBadge grade={c.grade} />
                    </div>
                    <div className="text-[10px] text-text-secondary font-sans truncate max-w-[200px]">
                      {c.company} • {c.sector}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-white font-bold">৳{c.price.toFixed(2)}</div>
                      <div className={`text-[10px] font-bold ${c.changePercent >= 0 ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                        {c.changePercent >= 0 ? '+' : ''}
                        {c.changePercent.toFixed(2)}%
                      </div>
                    </div>

                    <button
                      onClick={() => onAdd(c.symbol)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all focus:outline-none cursor-pointer ${
                        isAdded
                          ? 'bg-border-dark border border-border-dark text-text-secondary cursor-not-allowed'
                          : 'bg-[#238636] hover:bg-[#2EA043] text-white'
                      }`}
                    >
                      {isAdded ? 'ADDED' : 'ADD'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border-dark bg-[#161B22]/20 flex justify-end text-[10px] font-mono text-text-secondary">
          Press ESC to dismiss dialog
        </div>
      </div>
    </div>
  );
}

// ======================== SUB-COMPONENT: DETAIL & ALERT CONFIG DRAWER ========================

interface WatchlistDetailDrawerProps {
  symbol: string;
  activeTab: 'tech' | 'alerts';
  setActiveTab: (tab: 'tech' | 'alerts') => void;
  onClose: () => void;
  candidates: Candidate[];
  watchlistAlerts: Record<string, WatchlistItemAlert[]>;
  addWatchlistAlert: (symbol: string, alert: Omit<WatchlistItemAlert, 'createdAt'>) => void;
  removeWatchlistAlert: (symbol: string, index: number) => void;
}

function WatchlistDetailDrawer({
  symbol,
  activeTab,
  setActiveTab,
  onClose,
  candidates,
  watchlistAlerts,
  addWatchlistAlert,
  removeWatchlistAlert
}: WatchlistDetailDrawerProps) {
  const item = candidates.find((c) => c.symbol === symbol);

  // Alert fields
  const [alertType, setAlertType] = useState<WatchlistItemAlert['type']>('PRICE_ABOVE');
  const [alertValue, setAlertValue] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const activeAlerts = watchlistAlerts[symbol] || [];

  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(alertValue);
    if (alertType !== 'ENTRY_READY' && (isNaN(val) || val <= 0)) {
      alert('Please enter a valid target trigger price.');
      return;
    }

    addWatchlistAlert(symbol, {
      enabled: true,
      type: alertType,
      value: alertType === 'ENTRY_READY' ? 0 : val
    });

    setAlertValue('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-[#0B0E14]/70 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0D1117] border-l border-border-dark flex flex-col shadow-2xl relative">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-[#30363D] flex items-center justify-between bg-[#161B22]/50">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-black text-white uppercase">{item.symbol}</span>
                <GradeBadge grade={item.grade} />
              </div>
              <p className="text-xs text-text-secondary font-sans truncate max-w-[240px] mt-0.5">
                {item.company}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-text-secondary hover:text-white hover:bg-[#161B22] focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#30363D] bg-[#161B22]/20 font-mono text-xs select-none">
            <button
              onClick={() => setActiveTab('tech')}
              className={`flex-1 py-2.5 text-center font-bold tracking-wider transition-colors focus:outline-none ${
                activeTab === 'tech'
                  ? 'border-b-2 border-[#58A6FF] text-white bg-[#161B22]/40'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              TECHNICAL SPECS
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 py-2.5 text-center font-bold tracking-wider transition-colors relative focus:outline-none ${
                activeTab === 'alerts'
                  ? 'border-b-2 border-[#58A6FF] text-white bg-[#161B22]/40'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              ALERTS MANAGER
              {activeAlerts.length > 0 && (
                <span className="ml-1.5 px-1 py-0.2 text-[8px] bg-[#D29922] text-black font-black rounded">
                  {activeAlerts.length}
                </span>
              )}
            </button>
          </div>

          {/* Drawer Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {activeTab === 'tech' ? (
              <div className="space-y-5">
                {/* Score Card */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#161B22]/30 p-3 rounded-lg border border-border-dark text-center">
                    <span className="text-[9px] font-mono text-text-secondary uppercase">Current Market Price</span>
                    <span className="text-base font-mono font-black text-white mt-1 block">৳{item.price.toFixed(2)}</span>
                    <span className={`text-[10px] font-mono font-bold mt-0.5 inline-block ${item.changePercent >= 0 ? 'text-[#238636]' : 'text-[#DA3633]'}`}>
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </span>
                  </div>

                  <div className="bg-[#161B22]/30 p-3 rounded-lg border border-border-dark text-center">
                    <span className="text-[9px] font-mono text-text-secondary uppercase">Technical Score</span>
                    <span className="text-base font-mono font-black text-[#58A6FF] mt-1 block">{item.score}/100</span>
                    <span className="text-[9px] font-mono text-text-muted mt-0.5 block">Rank #{item.rank}</span>
                  </div>
                </div>

                {/* Technical stats matrix */}
                <div className="space-y-3">
                  <h4 className="text-[9px] font-mono font-bold text-text-secondary uppercase tracking-widest border-b border-border-dark pb-1">
                    Setup Parameters
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-mono">
                    <div className="flex justify-between border-b border-border-dark/20 pb-1.5">
                      <span className="text-text-secondary">Setup Pattern:</span>
                      <span className="text-white font-bold">{item.setup}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-dark/20 pb-1.5">
                      <span className="text-text-secondary">Bias Side:</span>
                      <SideBadge side={item.side} />
                    </div>
                    <div className="flex justify-between border-b border-border-dark/20 pb-1.5">
                      <span className="text-text-secondary">Daily RSI:</span>
                      <span className="text-white font-bold">{item.rsi}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-dark/20 pb-1.5">
                      <span className="text-text-secondary">Trend Status:</span>
                      <span className={`font-bold ${item.trend === 'BULLISH' ? 'text-[#238636]' : 'text-[#DA3633]'}`}>{item.trend}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-dark/20 pb-1.5 col-span-2">
                      <span className="text-text-secondary">Buy Entry Range:</span>
                      <span className="text-white font-bold">৳{item.entryLow.toFixed(2)} - ৳{item.entryHigh.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-dark/20 pb-1.5 col-span-2">
                      <span className="text-text-secondary">Stop Loss Level:</span>
                      <span className="text-[#DA3633] font-bold">৳{item.stopLoss.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-dark/20 pb-1.5 col-span-2">
                      <span className="text-text-secondary">First Target (T1):</span>
                      <span className="text-[#238636] font-bold">৳{item.target1.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-dark/20 pb-1.5 col-span-2">
                      <span className="text-text-secondary">Second Target (T2):</span>
                      <span className="text-[#238636] font-bold">৳{item.target2.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Qualifiers lists */}
                <div className="space-y-3.5 border-t border-border-dark pt-3">
                  {item.qualificationReasons.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono font-bold text-[#238636] uppercase tracking-wider">
                        ✔ Setup Strengths
                      </div>
                      <ul className="text-xs text-text-secondary pl-3.5 list-disc space-y-1">
                        {item.qualificationReasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {item.missingConditions.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-mono font-bold text-[#D29922] uppercase tracking-wider">
                        ▲ Pending Confirmations
                      </div>
                      <ul className="text-xs text-[#D29922] pl-3.5 list-disc space-y-1">
                        {item.missingConditions.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Alert builder form */}
                <form onSubmit={handleSaveAlert} className="bg-[#161B22]/40 border border-border-dark p-4 rounded-lg space-y-3">
                  <h4 className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                    Add Price Alert Rule
                  </h4>

                  <div>
                    <label className="block text-[9px] font-mono text-text-secondary mb-1">Trigger Condition</label>
                    <select
                      value={alertType}
                      onChange={(e) => setAlertType(e.target.value as WatchlistItemAlert['type'])}
                      className="w-full bg-[#161B22] border border-border-dark rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent font-mono"
                    >
                      <option value="PRICE_ABOVE">Price Above (৳)</option>
                      <option value="PRICE_BELOW">Price Below (৳)</option>
                      <option value="ENTRY_READY">On Entry Signal Ready</option>
                      <option value="SIGNAL_CHANGE">Any Grade Signal Change</option>
                    </select>
                  </div>

                  {alertType !== 'ENTRY_READY' && alertType !== 'SIGNAL_CHANGE' && (
                    <div>
                      <label className="block text-[9px] font-mono text-text-secondary mb-1">Trigger Price Threshold (৳)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={alertValue}
                        onChange={(e) => setAlertValue(e.target.value)}
                        placeholder={`e.g. ${item.price.toFixed(1)}`}
                        className="w-full bg-[#161B22] border border-border-dark rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent font-mono"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-1.5 px-3 rounded-md bg-[#58A6FF]/10 text-[#58A6FF] hover:bg-[#58A6FF]/25 border border-[#58A6FF]/20 text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    CREATE TRIGGER
                  </button>
                </form>

                {/* Active Alerts list */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono font-bold text-text-secondary uppercase tracking-widest border-b border-border-dark pb-1">
                    Active Watchers ({activeAlerts.length})
                  </h4>

                  {activeAlerts.length === 0 ? (
                    <div className="text-center p-6 bg-[#161B22]/10 border border-[#30363D] border-dashed rounded-lg text-xs text-text-secondary">
                      No triggers configured for {item.symbol}.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {activeAlerts.map((alert, index) => (
                        <div
                          key={index}
                          className="p-2.5 bg-[#161B22]/40 rounded-md border border-border-dark flex items-center justify-between gap-3 text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <BellRing className="w-3.5 h-3.5 text-[#D29922]" />
                            <div>
                              <div className="text-white font-bold">
                                {alert.type === 'PRICE_ABOVE' && `Price goes above ৳${alert.value.toFixed(2)}`}
                                {alert.type === 'PRICE_BELOW' && `Price drops below ৳${alert.value.toFixed(2)}`}
                                {alert.type === 'ENTRY_READY' && 'When setup triggers READY status'}
                                {alert.type === 'SIGNAL_CHANGE' && 'On any technical grading transition'}
                              </div>
                              <div className="text-[9px] text-text-secondary font-sans">Created on {alert.createdAt}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => removeWatchlistAlert(symbol, index)}
                            className="p-1 rounded text-text-secondary hover:text-[#DA3633] hover:bg-[#DA3633]/10 transition-colors focus:outline-none"
                            title="Delete trigger"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer warning */}
          <div className="p-3 bg-[#161B22]/20 border-t border-border-dark text-[9px] font-mono text-text-secondary">
            Watchers require browser state simulation activity.
          </div>
        </div>
      </div>
    </div>
  );
}
