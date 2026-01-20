import type { Buoy } from '../types'
import { DirectionArrow } from './DirectionArrow'
import { formatHour } from '../utils/time'

interface BuoyTableProps {
  buoys: Buoy[]
  locale: string
}

export const BuoyTable = ({ buoys, locale }: BuoyTableProps) => (
  <div className="overflow-hidden rounded-2xl border border-white/10">
    <table className="w-full text-left text-xs text-ocean-50">
      <thead className="bg-ocean-800/80 text-ocean-200">
        <tr>
          <th className="px-3 py-2">Hora</th>
          <th className="px-3 py-2">Altura</th>
          <th className="px-3 py-2">Periodo</th>
          <th className="px-3 py-2">Dirección</th>
        </tr>
      </thead>
      <tbody className="bg-ocean-900">
        {buoys.map((buoy) => (
          <tr key={buoy.date} className="border-t border-white/5">
            <td className="px-3 py-2">{formatHour(new Date(buoy.date).toISOString(), locale)}</td>
            <td className="px-3 py-2">{buoy.height}m</td>
            <td className="px-3 py-2">{buoy.period}s</td>
            <td className="px-3 py-2">
              <DirectionArrow degrees={buoy.avgDirection} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
