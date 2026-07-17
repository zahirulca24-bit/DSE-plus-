import { RegimeHistoryPoint, RegimeConfig, RegimeState } from '../types/marketRegime';

export const regimeConfigMock: Record<RegimeState, RegimeConfig> = {
  Neutral: {
    regime: 'Neutral',
    riskLevel: 'Moderate',
    trendBias: 'Mixed',
    participation: 'Selective',
    breadth: 'Balanced',
    volume: 'Normal',
    volatility: 'Moderate',
    operatingPosture: 'Focus on high-quality confirmed setups only.'
  },
  Bullish: {
    regime: 'Bullish',
    riskLevel: 'Low',
    trendBias: 'Strongly Upward',
    participation: 'Broad-Based',
    breadth: 'Strongly Positive',
    volume: 'High / Expanding',
    volatility: 'Low to Moderate',
    operatingPosture: 'Leverage trend-following setups and ride primary winners.'
  },
  Bearish: {
    regime: 'Bearish',
    riskLevel: 'Extreme',
    trendBias: 'Strongly Downward',
    participation: 'Panic Outflows',
    breadth: 'Deeply Negative',
    volume: 'Elevated on selloffs',
    volatility: 'High',
    operatingPosture: 'Prioritize capital protection. Hold Cash. Avoid bargain hunting.'
  },
  Recovery: {
    regime: 'Recovery',
    riskLevel: 'Moderate to High',
    trendBias: 'Bottoming / Turning Up',
    participation: 'Early Accumulation',
    breadth: 'Improving / Divergent',
    volume: 'Steady Accumulation',
    volatility: 'Contraction',
    operatingPosture: 'Gradually accumulate leading sectors on confirmed break-outs.'
  },
  Distribution: {
    regime: 'Distribution',
    riskLevel: 'Elevated',
    trendBias: 'Topping Fatigue',
    participation: 'Institutional Exiting',
    breadth: 'Thinning / Deteriorating',
    volume: 'Erratic Turnover',
    volatility: 'Expanding',
    operatingPosture: 'Tighten trailing stops. Raise Cash. Lock in passive gains.'
  }
};

