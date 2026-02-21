import type { Station, SurfForecast, BuoyInfoDoc, BuoyDataDoc } from '../types'
import { CACHE_TTL, getCachedResource, setCachedResource } from './storage'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const REQUEST_TIMEOUT_MS = 12000
const inFlightRequests = new Map<string, Promise<unknown>>()

const fetchJson = async <T>(path: string): Promise<T> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`API ${response.status}: ${path}`)
    }

    return (await response.json()) as T
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`API timeout: ${path}`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}

const getScrapeCycleBucket = (): string => {
  const now = Date.now()
  const cycleMs = 30 * 60 * 1000
  const offsetMs = 5 * 60 * 1000
  const bucket = Math.floor((now - offsetMs) / cycleMs)
  return String(bucket)
}

const withCache = async <T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttlMs?: number,
): Promise<T> => {
  const cached = getCachedResource<T>(cacheKey, ttlMs)
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

export const getStations = async (): Promise<Station[]> => {
  return withCache(
    'stations:list:v1',
    async () => {
      const buoys = await fetchJson<BuoyInfoDoc[]>('/buoys')
      return buoys.map((buoy) => ({
        name: buoy.buoyName,
        buoyId: buoy.buoyId,
      }))
    },
    CACHE_TTL.stations,
  )
}

export const getBuoysList = async (): Promise<BuoyInfoDoc[]> => {
  return withCache(
    'buoys:list:v1',
    async () => fetchJson<BuoyInfoDoc[]>('/buoys'),
    CACHE_TTL.stations,
  )
}

export const getBuoyInfo = async (buoyId: string): Promise<BuoyInfoDoc> => {
  return withCache(
    `buoy:info:${buoyId}:v1`,
    async () => fetchJson<BuoyInfoDoc>(`/buoys/${buoyId}`),
    CACHE_TTL.buoyInfo,
  )
}

export const getBuoyData = async (
  buoyId: string,
  limit = 6,
): Promise<BuoyDataDoc[]> => {
  type BuoyDataCacheItem = Omit<BuoyDataDoc, 'date'> & { date: string }

  const scrapeBucket = getScrapeCycleBucket()
  const cacheKey = `buoy:data:${buoyId}:limit:${limit}:bucket:${scrapeBucket}:v1`

  const data = await withCache<BuoyDataCacheItem[]>(
    cacheKey,
    async () => {
      const params = new URLSearchParams({
        limit: String(limit),
      })
      return fetchJson<BuoyDataCacheItem[]>(`/buoys/${buoyId}/data?${params}`)
    },
    CACHE_TTL.buoyData,
  )

  return data.map((item) => ({
    ...item,
    date: new Date(item.date),
  }))
}

export const getSurfForecast = async (
  spot: string,
  page = 1,
  limit = 50,
): Promise<SurfForecast[]> => {
  const scrapeBucket = getScrapeCycleBucket()
  const cacheKey = `spot:forecast:${spot}:page:${page}:limit:${limit}:bucket:${scrapeBucket}:v1`

  return withCache(
    cacheKey,
    async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      return fetchJson<SurfForecast[]>(`/surf-forecast/${spot}?${params}`)
    },
    CACHE_TTL.forecast,
  )
}

export const getForecastSpots = async (): Promise<string[]> => {
  return withCache(
    'spots:list:v1',
    async () => {
      const spots = await fetchJson<string[]>('/surf-forecast/spots')
      return spots.map((spot) => spot.trim()).filter((spot) => spot.length > 0)
    },
    CACHE_TTL.stations,
  )
}

export const getPrimarySwell = (forecast: SurfForecast) => {
  if (!forecast.validSwells.length) return null
  return forecast.validSwells.reduce((max, swell) =>
    swell.height > max.height ? swell : max,
  )
}

export const getTotalWaveHeight = (forecast: SurfForecast): number => {
  if (!forecast.validSwells.length) return 0
  const sumOfSquares = forecast.validSwells.reduce(
    (sum, swell) => sum + swell.height ** 2,
    0,
  )
  return Math.sqrt(sumOfSquares)
}
