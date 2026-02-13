import type { BuoyDataDoc } from '../types'
import { DirectionArrow } from './Icons'

interface HomeSummaryCardsProps {
  totalHeight: number
  primaryPeriod: number | null
  energy: number
  waveAngle: number | null
  waveDirection: string
  windAngle: number
  windDirection: string
  windSpeed: number
  latestBuoyRecord: BuoyDataDoc | null
}

export const HomeSummaryCards = ({
  totalHeight,
  primaryPeriod,
  energy,
  waveAngle,
  windAngle,
  waveDirection,
  windDirection,
  windSpeed,
  latestBuoyRecord,
}: HomeSummaryCardsProps) => (
  <div className='grid grid-cols-1 divide-y divide-slate-300/40 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm'>
    <div className='rounded-2xl bg-slate-50 px-2.5 py-2'>
      <p className='mb-1 text-[10px] uppercase tracking-wide text-slate-500'>
        Olas
      </p>
      <div className='flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-900'>
        <span className='text-xl font-semibold leading-none'>
          {totalHeight.toFixed(2)}m
        </span>
        <span className='text-slate-300/70'>•</span>
        <span className='text-base font-semibold leading-none text-slate-700'>
          {primaryPeriod ?? '--'}s
        </span>
        <span className='text-slate-300/70'>•</span>
        <span className='inline-flex items-center gap-1 text-base font-semibold leading-none'>
          <DirectionArrow
            className='h-4 w-4 text-sky-600'
            degrees={waveAngle ?? 0}
          />
          {waveDirection}
        </span>
        <span className='text-slate-300/70'>•</span>
        <span className='inline-flex items-center gap-1 text-base font-semibold leading-none'>
          <span aria-hidden='true'>⚡</span>
          {energy.toFixed(0)}
        </span>
      </div>
    </div>

    <div className='mt-1 rounded-2xl bg-slate-50 px-2.5 py-2'>
      <p className='text-[10px] uppercase tracking-wide text-slate-500'>
        Viento
      </p>
      <p className='mt-0.5 flex items-center gap-2 text-slate-900'>
        <span className='inline-flex items-center gap-1 text-sm font-medium leading-none text-slate-700'>
          <DirectionArrow
            className='h-4 w-4 text-sky-600'
            degrees={windAngle}
          />
          {windDirection}
        </span>
        <span className='text-slate-300/70'>•</span>
        <span className='text-lg font-semibold leading-none'>
          {windSpeed.toFixed(1)} km/h
        </span>
      </p>
    </div>

    <div className='mt-1 rounded-2xl bg-slate-50 px-2.5 py-2'>
      <p className='text-[10px] uppercase tracking-wide text-slate-500'>
        Último boya
      </p>
      <p className='mt-0.5 flex items-baseline gap-2 text-slate-900'>
        <span className='text-lg font-semibold leading-none'>
          {latestBuoyRecord ? `${latestBuoyRecord.height.toFixed(2)}m` : '--'}
        </span>
        <span className='text-slate-300/70'>•</span>
        <span className='text-sm font-medium leading-none text-slate-700'>
          {latestBuoyRecord ? `${latestBuoyRecord.period.toFixed(1)}s` : '--'}
        </span>
      </p>
    </div>
  </div>
)
