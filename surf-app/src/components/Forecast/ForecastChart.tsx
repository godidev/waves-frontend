import { useMemo } from 'react'
import type { TooltipProps } from 'recharts'
import type { SurfForecast } from '../../types'
import { DirectionArrow } from '../Icons'
import { CHART_LAYOUT, CHART_SERIES_COLORS } from '../charts/chartTheme'
import { TimeSeriesChart } from '../charts/TimeSeriesChart'

interface ForecastChartProps {
  forecasts: SurfForecast[]
  locale: string
  range: '48h' | '7d'
  nowMs: number
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

const getPeriodToneStyle = (period: number) => {
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
            {waveHeight !== undefined ? `${waveHeight.toFixed(1)}m` : '--'}
          </span>
        </p>
        <p
          className='flex justify-between gap-3'
          style={{ color: CHART_SERIES_COLORS.energy }}
        >
          <span>Energía:</span>
          <span className='font-semibold'>
            {energy !== undefined ? Math.round(energy) : '--'}
          </span>
        </p>
        <p
          className='flex justify-between gap-3'
          style={{ color: CHART_SERIES_COLORS.wavePeriod }}
        >
          <span>Periodo:</span>
          <span className='font-semibold'>
            {wavePeriod !== undefined ? `${wavePeriod.toFixed(1)}s` : '--'}
          </span>
        </p>
        <p
          className='flex justify-between gap-1'
          style={{ color: CHART_SERIES_COLORS.windSpeed }}
        >
          <span>Viento:</span>
          <span className='font-semibold'>
            {windSpeed !== undefined ? `${windSpeed.toFixed(0)} km/h` : '--'}
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
}: ForecastChartProps) => {
  const chartMargin = { top: 0, right: 0, left: -8, bottom: -12 }

  const chartData = useMemo(
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

  const snapshotItems = useMemo(() => {
    if (!chartData.length) return []

    const targets = [
      { label: 'Ahora', timestamp: nowMs },
      { label: '+6h', timestamp: nowMs + 6 * 60 * 60 * 1000 },
      { label: '+24h', timestamp: nowMs + 24 * 60 * 60 * 1000 },
    ]

    return targets.map((target) => {
      const closest = chartData.reduce(
        (best, point) => {
          if (!best) return point
          return Math.abs(point.time - target.timestamp) <
            Math.abs(best.time - target.timestamp)
            ? point
            : best
        },
        null as (typeof chartData)[number] | null,
      )

      if (!closest) {
        return {
          label: target.label,
          hour: '--',
          waveHeight: '--',
          wavePeriod: '--',
          windSpeed: '--',
          windDirection: null,
        }
      }

      return {
        label: target.label,
        hour: new Date(closest.time).toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
        }),
        waveHeight: `${closest.waveHeight.toFixed(1)}m`,
        energy: `${Math.round(closest.energy)}`,
        wavePeriod: `${closest.wavePeriod.toFixed(1)}s`,
        windSpeed: `${closest.windSpeed.toFixed(0)} km/h`,
        windDirection: closest.windDirection,
      }
    })
  }, [chartData, locale, nowMs])

  const chartContentPadding = {
    paddingLeft: `${Math.max(0, CHART_LAYOUT.leftAxisWidth + chartMargin.left)}px`,
    paddingRight: `${Math.max(0, CHART_LAYOUT.forecastRightAxisWidth + chartMargin.right)}px`,
  }

  return (
    <div className='space-y-1'>
      <div className='grid grid-cols-3 gap-2'>
        {snapshotItems.map((item) => (
          <div
            key={item.label}
            className='rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-800/60'
          >
            <div className='mb-0.5 flex items-center justify-between text-[10px] uppercase tracking-wide text-slate-600 dark:text-slate-300'>
              <span>{item.label}</span>
              <span className='font-semibold'>{item.hour}</span>
            </div>
            <div className='space-y-0.5 text-xs text-slate-700 dark:text-slate-200'>
              <p className='flex items-center justify-between'>
                <span>Altura</span>
                <span className='font-semibold'>{item.waveHeight}</span>
              </p>
              <p className='flex items-center justify-between'>
                <span>Energía</span>
                <span className='font-semibold'>{item.energy}</span>
              </p>
              <p className='flex items-center justify-between'>
                <span>Periodo</span>
                <span>{item.wavePeriod}</span>
              </p>
              <p className='flex items-center justify-between'>
                <span>Viento</span>
                <span className='inline-flex items-center gap-1'>
                  {item.windSpeed}
                  {item.windDirection !== null && (
                    <DirectionArrow
                      className='h-2.5 w-2.5 text-sky-600'
                      degrees={item.windDirection}
                    />
                  )}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

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
        baselineLabel='0 m'
      />

      <div className='space-y-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 dark:border-slate-700 dark:bg-slate-800/50'>
        <div>
          <p className='mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300'>
            Periodo
          </p>
          <div style={chartContentPadding}>
            <div className='flex h-2 w-full overflow-hidden rounded-full'>
              {chartData.map((point) => (
                <span
                  key={`period-${point.time}`}
                  className='h-full flex-1'
                  style={getPeriodToneStyle(point.wavePeriod)}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className='mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300'>
            Dirección de viento
          </p>
          <div style={chartContentPadding}>
            <div className='flex h-2 w-full overflow-hidden rounded-full'>
              {chartData.map((point) => (
                <span
                  key={`wind-${point.time}`}
                  className='h-full flex-1'
                  style={getWindDirectionToneStyle(point.windDirection)}
                />
              ))}
            </div>
            <div
              className='mt-1.5 grid w-full items-center text-center'
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
      </div>
    </div>
  )
}
