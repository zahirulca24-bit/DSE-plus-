export interface KpiData {
  label: string;
  value: string;
  change: string;
  changePercent: number;
  isPositive: boolean;
  isNegative: boolean;
  isNeutral: boolean;
  context: string;
}

export interface ChartDataPoint {
  time: string;
  value: number;
  volume: number;
}

export interface MoverItem {
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: string;
  turnover: string;
}

export interface WatchlistStock {
  symbol: string;
  name: string;
  lastPrice: number;
  changePercent: number;
  volumeStatus: 'HIGH' | 'NORMAL' | 'LOW';
  trend: 'UP' | 'DOWN' | 'FLAT';
}

export interface SectorItem {
  name: string;
  changePercent: number;
  advancers: number;
  decliners: number;
  unchanged: number;
  relativeStrength: 'STRONG' | 'MODERATE' | 'WEAK';
}

export const kpiMockData: KpiData[] = [
  {
    label: 'DSEX Index',
    value: '5,432.18',
    change: '+14.52',
    changePercent: 0.27,
    isPositive: true,
    isNegative: false,
    isNeutral: false,
    context: 'Dhaka Stock Exchange Broad Index'
  },
  {
    label: 'Market Turnover',
    value: '৳4.82B',
    change: '-12.4%',
    changePercent: -12.4,
    isPositive: false,
    isNegative: true,
    isNeutral: false,
    context: 'Total daily trading volume'
  },
  {
    label: 'Advancing Stocks',
    value: '184',
    change: '+12',
    changePercent: 6.9,
    isPositive: true,
    isNegative: false,
    isNeutral: false,
    context: 'Equities closing higher'
  },
  {
    label: 'Declining Stocks',
    value: '142',
    change: '-8',
    changePercent: -5.3,
    isPositive: false,
    isNegative: true,
    isNeutral: false,
    context: 'Equities closing lower'
  },
  {
    label: 'Unchanged Stocks',
    value: '68',
    change: '0',
    changePercent: 0,
    isPositive: false,
    isNegative: false,
    isNeutral: true,
    context: 'No price deviation'
  },
  {
    label: 'Market Breadth Ratio',
    value: '1.30',
    change: '+0.15',
    changePercent: 13.0,
    isPositive: true,
    isNegative: false,
    isNeutral: false,
    context: 'Advancers to Decliners ratio'
  }
];

export const chartTrendMockData: Record<string, ChartDataPoint[]> = {
  '1D': [
    { time: '10:00', value: 5418.5, volume: 150000 },
    { time: '10:30', value: 5422.1, volume: 240000 },
    { time: '11:00', value: 5420.3, volume: 180000 },
    { time: '11:30', value: 5415.8, volume: 310000 },
    { time: '12:00', value: 5425.2, volume: 420000 },
    { time: '12:30', value: 5428.9, volume: 290000 },
    { time: '13:00', value: 5430.1, volume: 350000 },
    { time: '13:30', value: 5427.4, volume: 190000 },
    { time: '14:00', value: 5432.18, volume: 510000 }
  ],
  '1W': [
    { time: 'Mon', value: 5390.2, volume: 2100000 },
    { time: 'Tue', value: 5405.6, volume: 2350000 },
    { time: 'Wed', value: 5388.1, volume: 1950000 },
    { time: 'Thu', value: 5412.4, volume: 2600000 },
    { time: 'Fri', value: 5432.18, volume: 2800000 }
  ],
  '1M': [
    { time: 'W1', value: 5340.0, volume: 11000000 },
    { time: 'W2', value: 5385.5, volume: 12500000 },
    { time: 'W3', value: 5360.2, volume: 10800000 },
    { time: 'W4', value: 5432.18, volume: 13900000 }
  ],
  '3M': [
    { time: 'Apr', value: 5210.4, volume: 48000000 },
    { time: 'May', value: 5295.8, volume: 51200000 },
    { time: 'Jun', value: 5432.18, volume: 54500000 }
  ]
};

