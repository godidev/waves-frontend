// ============================================
// API Types - Backend Response Types
// ============================================

/** Representa un registro individual de datos de oleaje de una boya */
export interface Buoy {
  /** Fecha de la medición en formato timestamp Unix (milisegundos) */
  date: number
  /** Identificador de la estación/boya (ej: "2136", "2111") */
  buoyId: string
  /** Periodo de pico en segundos - tiempo entre olas consecutivas */
  period: number
  /** Altura significativa del oleaje en metros */
  height: number
  /** Dirección media de procedencia del oleaje en grados (0-360) */
  avgDirection: number
  /** Dirección de pico de procedencia del oleaje en grados (0-360) - opcional */
  peakDirection?: number
}

/** Representa un registro de datos de boya desde el nuevo endpoint /buoys/:id/data */
export interface BuoyDataDoc {
  /** Fecha de la medición (objeto Date nativo) */
  date: Date
  /** Identificador de la boya */
  buoyId: string
  /** Periodo de pico en segundos - tiempo entre olas consecutivas */
  period: number
  /** Altura significativa del oleaje en metros */
  height: number
  /** Dirección media de procedencia del oleaje en grados (0-360) */
  avgDirection: number
  /** Dirección de pico de procedencia del oleaje en grados (0-360) - opcional */
  peakDirection?: number | null
}

/** Representa una estación de boyas disponible en el sistema */
export interface Station {
  /** Nombre descriptivo de la estación (ej: "Bilbao-Vizcaya") */
  name: string
  /** Identificador único de la estación (ej: "2136") */
  buoyId: string
}

/** Representa información detallada de una boya con ubicación geográfica */
export interface BuoyInfoDoc {
  /** Nombre de la boya */
  buoyName: string
  /** Identificador único de la boya */
  buoyId: string
  /** Descripción o información adicional de la boya */
  body?: string | null
  /** Ubicación geográfica de la boya en formato GeoJSON */
  location?: {
    type: 'Point'
    /** [longitud, latitud] en grados decimales */
    coordinates: number[]
  } | null
}

/** Representa un mar de fondo (swell) individual en la previsión */
export interface Swell {
  /** Periodo del swell en segundos */
  period: number
  /** Ángulo de dirección del swell en grados (0-360) */
  angle: number
  /** Altura del swell en metros */
  height: number
}

/** Representa las condiciones de viento */
export interface Wind {
  /** Velocidad del viento en km/h */
  speed: number
  /** Dirección del viento en grados (0-360) */
  angle: number
}

/** Representa una previsión completa de surf para un momento y lugar específicos */
export interface SurfForecast {
  /** Fecha y hora de la previsión en formato ISO 8601 */
  date: string
  /** Identificador del spot de surf */
  spot: string
  /** Array de swells válidos/relevantes para este spot */
  validSwells: Swell[]
  /** Condiciones de viento */
  wind: Wind
  /** Energía total del oleaje - métrica calculada */
  energy: number
}

/** Representa un spot de surf disponible */
export interface Spot {
  /** Identificador único del spot */
  spotId: string
  /** Nombre visible del spot */
  spotName: string
  /** Indica si el spot está activo para mostrarse en la app */
  active?: boolean
  /** Ubicación geográfica del spot en formato GeoJSON */
  location?: {
    type: 'Point'
    /** [longitud, latitud] en grados decimales */
    coordinates: [number, number]
  } | null
}

/** Respuesta de error de la API */
export interface ErrorResponse {
  error: string
}

// ============================================
// Query Parameters
// ============================================

export interface BuoyQueryParams {
  /** Número máximo de registros a devolver (default: 6) */
  limit?: number
  /** ID de la boya específica (default: "2136") */
  buoy?: string
}

export interface SurfForecastQueryParams {
  /** Número de página para paginación (default: 1, mínimo: 1) */
  page?: number
  /** Número de registros por página (default: 50, mínimo: 1, máximo: 200) */
  limit?: number
}

// ============================================
// App-specific Types
// ============================================

export interface SettingsState {
  theme: 'dark' | 'light'
  defaultSpotId: string
  defaultStationId: string
  buoySearchRadiusKm: number
}

// ============================================
// Utility Types for UI Components
// ============================================

/** Item genérico para selectores (spots y stations) */
export interface SelectableItem {
  id: string
  name: string
}

/** Convierte Station a SelectableItem */
export const stationToSelectable = (station: Station): SelectableItem => ({
  id: station.buoyId,
  name: station.name,
})

/** Convierte grados a dirección cardinal */
export const degreesToCardinal = (degrees: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const index = Math.round(degrees / 45) % 8
  return directions[index]
}
