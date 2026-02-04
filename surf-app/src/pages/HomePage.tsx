import { useEffect, useMemo, useState } from 'react'
import {
  getSurfForecast,
  getStations,
  getTotalWaveHeight,
  getPrimarySwell,
} from '../services/api'
import './HomePage.css'
import type { SurfForecast, Station, SelectableItem } from '../types'
import { BottomSheet } from '../components/BottomSheet'
import { ForecastChart } from '../components/Forecast/ForecastChart'
import { SearchAutocomplete } from '../components/SearchAutocomplete'
import { StatusMessage } from '../components/StatusMessage'
import { SectionHeader } from '../components/SectionHeader'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { BuoyDetailContent } from '../components/BuoyDetailContent'
import { ForecastTable } from '../components/Forecast/ForecastTable'
import { Hero } from '../components/Hero'

interface HomePageProps {
  defaultSpotId: string
  defaultStationId: string
  onSelectSpot: (id: string) => void
  onSelectStation: (id: string) => void
}

export const HomePage = ({
  defaultSpotId,
  defaultStationId,
  onSelectSpot,
  onSelectStation,
}: HomePageProps) => {
  const [spotId, setSpotId] = useState(defaultSpotId)
  const [stationId, setStationId] = useState(defaultStationId)
  const [forecasts, setForecasts] = useState<SurfForecast[]>([])
  const [tab, setTab] = useState<'forecast' | 'buoy'>('forecast')
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  )
  const [spotSheetOpen, setSpotSheetOpen] = useState(false)
  const [buoySheetOpen, setBuoySheetOpen] = useState(false)
  const [stations, setStations] = useState<Station[]>([])

  // Sync local state with props when they change externally
  if (spotId !== defaultSpotId && !spotSheetOpen) {
    setSpotId(defaultSpotId)
  }
  if (stationId !== defaultStationId && !buoySheetOpen) {
    setStationId(defaultStationId)
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setStatus('loading')
      try {
        const [forecastResponse, stationData] = await Promise.all([
          getSurfForecast(spotId, 1, 48),
          getStations(),
        ])
        if (!mounted) return

        setForecasts(forecastResponse)
        setStations(stationData)
        setStatus('success')
      } catch {
        if (!mounted) return
        setStatus('error')
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [spotId, stationId])

  const selected = forecasts[2]

  console.log({ selected })

  const locale = 'es-ES'

  // Derived values
  const stationLabel = useMemo(
    () => stations.find((s) => s.buoyId === stationId)?.name ?? stationId,
    [stations, stationId],
  )

  const stationItems: SelectableItem[] = useMemo(
    () => stations.map((s) => ({ id: s.buoyId, name: s.name })),
    [stations],
  )

  if (status === 'loading') {
    return <StatusMessage message='Cargando...' />
  }

  if (status === 'error') {
    return <StatusMessage message='Error al cargar datos' variant='error' />
  }

  if (tab === 'forecast' && !forecasts.length) {
    return <StatusMessage message='No hay datos disponibles' />
  }

  const selectedTotalHeight = selected ? getTotalWaveHeight(selected) : 0
  const selectedPrimarySwell = selected ? getPrimarySwell(selected) : null

  return (
    <div className='space-y-3'>
      <div className='rounded-3xl border border-white/10 bg-ocean-800/70 px-3 py-3'>
        <SectionHeader
          title={tab === 'forecast' ? spotId : stationLabel}
          action={tab === 'forecast' ? 'Cambiar spot' : 'Cambiar boya'}
          onAction={() =>
            tab === 'forecast' ? setSpotSheetOpen(true) : setBuoySheetOpen(true)
          }
        />
        <div className='mt-2'>
          <SegmentedTabs
            options={[
              { label: 'Spots', value: 'forecast' },
              { label: 'Boyas', value: 'buoy' },
            ]}
            value={tab}
            onChange={(value) => setTab(value as 'forecast' | 'buoy')}
          />
        </div>

        {tab === 'forecast' && selected && (
          <Hero
            selectedTotalHeight={selectedTotalHeight}
            selectedPrimarySwell={selectedPrimarySwell}
            wind={selected.wind}
            energy={selected.energy}
          />
        )}

        {tab === 'buoy' && (
          <div className='mt-3'>
            <BuoyDetailContent stationId={stationId} />
          </div>
        )}
      </div>

      {tab === 'forecast' && forecasts.length > 0 && (
        <>
          <ForecastTable forecasts={forecasts} locale={locale} />
          <ForecastChart forecasts={forecasts} locale={locale} />
        </>
      )}

      <BottomSheet
        open={spotSheetOpen}
        title='Seleccionar spot'
        onClose={() => setSpotSheetOpen(false)}
        closeLabel='Cerrar'
      >
        <div className='p-4'>
          <label className='text-xs uppercase text-ocean-200'>
            ID del spot
            <input
              type='text'
              value={spotId}
              onChange={(e) => setSpotId(e.target.value)}
              className='mt-2 w-full rounded-xl border border-white/10 bg-ocean-800 px-3 py-2 text-sm text-white'
              placeholder='sopelana'
            />
          </label>
          <button
            onClick={() => {
              onSelectSpot(spotId)
              setSpotSheetOpen(false)
            }}
            className='mt-4 w-full rounded-xl bg-ocean-600 py-2 text-sm font-semibold text-white'
          >
            Confirmar
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={buoySheetOpen}
        title='Seleccionar boya'
        onClose={() => setBuoySheetOpen(false)}
        closeLabel='Cerrar'
      >
        <SearchAutocomplete
          items={stationItems}
          onSelect={(id) => {
            setStationId(id)
            onSelectStation(id)
            setBuoySheetOpen(false)
          }}
        />
      </BottomSheet>
    </div>
  )
}
