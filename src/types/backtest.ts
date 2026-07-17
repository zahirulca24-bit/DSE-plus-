export interface BacktestConfig {
  strategy: string;
  symbol: string;
  sector: string;
  allSymbols: boolean;
  startDate: string;
  endDate: string;
  initialCapital: number;
  riskPerTradePercent: number;
  stopLossPercent: number;
  targetPercent: number;
  minRR: number;
  maxConcurrentPositions: number;
  tradingFeePercent: number;
  slippagePercent: number;
  minVolume: number;
  trendFilter: boolean;
  gradeFilter: string;
  sectorFilter: string;
  longOnly: boolean;
  excludeLowLiquidity: boolean;
}

export interface BacktestTrade {
  tradeId: string;
  date: string;
  exitDate: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  strategy: string;
  entry: number;
  stop: number;
  target: number;
  exit: number;
  quantity: number;
  fees: number;
  pl: number; // profit/loss amount
  rMultiple: number;
  holdingPeriod: number; // in days
  exitReason: string;
  entryReason: string;
  ruleComplianceStatus: 'Fully Compliant' | 'Partial Violation' | 'Rule Breach';
}

export interface BacktestResult {
  strategyName: string;
  runTimestamp: string;
  configUsed: BacktestConfig;
  metrics: {
    initialCapital: number;
    endingCapital: number;
    netProfit: number;
    totalReturnPercent: number;
    totalTrades: number;
    winRate: number; // e.g., 54.5
    profitFactor: number; // e.g., 1.85
    averageR: number; // e.g., 1.2
    maxDrawdown: number; // e.g., -12.4
    avgHoldingPeriod: number; // e.g., 14.5
  };
  equityCurve: { date: string; equity: number; drawdown: number }[];
  drawdownCurve: { date: string; drawdown: number }[];
  tradeLog: BacktestTrade[];
  winLossDistribution: { name: string; value: number }[];
  rMultipleDistribution: { range: string; count: number }[];
  monthlyPerformance: { month: string; trades: number; winRate: number; netPL: number; returnPercent: number }[];
}

export interface StrategyComparisonRow {
  strategyName: string;
  returnPercent: number;
  winRate: number;
  profitFactor: number;
  averageR: number;
  maxDrawdown: number;
  totalTrades: number;
  riskAdjustedScore: number;
  neutralInterpretation: string;
}
