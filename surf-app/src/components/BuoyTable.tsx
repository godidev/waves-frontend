import type { Buoy } from '../types'
import { DirectionArrow } from './Icons'
import { formatHour } from '../utils/time'

interface BuoyTableProps {
  buoys: Buoy[]
  locale: string
}

const formatNumber = (value: number, locale: string, digits = 0): string =>
  value.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

export const BuoyTable = ({ buoys, locale }: BuoyTableProps) => (
  <div className='overflow-x-auto rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800/70'>
    <table className='w-full min-w-[560px] border-collapse text-[11px] text-slate-700 dark:text-slate-200'>
      <thead>
        <tr className='border-b border-slate-200/90 dark:border-slate-700/90'>
          <th className='w-px whitespace-nowrap px-1.5 py-2 pr-1 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-300'>
            Métrica
          </th>
          {buoys.map((buoy) => (
            <th
              key={`header-${buoy.date}`}
              className='px-1 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-300'
            >
              <span className='block'>
                {new Date(buoy.date).toLocaleDateString(locale, {
                  weekday: 'short',
                  day: 'numeric',
                })}
              </span>
              <span className='mt-0.5 block text-[10px] font-semibold normal-case tracking-normal text-slate-700 dark:text-slate-200'>
                {formatHour(new Date(buoy.date).toISOString(), locale)}
              </span>
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        <tr className='border-b border-slate-200/70 dark:border-slate-700/70'>
          <th className='whitespace-nowrap px-1.5 py-2 pr-1 text-left font-medium text-slate-600 dark:text-slate-300'>
            Altura (m)
          </th>
          {buoys.map((buoy) => (
            <td
              key={`height-${buoy.date}`}
              className='px-1 py-2 text-center tabular-nums'
            >
              {formatNumber(buoy.height, locale, 2)}
            </td>
          ))}
        </tr>

        <tr className='border-b border-slate-200/70 dark:border-slate-700/70'>
          <th className='whitespace-nowrap px-1.5 py-2 pr-1 text-left font-medium text-slate-600 dark:text-slate-300'>
            Periodo (s)
          </th>
          {buoys.map((buoy) => (
            <td
              key={`period-${buoy.date}`}
              className='px-1 py-2 text-center tabular-nums'
            >
              {formatNumber(buoy.period, locale, 1)}
            </td>
          ))}
        </tr>

        <tr>
          <th className='whitespace-nowrap px-1.5 py-2 pr-1 text-left font-medium text-slate-600 dark:text-slate-300'>
            Dirección (°)
          </th>
          {buoys.map((buoy) => (
            <td
              key={`direction-${buoy.date}`}
              className='px-1 py-2 text-center tabular-nums'
            >
              <span className='inline-flex items-center gap-0.5'>
                {formatNumber(buoy.avgDirection, locale)}
                <DirectionArrow
                  className='h-2.5 w-2.5 text-sky-600'
                  degrees={buoy.avgDirection}
                />
              </span>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  </div>
)
