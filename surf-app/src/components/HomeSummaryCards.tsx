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
    const windSpeedText = `${windSpeed} km/h`
    const buoyHeightText = latestBuoyRecord
      ? `${latestBuoyRecord.height.toFixed(2)}m`
      : '--'
    const buoyPeriodText = latestBuoyRecord
      ? `${latestBuoyRecord.period.toFixed(1)}s`
      : '--'

    return (
      <div className='grid grid-cols-1 divide-y divide-slate-300/40 overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 shadow-sm dark:divide-slate-700/60 dark:border-slate-700 dark:bg-slate-900'>
        <div className='bg-slate-50 px-2.5 py-1 text-center dark:bg-slate-800'>
          <p className='mb-1 text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-300'>
            Olas
          </p>
          <div className='flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-slate-900 dark:text-slate-100'>
            <span className='text-xl font-semibold leading-none'>
              {totalHeightText}
            </span>
            <span className='text-slate-300/70 dark:text-slate-600'>•</span>
            <span className='text-base font-semibold leading-none text-slate-700 dark:text-slate-300'>
              {primaryPeriodText}
            </span>
            <span className='text-slate-300/70 dark:text-slate-600'>•</span>
            <span className='inline-flex items-center gap-1 text-base font-semibold leading-none'>
              <DirectionArrow
                className='h-4 w-4 text-sky-600'
                degrees={waveAngle ?? 0}
              />
              {waveDirection}
            </span>
            <span className='text-slate-300/70 dark:text-slate-600'>•</span>
            <span className='inline-flex items-center gap-1 text-base font-semibold leading-none'>
              <span aria-hidden='true'>⚡</span>
              {energyText}
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 divide-x divide-slate-300/40 dark:divide-slate-700/60'>
          <div className='flex flex-col items-center bg-slate-50 px-2.5 py-1 text-center dark:bg-slate-800'>
            <p className='text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-300'>
              Viento
            </p>
            <p className='mt-0.5 flex flex-col items-center justify-center gap-2 text-slate-900 dark:text-slate-100'>
              <span className='text-lg font-semibold leading-none'>
                {windSpeedText}
              </span>
              <span className='inline-flex items-center gap-1 text-sm font-medium leading-none text-slate-700 dark:text-slate-300'>
                <DirectionArrow
                  className='h-4 w-4 text-sky-600'
                  degrees={windAngle}
                />
                {windDirection}
              </span>
            </p>
          </div>

          <div className='flex flex-col items-center bg-slate-50 px-2.5 py-1 text-center dark:bg-slate-800'>
            <p className='text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-300'>
              Última boya
            </p>
            <p className='mt-0.5 flex flex-col items-center gap-2 text-slate-900 dark:text-slate-100'>
              <span className='text-lg font-semibold leading-none'>
                {buoyHeightText}
              </span>
              <span className='text-sm font-medium leading-none text-slate-700 dark:text-slate-300'>
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
