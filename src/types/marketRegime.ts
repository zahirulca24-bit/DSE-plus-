export type RegimeState = 'Bullish' | 'Bearish' | 'Neutral' | 'Recovery' | 'Distribution';

export interface RegimeConfig {
  regime: RegimeState;
  riskLevel: string;
  trendBias: string;
  participation: string;
  breadth: string;
  volume: string;
  volatility: string;
  operatingPosture: string;
}

export interface RegimeHistoryPoint {
  date: string;
  score: number;
  label: RegimeState;
  trendValue: number;
}
