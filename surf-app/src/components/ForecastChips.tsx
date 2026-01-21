import type { SurfForecast } from '../types'
import { formatHour, isToday, isTomorrow } from '../utils/time'
import { DirectionArrow } from './DirectionArrow'
import { getTotalWaveHeight, getPrimarySwell } from '../services/api'

interface ForecastChipsProps {
  forecasts: SurfForecast[]
  selected: string
  locale: string
  onSelect: (date: string) => void
}

export const ForecastChips = ({
  forecasts,
  selected,
  locale,
  onSelect,
}: ForecastChipsProps) => (
  <div className='space-y-3'>
    <div className='hide-scrollbar flex gap-3 items-end overflow-x-auto pb-2'>
      {forecasts.map((forecast, index) => {
        const showSeparator = index === 0 || isTomorrow(forecast.date)
        const primarySwell = getPrimarySwell(forecast)
        const totalHeight = getTotalWaveHeight(forecast)
        return (
          <div key={forecast.date} className='flex flex-col gap-2'>
            {showSeparator && (
              <span className='text-xs uppercase text-ocean-200'>
                {isToday(forecast.date) ? 'Hoy' : 'Mañana'}
              </span>
            )}
            <button
              onClick={() => onSelect(forecast.date)}
              className={`min-w-[150px] rounded-2xl border px-3 py-3 text-left text-xs text-white transition ${
                selected === forecast.date
                  ? 'border-ocean-300 bg-ocean-700 shadow-glow'
                  : 'border-white/10 bg-ocean-800'
              }`}
            >
              <div className='flex items-center justify-between text-sm font-semibold'>
                <span>{formatHour(forecast.date, locale)}</span>
                <span>{totalHeight.toFixed(1)}m</span>
              </div>
              <div className='mt-2 flex items-center justify-between text-ocean-200'>
                <span>{primarySwell?.period ?? '--'}s</span>
                <DirectionArrow degrees={forecast.wind.angle} />
              </div>
              <div className='mt-2 text-[11px] text-ocean-200'>
                <span>{forecast.wind.speed} km/h</span>
              </div>
              {forecast.validSwells.length > 0 && (
                <div className='mt-2 text-[11px] text-ocean-300'>
                  <span>
                    {forecast.validSwells.length} swell
                    {forecast.validSwells.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              <div className='text-[11px] text-ocean-300'>
                Energía: {forecast.energy}
              </div>
            </button>
          </div>
        )
      })}
    </div>
  </div>
)
