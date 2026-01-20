import { useEffect, useMemo, useState } from 'react'
import { getBuoyData } from '../services/api'
import type { BuoyDataDoc } from '../types'
import { MetricCard } from './MetricCard'
import { DirectionArrow } from './DirectionArrow'
import { BuoyChart } from './BuoyChart'
import { BuoyTable } from './BuoyTable'
import { SegmentedToggle } from './SegmentedToggle'
import { StatusMessage } from './StatusMessage'

interface BuoyDetailContentProps {
  stationId: string
  /** Si es true, muestra mensajes de loading/error. Si es false, no renderiza nada durante loading */
  showStatusMessages?: boolean
}

type RangeOption = '6' | '12' | '24'

type ChartMetric = 'height' | 'period'

const chartOptions: { value: ChartMetric; label: string }[] = [
  { value: 'height', label: 'Altura' },
  { value: 'period', label: 'Periodo' },
]

export const BuoyDetailContent = ({
  stationId,
  showStatusMessages = true,
}: BuoyDetailContentProps) => {
  const [range, setRange] = useState<RangeOption>('6')
  const [buoyData, setBuoyData] = useState<BuoyDataDoc[]>([])
  const [chartMetric, setChartMetric] = useState<ChartMetric>('height')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const locale = 'es-ES'

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(false)
      try {
        const data = await getBuoyData(stationId, Number(range))
        if (!mounted) return
        setBuoyData(data)
      } catch (err) {
        console.error('Failed to load buoy data:', err)
        if (!mounted) return
        setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [range, stationId])

  // Convert BuoyDataDoc to Buoy format for existing components
  const buoys = useMemo(
    () =>
      buoyData.map((data) => ({
        date: data.date.getTime(),
        buoyId: data.buoyId,
        period: data.period,
        height: data.height,
        avgDirection: data.avgDirection,
        peakDirection: data.peakDirection ?? undefined,
      })),
    [buoyData],
  )

  const latest = useMemo(() => buoys.at(-1), [buoys])

  if (loading) {
    if (!showStatusMessages) return null
    return <StatusMessage message='Cargando...' />
  }

  if (error) {
    if (!showStatusMessages) return null
    return <StatusMessage message='Error al cargar datos' variant='error' />
  }

  if (!buoys.length) {
    if (!showStatusMessages) return null
    return <StatusMessage message='No hay datos disponibles' />
  }

  return (
    <div className='space-y-5'>
      <SegmentedToggle
        options={[
          { label: '6h', value: '6' },
          { label: '12h', value: '12' },
          { label: '24h', value: '24' },
        ]}
        value={range}
        onChange={(value) => setRange(value as RangeOption)}
      />

      <div className='flex justify-stretch gap-4'>
        <MetricCard
          label='Altura'
          value={`${latest?.height ?? '--'}`}
          suffix='m'
        />
        <MetricCard
          label='Periodo'
          value={`${latest?.period ?? '--'}`}
          suffix='s'
        />
        <MetricCard
          label='Dirección'
          value={`${latest?.avgDirection ?? '--'}°`}
          icon={<DirectionArrow degrees={latest?.avgDirection ?? null} />}
        />
      </div>

      <div className='space-y-3'>
        <SegmentedToggle
          options={chartOptions}
          value={chartMetric}
          onChange={(value) => setChartMetric(value as ChartMetric)}
        />
        <BuoyChart buoys={buoys} metric={chartMetric} locale={locale} />
      </div>

      <BuoyTable buoys={buoys} locale={locale} />
    </div>
  )
}
