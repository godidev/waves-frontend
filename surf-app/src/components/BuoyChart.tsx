import { useEffect, useState, useRef } from 'react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Buoy } from '../types'
import { formatHour } from '../utils/time'

interface BuoyChartProps {
  buoys: Buoy[]
  locale: string
}

export const BuoyChart = ({ buoys, locale }: BuoyChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Small delay to ensure container has dimensions
    const timer = requestAnimationFrame(() => {
      setIsReady(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  // Transform data for the chart - convert timestamp to ISO string
  const chartData = buoys.map(({ date, height, period }) => ({
    timestamp: new Date(date).toISOString(),
    height,
    period,
  }))

  const roundDown = (v: number) => Math.floor(v / 5) * 5
  const roundUp = (v: number) => Math.ceil(v / 5) * 5

  return (
    <div
      ref={containerRef}
      className='h-56 w-full rounded-2xl border border-white/10 bg-ocean-800/60 p-2'
    >
      {isReady && (
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            data={chartData}
            margin={{ top: 0, right: 0, left: 0, bottom: -5 }}
          >
            <XAxis
              dataKey='timestamp'
              tickFormatter={(value) => formatHour(value, locale)}
              stroke='#7dd3fc'
              fontSize={10}
            />
            <YAxis
              yAxisId='left'
              orientation='left'
              stroke='#7dd3fc'
              fontSize={10}
              tickCount={12}
              tickFormatter={(value) => value + 'm'}
              width={33}
              padding={{ top: 20, bottom: 0 }}
            />
            <YAxis
              yAxisId='right'
              orientation='right'
              stroke='#fbbf24'
              fontSize={8}
              width={28}
              padding={{ top: 10, bottom: 10 }}
              tickFormatter={(value) => value + 's'}
              domain={[
                (dataMin) => roundDown(dataMin),
                (dataMax) => roundUp(dataMax + 2),
              ]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              labelFormatter={(value) => formatHour(String(value), locale)}
            />
            <Line
              yAxisId='left'
              type='natural'
              dataKey={'height'}
              stroke={'#38bdf8'}
              strokeWidth={2}
              activeDot={{ r: 5 }}
              name='Altura'
              dot={false}
            />
            <Line
              yAxisId='right'
              type='natural'
              dataKey='period'
              stroke='#fbbf24'
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              name='Periodo'
              strokeDasharray='5 5'
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
