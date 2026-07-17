import { PortfolioHolding, PortfolioSummary } from '../types/portfolio';

export const portfolioHoldingsMockData: PortfolioHolding[] = [
  {
    id: 'hold-gp',
    symbol: 'GP',
    company: 'Grameenphone Ltd.',
    quantity: 1000,
    averageCost: 275.5,
    lastPrice: 284.5,
    marketValue: 284500,
    unrealizedPL: 9000,
    unrealizedPLPercent: 3.27,
    todayChange: 4.98,
    portfolioWeight: 31.7,
    sector: 'Telecommunications',
    grade: 'A+',
    riskStatus: 'LOW',
    notes: 'Long-term dividend hold. Rebounding off horizontal support floor cleanly.',
    notesUpdatedAt: '16 Jul 2026 14:15'
  },
  {
    id: 'hold-squar',
    symbol: 'SQURPHARMA',
    company: 'Square Pharmaceuticals Ltd.',
    quantity: 2000,
    averageCost: 204.2,
    lastPrice: 212.4,
    marketValue: 424800,
    unrealizedPL: 16400,
    unrealizedPLPercent: 8.03,
    todayChange: 4.37,
    portfolioWeight: 47.3,
    sector: 'Pharmaceuticals',
    grade: 'A+',
    riskStatus: 'LOW',
    notes: 'Institutional cornerstone. Technicals showing highly positive momentum breakout.',
    notesUpdatedAt: '16 Jul 2026 14:10'
  },
  {
    id: 'hold-batbc',
    symbol: 'BATBC',
    company: 'British American Tobacco BD',
    quantity: 300,
    averageCost: 428.0,
    lastPrice: 418.2,
    marketValue: 125460,
    unrealizedPL: -2940,
    unrealizedPLPercent: -2.29,
    todayChange: 4.68,
    portfolioWeight: 14.0,
    sector: 'Food & Allied',
    grade: 'A',
    riskStatus: 'MEDIUM',
    notes: 'Position entered during double-bottom retest. Under pressure but structurally intact.',
    notesUpdatedAt: '16 Jul 2026 14:12'
  },
  {
    id: 'hold-city',
    symbol: 'CITYBANK',
    company: 'The City Bank Limited',
    quantity: 2500,
    averageCost: 25.4,
    lastPrice: 24.8,
    marketValue: 62000,
    unrealizedPL: -1500,
    unrealizedPLPercent: -2.36,
    todayChange: 1.2,
    portfolioWeight: 7.0,
    sector: 'Banking',
    grade: 'B+',
    riskStatus: 'HIGH',
    notes: 'Coiling structure. If support at 23.5 breaks, exit position completely.',
    notesUpdatedAt: '16 Jul 2026 14:18'
  }
];

export const portfolioSummaryMockData: PortfolioSummary = {
  portfolioValue: 896760,
  totalCost: 875800,
  unrealizedPL: 20960,
  unrealizedPLPercent: 2.39,
  todayPL: 39540,
  todayPLPercent: 4.61,
  cashAllocation: 10.3,
  cashValue: 103240,
  healthScore: 88
};
