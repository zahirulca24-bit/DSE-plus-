import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { Candidate } from '../types/scanner';
import { PortfolioHolding, PortfolioSummary } from '../types/portfolio';
import { JournalEntry } from '../types/journal';
import { WatchlistItemAlert } from '../types/watchlist';
import { RegimeState } from '../types/marketRegime';
import { BacktestConfig, BacktestResult } from '../types/backtest';
import { dseApi } from '../services/dseApi';
import { mapEntryStatus } from '../services/entryStatus';
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

type CandidateDataSource = 'none' | 'database' | 'local_csv';

interface MarketContextType {
  scannerCandidates: Candidate[];
  signalCandidates: Candidate[];
  backendConnectionStatus: 'Not Configured' | 'Checking' | 'Connected' | 'Error';
  backendMessage: string;
  scannerDataSource: CandidateDataSource;
  signalDataSource: CandidateDataSource;
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
  signalsTimestamp: string;

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

function timestamp(): string {
  return new Date().toLocaleString('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

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

function sourceFromBackend(value?: string): CandidateDataSource {
  if (value === 'database') return 'database';
  if (value === 'local_csv' || value === 'google_drive') return 'local_csv';
  return 'none';
}

function mapBackendCandidate(
  item: DseBackendCandidate,
  index: number,
  source: Exclude<CandidateDataSource, 'none'>,
): Candidate {
  const price = Number(item.latest_close ?? 0);
  const trend = item.trend || 'NEUTRAL';
  const riskReward = item.risk_reward !== undefined && item.risk_reward !== null ? Number(item.risk_reward) : null;

  return {
    id: `api-${source}-${item.symbol}-${index}`,
    rank: index + 1,
    symbol: item.symbol,
    company: item.company || `${item.symbol} — company metadata pending`,
    sector: item.sector || 'Metadata Pending',
    setup: item.setup || 'Scanner Setup',
    side: item.side ?? null,
    grade: item.grade,
    score: Number(item.score ?? 0),
    price,
    changePercent: item.change_percent !== undefined && item.change_percent !== null ? Number(item.change_percent) : null,
    relativeVolume: Number(item.volume_ratio ?? 0),
    averageVolume: 'Backend derived',
    turnover: 'Backend derived',
    rsi: Number(item.rsi14 ?? 0),
    trend,
    emaAlignment: trend,
    entryStatus: mapEntryStatus(item.entry_status),
    entryLow: item.entry_low ?? null,
    entryHigh: item.entry_high ?? null,
    stopLoss: item.stop_loss ?? null,
    target1: item.target1 ?? null,
    target2: item.target2 ?? null,
    target3: item.target3 ?? null,
    riskReward,
    support: item.support ?? null,
    resistance: item.resistance ?? null,
    qualificationReasons: item.reasons || [],
    missingConditions: item.warnings || [],
    rejectionReasons: item.signal_status === 'rejected' ? item.warnings || ['Rejected by backend scanner rule.'] : [],
    updatedAt: item.trade_date || timestamp(),
    dataMode: source === 'database' ? 'Database' : 'Google Drive-backed cache',
  };
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const [scannerCandidates, setScannerCandidates] = useState<Candidate[]>([]);
  const [signalCandidates, setSignalCandidates] = useState<Candidate[]>([]);
  const [backendConnectionStatus, setBackendConnectionStatus] = useState<MarketContextType['backendConnectionStatus']>('Checking');
  const [backendMessage, setBackendMessage] = useState<string>('Checking backend health...');
  const [scannerDataSource, setScannerDataSource] = useState<CandidateDataSource>('none');
  const [signalDataSource, setSignalDataSource] = useState<CandidateDataSource>('none');
  const [scannerUniverseCount, setScannerUniverseCount] = useState<number>(0);
  const [scannerEligibleCount, setScannerEligibleCount] = useState<number>(0);

  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);
  const [watchlistAlerts, setWatchlistAlerts] = useState<Record<string, WatchlistItemAlert[]>>({});

  const [selectedScannerCandidateId, setSelectedScannerCandidateId] = useState<string | null>(null);
  const [selectedSignalCandidateId, setSelectedSignalCandidateId] = useState<string | null>(null);
  const [scannerFilters, setScannerFilters] = useState<ScannerFilters>(initialFilters);
  const [activeSignalsTab, setActiveSignalsTab] = useState<'qualified' | 'near' | 'rejected' | 'all'>('qualified');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanTimestamp, setScanTimestamp] = useState<string>('Not run');
  const [signalsTimestamp, setSignalsTimestamp] = useState<string>('Not run');

  const [isPortfolioConnected, setIsPortfolioConnected] = useState<boolean>(false);
  const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioHolding[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>(emptyPortfolioSummary);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  const [regimePeriod, setRegimePeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [activeRegimeState, setActiveRegimeState] = useState<RegimeState>('Neutral');
  const [isRefreshingRegime, setIsRefreshingRegime] = useState<boolean>(false);
  const [regimeTimestamp, setRegimeTimestamp] = useState<string>('Not connected');

  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [isRefreshingSectors, setIsRefreshingSectors] = useState<boolean>(false);
  const [sectorTimestamp, setSectorTimestamp] = useState<string>('Not connected');

  const [backtestConfig, setBacktestConfig] = useState<BacktestConfig>({
    strategy: 'SMA 20/50 Crossover',
    symbol: 'ALL',
    sector: 'ALL',
    allSymbols: true,
    startDate: '2025-07-02',
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
  const [isBacktestLoaded] = useState<boolean>(false);
  const [isBacktesting, setIsBacktesting] = useState<boolean>(false);
  const [selectedBacktestTradeId, setSelectedBacktestTradeId] = useState<string | null>(null);
  const backtestResult: BacktestResult | null = null;

  const clearScannerData = useCallback(() => {
    setScannerCandidates([]);
    setScannerDataSource('none');
    setScannerUniverseCount(0);
    setScannerEligibleCount(0);
  }, []);

  const clearSignalsData = useCallback(() => {
    setSignalCandidates([]);
    setSignalDataSource('none');
  }, []);

  const applyScannerResult = useCallback((payload: DseScannerLatestResponse) => {
    const source = sourceFromBackend(payload.data_source);
    if (source === 'none') {
      clearScannerData();
      return;
    }
    setScannerCandidates(payload.candidates.map((item, index) => mapBackendCandidate(item, index, source)));
    setScannerDataSource(source);
    setScannerUniverseCount(payload.scanned_symbols || payload.candidates.length);
    setScannerEligibleCount(payload.eligible_symbols || payload.candidates.length);
    setScanTimestamp(formatDateTime(payload.generated_at));
  }, [clearScannerData]);

  const applySignalsResult = useCallback((payload: DseSignalsResponse) => {
    const source = sourceFromBackend(payload.data_source);
    if (source === 'none') {
      clearSignalsData();
      return;
    }
    setSignalCandidates(payload.signals.map((item, index) => mapBackendCandidate(item, index, source)));
    setSignalDataSource(source);
    setSignalsTimestamp(timestamp());
  }, [clearSignalsData]);

  const refreshBackendData = useCallback(async () => {
    setBackendConnectionStatus('Checking');
    const health = await dseApi.health();
    if (!health.ok) {
      setBackendConnectionStatus(health.error?.includes('not configured') ? 'Not Configured' : 'Error');
      setBackendMessage(health.error || 'Backend health check failed. No fake fallback is enabled.');
      clearScannerData();
      clearSignalsData();
      return;
    }

    setBackendConnectionStatus('Connected');
    setBackendMessage(`Health endpoint responded OK: ${health.data?.app || 'DSE Pulse Backend'}`);

    const latest = await dseApi.scannerLatest();
    if (latest.ok && latest.data?.ok && latest.data.candidates.length > 0 && sourceFromBackend(latest.data.data_source) !== 'none') {
      applyScannerResult(latest.data);
    } else {
      clearScannerData();
    }

    const signals = await dseApi.signals();
    if (signals.ok && signals.data?.signals?.length && sourceFromBackend(signals.data.data_source) !== 'none') {
      applySignalsResult(signals.data);
    } else {
      clearSignalsData();
    }
  }, [applyScannerResult, applySignalsResult, clearScannerData, clearSignalsData]);

  useEffect(() => {
    void refreshBackendData();
  }, [refreshBackendData]);

  const runRegimeRefresh = async () => {
    setIsRefreshingRegime(true);
    setRegimeTimestamp('Not connected');
    setIsRefreshingRegime(false);
  };

  const runSectorRefresh = async () => {
    setIsRefreshingSectors(true);
    setSectorTimestamp('Not connected');
    setIsRefreshingSectors(false);
  };

  const runDemoBacktest = async () => {
    setIsBacktesting(true);
    setIsBacktesting(false);
  };

  const addToWatchlist = (symbol: string) => {
    if (!watchlistSymbols.includes(symbol)) setWatchlistSymbols((prev) => [...prev, symbol]);
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlistSymbols((prev) => prev.filter((item) => item !== symbol));
    setWatchlistAlerts((prev) => {
      const next = { ...prev };
      delete next[symbol];
      return next;
    });
  };

  const addWatchlistAlert = (symbol: string, alert: Omit<WatchlistItemAlert, 'createdAt'>) => {
    setWatchlistAlerts((prev) => ({
      ...prev,
      [symbol]: [...(prev[symbol] || []), { ...alert, createdAt: new Date().toLocaleDateString('en-GB') }],
    }));
  };

  const removeWatchlistAlert = (symbol: string, index: number) => {
    setWatchlistAlerts((prev) => ({
      ...prev,
      [symbol]: (prev[symbol] || []).filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const clearWatchlist = () => {
    setWatchlistSymbols([]);
    setWatchlistAlerts({});
  };

  const resetScannerFilters = () => setScannerFilters(initialFilters);

  const runDemoScan = async () => {
    setIsScanning(true);
    const result = await dseApi.scannerRun();
    if (result.ok && result.data?.ok && sourceFromBackend(result.data.data_source) !== 'none') {
      applyScannerResult(result.data);
    } else {
      clearScannerData();
      setScanTimestamp(timestamp());
    }
    setIsScanning(false);
  };

  const loadDemoPortfolio = () => {
    setIsPortfolioConnected(false);
    setPortfolioHoldings([]);
    setPortfolioSummary(emptyPortfolioSummary);
  };

  const disconnectPortfolio = () => {
    setIsPortfolioConnected(false);
    setPortfolioHoldings([]);
    setPortfolioSummary(emptyPortfolioSummary);
  };

  const addPortfolioHoldingNote = (symbol: string, note: string) => {
    setPortfolioHoldings((prev) => prev.map((holding) => (
      holding.symbol === symbol
        ? { ...holding, notes: note, notesUpdatedAt: new Date().toLocaleDateString('en-GB') }
        : holding
    )));
  };

  const recordPortfolioExit = (symbol: string, exitPrice: number, quantity: number, exitReason: string) => {
    const holding = portfolioHoldings.find((item) => item.symbol === symbol);
    if (!holding) return;
    const qtyToExit = Math.min(quantity, holding.quantity);
    const realizedPL = qtyToExit * exitPrice - qtyToExit * holding.averageCost;
    const fee = 0;
    const plannedRisk = qtyToExit * Math.abs(holding.averageCost * 0.05);

    setPortfolioHoldings((prev) => prev
      .map((item) => item.symbol === symbol ? { ...item, quantity: item.quantity - qtyToExit } : item)
      .filter((item) => item.quantity > 0));

    const newJournalEntry: JournalEntry = {
      id: `journ-exit-${Date.now()}`,
      symbol: holding.symbol,
      company: holding.company,
      sector: holding.sector,
      tradeDate: new Date().toISOString().split('T')[0],
      side: 'LONG',
      setup: 'Portfolio Recorded Exit',
      grade: holding.grade,
      score: 0,
      entryPrice: holding.averageCost,
      stopLoss: holding.averageCost * 0.95,
      target1: holding.averageCost * 1.15,
      target2: holding.averageCost * 1.25,
      quantity: qtyToExit,
      plannedRisk,
      expectedRR: 0,
      status: 'CLOSED',
      exitPrice,
      exitDate: new Date().toISOString().split('T')[0],
      fees: fee,
      realizedPL,
      rMultiple: plannedRisk > 0 ? realizedPL / plannedRisk : 0,
      entryReason: 'Position supplied by user/imported portfolio data.',
      exitReason,
      whatWentWell: '',
      whatWentWrong: '',
      ruleFollowed: true,
      mistakeTags: [],
      emotionalState: 'Neutral',
      notes: holding.notes || '',
      tags: ['PortfolioExit'],
    };
    setJournalEntries((prev) => [newJournalEntry, ...prev]);
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    setJournalEntries((prev) => [{ ...entry, id: `journ-${Date.now()}` }, ...prev]);
  };

  const updateJournalEntry = (id: string, entryUpdates: Partial<JournalEntry>) => {
    setJournalEntries((prev) => prev.map((entry) => {
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
        const priceDiff = updated.side === 'LONG'
          ? updated.exitPrice - updated.entryPrice
          : updated.entryPrice - updated.exitPrice;
        updated.realizedPL = updated.quantity * priceDiff - (updated.fees || 0);
        updated.rMultiple = updated.plannedRisk > 0 ? updated.realizedPL / updated.plannedRisk : 0;
      }
      return updated;
    }));
  };

  const deleteJournalEntry = (id: string) => setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
  const clearJournal = () => setJournalEntries([]);
  const loadDemoJournal = () => setJournalEntries([]);

  return (
    <MarketContext.Provider value={{
      scannerCandidates,
      signalCandidates,
      backendConnectionStatus,
      backendMessage,
      scannerDataSource,
      signalDataSource,
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
      signalsTimestamp,
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
    }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarket must be used within a MarketProvider');
  return context;
}
