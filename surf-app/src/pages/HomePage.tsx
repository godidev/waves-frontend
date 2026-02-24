import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { getTotalWaveHeight, getPrimarySwell } from '../services/api'
import './HomePage.css'
import type { SurfForecast } from '../types'
import { StatusMessage } from '../components/StatusMessage'
import { SectionHeader } from '../components/SectionHeader'
import { SelectMenu } from '../components/SelectMenu'
import { HomeSummaryCards } from '../components/HomeSummaryCards'
import { LabeledToggleGroup } from '../components/LabeledToggleGroup'
import { BuoySearchRadiusControl } from '../components/BuoySearchRadiusControl'
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
import {
  buildForecastCurrentText,
  buildSelectedDirections,
  getClosestForecast,
} from './homePageSummary'

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

  const selected = useMemo(
    () => getClosestForecast(hourlyForecasts, nowMs),
    [hourlyForecasts, nowMs],
  )

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
  const {
    waveDirection: selectedWaveDirection,
    windDirection: selectedWindDirection,
  } = buildSelectedDirections(selected)
  const forecastCurrentText = buildForecastCurrentText(selected, locale)

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
          <LabeledToggleGroup
            ariaLabel='Rango del forecast'
            label='Tiempo'
            value={forecastRange}
            options={[
              { label: '48h', value: '48h' },
              { label: '7d', value: '7d' },
            ]}
            onChange={(value) => setForecastRange(value as '48h' | '7d')}
            groupClassName={compactGroupClass}
          />

          <LabeledToggleGroup
            ariaLabel='Vista de previsión'
            label='Tipo'
            value={forecastViewMode}
            options={[
              { label: 'Gráfico', value: 'chart' },
              { label: 'Tabla', value: 'table' },
            ]}
            onChange={(value) =>
              setForecastViewMode(value as 'chart' | 'table')
            }
            groupClassName={compactGroupClass}
            activeClassName='bg-emerald-100 font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
          />
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
          <BuoySearchRadiusControl
            value={draftBuoySearchRadiusKm}
            onChange={(value) =>
              setDraftBuoySearchRadiusKm(clampBuoySearchRadiusKm(value))
            }
            onCommit={commitBuoySearchRadiusKm}
          />
          <div className='mb-2 flex flex-wrap items-center justify-center gap-4'>
            <LabeledToggleGroup
              ariaLabel='Rango de horas de boya'
              label='Tiempo'
              value={buoyHours}
              options={[
                { label: '6h', value: '6' },
                { label: '12h', value: '12' },
                { label: '24h', value: '24' },
              ]}
              onChange={(value) => setBuoyHours(value as '6' | '12' | '24')}
              groupClassName={compactGroupClass}
            />

            <LabeledToggleGroup
              ariaLabel='Vista de boyas'
              label='Tipo'
              value={buoyViewMode}
              options={[
                { label: 'Gráfico', value: 'chart' },
                { label: 'Tabla', value: 'table' },
              ]}
              onChange={(value) => setBuoyViewMode(value as 'chart' | 'table')}
              groupClassName={compactGroupClass}
              activeClassName='bg-emerald-100 font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
            />
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
