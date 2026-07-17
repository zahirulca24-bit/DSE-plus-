export interface SectorData {
  id: string;
  name: string;
  score: number; // 0 to 100
  changePercent: number;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  volume: number; // in millions BDT
  breadth: string; // e.g., "15 Adv / 5 Dec"
  relativeStrength: string; // e.g., "Strong", "Improving", "Weak"
  momentum: string; // e.g., "High", "Low"
  participation: string; // e.g., "High Institutional", "Retail Dominated"
  riskStatus: 'Low' | 'Medium' | 'High';
  regime: 'Bullish' | 'Bearish' | 'Neutral' | 'Recovery' | 'Distribution';
  avgRsi: number;
  advancingCount: number;
  decliningCount: number;
  unchangedCount: number;
}

export interface SectorStock {
  symbol: string;
  companyName: string;
  price: number;
  changePercent: number;
  rsi: number;
  volume: number;
}
