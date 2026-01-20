import { useEffect, useMemo, useState } from 'react'
import { getBuoyData, getBuoyInfo } from '../services/api'
import type { BuoyDataDoc } from '../types'
import { MetricCard } from '../components/MetricCard'
import { DirectionArrow } from '../components/DirectionArrow'
import { BuoyChart } from '../components/BuoyChart'
import { BuoyTable } from '../components/BuoyTable'
import { SegmentedToggle } from '../components/SegmentedToggle'
import { StatusMessage } from '../components/StatusMessage'
import { PageHeader } from '../components/PageHeader'

interface BuoyDetailPageProps {
  stationId: string
}

type RangeOption = '6' | '12' | '24'

type ChartMetric = 'height' | 'period' | 'avgDirection'

const chartOptions: { value: ChartMetric; label: string }[] = [
  { value: 'height', label: 'Altura' },
  { value: 'period', label: 'Periodo' },
  { value: 'avgDirection', label: 'Dirección' },
]

export const BuoyDetailPage = ({ stationId }: BuoyDetailPageProps) => {
  const [range, setRange] = useState<RangeOption>('6')
  const [buoyData, setBuoyData] = useState<BuoyDataDoc[]>([])
  const [chartMetric, setChartMetric] = useState<ChartMetric>('height')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [buoyName, setBuoyName] = useState('')
  const locale = 'es-ES'

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(false)
      try {
        const [data, info] = await Promise.all([
          getBuoyData(stationId, Number(range)),
          getBuoyInfo(stationId),
        ])
        if (!mounted) return
        setBuoyData(data)
        setBuoyName(info.buoyName ?? stationId)
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
  const buoys = useMemo(() => 
    buoyData.map(data => ({
      date: data.date.getTime(),
      buoyId: data.buoyId,
      period: data.period,
      height: data.height,
      avgDirection: data.avgDirection,
      peakDirection: data.peakDirection ?? undefined
    })), 
    [buoyData]
  )

  const latest = useMemo(() => buoys[0], [buoys])

  if (loading) {
    return <StatusMessage message="Cargando..." />
  }

  if (error) {
    return <StatusMessage message="Error al cargar datos" variant="error" />
  }

  if (!buoys.length) {
    return <StatusMessage message="No hay datos disponibles" />
  }

  return (
    <div className="space-y-5">
      <PageHeader title={buoyName || 'Boyas'} subtitle="Boyas" />
      <SegmentedToggle
        options={[
          { label: '6h', value: '6' },
          { label: '12h', value: '12' },
          { label: '24h', value: '24' },
        ]}
        value={range}
        onChange={(value) => setRange(value as RangeOption)}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Altura" value={`${latest?.height ?? '--'}`} suffix="m" />
        <MetricCard label="Periodo" value={`${latest?.period ?? '--'}`} suffix="s" />
        <MetricCard
          label="Dirección"
          value={`${latest?.avgDirection ?? '--'}°`}
          icon={<DirectionArrow degrees={latest?.avgDirection ?? null} />}
        />
      </div>

      <div className="space-y-3">
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
