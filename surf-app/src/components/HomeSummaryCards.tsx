import { memo } from 'react'
import type { BuoyDataDoc } from '../types'
import { DirectionArrow } from './Icons'

const formatRelativeUpdate = (date: Date, nowMs: number): string => {
  const diffMs = Math.max(0, nowMs - date.getTime())
  const minutes = Math.floor(diffMs / 60000)

  if (minutes < 1) return 'hace menos de 1 min'
  if (minutes < 60) return `hace ${minutes} min`

  const hours = Math.floor(minutes / 60)
  return `hace ${hours} h`
}

const formatNumber = (value: number, digits = 0): string =>
  value.toLocaleString('es-ES', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

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
  nowMs: number
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
    nowMs,
  }: HomeSummaryCardsProps) => {
    const totalHeightText = `${formatNumber(totalHeight, 2)} m`
    const primaryPeriodText =
      primaryPeriod !== null ? `${formatNumber(primaryPeriod, 1)} s` : '--'
    const energyText = `${formatNumber(energy)} kJ`
    const windSpeedText = `${formatNumber(windSpeed)} km/h`
    const buoyHeightText = latestBuoyRecord
      ? `${formatNumber(latestBuoyRecord.height, 2)} m`
      : '--'
    const buoyPeriodText = latestBuoyRecord
      ? `${formatNumber(latestBuoyRecord.period, 1)} s`
      : '--'

    const updatedText = latestBuoyRecord?.date
      ? formatRelativeUpdate(new Date(latestBuoyRecord.date), nowMs)
      : '--'

    const isBuoyStale =
      latestBuoyRecord?.date !== undefined
        ? nowMs - new Date(latestBuoyRecord.date).getTime() > 90 * 60000
        : false

    return (
      <div className='overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50 to-sky-50/60 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/70'>
        <div className='px-3 pt-2.5 text-center'>
          <p className='mb-1 text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300'>
            Olas
          </p>
          <div className='flex flex-wrap items-end justify-center gap-x-2 gap-y-1 text-slate-900 dark:text-slate-100'>
            <span className='text-[1.75rem] font-semibold leading-none tracking-tight'>
              {totalHeightText}
            </span>
            <span className='text-slate-400 dark:text-slate-500'>•</span>
            <span className='text-lg font-semibold leading-none text-slate-800 dark:text-slate-200'>
              {primaryPeriodText}
            </span>
            <span className='text-slate-400 dark:text-slate-500'>•</span>
            <span className='inline-flex items-center gap-1 text-base font-semibold leading-none'>
              <DirectionArrow
                className='h-4 w-4 text-sky-600'
                degrees={waveAngle ?? 0}
              />
              {waveDirection}
            </span>
          </div>
          <div className='mt-2 inline-flex items-center gap-1 rounded-full bg-sky-100/80 px-2.5 py-1 text-sm font-semibold text-sky-900 ring-1 ring-sky-200/80 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-500/20'>
            <span aria-hidden='true'>⚡</span>
            <span>{energyText}</span>
          </div>
        </div>

        <div className='mt-2.5 grid grid-cols-2 gap-2 px-3 pb-2'>
          <div className='rounded-2xl border border-slate-200/80 bg-white/75 px-2.5 py-2 text-center dark:border-slate-700/70 dark:bg-slate-800/70'>
            <p className='text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300'>
              Viento
            </p>
            <p className='mt-1 flex flex-col items-center justify-center gap-2 text-slate-900 dark:text-slate-100'>
              <span className='text-base font-semibold leading-none'>
                {windSpeedText}
              </span>
              <span className='inline-flex items-center gap-1 text-sm font-medium leading-none text-slate-800 dark:text-slate-200'>
                <DirectionArrow
                  className='h-4 w-4 text-sky-600'
                  degrees={windAngle}
                />
                {windDirection}
              </span>
            </p>
          </div>

          <div className='rounded-2xl border border-slate-200/80 bg-white/75 px-2.5 py-2 text-center dark:border-slate-700/70 dark:bg-slate-800/70'>
            <p className='text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300'>
              Última boya
            </p>
            <p className='mt-1 flex flex-col items-center gap-2 text-slate-900 dark:text-slate-100'>
              <span className='text-base font-semibold leading-none'>
                {buoyHeightText}
              </span>
              <span className='text-sm font-medium leading-none text-slate-800 dark:text-slate-200'>
                {buoyPeriodText}
              </span>
            </p>
          </div>
        </div>

        <div
          className={`border-t px-3 py-1.5 text-center text-[11px] font-medium ${
            isBuoyStale
              ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200'
              : 'border-slate-200/70 bg-white/70 text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-200'
          }`}
        >
          <span>Datos actualizados: {updatedText}</span>
        </div>
      </div>
    )
  },
)

HomeSummaryCards.displayName = 'HomeSummaryCards'
