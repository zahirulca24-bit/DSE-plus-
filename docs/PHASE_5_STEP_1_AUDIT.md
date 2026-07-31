# Phase 5 Step 1 — Frontend Audit and Foundation

## Status

- Project: DSE Pulse Frontend
- Repository: `zahirulca24-bit/DSE-plus-`
- Phase: Frontend Integration
- Progress target: 58% → 63%

## Audit findings

1. The React/Vite application already has a central market store and backend service layer.
2. Backend endpoint strings were duplicated inside the API service.
3. Environment validation accepted malformed URLs and production localhost URLs.
4. API error messages were inconsistent across HTTP, timeout, network, and CORS failures.
5. The environment template still described a demo/local-only fallback, which conflicts with the verified-data policy.
6. Legacy `blob`, `drive`, and `demo` names remain in page-facing code. Compatibility aliases are retained temporarily so Step 1 does not break existing pages; Step 2 must migrate those pages.

## Implemented foundation

- centralized backend endpoints in `src/services/apiEndpoints.ts`
- normalized and validated `VITE_DSE_API_BASE_URL`
- blocked localhost backend URLs in production builds
- standardized HTTP, timeout, network, and CORS errors
- retained GET-only retry behavior
- updated `.env.example` to state that no mock/demo fallback exists
- preserved temporary API aliases for existing pages until Step 2 migration

## Step 2 integration gate

Before Step 2 is complete:

- migrate Dashboard, Scanner, Signals, and Data Status to the central API contract
- remove page-level demo actions and misleading demo labels
- remove temporary `driveStatus`, `importOhlcToBlob`, and `importOhlcToDrive` aliases after all callers are migrated
- expose consistent loading, empty, error, and retry states
- bind scanner qualification fields without synthesizing missing values
