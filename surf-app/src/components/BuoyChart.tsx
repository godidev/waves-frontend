import { useMemo } from 'react'
import type { Buoy } from '../types'
import { CHART_LAYOUT, CHART_SERIES_COLORS } from './charts/chartTheme'
import { TimeSeriesChart } from './charts/TimeSeriesChart'

interface BuoyChartProps {
  buoys: Buoy[]
  locale: string
}

export const BuoyChart = ({ buoys, locale }: BuoyChartProps) => {
  const chartData = useMemo(
    () =>
      buoys.map(({ date, height, period }) => ({
        time: date,
        height,
        period,
      })),
    [buoys],
  )

  const roundDown = (v: number) => Math.floor(v / 5) * 5
  const roundUp = (v: number) => Math.ceil(v / 5) * 5
  const maxHeight = chartData.reduce(
    (max, item) => Math.max(max, item.height),
    0,
  )
  const leftAxisStep = maxHeight <= 4 ? 0.5 : 1
  const leftAxisMax = Math.max(
    leftAxisStep,
    Math.ceil(maxHeight / leftAxisStep) * leftAxisStep,
  )
  const leftAxisTicks: number[] = []
  for (let value = 0; value <= leftAxisMax; value += leftAxisStep) {
    leftAxisTicks.push(Number(value.toFixed(2)))
  }
  const xAxisTickCount =
    chartData.length <= 8 ? chartData.length : chartData.length <= 12 ? 6 : 7
  const formatHourOnly = (value: number) =>
    new Date(value).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <TimeSeriesChart
      data={chartData}
      locale={locale}
      chartHeightClass={CHART_LAYOUT.buoyHeightClass}
      showXAxisTicks
      xAxisTickCount={xAxisTickCount}
      xAxisMinTickGap={32}
      xAxisTickFormatter={(value) => formatHourOnly(value)}
      tooltipLabelFormatter={(value) => formatHourOnly(value)}
      chartMargin={{ top: 0, right: 2, left: 2, bottom: -8 }}
      showDaySeparators
      showDayLabels={false}
      showNowMarker={false}
      showFutureArea={false}
      legendItems={[
        { label: 'Altura (m)', color: CHART_SERIES_COLORS.height },
        {
          label: 'Periodo (s)',
          color: CHART_SERIES_COLORS.period,
          dashed: true,
        },
      ]}
      leftAxis={{
        width: CHART_LAYOUT.leftAxisWidth,
        ticks: leftAxisTicks,
        domain: [0, leftAxisMax],
        allowDecimals: leftAxisStep % 1 !== 0,
        padding: { top: 20, bottom: 0 },
        tickFormatter: (value) => `${value.toFixed(1)} m`,
      }}
      rightAxis={{
        width: CHART_LAYOUT.buoyRightAxisWidth,
        tickCount: CHART_LAYOUT.rightAxisTickCount,
        padding: { top: 10, bottom: 10 },
        tickFormatter: (value) => `${value} s`,
        domain: [
          (dataMin) => roundDown(dataMin),
          (dataMax) => roundUp(dataMax + 2),
        ],
      }}
      series={[
        {
          dataKey: 'height',
          yAxisId: 'left',
          name: 'Altura',
          stroke: CHART_SERIES_COLORS.height,
        },
        {
          dataKey: 'period',
          yAxisId: 'right',
          name: 'Periodo',
          stroke: CHART_SERIES_COLORS.period,
          dashed: true,
        },
      ]}
    />
  )
}
