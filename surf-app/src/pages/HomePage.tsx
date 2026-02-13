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
import { BuoyDetailContent } from '../components/BuoyDetailContent'
import { ForecastTable } from '../components/Forecast/ForecastTable'
import { Hero } from '../components/Hero'
import { SegmentedToggle } from '../components/SegmentedToggle'

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
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  )
  const [spotSheetOpen, setSpotSheetOpen] = useState(false)
  const [buoySheetOpen, setBuoySheetOpen] = useState(false)
  const [stations, setStations] = useState<Station[]>([])
  const [buoyHours, setBuoyHours] = useState<'6' | '12' | '24'>('6')
  const [showForecastTable, setShowForecastTable] = useState(false)
  const [showBuoyTable, setShowBuoyTable] = useState(false)
  const forecastInterval = 1
  const activeSpotId = spotSheetOpen ? spotId : defaultSpotId
  const activeStationId = buoySheetOpen ? stationId : defaultStationId

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setStatus('loading')
      try {
        const forecastResponse = await getSurfForecast(activeSpotId, 1, 72)
        if (!mounted) return

        setForecasts(forecastResponse)
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
  }, [activeSpotId])

  useEffect(() => {
    let mounted = true
    const loadStations = async () => {
      try {
        const stationData = await getStations()
        if (!mounted) return
        setStations(stationData)
      } catch (err) {
        console.error('Failed to load stations:', err)
      }
    }

    void loadStations()
    return () => {
      mounted = false
    }
  }, [])

  const selected = useMemo(() => forecasts[0] ?? null, [forecasts])

  const locale = 'es-ES'

  // Derived values
  const stationLabel = useMemo(
    () =>
      stations.find((s) => s.buoyId === activeStationId)?.name ??
      activeStationId,
    [stations, activeStationId],
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

  if (!forecasts.length) {
    return <StatusMessage message='No hay datos disponibles' />
  }

  const selectedTotalHeight = selected ? getTotalWaveHeight(selected) : 0
  const selectedPrimarySwell = selected ? getPrimarySwell(selected) : null

  return (
    <div className='space-y-4'>
      <div className='rounded-3xl border border-white/10 bg-ocean-900/50 px-3 py-3'>
        <SectionHeader
          title={activeSpotId}
          action='Cambiar spot'
          onAction={() => {
            setSpotId(defaultSpotId)
            setSpotSheetOpen(true)
          }}
        />
      </div>

      {selected && (
        <div className='rounded-3xl border border-white/10 bg-ocean-900/30 px-3 py-3'>
          <SectionHeader title='Resumen actual' />
          <Hero
            selectedTotalHeight={selectedTotalHeight}
            selectedPrimarySwell={selectedPrimarySwell}
            wind={selected.wind}
            energy={selected.energy}
          />
        </div>
      )}

      <div className='space-y-3 rounded-3xl border border-white/10 bg-ocean-900/40 p-3'>
        <SectionHeader title='Forecast próximos días' />

        <div className='grid grid-cols-1 items-center gap-2'>
          <button
            type='button'
            onClick={() => setShowForecastTable((prev) => !prev)}
            className='rounded-full border border-white/15 px-3 py-1.5 text-xs text-ocean-100 transition hover:bg-white/5'
          >
            {showForecastTable ? 'Ocultar tabla' : 'Ver tabla'}
          </button>
        </div>

        <ForecastChart
          forecasts={forecasts}
          locale={locale}
          interval={forecastInterval}
        />

        {showForecastTable && (
          <ForecastTable
            forecasts={forecasts}
            locale={locale}
            interval={forecastInterval}
            showIntervalControl={false}
          />
        )}
      </div>

      <div className='space-y-3 rounded-3xl border border-white/10 bg-ocean-900/40 p-3'>
        <SectionHeader
          title={`Boya · ${stationLabel}`}
          action='Cambiar boya'
          onAction={() => {
            setStationId(defaultStationId)
            setBuoySheetOpen(true)
          }}
        />

        <div className='grid grid-cols-2 items-center gap-2'>
          <SegmentedToggle
            options={[
              { label: '6h', value: '6' },
              { label: '12h', value: '12' },
              { label: '24h', value: '24' },
            ]}
            value={buoyHours}
            onChange={(value) => setBuoyHours(value as '6' | '12' | '24')}
          />
          <button
            type='button'
            onClick={() => setShowBuoyTable((prev) => !prev)}
            className='rounded-full border border-white/15 px-3 py-1.5 text-xs text-ocean-100 transition hover:bg-white/5'
          >
            {showBuoyTable ? 'Ocultar tabla' : 'Ver tabla'}
          </button>
        </div>

        <BuoyDetailContent
          stationId={activeStationId}
          viewMode={showBuoyTable ? 'both' : 'chart'}
          hours={buoyHours}
          showRangeSelector={false}
          showMetrics={false}
        />
      </div>

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
