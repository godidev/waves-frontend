import type { Station, SurfForecast, BuoyInfoDoc, BuoyDataDoc } from '../types'
import { getCachedResource, setCachedResource } from './storage'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const inFlightRequests = new Map<string, Promise<unknown>>()

const withCache = async <T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
): Promise<T> => {
  const cached = getCachedResource<T>(cacheKey)
  if (cached !== null) return cached

  const inFlight = inFlightRequests.get(cacheKey) as Promise<T> | undefined
  if (inFlight) return inFlight

  const request = (async () => {
    const freshData = await fetcher()
    setCachedResource(cacheKey, freshData)
    return freshData
  })()

  inFlightRequests.set(cacheKey, request)
  try {
    return await request
  } finally {
    inFlightRequests.delete(cacheKey)
  }
}

/**
 * Obtiene el listado de estaciones de boyas disponibles
 * Usa el endpoint /buoys y convierte a formato Station
 */
export const getStations = async (): Promise<Station[]> => {
  return withCache('stations:list:v1', async () => {
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
  })
}

/**
 * Obtiene el listado de boyas con información de ubicación
 * GET /buoys
 */
export const getBuoysList = async (): Promise<BuoyInfoDoc[]> => {
  return withCache('buoys:list:v1', async () => {
    const response = await fetch(`${API_BASE_URL}/buoys`)
    if (!response.ok) {
      throw new Error('Failed to fetch buoys list')
    }
    return response.json()
  })
}

/**
 * Obtiene información detallada de una boya específica
 * GET /buoys/:id
 */
export const getBuoyInfo = async (buoyId: string): Promise<BuoyInfoDoc> => {
  return withCache(`buoy:info:${buoyId}:v1`, async () => {
    const response = await fetch(`${API_BASE_URL}/buoys/${buoyId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch buoy info')
    }
    return response.json()
  })
}

/**
 * Obtiene datos históricos de mediciones de una boya específica
 * GET /buoys/:id/data
 */
export const getBuoyData = async (
  buoyId: string,
  limit = 6,
): Promise<BuoyDataDoc[]> => {
  type BuoyDataCacheItem = Omit<BuoyDataDoc, 'date'> & { date: string }

  const cacheKey = `buoy:data:${buoyId}:limit:${limit}:v1`
  const data = await withCache<BuoyDataCacheItem[]>(cacheKey, async () => {
    const params = new URLSearchParams({
      limit: String(limit),
    })
    const response = await fetch(
      `${API_BASE_URL}/buoys/${buoyId}/data?${params}`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch buoy data')
    }
    return response.json()
  })

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
  const cacheKey = `spot:forecast:${spot}:page:${page}:limit:${limit}:v1`

  return withCache(cacheKey, async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    })
    const response = await fetch(
      `${API_BASE_URL}/surf-forecast/${spot}?${params}`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch surf forecast')
    }
    return response.json()
  })
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
