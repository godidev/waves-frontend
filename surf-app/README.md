# Waves Frontend

Frontend app for surf and buoy conditions, built with React + Vite + TypeScript.

## Stack

- React 19
- Vite 7
- TypeScript 5 (strict)
- Tailwind CSS
- Recharts
- React Router

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run format:check
npm run preview
```

## Environment

The app reads the API base URL from `VITE_API_URL`.

- Local default fallback: `http://localhost:3000`
- Production setup in this repo uses `VITE_API_URL=/api`

In production, Vercel rewrites `/api/*` to the backend (`https://waves-db-backend.vercel.app/*`) to avoid browser CORS issues.

## Main Features

- Forecast chart with spot dropdown and range selector (`48h` / `7d`)
- Buoy chart with station dropdown and hour range selector (`6h` / `12h` / `24h`)
- Shared chart system (`src/components/charts`) and shared dropdown component (`src/components/SelectMenu.tsx`)
- Persisted user settings (theme, default spot, default station)

## Project Structure

```text
src/
  components/
  components/Forecast/
  components/charts/
  hooks/
  pages/
  services/
  types/
  utils/
```
