export type JournalStatus = 'PLANNED' | 'OPEN' | 'CLOSED' | 'CANCELLED';

export interface JournalEntry {
  id: string;
  symbol: string;
  company: string;
  sector: string;
  tradeDate: string;
  side: 'LONG' | 'SHORT';
  setup: string;
  grade: 'A+' | 'A' | 'B+' | 'REJECT';
  score: number;
  
  // Trade Plan
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  quantity: number;
  plannedRisk: number; // calculated: quantity * abs(entryPrice - stopLoss)
  expectedRR: number; // calculated: (target1 - entryPrice) / abs(entryPrice - stopLoss)

  // Trade Result
  status: JournalStatus;
  exitPrice?: number;
  exitDate?: string;
  fees?: number;
  realizedPL?: number; // quantity * (exit - entry) for LONG, minus fees
  rMultiple?: number; // realizedPL / plannedRisk

  // Qualitative review
  entryReason: string;
  exitReason: string;
  whatWentWell: string;
  whatWentWrong: string;
  ruleFollowed: boolean;
  mistakeTags: string[];
  emotionalState: string;
  notes: string;
  tags: string[];
}

export interface JournalAnalytics {
  totalTrades: number;
  openPlans: number;
  closedTrades: number;
  winRate: number; // percentage of closed trades with positive realizedPL
  averageR: number; // average rMultiple of closed trades
  netRealizedPL: number;
}
