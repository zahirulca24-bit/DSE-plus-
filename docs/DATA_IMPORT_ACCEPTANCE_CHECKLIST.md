# Data Import Acceptance Checklist

- [ ] Frontend production environment has `VITE_DSE_API_BASE_URL`.
- [ ] Backend `/health` is reachable from the browser.
- [ ] Backend `/db/status` reports configured and connected.
- [ ] Backend `FRONTEND_ORIGIN` allows `https://dse-plus.vercel.app`.
- [ ] CSV preview reports valid/invalid rows and symbol count.
- [ ] Save initializes missing tables without dropping data.
- [ ] Save reports inserted and updated rows.
- [ ] Database audit refreshes total rows, symbols, and latest OHLC date.
- [ ] Re-upload does not create duplicate `symbol + trade_date` rows.
