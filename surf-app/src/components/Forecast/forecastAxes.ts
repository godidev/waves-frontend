import type { ForecastChartPoint } from './forecastSnapshots'

export interface ForecastAxesState {
  leftAxisStep: number
  firstWaveTick: number
  leftAxisMin: number
  leftAxisMax: number
  leftAxisTicks: number[]
  rightTickCount: number
  rightEnergyScale: {
    first: number
    last: number
    ticks: number[]
  }
  leftFirstTick: number
  leftLastTick: number
  leftTickSpan: number
  rightTickSpan: number
}

const getNiceEnergyStep = (rawStep: number): number => {
  if (!Number.isFinite(rawStep) || rawStep <= 0) return 50

  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const normalized = rawStep / magnitude

  if (normalized <= 1) return 1 * magnitude
  if (normalized <= 2) return 2 * magnitude
  if (normalized <= 2.5) return 2.5 * magnitude
  if (normalized <= 5) return 5 * magnitude
  return 10 * magnitude
}

export const buildForecastAxes = (
  chartData: ForecastChartPoint[],
): ForecastAxesState => {
  const maxWaveHeight = chartData.reduce(
    (max, item) => Math.max(max, item.waveHeight),
    0,
  )
  const minWaveHeight = chartData.reduce(
    (min, item) => Math.min(min, item.waveHeight),
    Infinity,
  )

  const maxEnergy = chartData.reduce(
    (max, item) => Math.max(max, item.energy),
    0,
  )
  const minEnergy = chartData.reduce(
    (min, item) => Math.min(min, item.energy),
    Infinity,
  )

  const leftAxisStep = maxWaveHeight > 7 ? 2 : maxWaveHeight < 4 ? 0.5 : 1

  const firstWaveTick =
    !Number.isFinite(minWaveHeight) || minWaveHeight <= 0
      ? leftAxisStep
      : Math.max(
          leftAxisStep,
          Math.floor(minWaveHeight / leftAxisStep) * leftAxisStep,
        )

  const leftAxisMin = Math.max(
    0,
    Number((firstWaveTick - leftAxisStep * 0.5).toFixed(2)),
  )

  const target = Math.max(
    maxWaveHeight * 1.1,
    maxWaveHeight + leftAxisStep * 0.5,
  )
  const rounded = Math.ceil(target / leftAxisStep) * leftAxisStep
  const leftAxisMax = Number(Math.max(leftAxisStep, rounded).toFixed(2))

  const leftAxisTicks: number[] = []
  for (let value = firstWaveTick; value <= leftAxisMax; value += leftAxisStep) {
    leftAxisTicks.push(Number(value.toFixed(2)))
  }

  const rightTickCount = Math.max(2, leftAxisTicks.length)

  const anchorStep = getNiceEnergyStep((maxEnergy - minEnergy) / 8)
  const first = Number(
    (Math.floor(minEnergy / anchorStep) * anchorStep).toFixed(2),
  )
  const last = Number(
    (Math.ceil(maxEnergy / anchorStep) * anchorStep).toFixed(2),
  )
  const safeLast = last <= first ? first + anchorStep : last

  const ticks = Array.from({ length: rightTickCount }, (_, index) => {
    const ratio = rightTickCount === 1 ? 0 : index / (rightTickCount - 1)
    return Number((first + (safeLast - first) * ratio).toFixed(2))
  })

  const leftFirstTick = leftAxisTicks[0] ?? firstWaveTick
  const leftLastTick = leftAxisTicks[leftAxisTicks.length - 1] ?? leftAxisMax
  const leftTickSpan = Math.max(0.0001, leftLastTick - leftFirstTick)
  const rightTickSpan = Math.max(0.0001, safeLast - first)

  return {
    leftAxisStep,
    firstWaveTick,
    leftAxisMin,
    leftAxisMax,
    leftAxisTicks,
    rightTickCount,
    rightEnergyScale: {
      first,
      last: safeLast,
      ticks,
    },
    leftFirstTick,
    leftLastTick,
    leftTickSpan,
    rightTickSpan,
  }
}

export const mapEnergyToLeftAxis = (
  chartData: ForecastChartPoint[],
  axes: ForecastAxesState,
) =>
  chartData.map((point) => ({
    ...point,
    energyMapped:
      axes.leftFirstTick +
      ((point.energy - axes.rightEnergyScale.first) / axes.rightTickSpan) *
        axes.leftTickSpan,
  }))
