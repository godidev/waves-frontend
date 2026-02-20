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
  const legendHeight = 24
  const chartHeight = Math.max(containerSize.height - legendHeight, 0)
  const canRenderChart = containerSize.width > 0 && chartHeight > 0

  return (
    <div
      ref={containerRef}
      className='h-60 min-h-[236px] w-full min-w-0 rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-1 py-2 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800'
    >
      <div className='mb-1 flex items-center justify-center gap-4 px-2 text-[11px] font-medium text-slate-700 dark:text-slate-200'>
        <span className='inline-flex items-center gap-1.5'>
          <span className='h-2 w-2 rounded-full bg-sky-400' aria-hidden='true' />
          Altura (m)
        </span>
        <span className='inline-flex items-center gap-1.5'>
          <span
            className='h-0.5 w-4 bg-amber-400'
            style={{
              backgroundImage:
                'repeating-linear-gradient(to right, #fbbf24 0 7px, transparent 7px 12px)',
            }}
            aria-hidden='true'
          />
          Periodo (s)
        </span>
      </div>
      {canRenderChart && (
        <LineChart
          width={containerSize.width}
          height={chartHeight}
          data={chartData}
          margin={{ top: 0, right: 2, left: -6, bottom: -8 }}
        >
          <XAxis
            dataKey='timestamp'
            tickFormatter={(value) => formatHour(value, locale)}
            stroke='#64748b'
            fontSize={10}
          />
          <YAxis
            yAxisId='left'
            orientation='left'
            stroke='#64748b'
            fontSize={10}
            tickCount={6}
            tickFormatter={(value) => `${value.toFixed(1)} m`}
            width={42}
            padding={{ top: 20, bottom: 0 }}
          />
          <YAxis
            yAxisId='right'
            orientation='right'
            stroke='#64748b'
            fontSize={10}
            width={42}
            tickCount={5}
            padding={{ top: 10, bottom: 10 }}
            tickFormatter={(value) => `${value} s`}
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
