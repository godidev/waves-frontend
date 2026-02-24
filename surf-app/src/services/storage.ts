import type { SettingsState } from '../types'

const SETTINGS_KEY = 'surf-settings'

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
