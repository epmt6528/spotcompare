# SpotCompare

A web app that lets you search for nearby restaurants on a Google Map, select up to 4 locations, and compare them side by side. For each selected place, reviews are fetched from the Google Places API and sent to the Anthropic Claude API to generate a structured pros/cons analysis.

## Prerequisites

- **Node.js** 18+ and npm
- **Google Cloud** project with billing enabled
- **Anthropic** API key

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example env file and fill in your keys:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key (used for the map and can be used for Places/Geocoding). Restrict by HTTP referrer (e.g. `localhost:*`, your domain). |
| `GOOGLE_PLACES_API_KEY` | Optional. If set, used for server-side Places and Geocoding; otherwise the app uses `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude (server-side only). |

### 3. Google Cloud configuration

In [Google Cloud Console](https://console.cloud.google.com/):

1. Create or select a project.
2. Enable these APIs:
   - **Maps JavaScript API** (for the map and optional client-side use)
   - **Places API** (Nearby Search, Place Details)
   - **Geocoding API** (for address/city search)
3. Create an API key under **APIs & Services → Credentials**.
4. Restrict the key:
   - **Application restrictions**: HTTP referrers, e.g. `http://localhost:3000/*`, `https://yourdomain.com/*`
   - **API restrictions**: restrict to the three APIs above (or leave unrestricted for development).

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Enter a city or address and click **Search**, or click **Use my location**.
2. Browse nearby restaurants on the map and in the list. Click a place (in the list or on the map) to select it; you can select up to 4.
3. Click **Compare** to fetch reviews and generate pros/cons for each selected place.
4. View the comparison cards with pros (green) and cons (amber).

## Tech stack

- **Next.js** (App Router) with **TypeScript**
- **Tailwind CSS** for styling
- **@react-google-maps/api** for the map and markers
- **@anthropic-ai/sdk** for Claude-based review analysis

## Project structure

- `src/app/page.tsx` – Main page (map, search, list, comparison)
- `src/app/api/places/route.ts` – Geocode, nearby search, place details
- `src/app/api/analyze/route.ts` – Claude pros/cons analysis
- `src/components/` – Map, LocationSearch, PlaceList, ComparisonCard, ComparisonGrid
- `src/lib/types.ts` – Shared types
- `src/lib/utils.ts` – Constants and helpers

## Scripts

- `npm run dev` – Start development server
- `npm run build` – Build for production
- `npm run start` – Start production server
- `npm run lint` – Run ESLint
