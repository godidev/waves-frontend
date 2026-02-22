# Waves Frontend

Aplicación frontend para consultar condiciones de surf y boyas, construida con React + Vite + TypeScript.

## Tecnologías

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
- Sistema de gráficos compartido (`src/components/charts`) y componente de select compartido (`src/components/SelectMenu.tsx`)
- Ajustes persistidos del usuario (tema, spot por defecto, estación por defecto)
- El tema solo se cambia desde Ajustes (el footer ya no incluye toggle de tema)

## Estructura del proyecto

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
