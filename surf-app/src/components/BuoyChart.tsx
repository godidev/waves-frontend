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

  return (
    <TimeSeriesChart
      data={chartData}
      locale={locale}
      chartHeightClass={CHART_LAYOUT.buoyHeightClass}
      showXAxisTicks
      showDaySeparators
      showDayLabels
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
        tickCount: CHART_LAYOUT.buoyLeftAxisTickCount,
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
