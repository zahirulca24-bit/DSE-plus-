import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { Candidate } from '../types/scanner';
import { candidatesMockData } from '../data/scannerMockData';
import { PortfolioHolding, PortfolioSummary } from '../types/portfolio';
import { portfolioHoldingsMockData, portfolioSummaryMockData } from '../data/portfolioMockData';
import { JournalEntry } from '../types/journal';
import { journalEntriesMockData } from '../data/journalMockData';
import { WatchlistItemAlert } from '../types/watchlist';
import { RegimeState } from '../types/marketRegime';
import { BacktestConfig, BacktestResult } from '../types/backtest';
import { backtestResultsMock } from '../data/backtestMockData';
import { dseApi } from '../services/dseApi';
import { DseBackendCandidate, DseScannerLatestResponse, DseSignalsResponse } from '../types/api';

interface ScannerFilters {
  search: string;
  sector: string;
  setup: string;
  side: string;
  grade: string;
  trend: string;
  entryStatus: string;
  minPrice: string;
  maxPrice: string;
  minVolume: string;
  excludeLowLiquidity: boolean;
}

const initialFilters: ScannerFilters = {
  search: '',
  sector: '',
  setup: '',
  side: '',
  grade: '',
  trend: '',
  entryStatus: '',
  minPrice: '',
  maxPrice: '',
  minVolume: '',
  excludeLowLiquidity: false,
};

const emptyPortfolioSummary: PortfolioSummary = {
  portfolioValue: 0,
  totalCost: 0,
  unrealizedPL: 0,
  unrealizedPLPercent: 0,
  todayPL: 0,
  todayPLPercent: 0,
  cashAllocation: 0,
  cashValue: 0,
  healthScore: 0,
};

interface MarketContextType {
  candidates: Candidate[];
  backendConnectionStatus: 'Not Configured' | 'Checking' | 'Connected' | 'Error';
  backendMessage: string;
  candidateDataSource: 'demo' | 'database' | 'local_csv';
  scannerUniverseCount: number;
  scannerEligibleCount: number;
  refreshBackendData: () => Promise<void>;

  watchlistSymbols: string[];
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  watchlistAlerts: Record<string, WatchlistItemAlert[]>;
  addWatchlistAlert: (symbol: string, alert: Omit<WatchlistItemAlert, 'createdAt'>) => void;
  removeWatchlistAlert: (symbol: string, index: number) => void;
  clearWatchlist: () => void;

  selectedScannerCandidateId: string | null;
  setSelectedScannerCandidateId: (id: string | null) => void;
  selectedSignalCandidateId: string | null;
  setSelectedSignalCandidateId: (id: string | null) => void;
  scannerFilters: ScannerFilters;
  setScannerFilters: React.Dispatch<React.SetStateAction<ScannerFilters>>;
  resetScannerFilters: () => void;
  activeSignalsTab: 'qualified' | 'near' | 'rejected' | 'all';
  setActiveSignalsTab: (tab: 'qualified' | 'near' | 'rejected' | 'all') => void;
  runDemoScan: () => Promise<void>;
  isScanning: boolean;
  scanTimestamp: string;

  isPortfolioConnected: boolean;
  setIsPortfolioConnected: (connected: boolean) => void;
  portfolioHoldings: PortfolioHolding[];
  setPortfolioHoldings: React.Dispatch<React.SetStateAction<PortfolioHolding[]>>;
  portfolioSummary: PortfolioSummary;
  loadDemoPortfolio: () => void;
  disconnectPortfolio: () => void;
  addPortfolioHoldingNote: (symbol: string, note: string) => void;
  recordPortfolioExit: (symbol: string, exitPrice: number, quantity: number, exitReason: string) => void;

