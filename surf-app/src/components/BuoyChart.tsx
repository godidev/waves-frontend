import { useMemo } from 'react'
import type { Buoy } from '../types'
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
      chartHeightClass='h-60 min-h-[236px]'
      showXAxisTicks
      showDaySeparators
      showDayLabels
      showNowMarker={false}
      showFutureArea={false}
      legendItems={[
        { label: 'Altura (m)', color: '#38bdf8' },
        { label: 'Periodo (s)', color: '#fbbf24', dashed: true },
      ]}
      leftAxis={{
        width: 42,
        tickCount: 6,
        padding: { top: 20, bottom: 0 },
        tickFormatter: (value) => `${value.toFixed(1)} m`,
      }}
      rightAxis={{
        width: 42,
        tickCount: 5,
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
          stroke: '#38bdf8',
        },
        {
          dataKey: 'period',
          yAxisId: 'right',
          name: 'Periodo',
          stroke: '#fbbf24',
          dashed: true,
        },
      ]}
    />
  )
}
