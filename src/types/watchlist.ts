export interface WatchlistItemAlert {
  enabled: boolean;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'SIGNAL_CHANGE' | 'ENTRY_READY';
  value: number;
  createdAt: string;
}

export interface WatchlistConfig {
  symbol: string;
  alerts: WatchlistItemAlert[];
}
