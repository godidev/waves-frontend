import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { getTotalWaveHeight, getPrimarySwell } from '../services/api'
import './HomePage.css'
import type { SurfForecast } from '../types'
import { degreesToCardinal } from '../types'
import { StatusMessage } from '../components/StatusMessage'
import { SectionHeader } from '../components/SectionHeader'
import { SelectMenu } from '../components/SelectMenu'
import { HomeSummaryCards } from '../components/HomeSummaryCards'
import { useSettingsContext } from '../context/SettingsContext'
import {
  useBuoyDataQuery,
  useBuoysNearQuery,
  useSpotsQuery,
  useSurfForecastQuery,
} from '../hooks/useAppQueries'
import {
  buildBuoySelectState,
  buildSpotItems,
  resolveSpotId,
} from './homePageSelectors'
import {
  deriveForecastStatus,
  deriveNearbyBuoysStatus,
} from './homePageQueryState'

const formatNumber = (value: number, locale: string, digits = 0): string =>
  value.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

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

export const HomePage = () => {
  const { settings, updateSettings } = useSettingsContext()
  const { defaultSpotId, defaultStationId, buoySearchRadiusKm } = settings
  const [nowMs, setNowMs] = useState(() => Date.now())
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

  const { data: spotsData, isLoading: isSpotsLoading } = useSpotsQuery()
  const spots = useMemo(
    () => (spotsData ?? []).filter((spot) => spot.active === true),
    [spotsData],
  )

  useEffect(() => {
    if (safeBuoySearchRadiusKm !== buoySearchRadiusKm) {
      updateSettings({ buoySearchRadiusKm: safeBuoySearchRadiusKm })
    }
  }, [buoySearchRadiusKm, safeBuoySearchRadiusKm, updateSettings])

  useEffect(() => {
    setDraftBuoySearchRadiusKm(safeBuoySearchRadiusKm)
  }, [safeBuoySearchRadiusKm])

  const commitBuoySearchRadiusKm = () => {
    if (draftBuoySearchRadiusKm !== safeBuoySearchRadiusKm) {
      updateSettings({ buoySearchRadiusKm: draftBuoySearchRadiusKm })
    }
  }

  const resolvedSpotId = useMemo(
    () => resolveSpotId(activeSpotId, spots),
    [activeSpotId, spots],
  )

  const resolvedSpot = useMemo(
    () => spots.find((spot) => spot.spotId === resolvedSpotId) ?? null,
    [resolvedSpotId, spots],
  )

  const mainForecastQuery = useSurfForecastQuery(
    resolvedSpotId,
    forecastVariant,
    1,
    forecastLimit,
  )

  const hourlySummaryQuery = useSurfForecastQuery(
    resolvedSpotId,
    'hourly',
    1,
    72,
  )

  const forecasts = useMemo(
    () => (mainForecastQuery.data ?? []) as SurfForecast[],
    [mainForecastQuery.data],
  )
  const hourlyForecasts = useMemo(
    () =>
      forecastVariant === 'hourly'
        ? forecasts
        : ((hourlySummaryQuery.data ?? []) as SurfForecast[]),
    [forecastVariant, forecasts, hourlySummaryQuery.data],
  )

  const status =
    isSpotsLoading && spots.length === 0
      ? 'loading'
      : deriveForecastStatus({
          isFetchingMain:
            mainForecastQuery.isLoading || mainForecastQuery.isFetching,
          isFetchingHourly:
            forecastVariant === 'hourly'
              ? false
              : hourlySummaryQuery.isLoading || hourlySummaryQuery.isFetching,
          mainHasData: forecasts.length > 0,
          hasError: Boolean(mainForecastQuery.error),
        })

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now())
    }, 60000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (!spots.length) return
    if (resolvedSpotId !== activeSpotId) {
      updateSettings({ defaultSpotId: resolvedSpotId })
    }
  }, [activeSpotId, resolvedSpotId, spots.length, updateSettings])

  const coordinates = resolvedSpot?.location?.coordinates
  const hasCoordinates = Boolean(coordinates && coordinates.length >= 2)
  const longitude = hasCoordinates ? (coordinates?.[0] ?? null) : null
  const latitude = hasCoordinates ? (coordinates?.[1] ?? null) : null

  const nearbyBuoysQuery = useBuoysNearQuery(
    longitude,
    latitude,
    safeBuoySearchRadiusKm,
  )
  const stations = useMemo(
    () => nearbyBuoysQuery.data ?? [],
    [nearbyBuoysQuery.data],
  )

  const nearbyBuoysStatus = deriveNearbyBuoysStatus({
    hasCoordinates,
    isFetching: nearbyBuoysQuery.isLoading || nearbyBuoysQuery.isFetching,
    hasError: Boolean(nearbyBuoysQuery.error),
  })

  useEffect(() => {
    if (!stations.length) return
    if (stations.some((station) => station.buoyId === activeStationId)) return
    updateSettings({ defaultStationId: stations[0].buoyId })
  }, [activeStationId, stations, updateSettings])

  const shouldFetchLatestBuoy =
    activeStationId.trim().length > 0 &&
    stations.some((station) => station.buoyId === activeStationId)
  const latestBuoyQuery = useBuoyDataQuery(
    shouldFetchLatestBuoy ? activeStationId : '',
    1,
  )
  const latestBuoyRecord = shouldFetchLatestBuoy
    ? ((latestBuoyQuery.data ?? [])[0] ?? null)
    : null

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

  const {
    options: buoySelectOptions,
    value: buoySelectValue,
    disabled: isBuoySelectorDisabled,
    hasActiveBuoy,
  } = useMemo(
    () => buildBuoySelectState(nearbyBuoysStatus, stations, activeStationId),
    [activeStationId, nearbyBuoysStatus, stations],
  )

  const spotItems = useMemo(
    () => buildSpotItems(spots, defaultSpotId),
    [defaultSpotId, spots],
  )

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
                onChange={(value) => updateSettings({ defaultSpotId: value })}
                ariaLabel='Seleccionar spot'
                name='forecast-spot'
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
            spot={resolvedSpot}
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
                  onChange={(value) =>
                    updateSettings({ defaultStationId: value })
                  }
                  ariaLabel='Seleccionar boya'
                  name='nearby-buoy'
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
              name='buoy-search-radius-km'
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
