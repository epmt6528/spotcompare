# AGENTS.md

## Cursor Cloud specific instructions

**SpotCompare** is a single Next.js (App Router) + TypeScript web app. No monorepo, no database, no Docker.

### Required API keys (`.env.local`)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Client-side Google Maps; also used server-side as fallback for Places/Geocoding |
| `GOOGLE_PLACES_API_KEY` | Optional dedicated server-side key for Places/Geocoding |
| `ANTHROPIC_API_KEY` | Claude-based review analysis (compare feature) |

Without valid Google API keys, the map shows "Oops! Something went wrong" and searches return "The provided API key is invalid." The rest of the UI still renders and is interactive.

### Common commands

See `README.md` → **Scripts** section. Quick reference:

- `npm run dev` — dev server on port 3000
- `npm run build` — production build
- `npm run lint` — ESLint (expects 0 errors; 1 known `react-hooks/exhaustive-deps` warning in `Map.tsx`)

### Gotchas

- No automated test suite exists (`npm test` is not configured). Validation is done via lint + build + manual testing.
- The app is fully stateless; all data comes from Google/Anthropic APIs at request time.
- Node 18+ is required; the VM ships with Node 22 which works fine.
