import { useEffect, useState } from 'react'
import type { SettingsState } from '../types'
import { defaultSettings, getSettings, saveSettings } from '../services/storage'

/** Hook para gestionar la configuración de la aplicación */
export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    if (typeof window === 'undefined') return defaultSettings
    return getSettings()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    saveSettings(settings)
    document.documentElement.classList.toggle('dark', settings.theme === 'dark')
  }, [settings])

  return {
    settings,
    setSettings,
  }
}
