import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Candidate } from '../types/scanner';
import { candidatesMockData } from '../data/scannerMockData';
import { PortfolioHolding, PortfolioSummary } from '../types/portfolio';
import { portfolioHoldingsMockData, portfolioSummaryMockData } from '../data/portfolioMockData';
import { JournalEntry, JournalStatus } from '../types/journal';
import { journalEntriesMockData } from '../data/journalMockData';
import { WatchlistItemAlert } from '../types/watchlist';

// Module-specific imports
import { RegimeState } from '../types/marketRegime';
import { BacktestConfig, BacktestResult } from '../types/backtest';
import { backtestResultsMock } from '../data/backtestMockData';

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

interface MarketContextType {
  candidates: Candidate[];
  
  // Watchlist
  watchlistSymbols: string[];
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  watchlistAlerts: Record<string, WatchlistItemAlert[]>;
  addWatchlistAlert: (symbol: string, alert: Omit<WatchlistItemAlert, 'createdAt'>) => void;
  removeWatchlistAlert: (symbol: string, index: number) => void;
  clearWatchlist: () => void;

  // Scanner/Signals
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

  // Portfolio
  isPortfolioConnected: boolean;
  setIsPortfolioConnected: (connected: boolean) => void;
  portfolioHoldings: PortfolioHolding[];
  setPortfolioHoldings: React.Dispatch<React.SetStateAction<PortfolioHolding[]>>;
  portfolioSummary: PortfolioSummary;
  loadDemoPortfolio: () => void;
  disconnectPortfolio: () => void;
  addPortfolioHoldingNote: (symbol: string, note: string) => void;
  recordPortfolioExit: (symbol: string, exitPrice: number, quantity: number, exitReason: string) => void;

