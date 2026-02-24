import { describe, expect, it } from 'vitest'
import {
  buildSnapshotItems,
  resolveActiveSnapshotLabel,
  type ForecastChartPoint,
} from '../forecastSnapshots'

const makePoint = (
  time: string,
  waveHeight: number,
  energy: number,
): ForecastChartPoint => ({
  time: new Date(time).getTime(),
  waveHeight,
  energy,
  wavePeriod: 12,
  windSpeed: 10,
  windDirection: 220,
})

describe('forecastSnapshots', () => {
  it('returns placeholder rows when there is no chart data', () => {
    expect(buildSnapshotItems([], '48h', 'es-ES', Date.now())).toEqual([])
  })

  it('builds 48h labels in expected order', () => {
    const baseTime = new Date('2026-02-24T08:00:00.000Z').getTime()
    const chartData: ForecastChartPoint[] = [
      makePoint('2026-02-24T08:00:00.000Z', 1.2, 350),
      makePoint('2026-02-24T14:00:00.000Z', 1.4, 420),
      makePoint('2026-02-25T08:00:00.000Z', 1.6, 500),
      makePoint('2026-02-25T20:00:00.000Z', 1.5, 470),
    ]

    const items = buildSnapshotItems(chartData, '48h', 'es-ES', baseTime)

    expect(items.map((item) => item.label)).toEqual([
      'Ahora',
      '+6h',
      '+24h',
      '+36h',
    ])
  })

  it('resolves active snapshot label preferring selected, then Ahora, then first', () => {
    const items = [
      {
        label: 'Ahora',
        time: 1,
        hour: '08:00',
        waveHeight: '1.2',
        waveHeightTrend: null,
        wavePeriod: '12.0',
        energy: '350',
        energyTrend: null,
        windSpeed: '10',
        windDirection: 220,
      },
      {
        label: '+6h',
        time: 2,
        hour: '14:00',
        waveHeight: '1.4',
        waveHeightTrend: null,
        wavePeriod: '12.0',
        energy: '420',
        energyTrend: null,
        windSpeed: '12',
        windDirection: 210,
      },
    ]

    expect(resolveActiveSnapshotLabel(items, '+6h')).toBe('+6h')
    expect(resolveActiveSnapshotLabel(items, 'nope')).toBe('Ahora')
    expect(resolveActiveSnapshotLabel([], 'nope')).toBe('Ahora')
  })
})
