import { useMemo, useState } from 'react'
import type { BuoyDataDoc } from '../types'
import { MetricCard } from './MetricCard'
import { BuoyChart } from './BuoyChart'
import { BuoyTable } from './BuoyTable'
import { SegmentedToggle } from './SegmentedToggle'
import { StatusMessage } from './StatusMessage'
import { DirectionArrow, WaveHeight, WavePeriod } from './Icons'
import { useBuoyDataQuery } from '../hooks/useAppQueries'

interface BuoyDetailContentProps {
  stationId: string
  /** Si es true, muestra mensajes de loading/error. Si es false, no renderiza nada durante loading */
  showStatusMessages?: boolean
  viewMode?: 'chart' | 'table' | 'both'
  hours?: RangeOption
  showRangeSelector?: boolean
  showMetrics?: boolean
}

type RangeOption = '6' | '12' | '24'

export const BuoyDetailContent = ({
  stationId,
  showStatusMessages = true,
  viewMode = 'both',
  hours,
  showRangeSelector = true,
  showMetrics = true,
}: BuoyDetailContentProps) => {
  const [range, setRange] = useState<RangeOption>('6')
  const {
    data: buoyDataResponse,
    isLoading,
    isError,
  } = useBuoyDataQuery(stationId, 24)
  const buoyData: BuoyDataDoc[] = useMemo(
    () => buoyDataResponse ?? [],
    [buoyDataResponse],
  )
  const locale = 'es-ES'
  const activeRange = hours ?? range

  // Convert BuoyDataDoc to Buoy format for existing components
  const buoys = useMemo(() => {
    const sortedData = [...buoyData].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    )

    return sortedData.map((data) => ({
      date: data.date.getTime(),
      buoyId: data.buoyId,
      period: data.period,
      height: data.height,
      avgDirection: data.avgDirection,
      peakDirection: data.peakDirection ?? undefined,
    }))
  }, [buoyData])

  const visibleBuoys = useMemo(
    () => buoys.slice(-Number(activeRange)),
    [buoys, activeRange],
  )

  const latest = useMemo(() => visibleBuoys.at(-1), [visibleBuoys])

  if (isLoading) {
    if (!showStatusMessages) return null
    return <StatusMessage message='Cargando…' />
  }

  if (isError) {
    if (!showStatusMessages) return null
    return <StatusMessage message='Error al cargar datos' variant='error' />
  }

  if (!visibleBuoys.length) {
    if (!showStatusMessages) return null
    return <StatusMessage message='No hay datos disponibles' />
  }

  return (
    <div className='space-y-3'>
      {showMetrics && (
        <div className='grid grid-cols-3 gap-3'>
          <MetricCard
            icon={<WaveHeight className='h-6 w-6' />}
            label='Altura'
            value={`${latest?.height ?? '--'}`}
            suffix='m'
          />
          <MetricCard
            icon={<WavePeriod className='h-6 w-6' />}
            label='Periodo'
            value={`${latest?.period ?? '--'}`}
            suffix='s'
          />
          <MetricCard
            icon={
              <DirectionArrow
                className='h-6 w-6'
                degrees={latest?.peakDirection ?? latest?.avgDirection ?? 0}
              />
            }
            label='Dirección'
            suffix=''
            value={`${latest?.avgDirection ?? '--'}°`}
          />
        </div>
      )}

      {(viewMode === 'chart' || viewMode === 'both') && (
        <div className='space-y-2'>
          <BuoyChart buoys={visibleBuoys} locale={locale} />
        </div>
      )}

      {showRangeSelector && hours === undefined && (
        <SegmentedToggle
          options={[
            { label: '6h', value: '6' },
            { label: '12h', value: '12' },
            { label: '24h', value: '24' },
          ]}
          value={range}
          onChange={(value) => setRange(value as RangeOption)}
        />
      )}

      {(viewMode === 'table' || viewMode === 'both') && (
        <BuoyTable buoys={visibleBuoys} locale={locale} />
      )}
    </div>
  )
}
