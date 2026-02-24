import { useMemo, useState } from 'react'
import type { TooltipProps } from 'recharts'
import type { Spot, SurfForecast } from '../../types'
import { DirectionArrow } from '../Icons'
import { CHART_LAYOUT, CHART_SERIES_COLORS } from '../charts/chartTheme'
import { TimeSeriesChart } from '../charts/TimeSeriesChart'
import {
  getSpotSwellPeriodQuality,
  getSpotWindQuality,
  hasConditionRanges,
} from './forecastConditions'
import {
  buildSnapshotItems,
  resolveActiveSnapshotLabel,
  type ForecastChartPoint,
} from './forecastSnapshots'

interface ForecastChartProps {
  forecasts: SurfForecast[]
  locale: string
  range: '48h' | '7d'
  nowMs: number
  viewMode?: 'chart' | 'table'
  spot?: Spot | null
}

const PERIOD_THRESHOLDS = {
  min: 6,
  yellowStart: 8,
  greenStart: 11,
  max: 18,
} as const

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const mix = (start: number, end: number, ratio: number) =>
  Math.round(start + (end - start) * ratio)

const toRgb = (red: number, green: number, blue: number) =>
  `rgb(${red} ${green} ${blue})`

const formatNumber = (value: number, locale: string, digits = 0): string =>
  value.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

const getNiceEnergyStep = (rawStep: number): number => {
  if (!Number.isFinite(rawStep) || rawStep <= 0) return 50

  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const normalized = rawStep / magnitude

  if (normalized <= 1) return 1 * magnitude
  if (normalized <= 2) return 2 * magnitude
  if (normalized <= 2.5) return 2.5 * magnitude
  if (normalized <= 5) return 5 * magnitude
  return 10 * magnitude
}

const mixColor = (
  start: [number, number, number],
  end: [number, number, number],
  ratio: number,
) =>
  toRgb(
    mix(start[0], end[0], ratio),
    mix(start[1], end[1], ratio),
    mix(start[2], end[2], ratio),
  )

const getDefaultPeriodToneStyle = (period: number) => {
  const value = clamp(period, PERIOD_THRESHOLDS.min, PERIOD_THRESHOLDS.max)

  if (value <= PERIOD_THRESHOLDS.yellowStart) {
    const ratio =
      (value - PERIOD_THRESHOLDS.min) /
      (PERIOD_THRESHOLDS.yellowStart - PERIOD_THRESHOLDS.min)
    return {
      backgroundColor: toRgb(
        mix(239, 250, ratio),
        mix(68, 204, ratio),
        mix(68, 21, ratio),
      ),
    }
  }

  if (value <= PERIOD_THRESHOLDS.greenStart) {
    const ratio =
      (value - PERIOD_THRESHOLDS.yellowStart) /
      (PERIOD_THRESHOLDS.greenStart - PERIOD_THRESHOLDS.yellowStart)
    return {
      backgroundColor: toRgb(
        mix(250, 234, ratio),
        mix(204, 179, ratio),
        mix(21, 8, ratio),
      ),
    }
  }

  const ratio =
    (value - PERIOD_THRESHOLDS.greenStart) /
    (PERIOD_THRESHOLDS.max - PERIOD_THRESHOLDS.greenStart)
  return {
    backgroundColor: toRgb(
      mix(234, 34, ratio),
      mix(179, 197, ratio),
      mix(8, 94, ratio),
    ),
  }
}

const getSpotPeriodToneStyle = (period: number, spot?: Spot | null) => {
  const periodQuality = getSpotSwellPeriodQuality(period, spot)
  if (periodQuality === 'epic') {
    return { backgroundColor: toRgb(34, 197, 94) }
  }
  if (periodQuality === 'limit') {
    return { backgroundColor: toRgb(250, 204, 21) }
  }
  if (periodQuality === 'poor') {
    return { backgroundColor: toRgb(239, 68, 68) }
  }

  return getDefaultPeriodToneStyle(period)
}

