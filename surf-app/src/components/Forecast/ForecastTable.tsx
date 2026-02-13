import { useMemo, useState } from 'react'
import type { SurfForecast } from '../../types'
import { ForecastDayNav } from './ForecastDayNav'
import { ForecastTableColumn } from './ForecastTableColumn'
import { ForecastTableHeaderColumn } from './ForecastTableHeaderColumn'

interface ForecastTableProps {
  forecasts: SurfForecast[]
  locale: string
  interval?: 1 | 3
  onIntervalChange?: (interval: 1 | 3) => void
  showIntervalControl?: boolean
}

const getUniqueDays = (forecasts: SurfForecast[]): string[] => {
  const days = new Map<string, string>()

  for (const forecast of forecasts) {
    const date = new Date(forecast.date)
    const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    if (!days.has(dayKey)) {
      days.set(dayKey, forecast.date)
    }
  }

  return Array.from(days.values())
}

const findTodayIndex = (days: string[]): number => {
  const now = new Date()
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`

  for (let i = 0; i < days.length; i++) {
    const date = new Date(days[i])
    const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    if (dayKey === todayKey) {
      return i
    }
  }

  return 0 // Default to first day if today not found
}

const filterByDay = (
  forecasts: SurfForecast[],
  selectedDate: string,
): SurfForecast[] => {
  const selected = new Date(selectedDate)
  const selectedDay = selected.getDate()
  const selectedMonth = selected.getMonth()
  const selectedYear = selected.getFullYear()

  return forecasts.filter((forecast) => {
    const date = new Date(forecast.date)
    return (
      date.getDate() === selectedDay &&
      date.getMonth() === selectedMonth &&
      date.getFullYear() === selectedYear
    )
  })
}

const filterByInterval = (
  forecasts: SurfForecast[],
  interval: 1 | 3,
): SurfForecast[] => {
  if (interval === 1) return forecasts

  return forecasts.filter((forecast) => {
    const hour = new Date(forecast.date).getHours()
    return hour % 3 === 0
  })
}

const isCurrentHour = (forecastDate: string): boolean => {
  const now = new Date()
  const forecast = new Date(forecastDate)
  return (
    forecast.getFullYear() === now.getFullYear() &&
    forecast.getMonth() === now.getMonth() &&
    forecast.getDate() === now.getDate() &&
    forecast.getHours() === now.getHours()
  )
}

export const ForecastTable = ({
  forecasts,
  locale,
  interval,
  onIntervalChange,
  showIntervalControl = true,
}: ForecastTableProps) => {
  const availableDays = useMemo(() => getUniqueDays(forecasts), [forecasts])
  const initialDayIndex = useMemo(
    () => findTodayIndex(availableDays),
    [availableDays],
  )

  const [selectedDayIndex, setSelectedDayIndex] = useState(initialDayIndex)
  const [internalInterval, setInternalInterval] = useState<1 | 3>(3)

  const activeInterval = interval ?? internalInterval
  const handleIntervalChange = onIntervalChange ?? setInternalInterval

  const selectedDate = availableDays[selectedDayIndex] ?? availableDays[0]

  const filteredForecasts = useMemo(() => {
    if (!selectedDate) return []
    const byDay = filterByDay(forecasts, selectedDate)
    return filterByInterval(byDay, activeInterval)
  }, [forecasts, selectedDate, activeInterval])

  const handlePrevDay = () => {
    setSelectedDayIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNextDay = () => {
    setSelectedDayIndex((prev) => Math.min(availableDays.length - 1, prev + 1))
  }

  if (availableDays.length === 0) {
    return null
  }

  return (
    <div className='space-y-3'>
      <ForecastDayNav
        selectedDate={selectedDate}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        hasPrevDay={selectedDayIndex > 0}
        hasNextDay={selectedDayIndex < availableDays.length - 1}
        interval={activeInterval}
        onIntervalChange={handleIntervalChange}
        showIntervalControl={showIntervalControl}
        locale={locale}
      />

      <div className='hide-scrollbar flex overflow-x-auto rounded-3xl border border-slate-200 bg-white pb-1 shadow-sm'>
        <ForecastTableHeaderColumn />
        {filteredForecasts.map((forecast) => (
          <ForecastTableColumn
            key={forecast.date}
            forecast={forecast}
            locale={locale}
            isCurrentHour={isCurrentHour(forecast.date)}
          />
        ))}
      </div>
    </div>
  )
}
