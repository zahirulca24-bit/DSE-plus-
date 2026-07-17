import { SectorData, SectorStock } from '../types/sector';

export const dseSectorsMock: SectorData[] = [
  { id: 'bank', name: 'Bank', score: 85, changePercent: 1.2, trend: 'UP', volume: 1540.5, breadth: '24 Adv / 6 Dec', relativeStrength: 'Strong', momentum: 'High', participation: 'Demo participation', riskStatus: 'Low', regime: 'Bullish', avgRsi: 65, advancingCount: 24, decliningCount: 6, unchangedCount: 2 },
  { id: 'cement', name: 'Cement', score: 45, changePercent: -0.8, trend: 'DOWN', volume: 210.2, breadth: '2 Adv / 5 Dec', relativeStrength: 'Weak', momentum: 'Low', participation: 'Demo participation', riskStatus: 'High', regime: 'Bearish', avgRsi: 41, advancingCount: 2, decliningCount: 5, unchangedCount: 0 },
  { id: 'ceramics', name: 'Ceramics', score: 65, changePercent: 0.5, trend: 'UP', volume: 120.8, breadth: '3 Adv / 2 Dec', relativeStrength: 'Improving', momentum: 'High', participation: 'Demo participation', riskStatus: 'Medium', regime: 'Neutral', avgRsi: 54, advancingCount: 3, decliningCount: 2, unchangedCount: 0 },
  { id: 'engineering', name: 'Engineering', score: 72, changePercent: 2.1, trend: 'UP', volume: 850.4, breadth: '28 Adv / 12 Dec', relativeStrength: 'Strong', momentum: 'High', participation: 'Demo participation', riskStatus: 'Low', regime: 'Bullish', avgRsi: 59, advancingCount: 28, decliningCount: 12, unchangedCount: 4 },
  { id: 'financial_institutions', name: 'Financial Institutions', score: 50, changePercent: 0.0, trend: 'NEUTRAL', volume: 340.6, breadth: '10 Adv / 10 Dec', relativeStrength: 'Neutral', momentum: 'Low', participation: 'Demo participation', riskStatus: 'Medium', regime: 'Neutral', avgRsi: 48, advancingCount: 10, decliningCount: 10, unchangedCount: 3 },
  { id: 'food_allied', name: 'Food & Allied', score: 88, changePercent: 1.5, trend: 'UP', volume: 670.3, breadth: '15 Adv / 4 Dec', relativeStrength: 'Strong', momentum: 'High', participation: 'Demo participation', riskStatus: 'Low', regime: 'Bullish', avgRsi: 68, advancingCount: 15, decliningCount: 4, unchangedCount: 2 },
  { id: 'fuel_power', name: 'Fuel & Power', score: 40, changePercent: -1.2, trend: 'DOWN', volume: 450.9, breadth: '4 Adv / 18 Dec', relativeStrength: 'Weak', momentum: 'Low', participation: 'Demo participation', riskStatus: 'High', regime: 'Bearish', avgRsi: 38, advancingCount: 4, decliningCount: 18, unchangedCount: 3 },
  { id: 'insurance', name: 'Insurance', score: 92, changePercent: 3.4, trend: 'UP', volume: 1280.1, breadth: '42 Adv / 8 Dec', relativeStrength: 'Strong', momentum: 'High', participation: 'Demo participation', riskStatus: 'Medium', regime: 'Bullish', avgRsi: 72, advancingCount: 42, decliningCount: 8, unchangedCount: 5 },
  { id: 'it_sector', name: 'IT Sector', score: 78, changePercent: 1.8, trend: 'UP', volume: 520.2, breadth: '8 Adv / 3 Dec', relativeStrength: 'Improving', momentum: 'High', participation: 'Demo participation', riskStatus: 'High', regime: 'Recovery', avgRsi: 61, advancingCount: 8, decliningCount: 3, unchangedCount: 1 },
  { id: 'jute', name: 'Jute', score: 30, changePercent: -2.5, trend: 'DOWN', volume: 50.4, breadth: '0 Adv / 3 Dec', relativeStrength: 'Weak', momentum: 'Low', participation: 'Demo participation', riskStatus: 'High', regime: 'Bearish', avgRsi: 32, advancingCount: 0, decliningCount: 3, unchangedCount: 0 },
  { id: 'miscellaneous', name: 'Miscellaneous', score: 60, changePercent: 0.2, trend: 'UP', volume: 280.7, breadth: '6 Adv / 5 Dec', relativeStrength: 'Neutral', momentum: 'High', participation: 'Demo participation', riskStatus: 'Medium', regime: 'Neutral', avgRsi: 53, advancingCount: 6, decliningCount: 5, unchangedCount: 3 },
  { id: 'paper_printing', name: 'Paper & Printing', score: 38, changePercent: -1.5, trend: 'DOWN', volume: 110.5, breadth: '1 Adv / 5 Dec', relativeStrength: 'Weak', momentum: 'Low', participation: 'Demo participation', riskStatus: 'High', regime: 'Bearish', avgRsi: 35, advancingCount: 1, decliningCount: 5, unchangedCount: 0 },
  { id: 'pharmaceuticals_chemicals', name: 'Pharmaceuticals & Chemicals', score: 95, changePercent: 2.8, trend: 'UP', volume: 1820.7, breadth: '28 Adv / 3 Dec', relativeStrength: 'Strong', momentum: 'High', participation: 'Demo participation', riskStatus: 'Low', regime: 'Bullish', avgRsi: 75, advancingCount: 28, decliningCount: 3, unchangedCount: 1 },
  { id: 'services_real_estate', name: 'Services & Real Estate', score: 48, changePercent: -0.4, trend: 'DOWN', volume: 180.2, breadth: '2 Adv / 6 Dec', relativeStrength: 'Weak', momentum: 'Low', participation: 'Demo participation', riskStatus: 'High', regime: 'Distribution', avgRsi: 44, advancingCount: 2, decliningCount: 6, unchangedCount: 1 },
  { id: 'tannery_industries', name: 'Tannery Industries', score: 35, changePercent: -1.8, trend: 'DOWN', volume: 90.1, breadth: '1 Adv / 5 Dec', relativeStrength: 'Weak', momentum: 'Low', participation: 'Demo participation', riskStatus: 'High', regime: 'Bearish', avgRsi: 33, advancingCount: 1, decliningCount: 5, unchangedCount: 0 },
  { id: 'telecommunication', name: 'Telecommunication', score: 82, changePercent: 1.1, trend: 'UP', volume: 760.4, breadth: '3 Adv / 0 Dec', relativeStrength: 'Strong', momentum: 'High', participation: 'Demo participation', riskStatus: 'Low', regime: 'Bullish', avgRsi: 64, advancingCount: 3, decliningCount: 0, unchangedCount: 0 },
  { id: 'textile', name: 'Textile', score: 58, changePercent: 0.4, trend: 'UP', volume: 1030.9, breadth: '35 Adv / 22 Dec', relativeStrength: 'Improving', momentum: 'High', participation: 'Demo participation', riskStatus: 'Medium', regime: 'Neutral', avgRsi: 52, advancingCount: 35, decliningCount: 22, unchangedCount: 8 },
  { id: 'travel_leisure', name: 'Travel & Leisure', score: 52, changePercent: 0.2, trend: 'UP', volume: 115.6, breadth: '2 Adv / 2 Dec', relativeStrength: 'Neutral', momentum: 'Low', participation: 'Demo participation', riskStatus: 'Medium', regime: 'Neutral', avgRsi: 49, advancingCount: 2, decliningCount: 2, unchangedCount: 1 },
];

