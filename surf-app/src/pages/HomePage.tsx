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
import { BuoyDetailContent } from '../components/BuoyDetailContent'
import { ForecastTable } from '../components/Forecast/ForecastTable'

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
      <div className='flex items-center gap-3'>
        <button
          type='button'
          onClick={() => {
            setSpotId(defaultSpotId)
            setSpotSheetOpen(true)
          }}
          className='flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-100 px-4 py-2.5 text-left text-slate-500 shadow-sm'
        >
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className='h-5 w-5 text-slate-400'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='m21 21-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z'
            />
          </svg>
          <span className='truncate text-base leading-none'>
            Buscar Región o Boya
          </span>
        </button>
        <button
          type='button'
          onClick={() => setSpotSheetOpen(true)}
          className='rounded-full border border-slate-200 bg-slate-100 p-2.5 text-slate-500 shadow-sm'
          aria-label='Favoritos'
        >
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className='h-6 w-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='m12 21-1.8-1.64C5.2 14.78 2 11.86 2 8.3A4.8 4.8 0 0 1 6.9 3.5c1.85 0 3.63.86 4.78 2.21A6.38 6.38 0 0 1 16.46 3.5 4.8 4.8 0 0 1 21.36 8.3c0 3.56-3.2 6.48-8.2 11.07Z'
            />
          </svg>
        </button>
      </div>

      {selected && (
        <div className='grid grid-cols-3 divide-x divide-slate-200 rounded-3xl border border-slate-200 bg-white px-2 py-2.5 shadow-sm'>
          <div className='px-2'>
            <p className='text-[11px] uppercase tracking-wide text-slate-500'>
              Altura (m)
            </p>
            <p className='text-[30px] font-semibold leading-none text-slate-900'>
              {selectedTotalHeight.toFixed(2)}m
            </p>
          </div>
          <div className='px-2'>
            <p className='text-[11px] uppercase tracking-wide text-slate-500'>
              Periodo (s)
            </p>
            <p className='text-[30px] font-semibold leading-none text-slate-900'>
              {selectedPrimarySwell?.period ?? '--'}s
            </p>
          </div>
          <div className='px-2'>
            <p className='text-[11px] uppercase tracking-wide text-slate-500'>
              Energía
            </p>
            <p className='text-[30px] font-semibold leading-none text-slate-900'>
              ⚡ {selected.energy.toFixed(0)}
            </p>
          </div>
        </div>
      )}

      <div className='space-y-4 rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-semibold uppercase leading-none tracking-wide text-slate-600'>
            Oleaje & Energía
          </h2>
          <button
            type='button'
            onClick={() => {
              setStationId(defaultStationId)
              setBuoySheetOpen(true)
            }}
            className='text-sm font-semibold text-sky-600'
          >
            {stationLabel}
          </button>
        </div>
        <ForecastChart
          forecasts={forecasts}
          locale={locale}
          interval={forecastInterval}
        />
        <div className='border-t border-slate-200 pt-4'>
          <div className='mb-3 flex items-center justify-between gap-3'>
            <h3 className='text-2xl font-semibold uppercase leading-none tracking-wide text-slate-600'>
              Boyas
            </h3>
            <div className='flex items-center gap-3 text-base font-medium text-slate-500'>
              {(['6', '12', '24'] as const).map((hours) => (
                <button
                  key={hours}
                  type='button'
                  onClick={() => setBuoyHours(hours)}
                  className={`transition ${
                    buoyHours === hours
                      ? 'font-semibold text-sky-600'
                      : 'hover:text-slate-700'
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>
          <BuoyDetailContent
            stationId={activeStationId}
            viewMode='chart'
            hours={buoyHours}
            showRangeSelector={false}
            showMetrics={false}
          />
        </div>
      </div>

      <div className='space-y-3'>
        <h2 className='text-3xl font-semibold text-slate-900'>
          Pronóstico Horario
        </h2>
        <ForecastTable
          forecasts={forecasts}
          locale={locale}
          interval={forecastInterval}
          showIntervalControl={false}
        />
      </div>

      <BottomSheet
        open={spotSheetOpen}
        title='Seleccionar spot'
        onClose={() => setSpotSheetOpen(false)}
        closeLabel='Cerrar'
      >
        <div className='p-4'>
          <label className='text-xs uppercase tracking-wide text-slate-500'>
            ID del spot
            <input
              type='text'
              value={spotId}
              onChange={(e) => setSpotId(e.target.value)}
              className='mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800'
              placeholder='sopelana'
            />
          </label>
          <button
            onClick={() => {
              onSelectSpot(spotId)
              setSpotSheetOpen(false)
            }}
            className='mt-4 w-full rounded-2xl bg-sky-600 py-2 text-sm font-semibold text-white'
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
