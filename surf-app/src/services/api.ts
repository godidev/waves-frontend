import type {
  Station,
  SurfForecast,
  BuoyInfoDoc,
  BuoyDataDoc,
  Spot,
} from '../types'

type SurfForecastVariant = 'hourly' | 'general'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const REQUEST_TIMEOUT_MS = 12000

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

export const getStations = async (): Promise<Station[]> => {
  const buoys = await fetchJson<BuoyInfoDoc[]>('/buoys')
  return buoys.map((buoy) => ({
    name: buoy.buoyName,
    buoyId: buoy.buoyId,
  }))
}

export const getBuoysList = async (): Promise<BuoyInfoDoc[]> => {
  return fetchJson<BuoyInfoDoc[]>('/buoys')
}

export const getBuoyInfo = async (buoyId: string): Promise<BuoyInfoDoc> => {
  return fetchJson<BuoyInfoDoc>(`/buoys/${buoyId}`)
}

export const getBuoyData = async (
  buoyId: string,
  limit = 6,
): Promise<BuoyDataDoc[]> => {
  type BuoyDataCacheItem = Omit<BuoyDataDoc, 'date'> & { date: string }
  const params = new URLSearchParams({
    limit: String(limit),
  })
  const data = await fetchJson<BuoyDataCacheItem[]>(
    `/buoys/${buoyId}/data?${params}`,
  )

  return data.map((item) => ({
    ...item,
    date: new Date(item.date),
  }))
}

export const getSurfForecast = async (
  spot: string,
  variant: SurfForecastVariant,
  page = 1,
  limit = 50,
): Promise<SurfForecast[]> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  return fetchJson<SurfForecast[]>(
    `/surf-forecast/${spot}/${variant}?${params}`,
  )
}

export const getSpots = async (): Promise<Spot[]> => {
  const spots = await fetchJson<Spot[]>('/spots')
  return spots.filter((spot) => spot.spotId.trim().length > 0)
}

export const getActiveSpots = async (): Promise<Spot[]> => {
  const spots = await fetchJson<Spot[]>('/spots/active')
  return spots.filter((spot) => spot.spotId.trim().length > 0)
}

export const getBuoysNear = async (
  longitude: number,
  latitude: number,
  maxDistanceKm: number,
): Promise<Station[]> => {
  const params = new URLSearchParams({
    longitude: String(longitude),
    latitude: String(latitude),
    maxDistanceKm: String(maxDistanceKm),
  })
  const buoys = await fetchJson<BuoyInfoDoc[]>(`/buoys/near?${params}`)
  return buoys.map((buoy) => ({
    name: buoy.buoyName,
    buoyId: buoy.buoyId,
  }))
}

export const updateSpotInfo = async (
  spotId: string,
  payload: {
    active: boolean
    coordinates?: [number, number]
  },
): Promise<Spot> => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`${API_BASE_URL}/spots/${spotId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`API ${response.status}: /spots/${spotId}`)
    }

    return (await response.json()) as Spot
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`API timeout: /spots/${spotId}`)
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
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
