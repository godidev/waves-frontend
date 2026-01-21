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
  metric: 'height' | 'period'
  locale: string
}

export const BuoyChart = ({ buoys, metric, locale }: BuoyChartProps) => {
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
  const chartData = buoys.map((buoy) => ({
    timestamp: new Date(buoy.date).toISOString(),
    height: buoy.height,
    period: buoy.period,
  }))

  return (
    <div
      ref={containerRef}
      className='h-56 w-full rounded-2xl border border-white/10 bg-ocean-800/60 p-'
    >
      {isReady && (
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={chartData}>
            <XAxis
              dataKey='timestamp'
              tickFormatter={(value) => formatHour(value, locale)}
              stroke='#7dd3fc'
              fontSize={10}
            />
            <YAxis
              stroke='#7dd3fc'
              fontSize={10}
              tickCount={12}
              tickFormatter={(value) => value + 'm'}
              width={30}
              padding={{ top: 20, bottom: 0 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              labelFormatter={(value) => formatHour(String(value), locale)}
            />
            <Line
              type='monotone'
              dataKey={metric}
              stroke={metric === 'height' ? '#38bdf8' : '#facc15'}
              strokeWidth={1.5}
              dot={true}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
