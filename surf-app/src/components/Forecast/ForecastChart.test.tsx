import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Spot, SurfForecast } from '../../types'
import { ForecastChart } from './ForecastChart'

const makeForecast = (
  date: string,
  windAngle: number,
  period: number,
): SurfForecast => ({
  date,
  spot: 'sopelana',
  validSwells: [
    {
      height: 1.2,
      period,
      angle: 240,
    },
  ],
  wind: {
    speed: 12,
    angle: windAngle,
  },
  energy: 420,
})

const baseForecasts: SurfForecast[] = [
  makeForecast('2026-02-24T08:00:00.000Z', 200, 12),
  makeForecast('2026-02-24T11:00:00.000Z', 280, 8),
]

describe('ForecastChart optimal condition bars', () => {
  it('shows only wind arrows section when spot has no optimal conditions', () => {
    render(
      <ForecastChart
        forecasts={baseForecasts}
        locale='es-ES'
        range='48h'
        nowMs={Date.now()}
        viewMode='chart'
        spot={null}
      />,
    )

    expect(screen.getAllByText('Viento').length).toBeGreaterThan(0)
    expect(screen.queryByText('Periodo')).not.toBeInTheDocument()
  })

  it('shows period bar when spot includes swell period ranges', () => {
    const spot: Spot = {
      spotId: '99d02a5c-ebed-4591-8514-52a14a9fa13f',
      spotName: 'sopelana',
      active: true,
      location: {
        type: 'Point',
        coordinates: [-2.995, 43.3884],
      },
      optimalConditions: {
        swellPeriod: {
          epic: [{ from: 14, to: 99 }],
          limit: [{ from: 10, to: 13 }],
          poor: [{ from: 0, to: 9 }],
        },
        windDirection: {
          epic: [{ from: 180, to: 270 }],
          limit: [
            { from: 160, to: 179 },
            { from: 271, to: 279 },
          ],
          poor: [
            { from: 0, to: 159 },
            { from: 280, to: 359 },
          ],
        },
      },
    }

    render(
      <ForecastChart
        forecasts={baseForecasts}
        locale='es-ES'
        range='48h'
        nowMs={Date.now()}
        viewMode='chart'
        spot={spot}
      />,
    )

    expect(screen.getAllByText('Viento').length).toBeGreaterThan(0)
    expect(screen.getByText('Periodo')).toBeInTheDocument()
  })
})
