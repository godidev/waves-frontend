import type { SurfForecast } from '../../types'
import { ForecastTableColumn } from './ForecastTableColumn'
import { ForecastTableHeaderColumn } from './ForecastTableHeaderColumn'

interface ForecastTableProps {
  forecasts: SurfForecast[]
  locale: string
}

export const ForecastTable = ({ forecasts, locale }: ForecastTableProps) => (
  <div className='space-y-3'>
    <div className='hide-scrollbar flex gap-3 overflow-x-auto rounded-2xl border border-white/10 bg-ocean-800 pb-2'>
      <ForecastTableHeaderColumn />
      {forecasts.map((forecast) => (
        <ForecastTableColumn
          key={forecast.date}
          forecast={forecast}
          locale={locale}
        />
      ))}
    </div>
  </div>
)
