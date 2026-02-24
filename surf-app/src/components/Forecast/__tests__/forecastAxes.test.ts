import { describe, expect, it } from 'vitest'
import type { ForecastChartPoint } from '../forecastSnapshots'
import { buildForecastAxes, mapEnergyToLeftAxis } from '../forecastAxes'

const makePoint = (waveHeight: number, energy: number): ForecastChartPoint => ({
  time: Date.now(),
  waveHeight,
  energy,
  wavePeriod: 10,
  windSpeed: 12,
  windDirection: 200,
})

describe('forecastAxes', () => {
  it('builds consistent left axis ticks for wave heights', () => {
    const chartData: ForecastChartPoint[] = [
      makePoint(1.1, 200),
      makePoint(2.2, 450),
      makePoint(3.4, 700),
    ]

    const axes = buildForecastAxes(chartData)

    expect(axes.leftAxisTicks.length).toBeGreaterThan(0)
    expect(axes.leftAxisMax).toBeGreaterThan(axes.leftAxisMin)
    expect(axes.leftAxisTicks[0]).toBeGreaterThanOrEqual(axes.leftAxisMin)
  })

  it('maps energy values into left-axis visual span', () => {
    const chartData: ForecastChartPoint[] = [
      makePoint(1.2, 100),
      makePoint(1.8, 600),
      makePoint(2.4, 1100),
    ]

    const axes = buildForecastAxes(chartData)
    const mapped = mapEnergyToLeftAxis(chartData, axes)

    mapped.forEach((point) => {
      expect(point.energyMapped).toBeGreaterThanOrEqual(
        axes.leftFirstTick - 0.001,
      )
      expect(point.energyMapped).toBeLessThanOrEqual(axes.leftLastTick + 0.001)
    })
  })
})
