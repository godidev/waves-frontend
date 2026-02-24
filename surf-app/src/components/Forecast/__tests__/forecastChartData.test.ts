import { describe, expect, it } from 'vitest'
import type { SurfForecast } from '../../../types'
import { buildForecastChartData } from '../forecastChartData'

const makeForecast = (
  date: string,
  waveHeight: number,
  period: number,
  windSpeed: number,
  windDirection: number,
): SurfForecast => ({
  date,
  spot: 'sopelana',
  validSwells: [{ height: waveHeight, period, angle: 240 }],
  wind: { speed: windSpeed, angle: windDirection },
  energy: 420,
})

describe('forecastChartData', () => {
  it('normalizes forecast documents into chart points', () => {
    const input: SurfForecast[] = [
      makeForecast('2026-02-24T08:00:00.000Z', 1.234, 12.345, 10.678, 201.234),
    ]

    const output = buildForecastChartData(input)

    expect(output).toHaveLength(1)
    expect(output[0].time).toBe(new Date('2026-02-24T08:00:00.000Z').getTime())
    expect(output[0].waveHeight).toBe(1.2)
    expect(output[0].wavePeriod).toBe(12.3)
    expect(output[0].windSpeed).toBe(10.7)
    expect(output[0].windDirection).toBe(201.2)
  })
})
