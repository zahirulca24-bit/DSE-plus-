export interface PortfolioHolding {
  id: string;
  symbol: string;
  company: string;
  quantity: number;
  averageCost: number;
  lastPrice: number;
  marketValue: number; // qty * lastPrice
  unrealizedPL: number; // marketValue - (qty * averageCost)
  unrealizedPLPercent: number; // unrealizedPL / costBasis * 100
  todayChange: number; // percentage change today
  portfolioWeight: number; // portion of overall portfolio
  sector: string;
  grade: 'A+' | 'A' | 'B+' | 'REJECT';
  riskStatus: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string;
  notesUpdatedAt?: string;
}

export interface PortfolioSummary {
  portfolioValue: number;
  totalCost: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  todayPL: number;
  todayPLPercent: number;
  cashAllocation: number; // as percentage or value
  cashValue: number;
  healthScore: number; // 0-100 rating
}
