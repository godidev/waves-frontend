import type { Buoy } from '../types'
import { DirectionArrow } from './DirectionArrow'
import { formatHour } from '../utils/time'

interface BuoyTableProps {
  buoys: Buoy[]
  locale: string
}

export const BuoyTable = ({ buoys, locale }: BuoyTableProps) => (
  <div className='overflow-hidden rounded-2xl border border-white/10'>
    <table className='w-full text-left text-[11px] leading-tight text-ocean-50'>
      <thead className='bg-ocean-800/80 text-[10px] uppercase tracking-wide text-ocean-200'>
        <tr>
          <th className='px-2 py-1.5'>Hora</th>
          <th className='px-2 py-1.5'>Altura</th>
          <th className='px-2 py-1.5'>Periodo</th>
          <th className='px-2 py-1.5'>Dirección</th>
        </tr>
      </thead>
      <tbody className='bg-ocean-900'>
        {buoys.map((buoy) => (
          <tr key={buoy.date} className='border-t border-white/5'>
            <td className='px-2 py-1.5 font-medium tabular-nums'>
              {formatHour(new Date(buoy.date).toISOString(), locale)}
            </td>
            <td className='px-2 py-1 tabular-nums'>{buoy.height}m</td>
            <td className='px-2 py-1 tabular-nums'>{buoy.period}s</td>
            <td className='flex items-center gap-1 px-2 py-1 tabular-nums'>
              {buoy.avgDirection}°
              <DirectionArrow degrees={buoy.avgDirection} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