  // Journal
  journalEntries: JournalEntry[];
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (id: string, entry: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  clearJournal: () => void;
  loadDemoJournal: () => void;

  // Market Regime Module
  regimePeriod: '1M' | '3M' | '6M' | '1Y';
  setRegimePeriod: (period: '1M' | '3M' | '6M' | '1Y') => void;
  activeRegimeState: RegimeState;
  setActiveRegimeState: (regime: RegimeState) => void;
  regimeTimestamp: string;
  runRegimeRefresh: () => Promise<void>;
  isRefreshingRegime: boolean;

  // Sector Analysis Module
  selectedSectorId: string | null;
  setSelectedSectorId: (id: string | null) => void;
  sectorTimestamp: string;
  runSectorRefresh: () => Promise<void>;
  isRefreshingSectors: boolean;

  // Strategy Backtest Module
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

export function MarketProvider({ children }: { children: ReactNode }) {
  // Core Scanner Candidates
  const [candidates] = useState<Candidate[]>(candidatesMockData);
  
  // Watchlist State
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(['GP', 'BATBC', 'SQURPHARMA']);
  const [watchlistAlerts, setWatchlistAlerts] = useState<Record<string, WatchlistItemAlert[]>>({
    'GP': [{ enabled: true, type: 'PRICE_ABOVE', value: 290.0, createdAt: '16 Jul 2026' }],
    'SQURPHARMA': [{ enabled: true, type: 'ENTRY_READY', value: 0, createdAt: '16 Jul 2026' }]
  });

  // Scanner UI States
  const [selectedScannerCandidateId, setSelectedScannerCandidateId] = useState<string | null>(null);
  const [selectedSignalCandidateId, setSelectedSignalCandidateId] = useState<string | null>(null);
  const [scannerFilters, setScannerFilters] = useState<ScannerFilters>(initialFilters);
  const [activeSignalsTab, setActiveSignalsTab] = useState<'qualified' | 'near' | 'rejected' | 'all'>('qualified');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanTimestamp, setScanTimestamp] = useState<string>('16 Jul 2026 14:00');

  // Portfolio State
  const [isPortfolioConnected, setIsPortfolioConnected] = useState<boolean>(true);
  const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioHolding[]>(portfolioHoldingsMockData);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>(portfolioSummaryMockData);

  // Journal State
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(journalEntriesMockData);

  // Market Regime State
  const [regimePeriod, setRegimePeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');
  const [activeRegimeState, setActiveRegimeState] = useState<RegimeState>('Neutral');
  const [isRefreshingRegime, setIsRefreshingRegime] = useState<boolean>(false);
  const [regimeTimestamp, setRegimeTimestamp] = useState<string>('16 Jul 2026 21:50');

  // Sector Analysis State
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [isRefreshingSectors, setIsRefreshingSectors] = useState<boolean>(false);
  const [sectorTimestamp, setSectorTimestamp] = useState<string>('16 Jul 2026 21:50');

  // Strategy Backtest State
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

  // Actions
  const runRegimeRefresh = async () => {
    setIsRefreshingRegime(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    setRegimeTimestamp(`16 Jul 2026 ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    setIsRefreshingRegime(false);
  };

  const runSectorRefresh = async () => {
    setIsRefreshingSectors(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    setSectorTimestamp(`16 Jul 2026 ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    setIsRefreshingSectors(false);
  };

  const runDemoBacktest = async () => {
    setIsBacktesting(true);
    setIsBacktestLoaded(false);
    await new Promise((resolve) => setTimeout(resolve, 1200)); // Simulated backtest processing
    setIsBacktestLoaded(true);
    setIsBacktesting(false);
  };

  // Watchlist Actions
  const addToWatchlist = (symbol: string) => {
    if (!watchlistSymbols.includes(symbol)) {
      setWatchlistSymbols((prev) => [...prev, symbol]);
    }
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlistSymbols((prev) => prev.filter((s) => s !== symbol));
    // Also clean alerts for that symbol
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
        [symbol]: [...list, { ...alert, createdAt: new Date().toLocaleDateString() }],
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

  // Scanner Actions
  const resetScannerFilters = () => {
    setScannerFilters(initialFilters);
  };

  const runDemoScan = async () => {
    setIsScanning(true);
    await new Promise((resolve) => setTimeout(resolve, 800)); // Short realistic demo lag
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    setScanTimestamp(`16 Jul 2026 ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`);
    setIsScanning(false);
  };

  // Portfolio Actions
  const loadDemoPortfolio = () => {
    setIsPortfolioConnected(true);
    setPortfolioHoldings(portfolioHoldingsMockData);
    setPortfolioSummary(portfolioSummaryMockData);
  };

  const disconnectPortfolio = () => {
    setIsPortfolioConnected(false);
    setPortfolioHoldings([]);
  };

  const addPortfolioHoldingNote = (symbol: string, note: string) => {
    setPortfolioHoldings((prev) =>
      prev.map((hold) => {
        if (hold.symbol === symbol) {
          return { ...hold, notes: note, notesUpdatedAt: new Date().toLocaleDateString('en-GB') };
        }
        return hold;
      })
    );
  };

  const recordPortfolioExit = (symbol: string, exitPrice: number, quantity: number, exitReason: string) => {
    const holding = portfolioHoldings.find((h) => h.symbol === symbol);
    if (!holding) return;

    const qtyToExit = Math.min(quantity, holding.quantity);
    const costBasis = qtyToExit * holding.averageCost;
    const realizedVal = qtyToExit * exitPrice;
    const realizedPL = realizedVal - costBasis;

    // Reduce or remove the holding
    setPortfolioHoldings((prev) =>
      prev
        .map((h) => {
          if (h.symbol === symbol) {
            const newQty = h.quantity - qtyToExit;
            if (newQty <= 0) return null;
            const marketValue = newQty * h.lastPrice;
            const unrealizedPL = marketValue - newQty * h.averageCost;
            const unrealizedPLPercent = h.averageCost > 0 ? (unrealizedPL / (newQty * h.averageCost)) * 100 : 0;
            return {
              ...h,
              quantity: newQty,
              marketValue,
              unrealizedPL,
              unrealizedPLPercent,
            };
          }
          return h;
        })
        .filter((h): h is PortfolioHolding => h !== null)
    );

    // Create a closed trade entry in the Trade Journal
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
      plannedRisk: qtyToExit * (holding.averageCost * 0.05),
      expectedRR: 3.0,
      status: 'CLOSED',
      exitPrice,
      exitDate: new Date().toISOString().split('T')[0],
      fees: 150,
      realizedPL: realizedPL - 150,
      rMultiple: parseFloat(((realizedPL - 150) / (qtyToExit * (holding.averageCost * 0.05) || 1)).toFixed(2)),
      entryReason: 'Position imported from Portfolio holding.',
      exitReason,
      whatWentWell: 'Position exit managed and logged via Portfolio controls.',
      whatWentWrong: '',
      ruleFollowed: true,
      mistakeTags: [],
      emotionalState: 'Neutral',
      notes: `Note from portfolio: ${holding.notes}`,
      tags: ['PortfolioExit'],
    };

    setJournalEntries((prev) => [newJournalEntry, ...prev]);

    // Re-calculate Portfolio Summary values based on updated holdings
    setPortfolioSummary((prev) => {
      const updatedHoldings = portfolioHoldings.map((h) => {
        if (h.symbol === symbol) {
          const newQty = h.quantity - qtyToExit;
          return { ...h, quantity: newQty };
        }
        return h;
      }).filter(h => h.quantity > 0);

      const totalMarketVal = updatedHoldings.reduce((sum, h) => sum + h.quantity * h.lastPrice, 0);
      const totalCostBasis = updatedHoldings.reduce((sum, h) => sum + h.quantity * h.averageCost, 0);
      const unrealizedPL = totalMarketVal - totalCostBasis;
      const unrealizedPLPercent = totalCostBasis > 0 ? (unrealizedPL / totalCostBasis) * 100 : 0;

      return {
        ...prev,
        portfolioValue: totalMarketVal,
        totalCost: totalCostBasis,
        unrealizedPL,
        unrealizedPLPercent,
      };
    });
  };

  // Journal Actions
  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `journ-${Date.now()}`,
    };
    setJournalEntries((prev) => [newEntry, ...prev]);
  };

  const updateJournalEntry = (id: string, entryUpdates: Partial<JournalEntry>) => {
    setJournalEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          const updated = { ...entry, ...entryUpdates };
          // Re-calculate plannedRisk & expectedRR if relevant parameters change
          if (entryUpdates.quantity || entryUpdates.entryPrice || entryUpdates.stopLoss) {
            updated.plannedRisk = updated.quantity * Math.abs(updated.entryPrice - updated.stopLoss);
          }
          if (entryUpdates.entryPrice || entryUpdates.stopLoss || entryUpdates.target1) {
            const riskPerShare = Math.abs(updated.entryPrice - updated.stopLoss);
            updated.expectedRR = riskPerShare > 0 ? (updated.target1 - updated.entryPrice) / riskPerShare : 0;
          }
          // Re-calculate realizedPL & rMultiple if exit parameters change
          if (updated.status === 'CLOSED' && updated.exitPrice !== undefined) {
            const priceDiff = updated.side === 'LONG' 
              ? (updated.exitPrice - updated.entryPrice) 
              : (updated.entryPrice - updated.exitPrice);
            const rawPL = updated.quantity * priceDiff;
            const fees = updated.fees || 0;
            updated.realizedPL = rawPL - fees;
            updated.rMultiple = updated.plannedRisk > 0 ? updated.realizedPL / updated.plannedRisk : 0;
          }
          return updated;
        }
        return entry;
      })
    );
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const clearJournal = () => {
    setJournalEntries([]);
  };

  const loadDemoJournal = () => {
    setJournalEntries(journalEntriesMockData);
  };

  return (
    <MarketContext.Provider
      value={{
        candidates,
        
        // Watchlist
        watchlistSymbols,
        addToWatchlist,
        removeFromWatchlist,
        watchlistAlerts,
        addWatchlistAlert,
        removeWatchlistAlert,
        clearWatchlist,

        // Scanner/Signals
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

        // Portfolio
        isPortfolioConnected,
        setIsPortfolioConnected,
        portfolioHoldings,
        setPortfolioHoldings,
        portfolioSummary,
        loadDemoPortfolio,
        disconnectPortfolio,
        addPortfolioHoldingNote,
        recordPortfolioExit,

        // Journal
        journalEntries,
        setJournalEntries,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        clearJournal,
        loadDemoJournal,

        // Market Regime Module
        regimePeriod,
        setRegimePeriod,
        activeRegimeState,
        setActiveRegimeState,
        regimeTimestamp,
        runRegimeRefresh,
        isRefreshingRegime,

        // Sector Analysis Module
        selectedSectorId,
        setSelectedSectorId,
        sectorTimestamp,
        runSectorRefresh,
        isRefreshingSectors,

        // Strategy Backtest Module
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
