import type { SettingsState } from '../types'

const SETTINGS_KEY = 'surf-settings'

/** Configuración por defecto de la aplicación */
export const defaultSettings: SettingsState = {
  theme: 'dark',
  defaultSpotId: 'sopelana',
  defaultStationId: '2136',
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
