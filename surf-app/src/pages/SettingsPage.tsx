import { useEffect, useMemo, useState } from 'react'
import type { SettingsState, Spot, Station } from '../types'
import { getSpots, getStations } from '../services/api'
import { PageHeader } from '../components/PageHeader'
import { SelectMenu } from '../components/SelectMenu'

const normalizeSpotId = (spotId: string): string =>
  spotId.trim().toLocaleLowerCase('es-ES')

interface SettingsPageProps {
  settings: SettingsState
  onUpdate: (next: SettingsState) => void
}

export const SettingsPage = ({ settings, onUpdate }: SettingsPageProps) => {
  const [spots, setSpots] = useState<Spot[]>([])
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

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const spotData = await getSpots()
        if (!mounted) return
        setSpots(spotData)
      } catch {
        // Handle error silently
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  const spotOptions = useMemo(() => {
    const map = new Map<string, { value: string; label: string }>()

    spots.forEach((spot) => {
      map.set(normalizeSpotId(spot.spotId), {
        value: spot.spotId,
        label: spot.spotName,
      })
    })

    if (!spots.length) {
      const normalizedDefault = normalizeSpotId(settings.defaultSpotId)
      map.set(normalizedDefault, {
        value: settings.defaultSpotId,
        label: settings.defaultSpotId,
      })
    }

    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label, 'es-ES'),
    )
  }, [settings.defaultSpotId, spots])

  const buoyOptions = useMemo(() => {
    const mapped = stations.map((station) => ({
      value: station.buoyId,
      label: station.name,
    }))

    if (mapped.some((option) => option.value === settings.defaultStationId)) {
      return mapped
    }

    return [
      { value: settings.defaultStationId, label: settings.defaultStationId },
      ...mapped,
    ]
  }, [settings.defaultStationId, stations])

  const selectClass =
    'w-full max-w-[220px] rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'

  return (
    <div className='space-y-6'>
      <PageHeader title='Ajustes' />
      <div className='rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900'>
        <div className='mt-2 space-y-4 text-sm text-slate-700 dark:text-slate-200'>
          <div className='flex items-center justify-between'>
            <span>Tema</span>
            <SelectMenu
              value={settings.theme}
              name='theme'
              onChange={(value) =>
                onUpdate({
                  ...settings,
                  theme: value as 'dark' | 'light',
                })
              }
              ariaLabel='Seleccionar tema'
              className={selectClass}
              options={[
                { value: 'dark', label: 'Oscuro' },
                { value: 'light', label: 'Claro' },
              ]}
            />
          </div>
          <div className='flex items-center justify-between'>
            <span>Spot por defecto</span>
            <SelectMenu
              value={settings.defaultSpotId}
              name='default-spot'
              onChange={(value) =>
                onUpdate({ ...settings, defaultSpotId: value })
              }
              ariaLabel='Seleccionar spot por defecto'
              className={selectClass}
              options={spotOptions}
            />
          </div>
          <div className='flex items-center justify-between'>
            <span>Boya por defecto</span>
            <SelectMenu
              value={settings.defaultStationId}
              name='default-buoy'
              onChange={(value) =>
                onUpdate({ ...settings, defaultStationId: value })
              }
              ariaLabel='Seleccionar boya por defecto'
              className={selectClass}
              options={buoyOptions}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
