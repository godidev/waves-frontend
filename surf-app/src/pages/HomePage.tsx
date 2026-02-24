import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import {
  getSurfForecast,
  getSpots,
  getBuoysNear,
  getTotalWaveHeight,
  getPrimarySwell,
  getBuoyData,
} from '../services/api'
import './HomePage.css'
import type { SurfForecast, Station, BuoyDataDoc, Spot } from '../types'
import { degreesToCardinal } from '../types'
import { StatusMessage } from '../components/StatusMessage'
import { SectionHeader } from '../components/SectionHeader'
import { SelectMenu } from '../components/SelectMenu'
import { HomeSummaryCards } from '../components/HomeSummaryCards'

const formatNumber = (value: number, locale: string, digits = 0): string =>
  value.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

const normalizeSpotId = (spotId: string): string =>
  spotId.trim().toLocaleLowerCase('es-ES')

const clampBuoySearchRadiusKm = (value: number): number =>
  Math.min(1000, Math.max(10, Math.round(value)))

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
  buoySearchRadiusKm: number
  onSelectSpot: (id: string) => void
  onSelectStation: (id: string) => void
  onSelectBuoySearchRadiusKm: (value: number) => void
}

export const HomePage = ({
  defaultSpotId,
  defaultStationId,
  buoySearchRadiusKm,
  onSelectSpot,
  onSelectStation,
  onSelectBuoySearchRadiusKm,
}: HomePageProps) => {
  const [forecasts, setForecasts] = useState<SurfForecast[]>([])
  const [hourlyForecasts, setHourlyForecasts] = useState<SurfForecast[]>([])
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  )
  const [spots, setSpots] = useState<Spot[]>([])
  const [spotsLoaded, setSpotsLoaded] = useState(false)
  const [stations, setStations] = useState<Station[]>([])
  const [nearbyBuoysStatus, setNearbyBuoysStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [latestBuoyRecord, setLatestBuoyRecord] = useState<BuoyDataDoc | null>(
    null,
  )
  const [forecastRange, setForecastRange] = useState<'48h' | '7d'>('48h')
  const [forecastViewMode, setForecastViewMode] = useState<'chart' | 'table'>(
    'chart',
  )
  const [buoyHours, setBuoyHours] = useState<'6' | '12' | '24'>('6')
  const [buoyViewMode, setBuoyViewMode] = useState<'chart' | 'table'>('chart')
  const safeBuoySearchRadiusKm = clampBuoySearchRadiusKm(buoySearchRadiusKm)
  const [draftBuoySearchRadiusKm, setDraftBuoySearchRadiusKm] = useState(
    safeBuoySearchRadiusKm,
  )
  const activeSpotId = defaultSpotId
  const activeStationId = defaultStationId
  const forecastVariant = forecastRange === '48h' ? 'hourly' : 'general'
  const forecastLimit = forecastRange === '48h' ? 72 : 21

  useEffect(() => {
    if (safeBuoySearchRadiusKm !== buoySearchRadiusKm) {
      onSelectBuoySearchRadiusKm(safeBuoySearchRadiusKm)
    }
  }, [buoySearchRadiusKm, onSelectBuoySearchRadiusKm, safeBuoySearchRadiusKm])

  useEffect(() => {
    setDraftBuoySearchRadiusKm(safeBuoySearchRadiusKm)
  }, [safeBuoySearchRadiusKm])

  const commitBuoySearchRadiusKm = () => {
    if (draftBuoySearchRadiusKm !== safeBuoySearchRadiusKm) {
      onSelectBuoySearchRadiusKm(draftBuoySearchRadiusKm)
    }
  }

  const resolvedSpotId = useMemo(() => {
    if (!spots.length) return activeSpotId

    const byId = spots.find(
      (spot) => normalizeSpotId(spot.spotId) === normalizeSpotId(activeSpotId),
    )
    if (byId) return byId.spotId

    const byName = spots.find(
      (spot) =>
        normalizeSpotId(spot.spotName) === normalizeSpotId(activeSpotId),
    )
    if (byName) return byName.spotId

    return spots[0].spotId
  }, [activeSpotId, spots])

  const resolvedSpot = useMemo(
    () => spots.find((spot) => spot.spotId === resolvedSpotId) ?? null,
    [resolvedSpotId, spots],
  )

  useEffect(() => {
    let mounted = true
    const load = async () => {
      if (!spotsLoaded) return

      setStatus('loading')
      try {
        const forecastResponse = await getSurfForecast(
          resolvedSpotId,
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
              resolvedSpotId,
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
  }, [forecastLimit, forecastVariant, resolvedSpotId, spotsLoaded])

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
        const spotData = await getSpots()
        if (!mounted) return
        setSpots(spotData.filter((spot) => spot.active === true))
      } catch (err) {
        console.error('Failed to load forecast spots:', err)
      } finally {
        if (mounted) setSpotsLoaded(true)
      }
    }

    void loadSpots()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!spots.length) return

    const byId = spots.find(
      (spot) => normalizeSpotId(spot.spotId) === normalizeSpotId(activeSpotId),
    )
    if (byId && byId.spotId !== activeSpotId) {
      onSelectSpot(byId.spotId)
      return
    }

    if (!byId) {
      const byName = spots.find(
        (spot) =>
          normalizeSpotId(spot.spotName) === normalizeSpotId(activeSpotId),
      )
      if (byName) {
        onSelectSpot(byName.spotId)
        return
      }

      onSelectSpot(spots[0].spotId)
    }
  }, [activeSpotId, onSelectSpot, spots])

  useEffect(() => {
    let mounted = true
    const coordinates = resolvedSpot?.location?.coordinates
    if (!coordinates || coordinates.length < 2) {
      setStations([])
      setNearbyBuoysStatus('error')
      return () => {
        mounted = false
      }
    }

    const [longitude, latitude] = coordinates
    setNearbyBuoysStatus('loading')
    setStations([])

    const loadNearbyStations = async () => {
      try {
        const stationData = await getBuoysNear(
          longitude,
          latitude,
          safeBuoySearchRadiusKm,
        )
        if (!mounted) return
        setStations(stationData)
        setNearbyBuoysStatus('success')
      } catch (err) {
        console.error('Failed to load nearby buoys:', err)
        if (!mounted) return
        setStations([])
        setNearbyBuoysStatus('error')
      }
    }

    void loadNearbyStations()
    return () => {
      mounted = false
    }
  }, [resolvedSpot, safeBuoySearchRadiusKm])

  useEffect(() => {
    if (!stations.length) return
    if (stations.some((station) => station.buoyId === activeStationId)) return
    onSelectStation(stations[0].buoyId)
  }, [activeStationId, onSelectStation, stations])

  useEffect(() => {
    if (!activeStationId) {
      setLatestBuoyRecord(null)
      return
    }
    if (!stations.some((station) => station.buoyId === activeStationId)) {
      setLatestBuoyRecord(null)
      return
    }

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
  }, [activeStationId, stations])

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
    return stations.map((station) => ({
      id: station.buoyId,
      name: station.name,
    }))
  }, [stations])

  const hasActiveBuoy = buoyOptions.some((item) => item.id === activeStationId)
  const isBuoySelectorDisabled =
    nearbyBuoysStatus === 'loading' || buoyOptions.length === 0
  const buoySelectOptions =
    nearbyBuoysStatus === 'loading'
      ? [{ value: activeStationId || 'loading', label: 'Buscando boyas...' }]
      : buoyOptions.length > 0
        ? buoyOptions.map((station) => ({
            value: station.id,
            label: station.name,
          }))
        : [{ value: 'none', label: 'Sin boyas cercanas' }]
  const buoySelectValue =
    nearbyBuoysStatus === 'loading'
      ? activeStationId || 'loading'
      : hasActiveBuoy
        ? activeStationId
        : (buoyOptions[0]?.id ?? 'none')

  const spotItems = useMemo(() => {
    const map = new Map<string, { value: string; label: string }>()

    spots.forEach((spot) => {
      map.set(normalizeSpotId(spot.spotId), {
        value: spot.spotId,
        label: spot.spotName,
      })
    })

    if (!spots.length) {
      map.set(normalizeSpotId(defaultSpotId), {
        value: defaultSpotId,
        label: defaultSpotId,
      })
    }

    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label, locale),
    )
  }, [defaultSpotId, locale, spots])

  const latestReadingText = latestBuoyRecord
    ? `${formatNumber(latestBuoyRecord.height, locale, 2)} m · ${formatNumber(latestBuoyRecord.period, locale, 1)} s`
    : '--'
  const headerSelectClass =
    'w-[48vw] min-w-[170px] max-w-[220px] rounded-lg border border-slate-200 bg-white/80 px-2 py-1 text-xs font-medium text-slate-700 focus:border-sky-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100'
  const compactGroupClass =
    'inline-flex items-center rounded-full border border-slate-200 bg-white/90 p-0.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800/80'

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
    ? `${formatNumber(selectedTotalHeight, locale, 2)} m · ${formatNumber(selectedPrimarySwell.period, locale, 1)} s`
    : `${formatNumber(selectedTotalHeight, locale, 2)} m · --`

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

      <div className='space-y-4 rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white via-slate-50/80 to-slate-100/70 p-2.5 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/70'>
        <SectionHeader
          title='Previsión'
          subtitle={forecastCurrentText}
          rightNode={
            <div className='shrink-0'>
              <SelectMenu
                value={resolvedSpotId}
                onChange={onSelectSpot}
                ariaLabel='Seleccionar spot'
                className={headerSelectClass}
                options={spotItems}
              />
            </div>
          }
        />
        <div className='mb-2 flex flex-wrap items-center justify-center gap-4'>
          <div className='inline-flex items-center gap-1.5'>
            <span className='text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300'>
              Tiempo
            </span>
            <div
              role='group'
              aria-label='Rango del forecast'
              className={compactGroupClass}
            >
              {(['48h', '7d'] as const).map((range) => (
                <button
                  key={range}
                  type='button'
                  aria-pressed={forecastRange === range}
                  onClick={() => setForecastRange(range)}
                  className={`rounded-full px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                    forecastRange === range
                      ? 'bg-sky-100 font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-200'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className='inline-flex items-center gap-1.5'>
            <span className='text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300'>
              Tipo
            </span>
            <div
              role='group'
              aria-label='Vista de previsión'
              className={compactGroupClass}
            >
              {(
                [
                  { label: 'Gráfico', value: 'chart' },
                  { label: 'Tabla', value: 'table' },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type='button'
                  aria-pressed={forecastViewMode === option.value}
                  onClick={() => setForecastViewMode(option.value)}
                  className={`rounded-full px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                    forecastViewMode === option.value
                      ? 'bg-emerald-100 font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Suspense fallback={<StatusMessage message='Cargando…' />}>
          <ForecastChart
            forecasts={forecasts}
            locale={locale}
            range={forecastRange}
            nowMs={nowMs}
            viewMode={forecastViewMode}
          />
        </Suspense>
        <div className='rounded-2xl p-2.5'>
          <SectionHeader
            title='Boyas'
            subtitle={latestReadingText}
            rightNode={
              <div className='shrink-0'>
                <SelectMenu
                  value={buoySelectValue}
                  onChange={onSelectStation}
                  ariaLabel='Seleccionar boya'
                  disabled={isBuoySelectorDisabled}
                  className={`${headerSelectClass} ${
                    isBuoySelectorDisabled
                      ? 'cursor-not-allowed opacity-60'
                      : ''
                  }`}
                  options={buoySelectOptions}
                />
              </div>
            }
          />
          <div className='mb-2 rounded-xl border border-slate-200/80 bg-white/70 px-2.5 py-2 dark:border-slate-700/70 dark:bg-slate-800/50'>
            <div className='mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300'>
              <span>Radio de búsqueda</span>
              <span className='text-slate-700 dark:text-slate-100'>
                {draftBuoySearchRadiusKm} km
              </span>
            </div>
            <input
              type='range'
              min={10}
              max={1000}
              step={10}
              value={draftBuoySearchRadiusKm}
              onChange={(event) =>
                setDraftBuoySearchRadiusKm(
                  clampBuoySearchRadiusKm(Number(event.target.value)),
                )
              }
              onMouseUp={commitBuoySearchRadiusKm}
              onTouchEnd={commitBuoySearchRadiusKm}
              onBlur={commitBuoySearchRadiusKm}
              aria-label='Rango de búsqueda de boyas en kilómetros'
              className='h-1.5 w-full cursor-pointer accent-sky-600'
            />
          </div>
          <div className='mb-2 flex flex-wrap items-center justify-center gap-4'>
            <div className='inline-flex items-center gap-1.5'>
              <span className='text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300'>
                Tiempo
              </span>
              <div
                role='group'
                aria-label='Rango de horas de boya'
                className={compactGroupClass}
              >
                {(['6', '12', '24'] as const).map((hours) => (
                  <button
                    key={hours}
                    type='button'
                    aria-pressed={buoyHours === hours}
                    onClick={() => setBuoyHours(hours)}
                    className={`rounded-full px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      buoyHours === hours
                        ? 'bg-sky-100 font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-200'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
            </div>

            <div className='inline-flex items-center gap-1.5'>
              <span className='text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300'>
                Tipo
              </span>
              <div
                role='group'
                aria-label='Vista de boyas'
                className={compactGroupClass}
              >
                {(
                  [
                    { label: 'Gráfico', value: 'chart' },
                    { label: 'Tabla', value: 'table' },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.value}
                    type='button'
                    aria-pressed={buoyViewMode === option.value}
                    onClick={() => setBuoyViewMode(option.value)}
                    className={`rounded-full px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                      buoyViewMode === option.value
                        ? 'bg-emerald-100 font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Suspense fallback={<StatusMessage message='Cargando…' />}>
            {nearbyBuoysStatus === 'loading' ? (
              <StatusMessage message='Buscando boyas cercanas…' />
            ) : hasActiveBuoy ? (
              <BuoyDetailContent
                stationId={activeStationId}
                viewMode={buoyViewMode}
                hours={buoyHours}
                showRangeSelector={false}
                showMetrics={false}
              />
            ) : nearbyBuoysStatus === 'error' ? (
              <StatusMessage
                message='Error al cargar boyas cercanas'
                variant='error'
              />
            ) : (
              <StatusMessage
                message={`No hay boyas cercanas en ${safeBuoySearchRadiusKm} km`}
              />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
