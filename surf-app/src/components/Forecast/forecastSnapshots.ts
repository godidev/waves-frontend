type Trend = 'up' | 'down' | 'flat' | null

export interface ForecastChartPoint {
  time: number
  waveHeight: number
  energy: number
  wavePeriod: number
  windSpeed: number
  windDirection: number
}

export interface ForecastSnapshotItem {
  label: string
  time: number | null
  hour: string
  waveHeight: string
  waveHeightTrend: Trend
  wavePeriod: string
  energy: string
  energyTrend: Trend
  windSpeed: string
  windDirection: number | null
}

const formatNumber = (value: number, locale: string, digits = 0): string =>
  value.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

const getTrend = (
  current: number,
  baseline: number,
  tolerance: number,
): Trend => {
  const delta = current - baseline
  if (Math.abs(delta) <= tolerance) return 'flat'
  return delta > 0 ? 'up' : 'down'
}

const buildSnapshotTargets = (
  chartData: ForecastChartPoint[],
  range: '48h' | '7d',
  locale: string,
  nowMs: number,
) => {
  if (range === '7d') {
    const dayTargets = new Map<
      string,
      {
        label: string
        timestamp: number
      }
    >()

    chartData.forEach((point) => {
      const date = new Date(point.time)
      const dayKey = date.toDateString()
      if (dayTargets.has(dayKey)) return

      dayTargets.set(dayKey, {
        label: date.toLocaleDateString(locale, {
          weekday: 'short',
          day: 'numeric',
        }),
        timestamp: point.time,
      })
    })

    return Array.from(dayTargets.values())
  }

  return [
    { label: 'Ahora', timestamp: nowMs },
    { label: '+6h', timestamp: nowMs + 6 * 60 * 60 * 1000 },
    { label: '+24h', timestamp: nowMs + 24 * 60 * 60 * 1000 },
    { label: '+36h', timestamp: nowMs + 36 * 60 * 60 * 1000 },
  ]
}

export const buildSnapshotItems = (
  chartData: ForecastChartPoint[],
  range: '48h' | '7d',
  locale: string,
  nowMs: number,
): ForecastSnapshotItem[] => {
  if (!chartData.length) return []

  const baselinePoint = chartData.reduce(
    (best, point) => {
      if (!best) return point
      return Math.abs(point.time - nowMs) < Math.abs(best.time - nowMs)
        ? point
        : best
    },
    null as ForecastChartPoint | null,
  )

  const targets = buildSnapshotTargets(chartData, range, locale, nowMs)

  return targets.map((target) => {
    const closest = chartData.reduce(
      (best, point) => {
        if (!best) return point
        return Math.abs(point.time - target.timestamp) <
          Math.abs(best.time - target.timestamp)
          ? point
          : best
      },
      null as ForecastChartPoint | null,
    )

    if (!closest) {
      return {
        label: target.label,
        time: null,
        hour: '--',
        waveHeight: '--',
        waveHeightTrend: null,
        wavePeriod: '--',
        energy: '--',
        energyTrend: null,
        windSpeed: '--',
        windDirection: null,
      }
    }

    const showTrend =
      baselinePoint !== null && Math.abs(closest.time - baselinePoint.time) > 1

    return {
      label: target.label,
      time: closest.time,
      hour: new Date(closest.time).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }),
      waveHeight: formatNumber(closest.waveHeight, locale, 1),
      waveHeightTrend: showTrend
        ? getTrend(closest.waveHeight, baselinePoint.waveHeight, 0.05)
        : null,
      energy: formatNumber(Math.round(closest.energy), locale),
      energyTrend: showTrend
        ? getTrend(closest.energy, baselinePoint.energy, 25)
        : null,
      wavePeriod: formatNumber(closest.wavePeriod, locale, 1),
      windSpeed: formatNumber(closest.windSpeed, locale),
      windDirection: closest.windDirection,
    }
  })
}

export const resolveActiveSnapshotLabel = (
  snapshotItems: ForecastSnapshotItem[],
  selectedSnapshotLabel: string,
) => {
  const activeSnapshotLabel = snapshotItems.some(
    (item) => item.label === selectedSnapshotLabel,
  )
    ? selectedSnapshotLabel
    : (snapshotItems.find((item) => item.label === 'Ahora')?.label ??
      snapshotItems[0]?.label ??
      'Ahora')

  return activeSnapshotLabel
}