export const sectorStocksMock: Record<string, SectorStock[]> = {
  bank: [
    { symbol: 'BRACBANK', companyName: 'BRAC Bank PLC', price: 42.5, changePercent: 1.8, rsi: 68, volume: 450 },
    { symbol: 'EBL', companyName: 'Eastern Bank PLC', price: 34.2, changePercent: 1.1, rsi: 63, volume: 320 },
    { symbol: 'CITYBANK', companyName: 'The City Bank PLC', price: 23.8, changePercent: 0.8, rsi: 58, volume: 290 },
  ],
  pharmaceuticals_chemicals: [
    { symbol: 'SQURPHARMA', companyName: 'Square Pharmaceuticals PLC', price: 215.4, changePercent: 3.2, rsi: 78, volume: 820 },
    { symbol: 'RENATA', companyName: 'Renata PLC', price: 810.5, changePercent: 2.1, rsi: 74, volume: 450 },
    { symbol: 'BXPHARMA', companyName: 'Beximco Pharmaceuticals PLC', price: 135.2, changePercent: 1.5, rsi: 68, volume: 380 },
  ],
  telecommunication: [
    { symbol: 'GP', companyName: 'Grameenphone Ltd.', price: 282.4, changePercent: 1.4, rsi: 66, volume: 510 },
    { symbol: 'ROBI', companyName: 'Robi Axiata PLC', price: 28.5, changePercent: 0.7, rsi: 61, volume: 210 },
    { symbol: 'BSCCL', companyName: 'Bangladesh Submarine Cables', price: 162.1, changePercent: 1.2, rsi: 65, volume: 40 },
  ],
  cement: [
    { symbol: 'LAFSURCEML', companyName: 'LafargeHolcim Bangladesh PLC', price: 58.4, changePercent: -1.2, rsi: 38, volume: 120 },
    { symbol: 'HEIDELBCEM', companyName: 'Heidelberg Materials BD', price: 242.0, changePercent: -0.5, rsi: 44, volume: 45 },
  ],
  engineering: [
    { symbol: 'BSRMLTD', companyName: 'BSRM Steels Limited', price: 82.3, changePercent: 2.5, rsi: 64, volume: 350 },
    { symbol: 'GPHISPAT', companyName: 'GPH Ispat Limited', price: 29.8, changePercent: 1.8, rsi: 58, volume: 220 },
    { symbol: 'SINGERBD', companyName: 'Singer Bangladesh Limited', price: 145.5, changePercent: 1.2, rsi: 55, volume: 180 },
  ],
};

export const getSectorStocksMock = (sectorId: string): SectorStock[] => {
  return sectorStocksMock[sectorId] || [
    { symbol: 'DEMO1', companyName: 'Demo Asset 1 PLC', price: 12.5, changePercent: 0.5, rsi: 50, volume: 50 },
    { symbol: 'DEMO2', companyName: 'Demo Asset 2 PLC', price: 45.8, changePercent: -0.8, rsi: 45, volume: 40 },
    { symbol: 'DEMO3', companyName: 'Demo Asset 3 PLC', price: 112.3, changePercent: 1.2, rsi: 55, volume: 80 },
  ];
};
