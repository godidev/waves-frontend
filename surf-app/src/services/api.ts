import type { Station, SurfForecast, BuoyInfoDoc, BuoyDataDoc } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Obtiene el listado de estaciones de boyas disponibles
 * Usa el endpoint /buoys y convierte a formato Station
 */
export const getStations = async (): Promise<Station[]> => {
  const response = await fetch(`${API_BASE_URL}/buoys`)
  if (!response.ok) {
    throw new Error('Failed to fetch stations')
  }
  const buoys: BuoyInfoDoc[] = await response.json()
  // Convertir BuoyInfoDoc[] a Station[]
  return buoys.map((buoy) => ({
    name: buoy.buoyName,
    buoyId: buoy.buoyId,
  }))
}

/**
 * Obtiene el listado de boyas con información de ubicación
 * GET /buoys
 */
export const getBuoysList = async (): Promise<BuoyInfoDoc[]> => {
  const response = await fetch(`${API_BASE_URL}/buoys`)
  if (!response.ok) {
    throw new Error('Failed to fetch buoys list')
  }
  return response.json()
}

/**
 * Obtiene información detallada de una boya específica
 * GET /buoys/:id
 */
export const getBuoyInfo = async (buoyId: string): Promise<BuoyInfoDoc> => {
  const response = await fetch(`${API_BASE_URL}/buoys/${buoyId}`)
  if (!response.ok) {
    throw new Error('Failed to fetch buoy info')
  }
  return response.json()
}

/**
 * Obtiene datos históricos de mediciones de una boya específica
 * GET /buoys/:id/data
 */
export const getBuoyData = async (
  buoyId: string,
  limit = 6,
): Promise<BuoyDataDoc[]> => {
  const params = new URLSearchParams({
    limit: String(limit),
  })
  const response = await fetch(`${API_BASE_URL}/buoys/${buoyId}/data?${params}`)
  if (!response.ok) {
    throw new Error('Failed to fetch buoy data')
  }
  const data: BuoyDataDoc[] = await response.json()
  // Convert date strings to Date objects
  return data.map((item) => ({
    ...item,
    date: new Date(item.date),
  }))
}

/**
 * Obtiene la previsión de surf para un spot específico
 * GET /surf-forecast/:spot?page=X&limit=Y
 */
export const getSurfForecast = async (
  spot: string,
  page = 1,
  limit = 50,
): Promise<SurfForecast[]> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  console.log({ spot })
  const response = await fetch(
    `${API_BASE_URL}/surf-forecast/${spot}?${params}`,
  )
  if (!response.ok) {
    throw new Error('Failed to fetch surf forecast')
  }
  return response.json()
}

// ============================================
// Helper functions for UI compatibility
// ============================================

/**
 * Obtiene el swell principal (el de mayor altura) de un forecast
 */
export const getPrimarySwell = (forecast: SurfForecast) => {
  if (!forecast.validSwells.length) return null
  return forecast.validSwells.reduce((max, swell) =>
    swell.height > max.height ? swell : max,
  )
}

/**
 * Calcula la altura total combinada de todos los swells
 */
export const getTotalWaveHeight = (forecast: SurfForecast): number => {
  if (!forecast.validSwells.length) return 0
  // Usamos la fórmula de suma cuadrática para combinar alturas de olas
  const sumOfSquares = forecast.validSwells.reduce(
    (sum, swell) => sum + swell.height ** 2,
    0,
  )
  return Math.sqrt(sumOfSquares)
}
