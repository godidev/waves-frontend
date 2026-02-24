import { DirectionArrow } from '../Icons'
import type { ForecastSnapshotItem } from './forecastSnapshots'

interface ForecastSnapshotTableProps {
  snapshotItems: ForecastSnapshotItem[]
  activeSnapshotLabel: string
  onSelectSnapshotLabel: (label: string) => void
}

export const ForecastSnapshotTable = ({
  snapshotItems,
  activeSnapshotLabel,
  onSelectSnapshotLabel,
}: ForecastSnapshotTableProps) => {
  return (
    <div className='rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800/70'>
      <table className='w-full border-collapse text-[11px] text-slate-700 dark:text-slate-200'>
        <thead>
          <tr className='border-b border-slate-200/90 dark:border-slate-700/90'>
            <th className='w-px whitespace-nowrap px-1.5 py-2 pr-1 text-left text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-300'>
              Métrica
            </th>
            {snapshotItems.map((item) => (
              <th
                key={`header-${item.label}`}
                className={`px-1 py-2 text-center font-semibold ${
                  item.label === activeSnapshotLabel
                    ? 'bg-sky-100/70 text-sky-700 dark:bg-sky-900/30 dark:text-sky-100'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <button
                  type='button'
                  className='flex w-full flex-col items-center gap-0.5 rounded-md px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500'
                  onClick={() => onSelectSnapshotLabel(item.label)}
                >
                  <span className='text-[10px] uppercase tracking-[0.08em]'>
                    {item.label}
                  </span>
                  <span className='font-medium'>{item.hour}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr className='border-b border-slate-200/70 dark:border-slate-700/70'>
            <th className='whitespace-nowrap px-1.5 py-2 pr-1 text-left font-medium text-slate-600 dark:text-slate-300'>
              Altura (m)
            </th>
            {snapshotItems.map((item) => (
              <td
                key={`height-${item.label}`}
                className={`px-1 py-2 text-center ${
                  item.label === activeSnapshotLabel
                    ? 'bg-sky-100/60 dark:bg-sky-900/20'
                    : ''
                }`}
              >
                <span className='inline-flex items-center gap-0.5 font-semibold'>
                  {item.waveHeight}
                  {item.waveHeightTrend === 'up' && (
                    <span
                      className='text-emerald-500 dark:text-emerald-400'
                      aria-label='Altura sube respecto a ahora'
                    >
                      ↑
                    </span>
                  )}
                  {item.waveHeightTrend === 'down' && (
                    <span
                      className='text-rose-500 dark:text-rose-400'
                      aria-label='Altura baja respecto a ahora'
                    >
                      ↓
                    </span>
                  )}
                  {item.waveHeightTrend === 'flat' && (
                    <span
                      className='text-slate-500 dark:text-slate-300'
                      aria-label='Altura estable respecto a ahora'
                    >
                      =
                    </span>
                  )}
                </span>
              </td>
            ))}
          </tr>

          <tr className='border-b border-slate-200/70 dark:border-slate-700/70'>
            <th className='whitespace-nowrap px-1.5 py-2 pr-1 text-left font-medium text-slate-600 dark:text-slate-300'>
              Energía (kJ)
            </th>
            {snapshotItems.map((item) => (
              <td
                key={`energy-${item.label}`}
                className={`px-1 py-2 text-center ${
                  item.label === activeSnapshotLabel
                    ? 'bg-sky-100/60 dark:bg-sky-900/20'
                    : ''
                }`}
              >
                <span className='inline-flex items-center gap-0.5 font-semibold'>
                  {item.energy}
                  {item.energyTrend === 'up' && (
                    <span
                      className='text-emerald-500 dark:text-emerald-400'
                      aria-label='Energía sube respecto a ahora'
                    >
                      ↑
                    </span>
                  )}
                  {item.energyTrend === 'down' && (
                    <span
                      className='text-rose-500 dark:text-rose-400'
                      aria-label='Energía baja respecto a ahora'
                    >
                      ↓
                    </span>
                  )}
                  {item.energyTrend === 'flat' && (
                    <span
                      className='text-slate-500 dark:text-slate-300'
                      aria-label='Energía estable respecto a ahora'
                    >
                      =
                    </span>
                  )}
                </span>
              </td>
            ))}
          </tr>

          <tr className='border-b border-slate-200/70 dark:border-slate-700/70'>
            <th className='whitespace-nowrap px-1.5 py-2 pr-1 text-left font-medium text-slate-600 dark:text-slate-300'>
              Periodo (s)
            </th>
            {snapshotItems.map((item) => (
              <td
                key={`period-${item.label}`}
                className={`px-1 py-2 text-center ${
                  item.label === activeSnapshotLabel
                    ? 'bg-sky-100/60 dark:bg-sky-900/20'
                    : ''
                }`}
              >
                {item.wavePeriod}
              </td>
            ))}
          </tr>

          <tr>
            <th className='whitespace-nowrap px-1.5 py-2 pr-1 text-left font-medium text-slate-600 dark:text-slate-300'>
              Viento (km/h)
            </th>
            {snapshotItems.map((item) => (
              <td
                key={`wind-${item.label}`}
                className={`px-1 py-2 text-center ${
                  item.label === activeSnapshotLabel
                    ? 'bg-sky-100/60 dark:bg-sky-900/20'
                    : ''
                }`}
              >
                <span className='inline-flex items-center gap-0.5'>
                  {item.windSpeed}
                  {item.windDirection !== null && (
                    <DirectionArrow
                      className='h-2.5 w-2.5 text-sky-600'
                      degrees={item.windDirection}
                    />
                  )}
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
