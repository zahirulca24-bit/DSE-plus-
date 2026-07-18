# DSE OHLC App Import Flow

The Data Import page now supports the following backend-driven workflow for **DSE OHLC Data**:

1. Select a CSV in the app.
2. Run authoritative validation through `POST /data/ohlc/preview`.
3. Check backend and database readiness through `/health`, `/db/status`, `/data/source`, and `/data/audit`.
4. Initialize missing database tables through `POST /db/init`.
5. Upsert valid rows through `POST /data/ohlc/import-db`.
6. Refresh verified database row, symbol, and latest-date counts.

Rows are upserted using the backend database constraint for `symbol + trade_date`, so re-uploading the same dataset updates existing rows instead of creating duplicates.

## Required deployment configuration

The frontend requires:

- `VITE_DSE_API_BASE_URL`

The backend requires:

- `DATABASE_URL` or `SUPABASE_DATABASE_URL`
- `FRONTEND_ORIGIN=https://dse-plus.vercel.app`

No Supabase credentials are exposed to the browser. The CSV is uploaded to the FastAPI backend, and the backend performs the database write.
