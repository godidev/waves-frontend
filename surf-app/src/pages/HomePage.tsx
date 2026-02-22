import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import {
  getSurfForecast,
  getForecastSpots,
  getStations,
  getTotalWaveHeight,
  getPrimarySwell,
  getBuoyData,
} from '../services/api'
import './HomePage.css'
import type { SurfForecast, Station, BuoyDataDoc } from '../types'
import { degreesToCardinal } from '../types'
import { StatusMessage } from '../components/StatusMessage'
import { SectionHeader } from '../components/SectionHeader'
import { SelectMenu } from '../components/SelectMenu'
import { HomeSummaryCards } from '../components/HomeSummaryCards'

const ForecastChart = lazy(() =>
  import('../components/Forecast/ForecastChart').then((module) => ({
    default: module.ForecastChart,
  })),
)

const BuoyDetailContent = lazy(() =>
  import('../components/BuoyDetailContent').then((module) => ({
    default: module.BuoyDetailContent,
  })),
)

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
  const [hourlyForecasts, setHourlyForecasts] = useState<SurfForecast[]>([])
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  )
  const [spots, setSpots] = useState<string[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [latestBuoyRecord, setLatestBuoyRecord] = useState<BuoyDataDoc | null>(
    null,
  )
  const [forecastRange, setForecastRange] = useState<'48h' | '7d'>('48h')
  const [buoyHours, setBuoyHours] = useState<'6' | '12' | '24'>('6')
  const activeSpotId = defaultSpotId
  const activeStationId = defaultStationId
  const forecastVariant = forecastRange === '48h' ? 'hourly' : 'general'
  const forecastLimit = forecastRange === '48h' ? 72 : 21

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setStatus('loading')
      try {
        const forecastResponse = await getSurfForecast(
          activeSpotId,
          forecastVariant,
          1,
          forecastLimit,
        )
        if (!mounted) return

        setForecasts(forecastResponse)

        if (forecastVariant === 'hourly') {
          setHourlyForecasts(forecastResponse)
        } else {
          try {
            const hourlyResponse = await getSurfForecast(
              activeSpotId,
              'hourly',
              1,
              72,
            )
            if (!mounted) return
            setHourlyForecasts(hourlyResponse)
          } catch (err) {
            console.error('Failed to load hourly forecast summary data:', err)
            if (!mounted) return
            setHourlyForecasts([])
          }
        }

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
  }, [activeSpotId, forecastLimit, forecastVariant])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now())
    }, 60000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

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

  const selected = useMemo(() => {
    if (!hourlyForecasts.length) return null

    return hourlyForecasts.reduce((closest, forecast) => {
      const forecastTime = new Date(forecast.date).getTime()
      const closestTime = new Date(closest.date).getTime()
      return Math.abs(forecastTime - nowMs) < Math.abs(closestTime - nowMs)
        ? forecast
        : closest
    })
  }, [hourlyForecasts, nowMs])

  const locale = 'es-ES'

  const buoyOptions = useMemo(() => {
    const fallback = {
      id: defaultStationId,
      name:
        stations.find((s) => s.buoyId === defaultStationId)?.name ??
        defaultStationId,
    }
    const items =
      stations.length > 0
        ? stations.map((station) => ({
            id: station.buoyId,
            name: station.name,
          }))
        : [fallback]
    if (items.some((item) => item.id === defaultStationId)) return items
    return [fallback, ...items]
  }, [defaultStationId, stations])

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
  const sectionSelectClass =
    'mb-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'

  if (status === 'loading') {
    return <StatusMessage message='Cargando…' />
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
  const forecastCurrentText = selectedPrimarySwell
    ? `${selectedTotalHeight.toFixed(2)}m | ${selectedPrimarySwell.period.toFixed(1)}s`
    : `${selectedTotalHeight.toFixed(2)}m | --`

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
          nowMs={nowMs}
        />
      )}

      <div className='rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900'>
        <SectionHeader
          title='Forecast'
          subtitle={forecastCurrentText}
          rightNode={
            <div
              role='group'
              aria-label='Rango del forecast'
              className='flex items-center gap-3 text-base font-medium text-slate-700 dark:text-slate-200'
            >
              {(['48h', '7d'] as const).map((range) => (
                <button
                  key={range}
                  type='button'
                  aria-pressed={forecastRange === range}
                  onClick={() => setForecastRange(range)}
                  className={`touch-manipulation transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                    forecastRange === range
                      ? 'font-semibold text-sky-700 dark:text-sky-300'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          }
        />
        <SelectMenu
          value={activeSpotId}
          onChange={onSelectSpot}
          ariaLabel='Seleccionar spot'
          className={sectionSelectClass}
          options={spotItems.map((spot) => ({
            value: spot,
            label: capitalizeSpot(spot),
          }))}
        />
        <Suspense fallback={<StatusMessage message='Cargando…' />}>
          <ForecastChart
            forecasts={forecasts}
            locale={locale}
            range={forecastRange}
          />
        </Suspense>
        <div className='mt-2 border-t border-slate-200 pt-5 dark:border-slate-700'>
          <SectionHeader
            title='Boyas'
            subtitle={latestReadingText}
            rightNode={
              <div
                role='group'
                aria-label='Rango de horas de boya'
                className='flex items-center gap-3 text-base font-medium text-slate-700 dark:text-slate-200'
              >
                {(['6', '12', '24'] as const).map((hours) => (
                  <button
                    key={hours}
                    type='button'
                    aria-pressed={buoyHours === hours}
                    onClick={() => setBuoyHours(hours)}
                    className={`touch-manipulation transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      buoyHours === hours
                        ? 'font-semibold text-sky-700 dark:text-sky-300'
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
            }
          />
          <SelectMenu
            value={activeStationId}
            onChange={onSelectStation}
            ariaLabel='Seleccionar boya'
            className={sectionSelectClass}
            options={buoyOptions.map((station) => ({
              value: station.id,
              label: station.name,
            }))}
          />
          <Suspense fallback={<StatusMessage message='Cargando…' />}>
            <BuoyDetailContent
              stationId={activeStationId}
              viewMode='chart'
              hours={buoyHours}
              showRangeSelector={false}
              showMetrics={false}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
