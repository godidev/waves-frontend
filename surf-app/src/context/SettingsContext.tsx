import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { SettingsState } from '../types'
import { defaultSettings, getSettings, saveSettings } from '../services/storage'

type SettingsAction =
  | { type: 'update'; payload: Partial<SettingsState> }
  | { type: 'replace'; payload: SettingsState }

interface SettingsContextValue {
  settings: SettingsState
  updateSettings: (patch: Partial<SettingsState>) => void
  replaceSettings: (next: SettingsState) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const settingsReducer = (
  state: SettingsState,
  action: SettingsAction,
): SettingsState => {
  if (action.type === 'replace') {
    return action.payload
  }

  return {
    ...state,
    ...action.payload,
  }
}

interface SettingsProviderProps {
  children: ReactNode
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, dispatch] = useReducer(
    settingsReducer,
    defaultSettings,
    () => {
      if (typeof window === 'undefined') return defaultSettings
      return getSettings()
    },
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    saveSettings(settings)
    document.documentElement.classList.toggle('dark', settings.theme === 'dark')
  }, [settings])

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      updateSettings: (patch) => {
        dispatch({ type: 'update', payload: patch })
      },
      replaceSettings: (next) => {
        dispatch({ type: 'replace', payload: next })
      },
    }),
    [settings],
  )

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSettingsContext = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettingsContext must be used within SettingsProvider')
  }
  return context
}