export const moversMockData: {
  gainers: MoverItem[];
  losers: MoverItem[];
  active: MoverItem[];
} = {
  gainers: [
    { symbol: 'GP', name: 'Grameenphone Ltd.', lastPrice: 284.5, change: 13.5, changePercent: 4.98, volume: '1.2M', turnover: '৳341.4M' },
    { symbol: 'BATBC', name: 'British American Tobacco BD', lastPrice: 418.2, change: 18.7, changePercent: 4.68, volume: '840K', turnover: '৳351.3M' },
    { symbol: 'SQURPHARMA', name: 'Square Pharmaceuticals Ltd.', lastPrice: 212.4, change: 8.9, changePercent: 4.37, volume: '2.1M', turnover: '৳446.0M' },
    { symbol: 'LHBL', name: 'LafargeHolcim Bangladesh Ltd.', lastPrice: 65.8, change: 2.3, changePercent: 3.62, volume: '3.4M', turnover: '৳223.7M' },
    { symbol: 'BEXIMCO', name: 'Beximco Limited', lastPrice: 115.6, change: 3.8, changePercent: 3.40, volume: '1.8M', turnover: '৳208.1M' }
  ],
  losers: [
    { symbol: 'RENATA', name: 'Renata Limited', lastPrice: 785.4, change: -41.2, changePercent: -4.98, volume: '120K', turnover: '৳94.2M' },
    { symbol: 'UPGDCL', name: 'United Power Generation Co.', lastPrice: 184.2, change: -8.6, changePercent: -4.46, volume: '450K', turnover: '৳82.9M' },
    { symbol: 'MJLBD', name: 'MJL Bangladesh Limited', lastPrice: 84.5, change: -3.7, changePercent: -4.20, volume: '620K', turnover: '৳52.4M' },
    { symbol: 'BRACBANK', name: 'BRAC Bank Limited', lastPrice: 38.2, change: -1.5, changePercent: -3.78, volume: '1.9M', turnover: '৳72.6M' },
    { symbol: 'EBL', name: 'Eastern Bank Limited', lastPrice: 31.4, change: -1.1, changePercent: -3.38, volume: '980K', turnover: '৳30.8M' }
  ],
  active: [
    { symbol: 'SQURPHARMA', name: 'Square Pharmaceuticals Ltd.', lastPrice: 212.4, change: 8.9, changePercent: 4.37, volume: '2.1M', turnover: '৳446.0M' },
    { symbol: 'BATBC', name: 'British American Tobacco BD', lastPrice: 418.2, change: 18.7, changePercent: 4.68, volume: '840K', turnover: '৳351.3M' },
    { symbol: 'GP', name: 'Grameenphone Ltd.', lastPrice: 284.5, change: 13.5, changePercent: 4.98, volume: '1.2M', turnover: '৳341.4M' },
    { symbol: 'LHBL', name: 'LafargeHolcim Bangladesh Ltd.', lastPrice: 65.8, change: 2.3, changePercent: 3.62, volume: '3.4M', turnover: '৳223.7M' },
    { symbol: 'BEXIMCO', name: 'Beximco Limited', lastPrice: 115.6, change: 3.8, changePercent: 3.40, volume: '1.8M', turnover: '৳208.1M' }
  ]
};

export const watchlistMockData: WatchlistStock[] = [
  { symbol: 'GP', name: 'Grameenphone Ltd.', lastPrice: 284.50, changePercent: 4.98, volumeStatus: 'HIGH', trend: 'UP' },
  { symbol: 'BATBC', name: 'British American Tobacco BD', lastPrice: 418.20, changePercent: 4.68, volumeStatus: 'HIGH', trend: 'UP' },
  { symbol: 'BRACBANK', name: 'BRAC Bank Limited', lastPrice: 38.20, changePercent: -3.78, volumeStatus: 'NORMAL', trend: 'DOWN' },
  { symbol: 'SQURPHARMA', name: 'Square Pharmaceuticals Ltd.', lastPrice: 212.40, changePercent: 4.37, volumeStatus: 'HIGH', trend: 'UP' },
  { symbol: 'RENATA', name: 'Renata Limited', lastPrice: 785.40, changePercent: -4.98, volumeStatus: 'LOW', trend: 'DOWN' }
];

export const sectorMockData: SectorItem[] = [
  { name: 'Pharmaceuticals', changePercent: 1.82, advancers: 18, decliners: 8, unchanged: 4, relativeStrength: 'STRONG' },
  { name: 'Banking', changePercent: -0.65, advancers: 12, decliners: 16, unchanged: 2, relativeStrength: 'MODERATE' },
  { name: 'Engineering', changePercent: 0.94, advancers: 22, decliners: 15, unchanged: 8, relativeStrength: 'STRONG' },
  { name: 'Fuel & Power', changePercent: -1.12, advancers: 6, decliners: 14, unchanged: 3, relativeStrength: 'WEAK' },
  { name: 'Food & Allied', changePercent: 2.45, advancers: 11, decliners: 4, unchanged: 2, relativeStrength: 'STRONG' },
  { name: 'Textiles', changePercent: 0.15, advancers: 25, decliners: 24, unchanged: 12, relativeStrength: 'MODERATE' },
  { name: 'Telecommunications', changePercent: 4.98, advancers: 2, decliners: 1, unchanged: 0, relativeStrength: 'STRONG' },
  { name: 'Insurance', changePercent: -0.42, advancers: 15, decliners: 18, unchanged: 7, relativeStrength: 'MODERATE' }
];

export const marketRegimeMockData = {
  status: 'Neutral',
  breadthScore: 54,
  trendScore: 48,
  volumeScore: 51,
  participationScore: 57,
  note: 'Regime classification will be provided by the market engine after API integration.'
};

export const portfolioRiskMockData = {
  totalValue: 'Not Connected',
  todayPL: 'Not Connected',
  cashExposure: 'Not Connected',
  largestSector: 'Not Connected',
  largestPosition: 'Not Connected',
  healthScore: 'Not Connected',
  note: 'Portfolio analytics will appear after holdings are imported or connected.'
};
