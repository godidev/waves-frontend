# waves-frontend

Frontend React + TypeScript para visualizar estado del mar (forecast + boyas).

## Estructura
- `surf-app/`: aplicación Vite principal.

## Requisitos
- Node.js 20+

## Configuración
En `surf-app/.env.production`:
- `VITE_API_URL=https://waves-db-backend.vercel.app`

Para local, crea `surf-app/.env.local` con tu backend local.

## Scripts
Desde `surf-app/`:
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run test`
- `npm run test:watch`
- `npm run preview`

## Notas técnicas
- Capa `src/services/api.ts` enfocada en llamadas HTTP tipadas y timeout.
- Estado servidor gestionado con React Query (`src/hooks/useAppQueries.ts`).
- Preferencias globales en contexto (`src/context/SettingsContext.tsx`).
- Requests con timeout para evitar bloqueos de UI por backend lento.
- UI optimizada para lectura rápida de pasado/presente/futuro.
- En mapa, la colocación de spots se valida geoespacialmente (mar + franja costera) usando Turf y GeoJSON de España en `surf-app/src/data/`.
