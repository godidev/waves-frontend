# Waves Frontend

Aplicación frontend para consultar condiciones de surf y boyas, construida con React + Vite + TypeScript.

## Tecnologías

- React 19
- Vite 7
- TypeScript 5 (strict)
- Tailwind CSS
- Recharts
- React Router
- Leaflet + React Leaflet
- Turf.js (validación geoespacial de costa)

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run test:watch
npm run format
npm run format:check
npm run preview
```

## Entorno

La app lee la URL base de la API desde `VITE_API_URL`.

- Fallback local por defecto: `http://localhost:3000`
- En producción, este repositorio usa `VITE_API_URL=/api`

En producción, Vercel reescribe `/api/*` al backend (`https://waves-db-backend.vercel.app/*`) para evitar problemas de CORS en el navegador.

## API de Forecast

El frontend usa dos endpoints de forecast según el rango seleccionado:

- `GET /surf-forecast/:spot/hourly?page=1&limit=72` para `48h`
- `GET /surf-forecast/:spot/general?page=1&limit=21` para `7d` (hasta 3 puntos por día)

La tarjeta de resumen superior usa siempre datos hourly y selecciona el punto más cercano a la hora actual.

## Funcionalidades principales

- Gráfico de forecast con selector de spot y selector de rango (`48h` / `7d`)
- Gráfico de boyas con selector de estación y selector de horas (`6h` / `12h` / `24h`)
- Sistema de gráficos compartido (`src/components/charts`) y componentes reutilizables de UI (`SelectMenu`, `LabeledToggleGroup`)
- Ajustes persistidos del usuario (tema, spot por defecto, estación por defecto)
- El tema solo se cambia desde Ajustes (el footer ya no incluye toggle de tema)
- Validación de ubicación en mapa: solo permite colocar/arrastrar spots en mar o en franja de playa cercana a costa de España
- Estado servidor y caché de datos gestionados con React Query (`src/hooks/useAppQueries.ts`)

## Validación geoespacial del mapa

- Regla actual: se permite en mar y en tierra a <= `1.3 km` de costa.
- Implementación en `src/utils/spainCoastValidation.ts`.
- Datos geográficos usados por el frontend:
  - `src/data/spainLand.geo.json`
  - `src/data/spainCoastline.geo.json`
- La validación se aplica al click en mapa y al drag del pin provisional en `src/pages/MapPage.tsx`.

### Regenerar geodata

Si quieres actualizar la geometría de costa/territorio desde las fuentes públicas:

```bash
node scripts/generate-spain-geodata.mjs
```

Este comando sobrescribe los archivos en `src/data/`.

## Estructura del proyecto

```text
src/
  components/
  components/Forecast/
  components/charts/
  components/**/__tests__/
  hooks/
  context/
  context/__tests__/
  pages/
  pages/__tests__/
  services/
  services/__tests__/
  tests/                # setup global de Vitest
  types/
  utils/
```
