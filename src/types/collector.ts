export interface ProductionCollectorStatusResponse {
  enabled: boolean;
  running: boolean;
  source: string | null;
  last_started_at: string | null;
  last_completed_at: string | null;
  last_error: string | null;
  symbols_updated: number;
  inserted_rows: number;
  updated_rows: number;
  rejected_rows: number;
  latest_trade_date: string | null;
}
