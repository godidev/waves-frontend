import { memo } from 'react'
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

export const HomeSummaryCards = memo(
  ({
    totalHeight,
    primaryPeriod,
    energy,
    waveAngle,
    windAngle,
    waveDirection,
    windDirection,
    windSpeed,
    latestBuoyRecord,
  }: HomeSummaryCardsProps) => {
    const totalHeightText = `${totalHeight.toFixed(2)}m`
    const primaryPeriodText = `${primaryPeriod ?? '--'}s`
    const energyText = energy.toFixed(0)
    const windSpeedText = `${windSpeed.toFixed(1)} km/h`
    const buoyHeightText = latestBuoyRecord
      ? `${latestBuoyRecord.height.toFixed(2)}m`
      : '--'
    const buoyPeriodText = latestBuoyRecord
      ? `${latestBuoyRecord.period.toFixed(1)}s`
      : '--'

    return (
      <div className='grid grid-cols-1 divide-y divide-slate-300/40 rounded-3xl border border-slate-200 bg-white p-1 shadow-sm'>
        <div className='rounded-xl bg-slate-50 px-2.5 py-1 text-center'>
          <p className='mb-1 text-[10px] uppercase tracking-wide text-slate-500'>
            Olas
          </p>
          <div className='flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-slate-900'>
            <span className='text-xl font-semibold leading-none'>
              {totalHeightText}
            </span>
            <span className='text-slate-300/70'>•</span>
            <span className='text-base font-semibold leading-none text-slate-700'>
              {primaryPeriodText}
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
              {energyText}
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 divide-x divide-slate-300/40 px-1'>
          <div className='mt-1 flex flex-col items-center rounded-xl bg-slate-50 px-2.5 py-1 text-center'>
            <p className='text-[10px] uppercase tracking-wide text-slate-500'>
              Viento
            </p>
            <p className='mt-0.5 flex flex-col items-center justify-center gap-2 text-slate-900'>
              <span className='text-lg font-semibold leading-none'>
                {windSpeedText}
              </span>
              <span className='inline-flex items-center gap-1 text-sm font-medium leading-none text-slate-700'>
                <DirectionArrow
                  className='h-4 w-4 text-sky-600'
                  degrees={windAngle}
                />
                {windDirection}
              </span>
            </p>
          </div>

          <div className='mt-1 flex flex-col items-center rounded-xl bg-slate-50 px-2.5 py-1 text-center'>
            <p className='text-[10px] uppercase tracking-wide text-slate-500'>
              Último boya
            </p>
            <p className='mt-0.5 flex flex-col items-center gap-2 text-slate-900'>
              <span className='text-lg font-semibold leading-none'>
                {buoyHeightText}
              </span>
              <span className='text-sm font-medium leading-none text-slate-700'>
                {buoyPeriodText}
              </span>
            </p>
          </div>
        </div>
      </div>
    )
  },
)

HomeSummaryCards.displayName = 'HomeSummaryCards'
