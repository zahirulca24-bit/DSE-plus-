# DSE Pulse

DSE Pulse is a Dhaka Stock Exchange analysis and signal-terminal frontend built with React, TypeScript, Vite, Tailwind CSS, Recharts, and Lucide React.

## Current Status — 19 Jul 2026

The frontend repository has been migrated toward a real backend + Vercel Blob data architecture. Mock/demo market-data fallbacks have been removed from the approved production flow.

The current GitHub `main` branch is ahead of the live Vercel production deployment. Therefore, repository code and the live website must not be treated as identical until a new production deployment is verified.

### Completed in Repository

- [x] React/Vite frontend structure implemented
- [x] FastAPI backend API client integration implemented
- [x] Supabase removed from the approved production architecture
- [x] Google Drive removed from the approved production architecture
- [x] Vercel Blob selected as the canonical durable OHLC storage
- [x] Data Import CSV preview and backend validation flow implemented
- [x] Vercel Blob import/upsert API flow implemented in the current repository
- [x] Scanner/Signals automatic demo fallback removed
- [x] Dashboard mock market values removed
- [x] Backtest fake-result generation removed
- [x] Market Regime and Sector Analysis mock outputs removed
- [x] Real-data unavailable states report honest empty/not-connected states
- [x] Frontend typecheck and production build CI added

### Current Blockers

- [ ] Live Vercel production is not yet verified on the latest `main` commit
- [ ] Vercel Git auto-deployment/pickup must be verified
- [ ] Production `VITE_DSE_API_BASE_URL` must be verified
- [ ] Backend runtime and CORS must be live-verified from the production frontend
- [ ] Vercel Blob credentials/configuration must be verified on the backend runtime
- [ ] App -> Backend -> Vercel Blob import has not yet been live-proven end to end
- [ ] Scanner must be live-proven against the Vercel Blob-backed OHLC dataset
- [ ] Data Import page-navigation draft persistence is tracked in GitHub issue #7 and must be reviewed before merge

## Locked Production Architecture

```text
Single User
  -> DSE Pulse Frontend (Vercel)
  -> FastAPI Backend
  -> Vercel Blob canonical OHLC master dataset
  -> Backend local cache for fast reads
  -> Scanner / Signals / future Backtest Engine
```

### Storage Responsibilities

| Data | Approved location |
|---|---|
| Final canonical DSE OHLC master dataset | Vercel Blob |
| Scanner production input | Backend cache refreshed from Vercel Blob |
| Unsaved Data Import page state during normal page navigation | React global application state |
| Full CSV in `localStorage` | Not allowed |
| Browser IndexedDB file persistence | Not part of the current locked scope unless explicitly approved later |

Vercel Blob is the permanent source of truth. Browser state must never be treated as production market-data storage.

## Data Import Target Flow

```text
Select CSV
  -> Browser displays a limited preview
  -> Backend validates the uploaded file
  -> User confirms Save to Vercel Blob
  -> Backend merges/upserts by (symbol, trade_date)
  -> Backend updates the canonical Vercel Blob master dataset
  -> Backend refreshes its local cache
  -> Frontend verifies rows / symbols / latest date / storage status
```

Required OHLC schema:

```text
symbol,trade_date,open,high,low,close,volume
```

### Data Import Navigation Rule

The selected file preview and validation state must not disappear merely because the user navigates to another page and returns during the same app session.

Approved fix direction:

- move Data Import draft state out of route-local component state
- preserve it in a React global store/context
- do not store the complete CSV text in `localStorage`
- provide an explicit discard/reset action
- do not reset the draft when the already-selected category is clicked

Browser refresh restoration of the original unsaved `File` is not currently a locked requirement. Re-selecting the CSV after a full browser reload is acceptable unless a separate persistence requirement is explicitly approved.

## Backend Endpoints Used by the Frontend

```text
GET  /health
GET  /storage/status
GET  /data/status
POST /data/ohlc/preview
POST /data/ohlc/import-blob
GET  /scanner/latest
POST /scanner/run
GET  /signals
```

No frontend screen may claim storage, scanner, or signal success without a successful real backend response.

## Verified Dataset Reference

Current verified merged CSV reference:

- Rows: 85,024
- Symbols: 460
- Base full-universe coverage: 2025-07-02 through 2026-06-30
- Partial July extension: through 2026-07-16
- July extension coverage: 6 symbols / 54 valid rows
- Duplicate `(symbol, trade_date)` keys: 0

The global latest date must not be interpreted as full-universe freshness because July coverage is partial.

## P0 Verification Checklist

### Deployment

- [ ] Confirm latest GitHub `main` commit SHA
- [ ] Confirm Vercel production deployment uses the same SHA
- [ ] Confirm production build state is `READY`
- [ ] Hard-refresh the production URL and verify current UI labels
- [ ] Confirm no user-facing Google Drive wording remains

### Backend and Storage

- [ ] Verify `GET /health`
- [ ] Verify `GET /storage/status` reports Vercel Blob configuration accurately
- [ ] Verify `GET /data/status` returns real stored dataset metadata
- [ ] Verify production frontend reaches backend without timeout or CORS failure
- [ ] Validate the 85,024-row CSV through the production frontend
- [ ] Save through the real backend to Vercel Blob
- [ ] Confirm canonical pathname returned by the backend
- [ ] Verify stored row count, symbol count, and latest date
- [ ] Re-upload an overlapping sample and prove `(symbol, trade_date)` upsert does not create duplicates

### Data Import Issue #7

- [ ] Select CSV and complete backend validation
- [ ] Navigate to Dashboard
- [ ] Return to Data Import
- [ ] Confirm filename, row count, preview, and validation state remain visible
- [ ] Confirm clicking the active category does not clear the draft
- [ ] Confirm explicit discard clears the draft
- [ ] Confirm no full CSV content is written to `localStorage`
- [ ] Run typecheck, production build, and automated tests
- [ ] Review the PR before merge

### Scanner

- [ ] Prove scanner reads the real Blob-backed dataset/cache
- [ ] Verify scanner universe and latest-data status
- [ ] Run one production scanner execution successfully
- [ ] Verify no demo fallback data appears
- [ ] Verify A+/A/B+/Reject grading rules
- [ ] Verify B+ is Watch/Near only and never BUY
- [ ] Verify stale/partial-data warnings are enforced

## Go / No-Go Rule

**GO** only when the production Vercel deployment matches the reviewed GitHub commit, the frontend reaches the backend, the canonical dataset is verified in Vercel Blob, and one real scanner run is proven.

**NO-GO** when production is running an old commit, storage cannot be verified, frontend/backend requests fail, Data Import loses state during page navigation, or any page displays fabricated/demo market data.

## Run Locally

Prerequisite: Node.js.

```bash
npm install
npm run dev
```

## Quality Checks

```bash
npm run typecheck
npm run build
npm test
```

Use only scripts that exist in the current `package.json`. Do not report a test or build as passed without actual command output.

## Important Notice

DSE Pulse is not a broker or order-routing system and does not execute trades. Signals and analysis must be based on verified market data and approved strategy rules. The application must not present fabricated demo values as live market information.
