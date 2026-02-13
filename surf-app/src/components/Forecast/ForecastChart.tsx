import { useEffect, useMemo, useRef, useState } from 'react'
import { Line, LineChart, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts'
import type { TooltipProps } from 'recharts'
import type { SurfForecast } from '../../types'
import { formatHour } from '../../utils/time'

interface ForecastChartProps {
  forecasts: SurfForecast[]
  locale: string
  interval?: 1 | 3
}

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number | string, string> & {
  payload?: Array<{ dataKey?: string; value?: number | string }>
  label?: string | number
}) => {
  if (active && payload && payload.length) {
    const date = new Date(label as string)
    const formattedDate = date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

    // Extraer valores originales del payload
    const waveHeight = payload.find((p) => p.dataKey === 'waveHeight')?.value
    const energy = payload.find((p) => p.dataKey === 'energy')?.value

    return (
      <div className='rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-md dark:border-slate-700 dark:bg-slate-900'>
        <p className='mb-2 font-semibold text-slate-700 dark:text-slate-200'>
          {formattedDate}
        </p>
        <p className='flex justify-between gap-3' style={{ color: '#38bdf8' }}>
          <span>Altura:</span>
          <span className='font-semibold'>{waveHeight}m</span>
        </p>
        <p className='flex justify-between gap-3' style={{ color: '#fbbf24' }}>
          <span>Energía:</span>
          <span className='font-semibold'>{energy}</span>
        </p>
      </div>
    )
  }
  return null
}

export const ForecastChart = ({
  forecasts,
  locale,
  interval = 1,
}: ForecastChartProps) => {
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

  const filteredForecasts = useMemo(() => {
    if (interval === 1) return forecasts

    return forecasts.filter((forecast) => {
      const hour = new Date(forecast.date).getHours()
      return hour % 3 === 0
    })
  }, [forecasts, interval])

  // Transform data for the chart
  const chartData = filteredForecasts.map((forecast) => ({
    date: forecast.date,
    waveHeight: Number((forecast.validSwells[0]?.height ?? 0).toFixed(1)),
    energy: forecast.energy,
  }))

  // Calcular líneas de referencia para cambios de día
  const dayChanges: string[] = []
  let lastDay = ''
  chartData.forEach((d) => {
    const date = new Date(d.date)
    const currentDay = date.toDateString()
    if (lastDay && lastDay !== currentDay) {
      dayChanges.push(d.date)
    }
    lastDay = currentDay
  })

  // Encontrar el punto más cercano a la hora actual
  const now = new Date()
  let closestToNow = chartData[0]?.date
  let minDiff = Infinity

  chartData.forEach((d) => {
    const diff = Math.abs(new Date(d.date).getTime() - now.getTime())
    if (diff < minDiff) {
      minDiff = diff
      closestToNow = d.date
    }
  })

  const canRenderChart = containerSize.width > 0 && containerSize.height > 0

  return (
    <div className='h-80 w-full rounded-2xl py-2'>
      <div ref={containerRef} className='h-full w-full min-w-0'>
        {canRenderChart && (
          <LineChart
            width={containerSize.width}
            height={containerSize.height}
            data={chartData}
            margin={{ top: 0, right: 0, left: -8, bottom: -12 }}
          >
            <XAxis
              dataKey='date'
              tickFormatter={(value) => formatHour(value, locale)}
              stroke='#94a3b8'
              fontSize={10}
            />
            <YAxis
              yAxisId='left'
              stroke='#94a3b8'
              fontSize={10}
              width={48}
              padding={{ top: 10 }}
              tickCount={7}
              tickFormatter={(value) => value + 'm'}
            />
            <YAxis
              yAxisId='right'
              orientation='right'
              stroke='#94a3b8'
              fontSize={10}
              width={44}
              tickCount={7}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Líneas verticales para separar días */}
            {dayChanges.map((date, index) => (
              <ReferenceLine
                key={`day-${index}`}
                x={date}
                stroke='#cbd5e1'
                strokeDasharray='3 3'
                strokeWidth={1}
                yAxisId='left'
              />
            ))}

            {/* Línea vertical para la hora actual */}
            <ReferenceLine
              x={closestToNow}
              stroke='#0284c7'
              strokeWidth={2}
              strokeOpacity={0.45}
              yAxisId='left'
              label={{
                value: 'Ahora',
                position: 'insideTopLeft',
                fill: '#0284c7',
                fontSize: 10,
                fontWeight: 'bold',
              }}
            />

            <Line
              yAxisId='left'
              type='natural'
              dataKey='waveHeight'
              stroke='#38bdf8'
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              name='Altura'
            />
            <Line
              yAxisId='right'
              type='natural'
              dataKey='energy'
              stroke='#fbbf24'
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              name='Energía'
              strokeDasharray='5 5'
            />
          </LineChart>
        )}
      </div>
      <div className='mt-1 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400'>
        <div className='flex items-center gap-2'>
          <div className='h-0.5 w-6 bg-[#38bdf8]'></div>
          <span>Altura de ola</span>
        </div>
        <div className='flex items-center gap-2'>
          <div className='h-0.5 w-6 border-b-2 border-dashed border-[#fbbf24]'></div>
          <span>Energía</span>
        </div>
      </div>
    </div>
  )
}
