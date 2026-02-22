# AGENTS.md

## Project Overview

React 19 + Vite 7 single-page application for surf forecasting. Uses TypeScript 5.9 with strict mode, Tailwind CSS 3.4 for styling, React Router DOM v7 for routing, Recharts for charts, and Leaflet for maps. No server-side rendering.

## Build, Lint, and Format Commands

```bash
npm run dev            # Start Vite dev server
npm run build          # TypeScript check (tsc -b) then Vite production build
npm run lint           # ESLint (flat config, v9)
npm run format         # Prettier -- write all files
npm run format:check   # Prettier -- check only (CI-friendly)
npm run preview        # Serve production build locally
```

**There is no test framework configured.** No jest, vitest, cypress, or playwright. No `npm test` script exists.

## Project Structure

```
src/
  components/          # Reusable UI components (PascalCase filenames)
  components/Forecast/ # Forecast-specific components
  components/charts/   # Shared chart system (theme + base chart)
  pages/               # Route-level page components
  hooks/               # Custom React hooks (camelCase with use prefix)
  services/            # API client and localStorage wrapper
  types/               # TypeScript interfaces and utility type functions
  utils/               # Pure utility functions (time formatting)
```

Key files:

- `src/App.tsx` -- Root component with BrowserRouter and route definitions
- `src/main.tsx` -- Entry point (createRoot + StrictMode)
- `src/services/api.ts` -- All API functions (raw fetch, no wrapper library)
- `src/services/storage.ts` -- localStorage persistence for settings
- `src/types/index.ts` -- Shared TypeScript types and small utility functions

## Code Style

### Formatting (Prettier)

- **No semicolons**
- **Single quotes** everywhere, including JSX attributes: `className='foo'`
- **Trailing commas** in all positions (ES5+): objects, arrays, function params
- 2-space indentation, no tabs
- `arrowParens: "always"` -- always wrap arrow function params in parens
- Tailwind class sorting via `prettier-plugin-tailwindcss`

### TypeScript

- Strict mode enabled with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- Target: ES2022, module: ESNext, bundler resolution
- Use `import type { Foo }` for type-only imports (enforced by `verbatimModuleSyntax`)
- Inline type imports are also acceptable: `import { type ReactNode, useState } from 'react'`
- No path aliases -- use relative imports (`../services/api`, `./Icons`)
- Explicit return type annotations on service functions (`Promise<T>`)
- Components do NOT use `React.FC` -- type props via destructured parameter only

### Import Order

1. External libraries (React, react-router-dom, etc.)
2. Internal services, hooks, utilities
3. CSS file imports (`import './HomePage.css'`)
4. Type imports (using `import type`)
5. Component imports

No blank-line separation is enforced between groups, but the ordering is consistent.

### Components

- **Always arrow functions** with `const`: `export const MyComponent = () => { ... }`
- **Named exports** for everything. Only `App` uses `export default`
- Simple components use implicit return (expression body); complex ones use block body
- Props interface defined immediately above the component, named `ComponentNameProps`
- Props are destructured in the function parameter
- For trivial inline components, inline object types are acceptable: `({ id }: { id: string })`

### Naming Conventions

| Category               | Convention           | Example                          |
| ---------------------- | -------------------- | -------------------------------- |
| Component files        | PascalCase `.tsx`    | `MetricCard.tsx`, `HomePage.tsx` |
| Hook files             | camelCase `.ts`      | `useSettings.ts`                 |
| Service/util files     | camelCase `.ts`      | `api.ts`, `time.ts`              |
| Directories            | lowercase            | `components/`, `hooks/`          |
| Components             | PascalCase           | `MetricCard`, `BottomNav`        |
| Hooks                  | `use` prefix         | `useSettings`                    |
| Functions              | camelCase            | `getStations`, `formatHour`      |
| Variables              | camelCase            | `spotId`, `stationLabel`         |
| Module-level constants | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `SETTINGS_KEY`   |
| Types/interfaces       | PascalCase           | `SurfForecast`, `SettingsState`  |
| Props interfaces       | `{Component}Props`   | `MetricCardProps`                |

### API and Data Fetching

- All API functions live in `src/services/api.ts`
- Pattern: `const fn = async (...): Promise<T> => { fetch -> check response.ok -> throw Error -> return json }`
- Use `URLSearchParams` for query strings; `String()` for number conversion
- Default parameter values for optional params (e.g., `limit = 6`)
- Forecast data has two endpoints by variant:
  - `hourly` -> `/surf-forecast/:spot/hourly`
  - `general` -> `/surf-forecast/:spot/general`
  - `getSurfForecast` receives variant as the second argument
- Error messages in thrown errors are in **English**: `'Failed to fetch stations'`
- Helper/derived functions (e.g., `getPrimarySwell`) are co-located in `api.ts`

### Error Handling

- API layer: `if (!response.ok) throw new Error('...')` -- no custom error classes
- Storage: `try/catch` with silent fallback to defaults
- Components use a **mounted flag** pattern to prevent state updates after unmount:
  ```ts
  useEffect(() => {
    let mounted = true
    const load = async () => {
      // ... if (!mounted) return
    }
    void load()
    return () => {
      mounted = false
    }
  }, [deps])
  ```
- Async status tracked with union type: `'loading' | 'error' | 'success'`
- Fire-and-forget async calls prefixed with `void`: `void load()`
- Secondary data loads log errors with `console.error()` and fail silently

### State Management

- No state management library (no Redux, Zustand, etc.)
- React `useState`/`useEffect` for all state
- `useMemo` for derived/computed values
- Settings persisted to `localStorage` via `src/services/storage.ts`
- Theme switching is controlled from `SettingsPage` (no theme toggle in footer nav)

### Styling

- **Tailwind CSS** for all styling, using long inline `className` strings
- Dark mode via Tailwind `class` strategy (`dark:` prefix classes)
- Custom theme colors: `ocean-*` (blues) and `sand-*` (beiges) in `tailwind.config.js`
- `clsx` is available but not widely used; most components use template literals for conditional classes
- Minimal vanilla CSS only for scrollbar hiding and Leaflet map overrides

### Language

- **UI text and labels** are in **Spanish**: `'Cargando...'`, `'Seleccionar spot'`, `'Cerrar'`
- **JSDoc comments** are in **Spanish**: `/** Obtiene el listado de estaciones */`
- **Inline code comments** are in **Spanish**: `// Convertir BuoyInfoDoc[] a Station[]`
- **Error messages** in thrown errors are in **English**: `'Failed to fetch stations'`
- Keep this convention when adding new code

### Environment

- API base URL configured via `VITE_API_URL` env var (falls back to `http://localhost:3000`)
- Production frontend uses `VITE_API_URL=/api` with Vercel rewrite proxy to backend
- Backend target for proxy: `https://waves-db-backend.vercel.app`
- Vite uses `import.meta.env` for environment variables
