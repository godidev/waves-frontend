import { getPrimarySwell, getTotalWaveHeight } from '../../services/api'
import type { SurfForecast } from '../../types'
import { formatHour } from '../../utils/time'
import { ForecastTableItem } from './ForecastTableItem'

interface ForecastTableColumnProps {
  forecast: SurfForecast
  locale: string
}

export const ForecastTableColumn = ({
  forecast,
  locale,
}: ForecastTableColumnProps) => {
  const primarySwell = getPrimarySwell(forecast)
  const totalHeight = getTotalWaveHeight(forecast)

  return (
    <div className='flex flex-col border-r border-white/10 pt-2'>
      <ForecastTableItem value={formatHour(forecast.date, locale)} />
      <ForecastTableItem value={`${totalHeight.toFixed(1)}m`} />
      <ForecastTableItem value={`${primarySwell?.period ?? '--'}s`} />
      <ForecastTableItem value={`${forecast.wind.speed} km/h. `} />
      <ForecastTableItem value={`${forecast.energy}`} />
    </div>
  )
}
