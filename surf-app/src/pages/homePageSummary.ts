import { getPrimarySwell, getTotalWaveHeight } from '../services/api'
import { degreesToCardinal, type SurfForecast } from '../types'

const formatNumber = (value: number, locale: string, digits = 0): string =>
  value.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

export const getClosestForecast = (
  forecasts: SurfForecast[],
  nowMs: number,
): SurfForecast | null => {
  if (!forecasts.length) return null

  return forecasts.reduce((closest, forecast) => {
    const forecastTime = new Date(forecast.date).getTime()
    const closestTime = new Date(closest.date).getTime()
    return Math.abs(forecastTime - nowMs) < Math.abs(closestTime - nowMs)
      ? forecast
      : closest
  })
}

export const buildSelectedDirections = (selected: SurfForecast | null) => {
  const primarySwell = selected ? getPrimarySwell(selected) : null

  const waveDirection =
    primarySwell?.angle !== undefined
      ? `${degreesToCardinal(primarySwell.angle)} ${primarySwell.angle.toFixed(0)}°`
      : '--'

  const windDirection =
    selected?.wind.angle !== undefined
      ? `${degreesToCardinal(selected.wind.angle)} ${selected.wind.angle.toFixed(0)}°`
      : '--'

  return { waveDirection, windDirection }
}

export const buildForecastCurrentText = (
  selected: SurfForecast | null,
  locale: string,
): string => {
  if (!selected) return '--'

  const selectedPrimarySwell = getPrimarySwell(selected)
  const selectedTotalHeight = getTotalWaveHeight(selected)

  return selectedPrimarySwell
    ? `${formatNumber(selectedTotalHeight, locale, 2)} m · ${formatNumber(selectedPrimarySwell.period, locale, 1)} s`
    : `${formatNumber(selectedTotalHeight, locale, 2)} m · --`
}
