import { getPrimarySwell, getTotalWaveHeight } from '../../services/api'
import type { SurfForecast } from '../../types'
import { ForecastTableItem } from './ForecastTableItem'

interface ForecastTableColumnProps {
  forecast: SurfForecast
  locale: string
  isCurrentHour?: boolean
}

const formatHourOnly = (timestamp: string, locale: string) =>
  new Date(timestamp).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })

export const ForecastTableColumn = ({
  forecast,
  locale,
  isCurrentHour = false,
}: ForecastTableColumnProps) => {
  const primarySwell = getPrimarySwell(forecast)
  const totalHeight = getTotalWaveHeight(forecast)

  return (
    <div
      className={`flex flex-col border-r border-white/10 pt-2 last:border-r-0 ${
        isCurrentHour ? 'bg-cyan-500/20' : ''
      }`}
    >
      <ForecastTableItem
        value={formatHourOnly(forecast.date, locale)}
        highlight={isCurrentHour}
      />
      <ForecastTableItem value={`${totalHeight.toFixed(1)}m`} />
      <ForecastTableItem value={`${primarySwell?.period ?? '--'}s`} />
      <ForecastTableItem value={`${forecast.wind.speed} km/h`} />
      <ForecastTableItem value={`${forecast.energy}`} />
    </div>
  )
}
