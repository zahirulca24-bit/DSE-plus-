export interface ProductionDataImportResponse {
  ok: boolean;
  data_source: 'database';
  inserted: number;
  updated: number;
  rejected: number;
  duplicate: number;
  symbols_count: number;
  latest_trade_date: string | null;
  message: string;
  warnings: string[];
  errors: string[];
}
