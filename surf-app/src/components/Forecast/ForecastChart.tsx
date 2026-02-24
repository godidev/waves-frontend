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
import { buildForecastAxes, mapEnergyToLeftAxis } from './forecastAxes'
import { buildForecastChartData } from './forecastChartData'
import { ForecastWindBands } from './ForecastWindBands'
import { ForecastSnapshotTable } from './ForecastSnapshotTable'

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
    () => buildForecastChartData(forecasts),
    [forecasts],
  )

  const axes = useMemo(() => buildForecastAxes(chartData), [chartData])

  const mappedChartData = useMemo(
    () => mapEnergyToLeftAxis(chartData, axes),
    [axes, chartData],
  )

  const rightTickLabelMap = useMemo(() => {
    const map = new Map<string, string>()
    axes.leftAxisTicks.forEach((tick, index) => {
      const label = axes.rightEnergyScale.ticks[index]
      map.set(tick.toFixed(4), `${Math.round(label ?? 0)}`)
    })
    return map
  }, [axes.leftAxisTicks, axes.rightEnergyScale.ticks])

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
        <ForecastSnapshotTable
          snapshotItems={snapshotItems}
          activeSnapshotLabel={activeSnapshotLabel}
          onSelectSnapshotLabel={setSelectedSnapshotLabel}
        />
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
              domain: [axes.leftAxisMin, axes.leftAxisMax],
              ticks: axes.leftAxisTicks,
              allowDecimals: axes.leftAxisStep % 1 !== 0,
              tickFormatter: (value) =>
                `${Number.isInteger(value) ? value : value.toFixed(1)} m`,
            }}
            rightAxis={{
              width: CHART_LAYOUT.forecastRightAxisWidth,
              interval: 0,
              padding: { top: 10 },
              domain: [axes.leftAxisMin, axes.leftAxisMax],
              ticks: axes.leftAxisTicks,
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

          <ForecastWindBands
            chartData={chartData}
            chartContentPadding={chartContentPadding}
            showWindColorBar={showWindColorBar}
            showPeriodColorBar={showPeriodColorBar}
            getWindToneStyle={(angle) =>
              getSpotWindDirectionToneStyle(angle, spot)
            }
            getPeriodToneStyle={(period) =>
              getSpotPeriodToneStyle(period, spot)
            }
          />
        </>
      )}
    </div>
  )
}