const getWindDirectionToneStyle = (angle: number) => {
  const normalized = ((angle % 360) + 360) % 360
  const GREEN: [number, number, number] = [34, 197, 94]
  const YELLOW: [number, number, number] = [250, 204, 21]
  const ORANGE: [number, number, number] = [249, 115, 22]
  const RED: [number, number, number] = [239, 68, 68]

  if (normalized >= 180 && normalized <= 250) {
    return { backgroundColor: toRgb(GREEN[0], GREEN[1], GREEN[2]) }
  }

  if (
    (normalized >= 170 && normalized < 180) ||
    (normalized > 250 && normalized <= 270)
  ) {
    return { backgroundColor: toRgb(YELLOW[0], YELLOW[1], YELLOW[2]) }
  }

  if (normalized >= 160 && normalized < 170) {
    const ratio = (normalized - 160) / 10
    return { backgroundColor: mixColor(ORANGE, YELLOW, ratio) }
  }

  if (normalized > 270 && normalized <= 280) {
    const ratio = (normalized - 270) / 10
    return { backgroundColor: mixColor(YELLOW, ORANGE, ratio) }
  }

  if (normalized >= 130 && normalized < 160) {
    const ratio = (normalized - 130) / 30
    return { backgroundColor: mixColor(RED, ORANGE, ratio) }
  }

  if (normalized > 280 && normalized <= 310) {
    const ratio = (normalized - 280) / 30
    return { backgroundColor: mixColor(ORANGE, RED, ratio) }
  }

  return { backgroundColor: toRgb(RED[0], RED[1], RED[2]) }
}

const getSpotWindDirectionToneStyle = (angle: number, spot?: Spot | null) => {
  const windQuality = getSpotWindQuality(angle, spot)
  if (windQuality === 'epic') {
    return { backgroundColor: toRgb(34, 197, 94) }
  }
  if (windQuality === 'limit') {
    return { backgroundColor: toRgb(250, 204, 21) }
  }
  if (windQuality === 'poor') {
    return { backgroundColor: toRgb(239, 68, 68) }
  }

  return getWindDirectionToneStyle(angle)
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number | string, string> & {
  payload?: Array<{
    dataKey?: string
    value?: number | string
    payload?: {
      waveHeight: number
      energy: number
      wavePeriod: number
      windSpeed: number
      windDirection: number
    }
  }>
  label?: string | number
}) => {
  if (active && payload && payload.length) {
    const timestamp = Number(label)
    const point = payload[0]?.payload as
      | {
          waveHeight: number
          energy: number
          wavePeriod: number
          windSpeed: number
          windDirection: number
        }
      | undefined
    const formattedDate = new Date(timestamp).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

    const waveHeight = point?.waveHeight
    const energy = point?.energy
    const wavePeriod = point?.wavePeriod
    const windSpeed = point?.windSpeed
    const windDirection = point?.windDirection

    return (
      <div className='rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-md dark:border-slate-700 dark:bg-slate-900'>
        <p className='mb-2 font-semibold text-slate-700 dark:text-slate-200'>
          {formattedDate}
        </p>
        <p
          className='flex justify-between gap-3'
          style={{ color: CHART_SERIES_COLORS.height }}
        >
          <span>Altura:</span>
          <span className='font-semibold'>
            {waveHeight !== undefined
              ? `${formatNumber(waveHeight, 'es-ES', 1)} m`
              : '--'}
          </span>
        </p>
        <p
          className='flex justify-between gap-3'
          style={{ color: CHART_SERIES_COLORS.energy }}
        >
          <span>Energía:</span>
          <span className='font-semibold'>
            {energy !== undefined
              ? `${formatNumber(Math.round(energy), 'es-ES')} kJ`
              : '--'}
          </span>
        </p>
        <p
          className='flex justify-between gap-3'
          style={{ color: CHART_SERIES_COLORS.wavePeriod }}
        >
          <span>Periodo:</span>
          <span className='font-semibold'>
            {wavePeriod !== undefined
              ? `${formatNumber(wavePeriod, 'es-ES', 1)} s`
              : '--'}
          </span>
        </p>
        <p
          className='flex justify-between gap-1'
          style={{ color: CHART_SERIES_COLORS.windSpeed }}
        >
          <span>Viento:</span>
          <span className='font-semibold'>
            {windSpeed !== undefined
              ? `${formatNumber(windSpeed, 'es-ES')} km/h`
              : '--'}
          </span>
          <span className='font-semibold'>
            {windDirection !== undefined && (
              <DirectionArrow
                className='h-4 w-4 text-sky-600'
                degrees={windDirection}
              />
            )}
          </span>
        </p>
      </div>
    )
  }
  return null
}