export const regimeHistoryMock: Record<RegimeState, Record<'1M' | '3M' | '6M' | '1Y', RegimeHistoryPoint[]>> = {
  Neutral: {
    '1M': [
      { date: 'Jun 16', score: 50, label: 'Neutral', trendValue: 6100 },
      { date: 'Jun 23', score: 52, label: 'Neutral', trendValue: 6120 },
      { date: 'Jun 30', score: 48, label: 'Neutral', trendValue: 6080 },
      { date: 'Jul 07', score: 53, label: 'Neutral', trendValue: 6115 },
      { date: 'Jul 16', score: 51, label: 'Neutral', trendValue: 6105 }
    ],
    '3M': [
      { date: 'Apr 16', score: 45, label: 'Neutral', trendValue: 5980 },
      { date: 'Apr 30', score: 48, label: 'Neutral', trendValue: 6020 },
      { date: 'May 15', score: 55, label: 'Neutral', trendValue: 6150 },
      { date: 'May 30', score: 52, label: 'Neutral', trendValue: 6100 },
      { date: 'Jun 15', score: 49, label: 'Neutral', trendValue: 6070 },
      { date: 'Jun 30', score: 50, label: 'Neutral', trendValue: 6090 },
      { date: 'Jul 16', score: 51, label: 'Neutral', trendValue: 6105 }
    ],
    '6M': [
      { date: 'Jan 16', score: 65, label: 'Bullish', trendValue: 6300 },
      { date: 'Feb 16', score: 58, label: 'Distribution', trendValue: 6250 },
      { date: 'Mar 16', score: 38, label: 'Bearish', trendValue: 5800 },
      { date: 'Apr 16', score: 42, label: 'Recovery', trendValue: 5950 },
      { date: 'May 16', score: 54, label: 'Neutral', trendValue: 6120 },
      { date: 'Jun 16', score: 50, label: 'Neutral', trendValue: 6090 },
      { date: 'Jul 16', score: 51, label: 'Neutral', trendValue: 6105 }
    ],
    '1Y': [
      { date: 'Jul 25', score: 70, label: 'Bullish', trendValue: 6400 },
      { date: 'Sep 25', score: 55, label: 'Distribution', trendValue: 6220 },
      { date: 'Nov 25', score: 32, label: 'Bearish', trendValue: 5650 },
      { date: 'Jan 26', score: 40, label: 'Recovery', trendValue: 5850 },
      { date: 'Mar 26', score: 50, label: 'Neutral', trendValue: 6050 },
      { date: 'May 26', score: 52, label: 'Neutral', trendValue: 6110 },
      { date: 'Jul 26', score: 51, label: 'Neutral', trendValue: 6105 }
    ]
  },
  Bullish: {
    '1M': [
      { date: 'Jun 16', score: 78, label: 'Bullish', trendValue: 6300 },
      { date: 'Jun 23', score: 82, label: 'Bullish', trendValue: 6350 },
      { date: 'Jun 30', score: 85, label: 'Bullish', trendValue: 6410 },
      { date: 'Jul 07', score: 88, label: 'Bullish', trendValue: 6480 },
      { date: 'Jul 16', score: 92, label: 'Bullish', trendValue: 6520 }
    ],
    '3M': [
      { date: 'Apr 16', score: 65, label: 'Recovery', trendValue: 6050 },
      { date: 'Apr 30', score: 72, label: 'Bullish', trendValue: 6150 },
      { date: 'May 15', score: 78, label: 'Bullish', trendValue: 6280 },
      { date: 'May 30', score: 81, label: 'Bullish', trendValue: 6320 },
      { date: 'Jun 15', score: 85, label: 'Bullish', trendValue: 6400 },
      { date: 'Jun 30', score: 89, label: 'Bullish', trendValue: 6470 },
      { date: 'Jul 16', score: 92, label: 'Bullish', trendValue: 6520 }
    ],
    '6M': [
      { date: 'Jan 16', score: 50, label: 'Neutral', trendValue: 5950 },
      { date: 'Feb 16', score: 54, label: 'Neutral', trendValue: 6000 },
      { date: 'Mar 16', score: 62, label: 'Recovery', trendValue: 6120 },
      { date: 'Apr 16', score: 75, label: 'Bullish', trendValue: 6250 },
      { date: 'May 16', score: 82, label: 'Bullish', trendValue: 6380 },
      { date: 'Jun 16', score: 87, label: 'Bullish', trendValue: 6450 },
      { date: 'Jul 16', score: 92, label: 'Bullish', trendValue: 6520 }
    ],
    '1Y': [
      { date: 'Jul 25', score: 38, label: 'Bearish', trendValue: 5500 },
      { date: 'Sep 25', score: 45, label: 'Recovery', trendValue: 5720 },
      { date: 'Nov 25', score: 52, label: 'Neutral', trendValue: 5910 },
      { date: 'Jan 26', score: 65, label: 'Bullish', trendValue: 6150 },
      { date: 'Mar 26', score: 75, label: 'Bullish', trendValue: 6290 },
      { date: 'May 26', score: 85, label: 'Bullish', trendValue: 6420 },
      { date: 'Jul 26', score: 92, label: 'Bullish', trendValue: 6520 }
    ]
  },
  Bearish: {
    '1M': [
      { date: 'Jun 16', score: 25, label: 'Bearish', trendValue: 5500 },
      { date: 'Jun 23', score: 22, label: 'Bearish', trendValue: 5420 },
      { date: 'Jun 30', score: 18, label: 'Bearish', trendValue: 5310 },
      { date: 'Jul 07', score: 15, label: 'Bearish', trendValue: 5240 },
      { date: 'Jul 16', score: 12, label: 'Bearish', trendValue: 5180 }
    ],
    '3M': [
      { date: 'Apr 16', score: 42, label: 'Distribution', trendValue: 5850 },
      { date: 'Apr 30', score: 35, label: 'Bearish', trendValue: 5710 },
      { date: 'May 15', score: 28, label: 'Bearish', trendValue: 5600 },
      { date: 'May 30', score: 25, label: 'Bearish', trendValue: 5520 },
      { date: 'Jun 15', score: 20, label: 'Bearish', trendValue: 5410 },
      { date: 'Jun 30', score: 16, label: 'Bearish', trendValue: 5290 },
      { date: 'Jul 16', score: 12, label: 'Bearish', trendValue: 5180 }
    ],
    '6M': [
      { date: 'Jan 16', score: 68, label: 'Distribution', trendValue: 6200 },
      { date: 'Feb 16', score: 54, label: 'Neutral', trendValue: 6050 },
      { date: 'Mar 16', score: 40, label: 'Bearish', trendValue: 5820 },
      { date: 'Apr 16', score: 32, label: 'Bearish', trendValue: 5690 },
      { date: 'May 16', score: 26, label: 'Bearish', trendValue: 5540 },
      { date: 'Jun 16', score: 19, label: 'Bearish', trendValue: 5380 },
      { date: 'Jul 16', score: 12, label: 'Bearish', trendValue: 5180 }
    ],
    '1Y': [
      { date: 'Jul 25', score: 82, label: 'Bullish', trendValue: 6500 },
      { date: 'Sep 25', score: 65, label: 'Distribution', trendValue: 6310 },
      { date: 'Nov 25', score: 45, label: 'Bearish', trendValue: 5900 },
      { date: 'Jan 26', score: 38, label: 'Bearish', trendValue: 5750 },
      { date: 'Mar 26', score: 32, label: 'Bearish', trendValue: 5600 },
      { date: 'May 26', score: 22, label: 'Bearish', trendValue: 5350 },
      { date: 'Jul 26', score: 12, label: 'Bearish', trendValue: 5180 }
    ]
  },
  Recovery: {
    '1M': [
      { date: 'Jun 16', score: 42, label: 'Recovery', trendValue: 5720 },
      { date: 'Jun 23', score: 44, label: 'Recovery', trendValue: 5750 },
      { date: 'Jun 30', score: 46, label: 'Recovery', trendValue: 5780 },
      { date: 'Jul 07', score: 50, label: 'Recovery', trendValue: 5830 },
      { date: 'Jul 16', score: 55, label: 'Recovery', trendValue: 5890 }
    ],
    '3M': [
      { date: 'Apr 16', score: 25, label: 'Bearish', trendValue: 5400 },
      { date: 'Apr 30', score: 28, label: 'Bearish', trendValue: 5430 },
      { date: 'May 15', score: 35, label: 'Recovery', trendValue: 5550 },
      { date: 'May 30', score: 41, label: 'Recovery', trendValue: 5680 },
      { date: 'Jun 15', score: 46, label: 'Recovery', trendValue: 5740 },
      { date: 'Jun 30', score: 51, label: 'Recovery', trendValue: 5810 },
      { date: 'Jul 16', score: 55, label: 'Recovery', trendValue: 5890 }
    ],
    '6M': [
      { date: 'Jan 16', score: 45, label: 'Bearish', trendValue: 5600 },
      { date: 'Feb 16', score: 32, label: 'Bearish', trendValue: 5410 },
      { date: 'Mar 16', score: 24, label: 'Bearish', trendValue: 5350 },
      { date: 'Apr 16', score: 30, label: 'Recovery', trendValue: 5480 },
      { date: 'May 16', score: 42, label: 'Recovery', trendValue: 5640 },
      { date: 'Jun 16', score: 49, label: 'Recovery', trendValue: 5760 },
      { date: 'Jul 16', score: 55, label: 'Recovery', trendValue: 5890 }
    ],
    '1Y': [
      { date: 'Jul 25', score: 68, label: 'Distribution', trendValue: 6150 },
      { date: 'Sep 25', score: 42, label: 'Bearish', trendValue: 5600 },
      { date: 'Nov 25', score: 28, label: 'Bearish', trendValue: 5390 },
      { date: 'Jan 26', score: 34, label: 'Recovery', trendValue: 5490 },
      { date: 'Mar 26', score: 40, label: 'Recovery', trendValue: 5580 },
      { date: 'May 26', score: 48, label: 'Recovery', trendValue: 5720 },
      { date: 'Jul 26', score: 55, label: 'Recovery', trendValue: 5890 }
    ]
  },
  Distribution: {
    '1M': [
      { date: 'Jun 16', score: 64, label: 'Distribution', trendValue: 6350 },
      { date: 'Jun 23', score: 62, label: 'Distribution', trendValue: 6380 },
      { date: 'Jun 30', score: 59, label: 'Distribution', trendValue: 6360 },
      { date: 'Jul 07', score: 55, label: 'Distribution', trendValue: 6320 },
      { date: 'Jul 16', score: 48, label: 'Distribution', trendValue: 6250 }
    ],
    '3M': [
      { date: 'Apr 16', score: 82, label: 'Bullish', trendValue: 6410 },
      { date: 'Apr 30', score: 78, label: 'Bullish', trendValue: 6450 },
      { date: 'May 15', score: 71, label: 'Distribution', trendValue: 6420 },
      { date: 'May 30', score: 65, label: 'Distribution', trendValue: 6390 },
      { date: 'Jun 15', score: 58, label: 'Distribution', trendValue: 6310 },
      { date: 'Jun 30', score: 53, label: 'Distribution', trendValue: 6280 },
      { date: 'Jul 16', score: 48, label: 'Distribution', trendValue: 6250 }
    ],
    '6M': [
      { date: 'Jan 16', score: 60, label: 'Neutral', trendValue: 5980 },
      { date: 'Feb 16', score: 72, label: 'Bullish', trendValue: 6150 },
      { date: 'Mar 16', score: 84, label: 'Bullish', trendValue: 6450 },
      { date: 'Apr 16', score: 78, label: 'Bullish', trendValue: 6410 },
      { date: 'May 16', score: 68, label: 'Distribution', trendValue: 6380 },
      { date: 'Jun 16', score: 58, label: 'Distribution', trendValue: 6310 },
      { date: 'Jul 16', score: 48, label: 'Distribution', trendValue: 6250 }
    ],
    '1Y': [
      { date: 'Jul 25', score: 45, label: 'Recovery', trendValue: 5750 },
      { date: 'Sep 25', score: 55, label: 'Neutral', trendValue: 5980 },
      { date: 'Nov 25', score: 72, label: 'Bullish', trendValue: 6220 },
      { date: 'Jan 26', score: 85, label: 'Bullish', trendValue: 6510 },
      { date: 'Mar 26', score: 76, label: 'Distribution', trendValue: 6430 },
      { date: 'May 26', score: 62, label: 'Distribution', trendValue: 6320 },
      { date: 'Jul 26', score: 48, label: 'Distribution', trendValue: 6250 }
    ]
  }
};
