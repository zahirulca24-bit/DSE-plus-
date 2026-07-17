import { RegimeState } from '../types/marketRegime';

export interface ScorecardRule {
  id: string;
  label: string;
  score: number;
  status: string;
  interpretation: string;
}

export const scorecardConfigs: Record<RegimeState, ScorecardRule[]> = {
  Neutral: [
    { id: 'trend', label: 'Trend Score', score: 55, status: 'Neutral Bias', interpretation: 'DSEX trading within medium-term consolidation brackets.' },
    { id: 'breadth', label: 'Breadth Score', score: 52, status: 'Balanced', interpretation: 'Advance-Decline count evenly matched across capital tiers.' },
    { id: 'momentum', label: 'Momentum Score', score: 48, status: 'Flat', interpretation: 'Aggregated RSI levels clustering in the 45-55 neutral zone.' },
    { id: 'volume', label: 'Volume Score', score: 45, status: 'Below Average', interpretation: 'Market turnover hovering 15% below the 20-day moving average volume.' },
    { id: 'participation', label: 'Participation Score', score: 50, status: 'Selective', interpretation: 'Concentration of volume restricted to 4 key blue-chip symbols.' },
    { id: 'volatility', label: 'Volatility Score', score: 38, status: 'Moderate', interpretation: 'Average daily range compressed; low impulse expansion threats.' }
  ],
  Bullish: [
    { id: 'trend', label: 'Trend Score', score: 85, status: 'Strong Bullish', interpretation: 'DSEX trading above ascending 20, 50, and 200 EMA structures.' },
    { id: 'breadth', label: 'Breadth Score', score: 82, status: 'Advancing Dominant', interpretation: 'Broad participation with over 70% of active listings advancing.' },
    { id: 'momentum', label: 'Momentum Score', score: 78, status: 'High Momentum', interpretation: 'Aggregated RSI levels holding firm in the 65-75 bullish zone.' },
    { id: 'volume', label: 'Volume Score', score: 80, status: 'Elevated Turnover', interpretation: 'Daily turnover expanding consistently on positive session closes.' },
    { id: 'participation', label: 'Participation Score', score: 85, status: 'Broad-Based', interpretation: 'Institutional and retail participation expanding across all sectors.' },
    { id: 'volatility', label: 'Volatility Score', score: 42, status: 'Normal Expansion', interpretation: 'Moderate volatility supporting sustainable impulse legs.' }
  ],
  Bearish: [
    { id: 'trend', label: 'Trend Score', score: 18, status: 'Strong Bearish', interpretation: 'DSEX locked below descending 20, 50, and 200 EMAs.' },
    { id: 'breadth', label: 'Breadth Score', score: 12, status: 'Declining Dominant', interpretation: 'Mass liquidation waves with under 10% of active listings advancing.' },
    { id: 'momentum', label: 'Momentum Score', score: 15, status: 'Oversold Depths', interpretation: 'RSI levels buried deep in extreme oversold territory below 30.' },
    { id: 'volume', label: 'Volume Score', score: 70, status: 'Panic Liquidations', interpretation: 'Volume spikes on descending sessions confirming distribution.' },
    { id: 'participation', label: 'Participation Score', score: 20, status: 'Illiquid Freeze', interpretation: 'Bids disappearing on major small-cap and mid-cap listings.' },
    { id: 'volatility', label: 'Volatility Score', score: 85, status: 'Extreme Risk', interpretation: 'Gap-down frequency and average daily range expanding dangerously.' }
  ],
  Recovery: [
    { id: 'trend', label: 'Trend Score', score: 62, status: 'Early Accumulation', interpretation: 'DSEX stabilizing above short-term EMAs; attempting base breakout.' },
    { id: 'breadth', label: 'Breadth Score', score: 65, status: 'Positive Divergence', interpretation: 'Advancers leading decliners while index makes a final low test.' },
    { id: 'momentum', label: 'Momentum Score', score: 58, status: 'Rising Strengths', interpretation: 'RSI climbing steadily out of oversold territory toward 50+.' },
    { id: 'volume', label: 'Volume Score', score: 60, status: 'Accumulation Volume', interpretation: 'Buying volume expanding while sell waves dry up significantly.' },
    { id: 'participation', label: 'Participation Score', score: 55, status: 'Leading Clusters', interpretation: 'Pockets of institutional buying visible in pharma and banking.' },
    { id: 'volatility', label: 'Volatility Score', score: 50, status: 'Contracting', interpretation: 'Dampening oscillation ranges indicating standard consolidation bases.' }
  ],
  Distribution: [
    { id: 'trend', label: 'Trend Score', score: 45, status: 'Topping Fatigue', interpretation: 'Index making marginal highs while momentum indicators diverge.' },
    { id: 'breadth', label: 'Breadth Score', score: 38, status: 'Thinning Market', interpretation: 'Index held up by 2 heavyweights while 80% of stocks fall.' },
    { id: 'momentum', label: 'Momentum Score', score: 42, status: 'Bearish Divergence', interpretation: 'RSI failing to match index highs, pointing to topping behavior.' },
    { id: 'volume', label: 'Volume Score', score: 75, status: 'Hidden Selloffs', interpretation: 'Churning volume at resistance with no progressive index gain.' },
    { id: 'participation', label: 'Participation Score', score: 40, status: 'Institutional Exit', interpretation: 'Block trade selling matches rising retail momentum.' },
    { id: 'volatility', label: 'Volatility Score', score: 68, status: 'Erratic Spikes', interpretation: 'Interday reversals and sudden intraday selloffs expanding.' }
  ]
};
