import type { SurfForecast } from '../../types'
import type { ForecastChartPoint } from './forecastSnapshots'

export const buildForecastChartData = (
  forecasts: SurfForecast[],
): ForecastChartPoint[] =>
  forecasts.map((forecast) => ({
    time: new Date(forecast.date).getTime(),
    waveHeight: Number((forecast.validSwells[0]?.height ?? 0).toFixed(1)),
    energy: forecast.energy,
    wavePeriod: Number((forecast.validSwells[0]?.period ?? 0).toFixed(1)),
    windSpeed: Number((forecast.wind.speed ?? 0).toFixed(1)),
    windDirection: Number((forecast.wind.angle ?? 0).toFixed(1)),
  }))
