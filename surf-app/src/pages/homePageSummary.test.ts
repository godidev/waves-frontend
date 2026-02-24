import { describe, expect, it } from 'vitest'
import type { SurfForecast } from '../types'
import {
  buildForecastCurrentText,
  buildSelectedDirections,
  getClosestForecast,
} from './homePageSummary'

const makeForecast = (
  date: string,
  angle: number,
  period: number,
): SurfForecast => ({
  date,
  spot: 'sopelana',
  validSwells: [{ height: 1.4, period, angle }],
  wind: {
    speed: 14,
    angle,
  },
  energy: 800,
})

describe('homePageSummary', () => {
  it('returns closest forecast to now', () => {
    const forecasts: SurfForecast[] = [
      makeForecast('2026-02-24T08:00:00.000Z', 200, 12),
      makeForecast('2026-02-24T10:00:00.000Z', 230, 13),
      makeForecast('2026-02-24T12:00:00.000Z', 260, 14),
    ]

    const nowMs = new Date('2026-02-24T10:20:00.000Z').getTime()
    const closest = getClosestForecast(forecasts, nowMs)

    expect(closest?.date).toBe('2026-02-24T10:00:00.000Z')
  })

  it('builds fallback directions when data is missing', () => {
    expect(buildSelectedDirections(null)).toEqual({
      waveDirection: '--',
      windDirection: '--',
    })
  })

  it('builds forecast current text with period when swell exists', () => {
    const forecast = makeForecast('2026-02-24T10:00:00.000Z', 210, 15)
    expect(buildForecastCurrentText(forecast, 'es-ES')).toContain('15,0 s')
  })
})