export const ForecastChart = ({
  forecasts,
  locale,
  range,
  nowMs,
  viewMode = 'chart',
  spot,
}: ForecastChartProps) => {
  const [selectedSnapshotLabel, setSelectedSnapshotLabel] = useState('Ahora')
  const chartMargin = { top: 0, right: 0, left: -8, bottom: -12 }

  const chartData = useMemo<ForecastChartPoint[]>(
    () =>
      forecasts.map((forecast) => ({
        time: new Date(forecast.date).getTime(),
        waveHeight: Number((forecast.validSwells[0]?.height ?? 0).toFixed(1)),
        energy: forecast.energy,
        wavePeriod: Number((forecast.validSwells[0]?.period ?? 0).toFixed(1)),
        windSpeed: Number((forecast.wind.speed ?? 0).toFixed(1)),
        windDirection: Number((forecast.wind.angle ?? 0).toFixed(1)),
      })),
    [forecasts],
  )

  const maxWaveHeight = useMemo(
    () => chartData.reduce((max, item) => Math.max(max, item.waveHeight), 0),
    [chartData],
  )

  const minWaveHeight = useMemo(
    () =>
      chartData.reduce((min, item) => Math.min(min, item.waveHeight), Infinity),
    [chartData],
  )

  const maxEnergy = useMemo(
    () => chartData.reduce((max, item) => Math.max(max, item.energy), 0),
    [chartData],
  )

  const minEnergy = useMemo(
    () => chartData.reduce((min, item) => Math.min(min, item.energy), Infinity),
    [chartData],
  )

  const leftAxisStep = useMemo(() => {
    if (maxWaveHeight > 7) return 2
    if (maxWaveHeight < 4) return 0.5
    return 1
  }, [maxWaveHeight])

  const firstWaveTick = useMemo(() => {
    if (!Number.isFinite(minWaveHeight) || minWaveHeight <= 0)
      return leftAxisStep
    return Math.max(
      leftAxisStep,
      Math.floor(minWaveHeight / leftAxisStep) * leftAxisStep,
    )
  }, [leftAxisStep, minWaveHeight])

  const leftAxisMin = useMemo(
    () => Math.max(0, Number((firstWaveTick - leftAxisStep * 0.5).toFixed(2))),
    [firstWaveTick, leftAxisStep],
  )

  const leftAxisMax = useMemo(() => {
    const target = Math.max(
      maxWaveHeight * 1.1,
      maxWaveHeight + leftAxisStep * 0.5,
    )
    const rounded = Math.ceil(target / leftAxisStep) * leftAxisStep
    return Number(Math.max(leftAxisStep, rounded).toFixed(2))
  }, [leftAxisStep, maxWaveHeight])

  const leftAxisTicks = useMemo(() => {
    const ticks: number[] = []
    for (
      let value = firstWaveTick;
      value <= leftAxisMax;
      value += leftAxisStep
    ) {
      ticks.push(Number(value.toFixed(2)))
    }
    return ticks
  }, [firstWaveTick, leftAxisMax, leftAxisStep])

  const rightTickCount = Math.max(2, leftAxisTicks.length)

  const rightEnergyScale = useMemo(() => {
    const anchorStep = getNiceEnergyStep((maxEnergy - minEnergy) / 8)
    const first = Number(
      (Math.floor(minEnergy / anchorStep) * anchorStep).toFixed(2),
    )
    const last = Number(
      (Math.ceil(maxEnergy / anchorStep) * anchorStep).toFixed(2),
    )
    const safeLast = last <= first ? first + anchorStep : last

    const ticks = Array.from({ length: rightTickCount }, (_, index) => {
      const ratio = rightTickCount === 1 ? 0 : index / (rightTickCount - 1)
      return Number((first + (safeLast - first) * ratio).toFixed(2))
    })

    return {
      first,
      last: safeLast,
      ticks,
    }
  }, [maxEnergy, minEnergy, rightTickCount])

  const leftFirstTick = leftAxisTicks[0] ?? firstWaveTick
  const leftLastTick = leftAxisTicks[leftAxisTicks.length - 1] ?? leftAxisMax
  const leftTickSpan = Math.max(0.0001, leftLastTick - leftFirstTick)
  const rightTickSpan = Math.max(
    0.0001,
    rightEnergyScale.last - rightEnergyScale.first,
  )

  const mappedChartData = useMemo(
    () =>
      chartData.map((point) => ({
        ...point,
        energyMapped:
          leftFirstTick +
          ((point.energy - rightEnergyScale.first) / rightTickSpan) *
            leftTickSpan,
      })),
    [
      chartData,
      leftFirstTick,
      leftTickSpan,
      rightEnergyScale.first,
      rightTickSpan,
    ],
  )

  const rightTickLabelMap = useMemo(() => {
    const map = new Map<string, string>()
    leftAxisTicks.forEach((tick, index) => {
      const label = rightEnergyScale.ticks[index]
      map.set(tick.toFixed(4), `${Math.round(label ?? 0)}`)
    })
    return map
  }, [leftAxisTicks, rightEnergyScale.ticks])

  const snapshotItems = useMemo(
    () => buildSnapshotItems(chartData, range, locale, nowMs),
    [chartData, locale, nowMs, range],
  )

  const activeSnapshotLabel = resolveActiveSnapshotLabel(
    snapshotItems,
    selectedSnapshotLabel,
  )

  const selectedSnapshot = snapshotItems.find(
    (item) => item.label === activeSnapshotLabel,
  )

  const chartContentPadding = {
    paddingLeft: `${Math.max(0, CHART_LAYOUT.leftAxisWidth + chartMargin.left)}px`,
    paddingRight: `${Math.max(0, CHART_LAYOUT.forecastRightAxisWidth + chartMargin.right)}px`,
  }

  const showPeriodColorBar = hasConditionRanges(
    spot?.optimalConditions?.swellPeriod,
  )
  const showWindColorBar = hasConditionRanges(
    spot?.optimalConditions?.windDirection,
  )

  return (
    <div>
      {viewMode === 'table' && (
        <div className='rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800/70'>
          <table className='w-full border-collapse text-[11px] text-slate-700 dark:text-slate-200'>
            <thead>
              <tr className='border-b border-slate-200/90 dark:border-slate-700/90'>
                <th className='w-px whitespace-nowrap px-1.5 py-2 pr-1 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-300'>
                  Métrica
                </th>
                {snapshotItems.map((item) => (
                  <th
                    key={`header-${item.label}`}
                    className={`px-1 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-300 ${
                      item.label === activeSnapshotLabel
                        ? 'bg-sky-100/60 dark:bg-sky-900/20'
                        : ''
                    }`}
                  >
                    <button
                      type='button'
                      onClick={() => setSelectedSnapshotLabel(item.label)}
                      className='w-full rounded-md px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500'
                    >
                      <span className='block'>{item.label}</span>
                      <span className='mt-0.5 block text-[10px] font-semibold normal-case tracking-normal text-slate-700 dark:text-slate-200'>
                        {item.hour}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              <tr className='border-b border-slate-200/70 dark:border-slate-700/70'>
                <th className='whitespace-nowrap px-1.5 py-2 pr-1 text-left font-medium text-slate-600 dark:text-slate-300'>
                  Altura (m)
                </th>
                {snapshotItems.map((item) => (
                  <td
                    key={`height-${item.label}`}
                    className={`px-1 py-2 text-center ${
                      item.label === activeSnapshotLabel
                        ? 'bg-sky-100/60 dark:bg-sky-900/20'
                        : ''
                    }`}
                  >
                    <span className='inline-flex items-center gap-0.5 text-[11px] font-semibold'>
                      {item.waveHeight}
                      {item.waveHeightTrend === 'up' && (
                        <span
                          className='text-emerald-500 dark:text-emerald-400'
                          aria-label='Altura sube respecto a ahora'
                        >
                          ↑
                        </span>
                      )}
                      {item.waveHeightTrend === 'down' && (
                        <span
                          className='text-rose-500 dark:text-rose-400'
                          aria-label='Altura baja respecto a ahora'
                        >
                          ↓
                        </span>
                      )}
                      {item.waveHeightTrend === 'flat' && (
                        <span
                          className='text-slate-500 dark:text-slate-300'
                          aria-label='Altura estable respecto a ahora'
                        >
                          =
                        </span>
                      )}
                    </span>
                  </td>
                ))}
              </tr>

              <tr className='border-b border-slate-200/70 dark:border-slate-700/70'>
                <th className='whitespace-nowrap px-1.5 py-2 pr-1 text-left font-medium text-slate-600 dark:text-slate-300'>
                  Energía (kJ)
                </th>
                {snapshotItems.map((item) => (
                  <td
                    key={`energy-${item.label}`}
                    className={`px-1 py-2 text-center ${
                      item.label === activeSnapshotLabel
                        ? 'bg-sky-100/60 dark:bg-sky-900/20'
                        : ''
                    }`}
                  >
                    <span className='inline-flex items-center gap-0.5 font-semibold'>
                      {item.energy}
                      {item.energyTrend === 'up' && (
                        <span
                          className='text-emerald-500 dark:text-emerald-400'
                          aria-label='Energía sube respecto a ahora'
                        >
                          ↑
                        </span>
                      )}
                      {item.energyTrend === 'down' && (
                        <span
                          className='text-rose-500 dark:text-rose-400'
                          aria-label='Energía baja respecto a ahora'
                        >
                          ↓
                        </span>
                      )}
                      {item.energyTrend === 'flat' && (
                        <span
                          className='text-slate-500 dark:text-slate-300'
                          aria-label='Energía estable respecto a ahora'
                        >
                          =
                        </span>
                      )}
                    </span>
                  </td>
                ))}
              </tr>

              <tr className='border-b border-slate-200/70 dark:border-slate-700/70'>
                <th className='whitespace-nowrap px-1.5 py-2 pr-1 text-left font-medium text-slate-600 dark:text-slate-300'>
                  Periodo (s)
                </th>
                {snapshotItems.map((item) => (
                  <td
                    key={`period-${item.label}`}
                    className={`px-1 py-2 text-center ${
                      item.label === activeSnapshotLabel
                        ? 'bg-sky-100/60 dark:bg-sky-900/20'
                        : ''
                    }`}
                  >
                    {item.wavePeriod}
                  </td>
                ))}
              </tr>

              <tr>
                <th className='whitespace-nowrap px-1.5 py-2 pr-1 text-left font-medium text-slate-600 dark:text-slate-300'>
                  Viento (km/h)
                </th>
                {snapshotItems.map((item) => (
                  <td
                    key={`wind-${item.label}`}
                    className={`px-1 py-2 text-center ${
                      item.label === activeSnapshotLabel
                        ? 'bg-sky-100/60 dark:bg-sky-900/20'
                        : ''
                    }`}
                  >
                    <span className='inline-flex items-center gap-0.5'>
                      {item.windSpeed}
                      {item.windDirection !== null && (
                        <DirectionArrow
                          className='h-2.5 w-2.5 text-sky-600'
                          degrees={item.windDirection}
                        />
                      )}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'chart' && (
        <>
          <TimeSeriesChart
            data={mappedChartData}
            locale={locale}
            chartHeightClass={CHART_LAYOUT.forecastHeightClass}
            chartMargin={chartMargin}
            legendItems={[
              { label: 'Altura (m)', color: CHART_SERIES_COLORS.height },
              {
                label: 'Energía (kJ)',
                color: CHART_SERIES_COLORS.energy,
                dashed: true,
              },
            ]}
            leftAxis={{
              width: CHART_LAYOUT.leftAxisWidth,
              interval: 0,
              padding: { top: 10 },
              domain: [leftAxisMin, leftAxisMax],
              ticks: leftAxisTicks,
              allowDecimals: leftAxisStep % 1 !== 0,
              tickFormatter: (value) =>
                `${Number.isInteger(value) ? value : value.toFixed(1)} m`,
            }}
            rightAxis={{
              width: CHART_LAYOUT.forecastRightAxisWidth,
              interval: 0,
              padding: { top: 10 },
              domain: [leftAxisMin, leftAxisMax],
              ticks: leftAxisTicks,
              tickFormatter: (value) =>
                rightTickLabelMap.get(Number(value).toFixed(4)) ?? '',
            }}
            series={[
              {
                dataKey: 'waveHeight',
                yAxisId: 'left',
                name: 'Altura',
                stroke: CHART_SERIES_COLORS.height,
              },
              {
                dataKey: 'energyMapped',
                yAxisId: 'right',
                name: 'Energía',
                stroke: CHART_SERIES_COLORS.energy,
                dashed: true,
              },
            ]}
            tooltipContent={<CustomTooltip />}
            dayLabelFormatter={(date, currentLocale) =>
              range === '7d'
                ? String(date.getDate())
                : date.toLocaleDateString(currentLocale, {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })
            }
            dayLabelDx={range === '7d' ? 8 : 0}
            showDaySeparators
            showDayLabels
            showNowMarker
            showFutureArea
            selectedTimeMarker={
              selectedSnapshot?.time
                ? { time: selectedSnapshot.time, label: activeSnapshotLabel }
                : undefined
            }
            baselineLabel='0 m'
          />

          <div className='pt-1'>
            <div>
              <p className='mb-0.5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300'>
                Viento
              </p>
              <div style={chartContentPadding}>
                <div
                  className='grid w-full items-center text-center'
                  style={{
                    gridTemplateColumns: `repeat(${Math.max(chartData.length, 1)}, minmax(0, 1fr))`,
                  }}
                >
                  {chartData.map((point) => (
                    <span
                      key={`wind-arrow-${point.time}`}
                      className='inline-flex h-3.5 w-full items-center justify-center'
                    >
                      <DirectionArrow
                        className='h-2.5 w-2.5 text-sky-600'
                        degrees={point.windDirection}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {showWindColorBar && (
              <div>
                <div style={chartContentPadding}>
                  <div className='flex h-2 w-full overflow-hidden rounded-full'>
                    {chartData.map((point) => (
                      <span
                        key={`wind-${point.time}`}
                        className='h-full flex-1'
                        style={getSpotWindDirectionToneStyle(
                          point.windDirection,
                          spot,
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showPeriodColorBar && (
              <div className='mt-1.5'>
                <p className='mb-0.5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300'>
                  Periodo
                </p>
                <div style={chartContentPadding}>
                  <div className='flex h-2 w-full overflow-hidden rounded-full'>
                    {chartData.map((point) => (
                      <span
                        key={`period-${point.time}`}
                        className='h-full flex-1'
                        style={getSpotPeriodToneStyle(point.wavePeriod, spot)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
