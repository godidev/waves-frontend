import { useEffect, useState } from 'react'
import type { SettingsState, Station, SelectableItem } from '../types'
import { BottomSheet } from '../components/BottomSheet'
import { SearchAutocomplete } from '../components/SearchAutocomplete'
import { getStations } from '../services/api'
import { PageHeader } from '../components/PageHeader'

interface SettingsPageProps {
  settings: SettingsState
  onUpdate: (next: SettingsState) => void
}

export const SettingsPage = ({ settings, onUpdate }: SettingsPageProps) => {
  const [spotSheetOpen, setSpotSheetOpen] = useState(false)
  const [buoySheetOpen, setBuoySheetOpen] = useState(false)
  const [stations, setStations] = useState<Station[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const stationData = await getStations()
        if (!mounted) return
        setStations(stationData)
      } catch {
        // Handle error silently
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  // Convert stations to selectable items
  const stationItems: SelectableItem[] = stations.map((s) => ({
    id: s.buoyId,
    name: s.name,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Ajustes" />
      <div className="rounded-3xl border border-white/10 bg-ocean-800/70 p-5">
        <div className="mt-2 space-y-4 text-sm text-ocean-100">
          <div className="flex items-center justify-between">
            <span>Tema</span>
            <select
              value={settings.theme}
              onChange={(event) => onUpdate({ ...settings, theme: event.target.value as 'dark' | 'light' })}
              className="rounded-xl border border-white/10 bg-ocean-900 px-3 py-2 text-xs"
            >
              <option value="dark">Oscuro</option>
              <option value="light">Claro</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span>Spot por defecto</span>
            <button
              onClick={() => setSpotSheetOpen(true)}
              className="rounded-full border border-white/10 px-3 py-2 text-xs"
              type="button"
            >
              {settings.defaultSpotId || 'sopelana'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span>Boya por defecto</span>
            <button
              onClick={() => setBuoySheetOpen(true)}
              className="rounded-full border border-white/10 px-3 py-2 text-xs"
              type="button"
            >
              {stations.find((item) => item.buoyId === settings.defaultStationId)?.name ??
                settings.defaultStationId}
            </button>
          </div>
        </div>
      </div>

      <BottomSheet
        open={spotSheetOpen}
        title="Seleccionar spot"
        onClose={() => setSpotSheetOpen(false)}
        closeLabel="Cerrar"
      >
        <div className="p-4">
          <label className="text-xs uppercase text-ocean-200">
            ID del spot
            <input
              type="text"
              value={settings.defaultSpotId}
              onChange={(e) => onUpdate({ ...settings, defaultSpotId: e.target.value })}
              className="mt-2 w-full rounded-xl border border-white/10 bg-ocean-800 px-3 py-2 text-sm text-white"
              placeholder="sopelana"
            />
          </label>
          <button
            onClick={() => setSpotSheetOpen(false)}
            className="mt-4 w-full rounded-xl bg-ocean-600 py-2 text-sm font-semibold text-white"
          >
            Confirmar
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={buoySheetOpen}
        title="Seleccionar boya"
        onClose={() => setBuoySheetOpen(false)}
        closeLabel="Cerrar"
      >
        <SearchAutocomplete
          items={stationItems}
          onSelect={(id) => {
            onUpdate({ ...settings, defaultStationId: id })
            setBuoySheetOpen(false)
          }}
        />
      </BottomSheet>
    </div>
  )
}
