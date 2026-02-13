import { useEffect, useState, useRef } from 'react'
import { Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import type { Buoy } from '../types'
import { formatHour } from '../utils/time'

interface BuoyChartProps {
  buoys: Buoy[]
  locale: string
}

export const BuoyChart = ({ buoys, locale }: BuoyChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return

      const width = Math.floor(entry.contentRect.width)
      const height = Math.floor(entry.contentRect.height)

      setContainerSize({ width, height })
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Transform data for the chart - convert timestamp to ISO string
  const chartData = buoys.map(({ date, height, period }) => ({
    timestamp: new Date(date).toISOString(),
    height,
    period,
  }))

  const roundDown = (v: number) => Math.floor(v / 5) * 5
  const roundUp = (v: number) => Math.ceil(v / 5) * 5
  const canRenderChart = containerSize.width > 0 && containerSize.height > 0

  return (
    <div
      ref={containerRef}
      className='h-56 min-h-[220px] w-full min-w-0 rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-3'
    >
      {canRenderChart && (
        <LineChart
          width={containerSize.width}
          height={containerSize.height}
          data={chartData}
          margin={{ top: 0, right: 0, left: 0, bottom: -5 }}
        >
          <XAxis
            dataKey='timestamp'
            tickFormatter={(value) => formatHour(value, locale)}
            stroke='#94a3b8'
            fontSize={10}
          />
          <YAxis
            yAxisId='left'
            orientation='left'
            stroke='#94a3b8'
            fontSize={10}
            tickCount={12}
            tickFormatter={(value) => value.toFixed(1) + 'm'}
            width={33}
            padding={{ top: 20, bottom: 0 }}
          />
          <YAxis
            yAxisId='right'
            orientation='right'
            stroke='#94a3b8'
            fontSize={10}
            width={32}
            padding={{ top: 10, bottom: 10 }}
            tickFormatter={(value) => value + 's'}
            domain={[
              (dataMin) => roundDown(dataMin),
              (dataMax) => roundUp(dataMax + 2),
            ]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
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
      )}
    </div>
  )
}
