import { useMemo } from 'react'
import type { TooltipProps } from 'recharts'
import type { SurfForecast } from '../../types'
import { DirectionArrow } from '../Icons'
import { CHART_LAYOUT, CHART_SERIES_COLORS } from '../charts/chartTheme'
import { TimeSeriesChart } from '../charts/TimeSeriesChart'

interface ForecastChartProps {
  forecasts: SurfForecast[]
  locale: string
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number | string, string> & {
  payload?: Array<{ dataKey?: string; value?: number | string }>
  label?: string | number
}) => {
  if (active && payload && payload.length) {
    const timestamp = Number(label)
    const formattedDate = new Date(timestamp).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

    const waveHeight = payload.find((p) => p.dataKey === 'waveHeight')?.value
    const energy = payload.find((p) => p.dataKey === 'energy')?.value
    const wavePeriod = payload.find((p) => p.dataKey === 'wavePeriod')?.value
    const windSpeed = payload.find((p) => p.dataKey === 'windSpeed')?.value
    const windDirection = payload.find(
      (p) => p.dataKey === 'windDirection',
    )?.value

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
          <span className='font-semibold'>{waveHeight}m</span>
        </p>
        <p
          className='flex justify-between gap-3'
          style={{ color: CHART_SERIES_COLORS.energy }}
        >
          <span>Energía:</span>
          <span className='font-semibold'>{energy}</span>
        </p>
        <p
          className='flex justify-between gap-3'
          style={{ color: CHART_SERIES_COLORS.wavePeriod }}
        >
          <span>Periodo:</span>
          <span className='font-semibold'>{wavePeriod}s</span>
        </p>
        <p
          className='flex justify-between gap-1'
          style={{ color: CHART_SERIES_COLORS.windSpeed }}
        >
          <span>Viento:</span>
          <span className='font-semibold'>{windSpeed} km/h </span>
          <span className='font-semibold'>
            <DirectionArrow
              className='h-4 w-4 text-sky-600'
              degrees={Number(windDirection)}
            />
          </span>
        </p>
      </div>
    )
  }
  return null
}

export const ForecastChart = ({ forecasts, locale }: ForecastChartProps) => {
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

  const leftAxisStep = useMemo(() => {
    if (maxWaveHeight > 7) return 2
    if (maxWaveHeight < 4) return 0.5
    return 1
  }, [maxWaveHeight])

  const leftAxisMax = useMemo(() => {
    const rounded = Math.ceil(maxWaveHeight / leftAxisStep) * leftAxisStep
    return Number(Math.max(leftAxisStep, rounded).toFixed(2))
  }, [leftAxisStep, maxWaveHeight])

  const leftAxisTicks = useMemo(() => {
    const ticks: number[] = []
    for (let value = 0; value <= leftAxisMax; value += leftAxisStep) {
      ticks.push(Number(value.toFixed(2)))
    }
    return ticks
  }, [leftAxisMax, leftAxisStep])

  return (
    <TimeSeriesChart
      data={chartData}
      locale={locale}
      chartHeightClass={CHART_LAYOUT.forecastHeightClass}
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
        padding: { top: 10 },
        domain: [0, leftAxisMax],
        ticks: leftAxisTicks,
        allowDecimals: leftAxisStep % 1 !== 0,
        tickFormatter: (value) =>
          `${Number.isInteger(value) ? value : value.toFixed(1)} m`,
      }}
      rightAxis={{
        width: CHART_LAYOUT.forecastRightAxisWidth,
        tickCount: CHART_LAYOUT.rightAxisTickCount,
        tickFormatter: (value) => `${Math.round(value)}`,
      }}
      series={[
        {
          dataKey: 'waveHeight',
          yAxisId: 'left',
          name: 'Altura',
          stroke: CHART_SERIES_COLORS.height,
        },
        {
          dataKey: 'energy',
          yAxisId: 'right',
          name: 'Energía',
          stroke: CHART_SERIES_COLORS.energy,
          dashed: true,
        },
        {
          dataKey: 'wavePeriod',
          yAxisId: 'right',
          name: 'Periodo',
          stroke: CHART_SERIES_COLORS.wavePeriod,
          hidden: true,
        },
        {
          dataKey: 'windSpeed',
          yAxisId: 'right',
          name: 'Viento (km/h)',
          stroke: CHART_SERIES_COLORS.windSpeed,
          hidden: true,
        },
        {
          dataKey: 'windDirection',
          yAxisId: 'right',
          name: 'Dirección viento (°)',
          stroke: CHART_SERIES_COLORS.windDirection,
          hidden: true,
        },
      ]}
      tooltipContent={<CustomTooltip />}
      showDaySeparators
      showDayLabels
      showNowMarker
      showFutureArea
    />
  )
}
