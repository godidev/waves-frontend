import { useEffect, useMemo, useState } from 'react'
import {
  getSurfForecast,
  getForecastSpots,
  getStations,
  getTotalWaveHeight,
  getPrimarySwell,
  getBuoyData,
} from '../services/api'
import './HomePage.css'
import type {
  SurfForecast,
  Station,
  SelectableItem,
  BuoyDataDoc,
} from '../types'
import { degreesToCardinal } from '../types'
import { ForecastChart } from '../components/Forecast/ForecastChart'
import { StatusMessage } from '../components/StatusMessage'
import { BuoyDetailContent } from '../components/BuoyDetailContent'
import { SectionHeader } from '../components/SectionHeader'
import { HomeSummaryCards } from '../components/HomeSummaryCards'
import { BuoySectionHeader } from '../components/BuoySectionHeader'

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
  const [forecasts, setForecasts] = useState<SurfForecast[]>([])
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  )
  const [spots, setSpots] = useState<string[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [latestBuoyRecord, setLatestBuoyRecord] = useState<BuoyDataDoc | null>(
    null,
  )
  const [buoyHours, setBuoyHours] = useState<'6' | '12' | '24'>('6')
  const activeSpotId = defaultSpotId
  const activeStationId = defaultStationId

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
    const loadSpots = async () => {
      try {
        const spotData = await getForecastSpots()
        if (!mounted) return
        setSpots(spotData)
      } catch (err) {
        console.error('Failed to load forecast spots:', err)
      }
    }

    void loadSpots()
    return () => {
      mounted = false
    }
  }, [])

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

  useEffect(() => {
    let mounted = true
    const loadLatestBuoy = async () => {
      try {
        const latest = await getBuoyData(activeStationId, 1)
        if (!mounted) return
        setLatestBuoyRecord(latest[0] ?? null)
      } catch (err) {
        console.error('Failed to load latest buoy record:', err)
        if (!mounted) return
        setLatestBuoyRecord(null)
      }
    }

    void loadLatestBuoy()
    return () => {
      mounted = false
    }
  }, [activeStationId])

  const selected = useMemo(
    () => forecasts[2] ?? forecasts[0] ?? null,
    [forecasts],
  )

  const locale = 'es-ES'

  const stationItems: SelectableItem[] = useMemo(
    () => stations.map((s) => ({ id: s.buoyId, name: s.name })),
    [stations],
  )

  const buoyOptions = useMemo(() => {
    const fallback = {
      id: defaultStationId,
      name:
        stations.find((s) => s.buoyId === defaultStationId)?.name ??
        defaultStationId,
    }
    const items = stationItems.length > 0 ? stationItems : [fallback]
    if (items.some((item) => item.id === defaultStationId)) return items
    return [fallback, ...items]
  }, [defaultStationId, stationItems, stations])

  const spotItems = useMemo(() => {
    const unique = Array.from(new Set([defaultSpotId, ...spots]))
    return unique.sort((a, b) => a.localeCompare(b, locale))
  }, [defaultSpotId, locale, spots])

  const capitalizeSpot = (spot: string) =>
    spot
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')

  const latestReadingText = latestBuoyRecord
    ? `${latestBuoyRecord.height.toFixed(2)}m | ${latestBuoyRecord.period.toFixed(1)}s`
    : '--'

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
  const selectedWaveDirection =
    selectedPrimarySwell?.angle !== undefined
      ? `${degreesToCardinal(selectedPrimarySwell.angle)} ${selectedPrimarySwell.angle.toFixed(0)}°`
      : '--'
  const selectedWindDirection =
    selected?.wind.angle !== undefined
      ? `${degreesToCardinal(selected.wind.angle)} ${selected.wind.angle.toFixed(0)}°`
      : '--'

  return (
    <div className='space-y-4'>
      {selected && (
        <HomeSummaryCards
          totalHeight={selectedTotalHeight}
          primaryPeriod={selectedPrimarySwell?.period ?? null}
          energy={selected.energy}
          waveAngle={selectedPrimarySwell?.angle ?? null}
          waveDirection={selectedWaveDirection}
          windAngle={selected.wind.angle}
          windDirection={selectedWindDirection}
          windSpeed={selected.wind.speed}
          latestBuoyRecord={latestBuoyRecord}
        />
      )}

      <div className='rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900'>
        <SectionHeader
          title='Forecast'
          actionNode={
            <select
              id='forecast-spot-select'
              value={activeSpotId}
              onChange={(event) => {
                onSelectSpot(event.target.value)
              }}
              className='max-w-[220px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:border-slate-600 dark:bg-slate-800 dark:text-sky-300'
              aria-label='Seleccionar spot'
            >
              {spotItems.map((spot) => (
                <option key={spot} value={spot}>
                  {capitalizeSpot(spot)}
                </option>
              ))}
            </select>
          }
        />
        <ForecastChart forecasts={forecasts} locale={locale} />
        <div className='mt-2 border-t border-slate-200 pt-5 dark:border-slate-700'>
          <BuoySectionHeader
            stationOptions={buoyOptions}
            selectedStationId={activeStationId}
            onStationChange={onSelectStation}
            buoyHours={buoyHours}
            onChangeHours={setBuoyHours}
            latestReading={latestReadingText}
          />
          <BuoyDetailContent
            stationId={activeStationId}
            viewMode='chart'
            hours={buoyHours}
            showRangeSelector={false}
            showMetrics={false}
          />
        </div>
      </div>
    </div>
  )
}
