import type { SettingsState } from '../types'

const SETTINGS_KEY = 'surf-settings'
const CACHE_PREFIX = 'surf-cache:'
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const CACHE_MAX_ENTRIES = 180
const CACHE_GC_INTERVAL_MS = 5 * 60 * 1000
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

type CacheRecord<T> = {
  entry: CacheEntry<T>
  expired: boolean
}

const memoryCache = new Map<string, CacheEntry<unknown>>()
let lastCacheGcAt = 0

const hasLocalStorage = (): boolean => {
  return (
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  )
}

const safeGetItem = (key: string): string | null => {
  if (!hasLocalStorage()) return null
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const safeSetItem = (key: string, value: string): boolean => {
  if (!hasLocalStorage()) return false
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

const safeRemoveItem = (key: string) => {
  if (!hasLocalStorage()) return
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore storage remove errors
  }
}

const getStorageKeysByPrefix = (prefix: string): string[] => {
  if (!hasLocalStorage()) return []

  const keys: string[] = []
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (key?.startsWith(prefix)) {
        keys.push(key)
      }
    }
  } catch {
    return []
  }

  return keys
}

const parseCacheEntry = <T>(raw: string): CacheEntry<T> | null => {
  try {
    const parsed = JSON.parse(raw) as Partial<CacheEntry<T>>
    if (typeof parsed.timestamp !== 'number') {
      return null
    }

    return {
      timestamp: parsed.timestamp,
      data: parsed.data as T,
    }
  } catch {
    return null
  }
}

const runCacheGc = (force = false) => {
  const now = Date.now()
  if (!force && now - lastCacheGcAt < CACHE_GC_INTERVAL_MS) {
    return
  }

  lastCacheGcAt = now
  const keys = getStorageKeysByPrefix(CACHE_PREFIX)
  if (!keys.length) return

  const validEntries: Array<{ key: string; timestamp: number }> = []

  keys.forEach((key) => {
    const raw = safeGetItem(key)
    if (!raw) {
      safeRemoveItem(key)
      return
    }

    const parsed = parseCacheEntry<unknown>(raw)
    if (!parsed) {
      safeRemoveItem(key)
      return
    }

    if (now - parsed.timestamp > CACHE_MAX_AGE_MS) {
      safeRemoveItem(key)
      return
    }

    validEntries.push({ key, timestamp: parsed.timestamp })
  })

  if (validEntries.length <= CACHE_MAX_ENTRIES) {
    return
  }

  validEntries
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(0, validEntries.length - CACHE_MAX_ENTRIES)
    .forEach((entry) => {
      safeRemoveItem(entry.key)
    })
}

/** Configuración por defecto de la aplicación */
export const defaultSettings: SettingsState = {
  theme: 'dark',
  defaultSpotId: 'sopelana',
  defaultStationId: '2136',
  buoySearchRadiusKm: 200,
}

/** Obtiene la configuración de la aplicación desde localStorage */
export const getSettings = (): SettingsState => {
  const raw = safeGetItem(SETTINGS_KEY)
  if (!raw) return defaultSettings
  try {
    return { ...defaultSettings, ...(JSON.parse(raw) as SettingsState) }
  } catch {
    return defaultSettings
  }
}

/** Guarda la configuración de la aplicación en localStorage */
export const saveSettings = (next: SettingsState) => {
  safeSetItem(SETTINGS_KEY, JSON.stringify(next))
}

const getCacheStorageKey = (resourceKey: string) =>
  `${CACHE_PREFIX}${resourceKey}`

const readCacheRecord = <T>(
  resourceKey: string,
  ttlMs: number,
): CacheRecord<T> | null => {
  const now = Date.now()

  const memoryEntry = memoryCache.get(resourceKey) as CacheEntry<T> | undefined
  if (memoryEntry) {
    return {
      entry: memoryEntry,
      expired: now - memoryEntry.timestamp > ttlMs,
    }
  }

  const raw = safeGetItem(getCacheStorageKey(resourceKey))
  if (!raw) return null

  const parsed = parseCacheEntry<T>(raw)
  if (!parsed) {
    safeRemoveItem(getCacheStorageKey(resourceKey))
    return null
  }

  memoryCache.set(resourceKey, parsed as CacheEntry<unknown>)

  return {
    entry: parsed,
    expired: now - parsed.timestamp > ttlMs,
  }
}

/** Obtiene un recurso cacheado si no ha expirado por TTL */
export const getCachedResource = <T>(
  resourceKey: string,
  ttlMs: number = CACHE_TTL_MS,
): T | null => {
  const record = readCacheRecord<T>(resourceKey, ttlMs)
  if (!record) return null
  if (record.expired) {
    memoryCache.delete(resourceKey)
    return null
  }

  return record.entry.data
}

/** Obtiene un recurso cacheado aunque esté expirado */
export const getCachedResourceStale = <T>(resourceKey: string): T | null => {
  const record = readCacheRecord<T>(resourceKey, Number.POSITIVE_INFINITY)
  if (!record) return null
  return record.entry.data
}

/** Guarda un recurso en caché (memoria + localStorage) */
export const setCachedResource = <T>(resourceKey: string, data: T) => {
  const entry: CacheEntry<T> = {
    timestamp: Date.now(),
    data,
  }
  memoryCache.set(resourceKey, entry as CacheEntry<unknown>)

  const serialized = JSON.stringify(entry)
  const storageKey = getCacheStorageKey(resourceKey)

  if (safeSetItem(storageKey, serialized)) {
    runCacheGc()
    return
  }

  runCacheGc(true)
  safeSetItem(storageKey, serialized)
}

/** Invalida explícitamente una clave de caché */
export const invalidateCachedResource = (resourceKey: string) => {
  memoryCache.delete(resourceKey)
  safeRemoveItem(getCacheStorageKey(resourceKey))
}
