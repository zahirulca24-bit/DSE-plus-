# DSE Pulse

DSE Pulse is a Bangladesh Dhaka Stock Exchange analysis and signal-terminal frontend built with React, TypeScript, Vite, Tailwind CSS, Recharts, and Lucide React.

## Current Status — 18 Jul 2026

Production frontend is deployed on Vercel and the application has been cleaned of automatic mock/demo market-data fallbacks.

### Completed

- [x] Vercel production frontend deployed
- [x] FastAPI backend API client integration implemented
- [x] Supabase removed from the approved production architecture
- [x] Google Drive selected as durable DSE market-data storage
- [x] DSE storage restricted by design to one configured Drive folder
- [x] Data Import CSV preview and validation flow implemented
- [x] Google Drive save/upsert frontend flow implemented
- [x] Scanner/Signals automatic demo fallback removed
- [x] Dashboard mock market values removed
- [x] Backtest fake-result generation removed
- [x] Market Regime and Sector Analysis mock market outputs removed
- [x] Portfolio, Journal, Watchlist, Alerts, Collector, and Settings demo-state cleanup completed
- [x] Real data unavailable state now reports an honest empty/not-connected state instead of fabricated market values

### Current Blockers

- [ ] Google Drive service-account authentication is not configured in the deployed backend yet
- [ ] The configured Drive folder is not yet shared with a dedicated DSE service account
- [ ] `DSE_OHLC_MASTER.csv` is not yet confirmed inside the target Drive folder
- [ ] App -> Backend -> Google Drive end-to-end save has not yet been live-proven
- [ ] Production frontend backend base URL/runtime connection must be live-verified before market open
- [ ] Scanner must be live-proven against the real Drive-backed OHLC dataset

## Locked Production Architecture

```text
Single User
  -> DSE Pulse Frontend (Vercel)
  -> FastAPI Backend
  -> Google Drive: one dedicated DSE folder only
  -> DSE_OHLC_MASTER.csv
  -> Backend local cache for fast reads
  -> Scanner / future backtest engine
```

Google Drive is the approved durable storage. The backend must not be given broad access to the user's entire Drive.

Target storage root:

```text
DSE Pulse
  -> Market Data & Backtest Storage
```

The backend is configured to use a fixed Drive folder ID and master filename. A dedicated service account must receive access only to the approved DSE folder.

## Data Import Target Flow

```text
Upload CSV
  -> Validate required schema
  -> Preview rows and errors
  -> Save Data
  -> Upsert by (symbol, trade_date)
  -> Save/update DSE_OHLC_MASTER.csv in Google Drive
  -> Refresh backend cache
  -> Verify rows / symbols / latest date / coverage
```

Required OHLC schema:

```text
symbol,trade_date,open,high,low,close,volume
```

## Verified Dataset Reference

Current verified merged dataset prepared for DSE Pulse:

- Rows: 85,024
- Symbols: 460
- Base full-universe coverage: 2025-07-02 through 2026-06-30
- Partial July extension: through 2026-07-16
- July extension coverage: only 6 symbols / 54 valid rows
- Duplicate `(symbol, trade_date)` keys: 0

Important: the global latest date must not be interpreted as full-universe freshness because July coverage is partial.

## Pre-Market Checklist — Must Finish Before 19 Jul 2026, 10:00 BDT

### P0 — Storage and Runtime

- [ ] Create/select Google Cloud project for DSE Pulse
- [ ] Enable Google Drive API
- [ ] Create dedicated DSE service account
- [ ] Do not grant broad Google Cloud IAM roles unless required
- [ ] Share only `DSE Pulse -> Market Data & Backtest Storage` with service-account email as Editor
- [ ] Create service-account JSON key securely
- [ ] Encode/store credential only as backend secret; never commit it to GitHub
- [ ] Set `GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON_B64` in backend runtime
- [x] `GOOGLE_DRIVE_FOLDER_ID` configured in backend deployment definition
- [x] `GOOGLE_DRIVE_MASTER_FILENAME=DSE_OHLC_MASTER.csv` configured
- [ ] Set/verify production `FRONTEND_ORIGIN`
- [ ] Redeploy backend
- [ ] Verify `GET /health`
- [ ] Verify `GET /drive/status` reports configured + connected

### P0 — Real Data Proof

- [ ] Import the verified master CSV from the app
- [ ] Confirm validation result before save
- [ ] Save through app to Google Drive
- [ ] Confirm `DSE_OHLC_MASTER.csv` physically exists in the approved Drive folder
- [ ] Verify stored row count
- [ ] Verify symbol count
- [ ] Verify latest date and partial-coverage warning
- [ ] Re-upload a small overlapping sample and prove `(symbol, trade_date)` upsert does not duplicate rows
- [ ] Restart/redeploy backend and prove data survives because Drive is the durable source

### P0 — Frontend/Backend Live Connection

- [ ] Verify production `VITE_DSE_API_BASE_URL`
- [ ] Verify frontend can reach backend from Vercel without CORS failure
- [ ] Verify Data Import preview from production frontend
- [ ] Verify Save to Google Drive from production frontend
- [ ] Verify error state is clear when Drive/backend is unavailable
- [ ] Verify no mock/demo market numbers appear anywhere

### P0 — Scanner Before Market Open

- [ ] Prove scanner reads real Drive-backed OHLC/cache data
- [ ] Verify scanner symbol universe and latest-data status
- [ ] Run one manual production scan successfully
- [ ] Verify scanner output contains no demo fallback
- [ ] Verify A+/A/B+/Reject grading rules are consistent with the locked strategy rules
- [ ] Verify B+ is Watch/Near only and never BUY
- [ ] Verify stale/partial-data warning is visible or enforced where appropriate

### P1 — After Core Go-Live

- [ ] Automate daily DSE OHLC collection/update
- [ ] Add market-hour schedule for 10:00-14:30 BDT
- [ ] Add hourly rescan during market hours where approved
- [ ] Build real historical backtest engine against the same single-source dataset
- [ ] Add Telegram alerts and daily report after scanner runtime is proven

## Go/No-Go Rule for 10:00 BDT

**GO** only when all P0 items for Drive authentication, real CSV persistence, frontend/backend live connection, and one real scanner run are verified.

**NO-GO** if the app still cannot save to Google Drive, the backend cannot reconnect to the Drive master after restart/redeploy, the frontend cannot reach the backend, or any market/scanner screen is showing fabricated/demo data.

## Run Locally

Prerequisite: Node.js.

```bash
npm install
npm run dev
```

## Build

```bash
npm run lint
npm run build
```

## Important Notice

DSE Pulse is not a broker or order-routing system and does not execute trades. Signals and analysis must be based on verified market data and approved strategy rules; the application must not present fabricated demo values as live market information.