  journalEntries: JournalEntry[];
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (id: string, entry: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  clearJournal: () => void;
  loadDemoJournal: () => void;

  regimePeriod: '1M' | '3M' | '6M' | '1Y';
  setRegimePeriod: (period: '1M' | '3M' | '6M' | '1Y') => void;
  activeRegimeState: RegimeState;
  setActiveRegimeState: (regime: RegimeState) => void;
  regimeTimestamp: string;
  runRegimeRefresh: () => Promise<void>;
  isRefreshingRegime: boolean;

  selectedSectorId: string | null;
  setSelectedSectorId: (id: string | null) => void;
  sectorTimestamp: string;
  runSectorRefresh: () => Promise<void>;
  isRefreshingSectors: boolean;

  backtestConfig: BacktestConfig;
  setBacktestConfig: React.Dispatch<React.SetStateAction<BacktestConfig>>;
  isBacktestLoaded: boolean;
  isBacktesting: boolean;
  backtestResult: BacktestResult | null;
  selectedBacktestTradeId: string | null;
  setSelectedBacktestTradeId: (id: string | null) => void;
  runDemoBacktest: () => Promise<void>;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

function formatDateTime(value?: string | null): string {
  if (!value) return timestamp();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timestamp() {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `17 Jul 2026 ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function mapEntryStatus(status?: string): Candidate['entryStatus'] {
  if (status === 'READY' || status === 'NEAR' || status === 'WATCH') return status;
  return 'WATCH';
}

function mapBackendCandidate(item: DseBackendCandidate, index: number, source: 'demo' | 'database' | 'local_csv'): Candidate {
  const price = Number(item.latest_close ?? 0);
  const trend = item.trend || 'NEUTRAL';
  const riskReward = Number(item.risk_reward ?? 0);
  const displayRisk = price > 0 ? price * 0.03 : 1;
  const target1 = price > 0 ? price + displayRisk * Math.max(riskReward || 1, 1) : 0;
  const stopLoss = price > 0 ? Math.max(price - displayRisk, 0) : 0;

  return {
    id: `api-${source}-${item.symbol}-${index}`,
    rank: index + 1,
    symbol: item.symbol,
    company: item.company || `${item.symbol} — company metadata pending`,
    sector: item.sector || 'Metadata Pending',
    setup: item.setup || 'Scanner Setup',
    side: trend === 'BEARISH' ? 'SHORT' : 'LONG',
    grade: item.grade,
    score: Number(item.score ?? 0),
    price,
    changePercent: 0,
    relativeVolume: Number(item.volume_ratio ?? 0),
    averageVolume: 'Backend derived',
    turnover: 'Backend derived',
    rsi: Number(item.rsi14 ?? 0),
    trend,
    emaAlignment: trend,
    entryStatus: mapEntryStatus(item.entry_status),
    entryLow: price,
    entryHigh: price,
    stopLoss,
    target1,
    target2: target1,
    target3: target1,
    riskReward,
    support: stopLoss,
    resistance: target1,
    qualificationReasons: item.reasons || [],
    missingConditions: item.warnings || [],
    rejectionReasons: item.signal_status === 'rejected' ? item.warnings || ['Rejected by backend scanner rule.'] : [],
    updatedAt: item.trade_date || timestamp(),
    dataMode: item.data_mode || (source === 'database' ? 'Database' : source === 'local_csv' ? 'Local CSV' : 'Demo Data'),
  };
}

function sourceFromBackend(value?: string): 'demo' | 'database' | 'local_csv' {
  if (value === 'database') return 'database';
  if (value === 'local_csv') return 'local_csv';
  return 'demo';
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>(candidatesMockData);
  const [backendConnectionStatus, setBackendConnectionStatus] = useState<MarketContextType['backendConnectionStatus']>('Checking');
  const [backendMessage, setBackendMessage] = useState<string>('Checking backend health...');
  const [candidateDataSource, setCandidateDataSource] = useState<'demo' | 'database' | 'local_csv'>('demo');
  const [scannerUniverseCount, setScannerUniverseCount] = useState<number>(395);
  const [scannerEligibleCount, setScannerEligibleCount] = useState<number>(candidatesMockData.length);

  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(['GP', 'BATBC', 'SQURPHARMA']);
  const [watchlistAlerts, setWatchlistAlerts] = useState<Record<string, WatchlistItemAlert[]>>({
    GP: [{ enabled: true, type: 'PRICE_ABOVE', value: 290.0, createdAt: '16 Jul 2026' }],
    SQURPHARMA: [{ enabled: true, type: 'ENTRY_READY', value: 0, createdAt: '16 Jul 2026' }],
  });

  const [selectedScannerCandidateId, setSelectedScannerCandidateId] = useState<string | null>(null);
  const [selectedSignalCandidateId, setSelectedSignalCandidateId] = useState<string | null>(null);
  const [scannerFilters, setScannerFilters] = useState<ScannerFilters>(initialFilters);
  const [activeSignalsTab, setActiveSignalsTab] = useState<'qualified' | 'near' | 'rejected' | 'all'>('qualified');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanTimestamp, setScanTimestamp] = useState<string>('16 Jul 2026 14:00');

  const [isPortfolioConnected, setIsPortfolioConnected] = useState<boolean>(false);
  const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioHolding[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>(emptyPortfolioSummary);

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  const [regimePeriod, setRegimePeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [activeRegimeState, setActiveRegimeState] = useState<RegimeState>('Neutral');
  const [isRefreshingRegime, setIsRefreshingRegime] = useState<boolean>(false);
  const [regimeTimestamp, setRegimeTimestamp] = useState<string>('16 Jul 2026 21:50');

  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [isRefreshingSectors, setIsRefreshingSectors] = useState<boolean>(false);
  const [sectorTimestamp, setSectorTimestamp] = useState<string>('16 Jul 2026 21:50');

  const [backtestConfig, setBacktestConfig] = useState<BacktestConfig>({
    strategy: 'SMA 20/50 Crossover',
    symbol: 'ALL',
    sector: 'ALL',
    allSymbols: true,
    startDate: '2025-01-01',
    endDate: '2026-07-16',
    initialCapital: 1000000,
    riskPerTradePercent: 1.0,
    stopLossPercent: 5.0,
    targetPercent: 15.0,
    minRR: 2.5,
    maxConcurrentPositions: 5,
    tradingFeePercent: 0.1,
    slippagePercent: 0.1,
    minVolume: 100000,
    trendFilter: true,
    gradeFilter: 'A',
    sectorFilter: 'ALL',
    longOnly: true,
    excludeLowLiquidity: true,
  });
  const [isBacktestLoaded, setIsBacktestLoaded] = useState<boolean>(false);
  const [isBacktesting, setIsBacktesting] = useState<boolean>(false);
  const [selectedBacktestTradeId, setSelectedBacktestTradeId] = useState<string | null>(null);

  const backtestResult = isBacktestLoaded
    ? backtestResultsMock[backtestConfig.strategy] || backtestResultsMock['SMA 20/50 Crossover']
    : null;

  const applyScannerResult = useCallback((payload: DseScannerLatestResponse) => {
    const source = sourceFromBackend(payload.data_source);
    setCandidates(payload.candidates.map((item, index) => mapBackendCandidate(item, index, source)));
    setCandidateDataSource(source);
    setScannerUniverseCount(payload.scanned_symbols || payload.candidates.length);
    setScannerEligibleCount(payload.eligible_symbols || payload.candidates.length);
    setScanTimestamp(formatDateTime(payload.generated_at));
  }, []);

  const applySignalsResult = useCallback((payload: DseSignalsResponse) => {
    const source = sourceFromBackend(payload.data_source);
    setCandidates(payload.signals.map((item, index) => mapBackendCandidate(item, index, source)));
    setCandidateDataSource(source);
    setScannerUniverseCount(payload.signals.length);
    setScannerEligibleCount(payload.signals.length);
  }, []);

  const refreshBackendData = useCallback(async () => {
    setBackendConnectionStatus('Checking');
    const health = await dseApi.health();
    if (!health.ok) {
      setBackendConnectionStatus(health.error?.includes('not configured') ? 'Not Configured' : 'Error');
      setBackendMessage(health.error || 'Backend health check failed. Demo data remains active.');
      setCandidateDataSource('demo');
      return;
    }

    setBackendConnectionStatus('Connected');
    setBackendMessage(`Health endpoint responded OK: ${health.data?.app || 'DSE Pulse Backend'}`);

    const latest = await dseApi.scannerLatest();
    if (latest.ok && latest.data?.ok && latest.data.candidates.length > 0) {
      applyScannerResult(latest.data);
      return;
    }

    const signals = await dseApi.signals();
    if (signals.ok && signals.data?.signals?.length) {
      applySignalsResult(signals.data);
    }
  }, [applyScannerResult, applySignalsResult]);

  useEffect(() => {
    void refreshBackendData();
  }, [refreshBackendData]);

  const runRegimeRefresh = async () => {
    setIsRefreshingRegime(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRegimeTimestamp(timestamp());
    setIsRefreshingRegime(false);
  };

  const runSectorRefresh = async () => {
    setIsRefreshingSectors(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSectorTimestamp(timestamp());
    setIsRefreshingSectors(false);
  };

  const runDemoBacktest = async () => {
    setIsBacktesting(true);
    setIsBacktestLoaded(false);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsBacktestLoaded(true);
    setIsBacktesting(false);
  };

  const addToWatchlist = (symbol: string) => {
    if (!watchlistSymbols.includes(symbol)) {
      setWatchlistSymbols((prev) => [...prev, symbol]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlistSymbols((prev) => prev.filter((s) => s !== symbol));
    setWatchlistAlerts((prev) => {
      const copy = { ...prev };
      delete copy[symbol];
      return copy;
    });
  };

  const addWatchlistAlert = (symbol: string, alert: Omit<WatchlistItemAlert, 'createdAt'>) => {
    setWatchlistAlerts((prev) => {
      const list = prev[symbol] || [];
      return {
        ...prev,
        [symbol]: [...list, { ...alert, createdAt: new Date().toLocaleDateString('en-GB') }],
      };
    });
  };

  const removeWatchlistAlert = (symbol: string, index: number) => {
    setWatchlistAlerts((prev) => {
      const list = prev[symbol] || [];
      return {
        ...prev,
        [symbol]: list.filter((_, i) => i !== index),
      };
    });
  };

  const clearWatchlist = () => {
    setWatchlistSymbols([]);
    setWatchlistAlerts({});
  };

  const resetScannerFilters = () => {
    setScannerFilters(initialFilters);
  };

  const runDemoScan = async () => {
    setIsScanning(true);
    const result = await dseApi.scannerRun();
    if (result.ok && result.data?.ok) {
      applyScannerResult(result.data);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setScanTimestamp(timestamp());
    }
    setIsScanning(false);
  };

  const loadDemoPortfolio = () => {
    setIsPortfolioConnected(true);
    setPortfolioHoldings(portfolioHoldingsMockData);
    setPortfolioSummary(portfolioSummaryMockData);
  };

  const disconnectPortfolio = () => {
    setIsPortfolioConnected(false);
    setPortfolioHoldings([]);
    setPortfolioSummary(emptyPortfolioSummary);
  };

  const addPortfolioHoldingNote = (symbol: string, note: string) => {
    setPortfolioHoldings((prev) =>
      prev.map((hold) =>
        hold.symbol === symbol ? { ...hold, notes: note, notesUpdatedAt: new Date().toLocaleDateString('en-GB') } : hold
      )
    );
  };

  const recordPortfolioExit = (symbol: string, exitPrice: number, quantity: number, exitReason: string) => {
    const holding = portfolioHoldings.find((h) => h.symbol === symbol);
    if (!holding) return;

    const qtyToExit = Math.min(quantity, holding.quantity);
    const realizedPL = qtyToExit * exitPrice - qtyToExit * holding.averageCost;

    setPortfolioHoldings((prev) =>
      prev
        .map((h) => {
          if (h.symbol !== symbol) return h;
          const newQty = h.quantity - qtyToExit;
          if (newQty <= 0) return null;
          const marketValue = newQty * h.lastPrice;
          const costBasis = newQty * h.averageCost;
          const unrealizedPL = marketValue - costBasis;
          const unrealizedPLPercent = costBasis > 0 ? (unrealizedPL / costBasis) * 100 : 0;
          return { ...h, quantity: newQty, marketValue, unrealizedPL, unrealizedPLPercent };
        })
        .filter((h): h is PortfolioHolding => h !== null)
    );

    const fee = 150;
    const plannedRisk = qtyToExit * Math.abs(holding.averageCost * 0.05);
    const newJournalEntry: JournalEntry = {
      id: `journ-exit-${Date.now()}`,
      symbol: holding.symbol,
      company: holding.company,
      sector: holding.sector,
      tradeDate: new Date().toISOString().split('T')[0],
      side: 'LONG',
      setup: 'Portfolio Recorded Exit',
      grade: holding.grade,
      score: 90,
      entryPrice: holding.averageCost,
      stopLoss: holding.averageCost * 0.95,
      target1: holding.averageCost * 1.15,
      target2: holding.averageCost * 1.25,
      quantity: qtyToExit,
      plannedRisk,
      expectedRR: 3.0,
      status: 'CLOSED',
      exitPrice,
      exitDate: new Date().toISOString().split('T')[0],
      fees: fee,
      realizedPL: realizedPL - fee,
      rMultiple: plannedRisk > 0 ? parseFloat(((realizedPL - fee) / plannedRisk).toFixed(2)) : 0,
      entryReason: 'Position imported from local demo portfolio state.',
      exitReason,
      whatWentWell: 'Recorded exit was logged locally for journal review.',
      whatWentWrong: '',
      ruleFollowed: true,
      mistakeTags: [],
      emotionalState: 'Neutral',
      notes: `Local portfolio note: ${holding.notes}`,
      tags: ['PortfolioExit', 'LocalOnly'],
    };

    setJournalEntries((prev) => [newJournalEntry, ...prev]);

    const updatedHoldings = portfolioHoldings
      .map((h) => (h.symbol === symbol ? { ...h, quantity: h.quantity - qtyToExit } : h))
      .filter((h) => h.quantity > 0);
    const totalMarketVal = updatedHoldings.reduce((sum, h) => sum + h.quantity * h.lastPrice, 0);
    const totalCostBasis = updatedHoldings.reduce((sum, h) => sum + h.quantity * h.averageCost, 0);
    const unrealizedPL = totalMarketVal - totalCostBasis;
    setPortfolioSummary((prev) => ({
      ...prev,
      portfolioValue: totalMarketVal,
      totalCost: totalCostBasis,
      unrealizedPL,
      unrealizedPLPercent: totalCostBasis > 0 ? (unrealizedPL / totalCostBasis) * 100 : 0,
    }));
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    setJournalEntries((prev) => [{ ...entry, id: `journ-${Date.now()}` }, ...prev]);
  };

  const updateJournalEntry = (id: string, entryUpdates: Partial<JournalEntry>) => {
    setJournalEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        const updated = { ...entry, ...entryUpdates };
        if (entryUpdates.quantity || entryUpdates.entryPrice || entryUpdates.stopLoss) {
          updated.plannedRisk = updated.quantity * Math.abs(updated.entryPrice - updated.stopLoss);
        }
        if (entryUpdates.entryPrice || entryUpdates.stopLoss || entryUpdates.target1) {
          const riskPerShare = Math.abs(updated.entryPrice - updated.stopLoss);
          updated.expectedRR = riskPerShare > 0 ? (updated.target1 - updated.entryPrice) / riskPerShare : 0;
        }
        if (updated.status === 'CLOSED' && updated.exitPrice !== undefined) {
          const priceDiff = updated.side === 'LONG' ? updated.exitPrice - updated.entryPrice : updated.entryPrice - updated.exitPrice;
          updated.realizedPL = updated.quantity * priceDiff - (updated.fees || 0);
          updated.rMultiple = updated.plannedRisk > 0 ? updated.realizedPL / updated.plannedRisk : 0;
        }
        return updated;
      })
    );
  };

  const deleteJournalEntry = (id: string) => setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
  const clearJournal = () => setJournalEntries([]);
  const loadDemoJournal = () => setJournalEntries(journalEntriesMockData);

  return (
    <MarketContext.Provider
      value={{
        candidates,
        backendConnectionStatus,
        backendMessage,
        candidateDataSource,
        scannerUniverseCount,
        scannerEligibleCount,
        refreshBackendData,
        watchlistSymbols,
        addToWatchlist,
        removeFromWatchlist,
        watchlistAlerts,
        addWatchlistAlert,
        removeWatchlistAlert,
        clearWatchlist,
        selectedScannerCandidateId,
        setSelectedScannerCandidateId,
        selectedSignalCandidateId,
        setSelectedSignalCandidateId,
        scannerFilters,
        setScannerFilters,
        resetScannerFilters,
        activeSignalsTab,
        setActiveSignalsTab,
        runDemoScan,
        isScanning,
        scanTimestamp,
        isPortfolioConnected,
        setIsPortfolioConnected,
        portfolioHoldings,
        setPortfolioHoldings,
        portfolioSummary,
        loadDemoPortfolio,
        disconnectPortfolio,
        addPortfolioHoldingNote,
        recordPortfolioExit,
        journalEntries,
        setJournalEntries,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        clearJournal,
        loadDemoJournal,
        regimePeriod,
        setRegimePeriod,
        activeRegimeState,
        setActiveRegimeState,
        regimeTimestamp,
        runRegimeRefresh,
        isRefreshingRegime,
        selectedSectorId,
        setSelectedSectorId,
        sectorTimestamp,
        runSectorRefresh,
        isRefreshingSectors,
        backtestConfig,
        setBacktestConfig,
        isBacktestLoaded,
        isBacktesting,
        backtestResult,
        selectedBacktestTradeId,
        setSelectedBacktestTradeId,
        runDemoBacktest,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
}
