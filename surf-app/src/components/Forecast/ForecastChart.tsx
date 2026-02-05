import { useEffect, useState } from 'react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts'
import type { TooltipProps } from 'recharts'
import type { SurfForecast } from '../../types'
import { formatHour } from '../../utils/time'

interface ForecastChartProps {
  forecasts: SurfForecast[]
  locale: string
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
      <div className='rounded-lg border border-white/10 bg-ocean-900/95 p-3 text-xs shadow-lg'>
        <p className='mb-2 font-semibold text-ocean-100'>{formattedDate}</p>
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

export const ForecastChart = ({ forecasts, locale }: ForecastChartProps) => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Small delay to ensure container has dimensions
    const timer = requestAnimationFrame(() => {
      setIsReady(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  // Transform data for the chart
  const chartData = forecasts.map((forecast) => ({
    date: forecast.date,
    waveHeight: forecast.validSwells[0].height.toFixed(1),
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

  return (
    <div className='h-80 w-full rounded-2xl border border-white/10 bg-ocean-800/60 p-2'>
      {isReady && (
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart
            data={chartData}
            margin={{ top: 0, right: 5, left: 0, bottom: -10 }}
          >
            <XAxis
              dataKey='date'
              tickFormatter={(value) => formatHour(value, locale)}
              stroke='#7dd3fc'
              fontSize={8}
            />
            <YAxis
              yAxisId='left'
              stroke='#7dd3fc'
              fontSize={10}
              width={33}
              padding={{ top: 25 }}
              tickCount={10}
              tickFormatter={(value) => value + 'm'}
            />
            <YAxis
              yAxisId='right'
              orientation='right'
              stroke='#fbbf24'
              fontSize={8}
              width={28}
              tickCount={10}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Líneas verticales para separar días */}
            {dayChanges.map((date, index) => (
              <ReferenceLine
                key={`day-${index}`}
                x={date}
                stroke='#475569'
                strokeDasharray='3 3'
                strokeWidth={1}
                yAxisId='left'
              />
            ))}

            {/* Línea vertical para la hora actual */}
            <ReferenceLine
              x={closestToNow}
              stroke='#ef4444'
              strokeWidth={2}
              strokeOpacity={0.4}
              yAxisId='left'
              label={{
                value: 'Ahora',
                position: 'insideTopLeft',
                fill: '#ef4444',
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
              activeDot={{ r: 5 }}
              name='Altura'
            />
            <Line
              yAxisId='right'
              type='natural'
              dataKey='energy'
              stroke='#fbbf24'
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
              name='Energía'
              strokeDasharray='5 5'
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      <div className='mt-3 flex items-center justify-center gap-4 text-xs text-ocean-200'>
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
