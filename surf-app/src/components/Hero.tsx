import { DirectionArrow } from './DirectionArrow'
import { MetricCard } from './MetricCard'

interface HeroProps {
  selectedTotalHeight: number
  selectedPrimarySwell: {
    period: number
    angle: number
    height: number
  } | null

  wind: {
    speed: number
    angle: number
  }
}

export const Hero = ({
  selectedTotalHeight,
  selectedPrimarySwell,
  wind,
}: HeroProps) => {
  return (
    <div>
      <p>Prevision en sopelana ahora</p>
      <div className='flex flex-nowrap justify-between gap-3'>
        <MetricCard
          label='Altura'
          value={selectedTotalHeight.toFixed(1)}
          suffix='m'
        />
        <MetricCard
          label='Periodo'
          value={`${selectedPrimarySwell?.period ?? '--'}`}
          suffix='s'
        />
        <MetricCard
          label='Viento'
          value={`${wind.speed}`}
          suffix='km/h'
          icon={<DirectionArrow degrees={wind.angle} />}
        />
      </div>
    </div>
  )
}
