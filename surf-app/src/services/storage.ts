import type { SettingsState } from '../types'

const SETTINGS_KEY = 'surf-settings'
const CACHE_PREFIX = 'surf-cache:'
export const CACHE_TTL_MS = 60 * 60 * 1000

export const CACHE_TTL = {
  forecast: 20 * 60 * 1000,
  buoyData: 15 * 60 * 1000,
  buoyInfo: 2 * 60 * 60 * 1000,
  stations: 6 * 60 * 60 * 1000,
} as const

type CacheEntry<T> = {
  timestamp: number
  data: T
}

const memoryCache = new Map<string, CacheEntry<unknown>>()

/** Configuración por defecto de la aplicación */
export const defaultSettings: SettingsState = {
  theme: 'dark',
  defaultSpotId: 'sopelana',
  defaultStationId: '2136',
  buoySearchRadiusKm: 200,
}

/** Obtiene la configuración de la aplicación desde localStorage */
export const getSettings = (): SettingsState => {
  const raw = localStorage.getItem(SETTINGS_KEY)
  if (!raw) return defaultSettings
  try {
    return { ...defaultSettings, ...(JSON.parse(raw) as SettingsState) }
  } catch {
    return defaultSettings
  }
}

/** Guarda la configuración de la aplicación en localStorage */
export const saveSettings = (next: SettingsState) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
}

const getCacheStorageKey = (resourceKey: string) =>
  `${CACHE_PREFIX}${resourceKey}`

/** Obtiene un recurso cacheado si no ha expirado por TTL */
export const getCachedResource = <T>(
  resourceKey: string,
  ttlMs: number = CACHE_TTL_MS,
): T | null => {
  const now = Date.now()

  const memoryEntry = memoryCache.get(resourceKey) as CacheEntry<T> | undefined
  if (memoryEntry) {
    if (now - memoryEntry.timestamp <= ttlMs) {
      return memoryEntry.data
    }
    memoryCache.delete(resourceKey)
  }

  const raw = localStorage.getItem(getCacheStorageKey(resourceKey))
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as CacheEntry<T>
    if (now - parsed.timestamp > ttlMs) {
      localStorage.removeItem(getCacheStorageKey(resourceKey))
      return null
    }
    memoryCache.set(resourceKey, parsed as CacheEntry<unknown>)
    return parsed.data
  } catch {
    localStorage.removeItem(getCacheStorageKey(resourceKey))
    return null
  }
}

/** Guarda un recurso en caché (memoria + localStorage) */
export const setCachedResource = <T>(resourceKey: string, data: T) => {
  const entry: CacheEntry<T> = {
    timestamp: Date.now(),
    data,
  }
  memoryCache.set(resourceKey, entry as CacheEntry<unknown>)
  localStorage.setItem(getCacheStorageKey(resourceKey), JSON.stringify(entry))
}

/** Invalida explícitamente una clave de caché */
export const invalidateCachedResource = (resourceKey: string) => {
  memoryCache.delete(resourceKey)
  localStorage.removeItem(getCacheStorageKey(resourceKey))
}
