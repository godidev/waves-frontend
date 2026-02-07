import { DirectionArrow, EnergyIcon } from './Icons'
import { WaveHeight, WavePeriod, WindIcon } from './Icons'
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

  energy: number
}

export const Hero = ({
  selectedTotalHeight,
  selectedPrimarySwell,
  wind,
  energy,
}: HeroProps) => {
  return (
    <div>
      <div className='mt-1 grid w-full min-w-0 grid-cols-[auto_auto_auto] gap-1'>
        <MetricCard
          label='Altura'
          value={selectedTotalHeight.toFixed(1)}
          suffix='m'
          icon={<WaveHeight className='h-7 w-7' />}
        />
        <MetricCard
          icon={<WavePeriod className='h-7 w-7' />}
          label='Periodo'
          value={`${selectedPrimarySwell?.period ?? '--'}`}
          suffix='s'
        />
        <MetricCard
          icon={<WindIcon className='h-7 w-7' />}
          label='Viento'
          value={`${wind.speed}`}
          suffix='km/h'
          windAngle={
            <DirectionArrow degrees={wind.angle} className='h-4 w-4' />
          }
        />
        <MetricCard
          icon={
            <DirectionArrow
              degrees={selectedPrimarySwell?.angle ?? 0}
              className='h-7 w-7'
            />
          }
          label='Dirección'
          value={
            selectedPrimarySwell?.angle
              ? selectedPrimarySwell.angle.toFixed(0)
              : '--'
          }
          suffix='°'
        />

        <MetricCard
          label='Energía'
          value={energy ? energy.toFixed(0) : '--'}
          suffix='kJ'
          icon={<EnergyIcon className='h-7 w-7' />}
        />
      </div>
    </div>
  )
}
