import type { Spot } from '../../types'

type ConditionRange = { from: number; to: number }

type ConditionRanges = {
  epic: ConditionRange[]
  limit: ConditionRange[]
  poor: ConditionRange[]
}

const normalizeAngle = (value: number): number => ((value % 360) + 360) % 360

const normalizeRangeBound = (value: number): number => {
  if (!Number.isFinite(value)) return 0
  if (value === 360) return 360
  return normalizeAngle(value)
}

export const isAngleInRange = (
  angle: number,
  range: ConditionRange,
): boolean => {
  const normalizedAngle = normalizeAngle(angle)
  const from = normalizeRangeBound(range.from)
  const to = normalizeRangeBound(range.to)

  const effectiveFrom = from === 360 ? 0 : from
  const effectiveTo = to === 360 ? 359.999999 : to

  if (effectiveFrom <= effectiveTo) {
    return normalizedAngle >= effectiveFrom && normalizedAngle <= effectiveTo
  }

  return normalizedAngle >= effectiveFrom || normalizedAngle <= effectiveTo
}

const isValueInRange = (value: number, range: ConditionRange): boolean => {
  if (!Number.isFinite(value)) return false
  if (!Number.isFinite(range.from) || !Number.isFinite(range.to)) return false
  const min = Math.min(range.from, range.to)
  const max = Math.max(range.from, range.to)
  return value >= min && value <= max
}

export const getSpotWindQuality = (
  angle: number,
  spot?: Spot | null,
): 'epic' | 'limit' | 'poor' | null => {
  const ranges = spot?.optimalConditions?.windDirection
  if (!ranges) return null

  if (ranges.epic.some((range) => isAngleInRange(angle, range))) return 'epic'
  if (ranges.limit.some((range) => isAngleInRange(angle, range))) return 'limit'
  if (ranges.poor.some((range) => isAngleInRange(angle, range))) return 'poor'

  return 'poor'
}

export const getSpotSwellPeriodQuality = (
  period: number,
  spot?: Spot | null,
): 'epic' | 'limit' | 'poor' | null => {
  const ranges = spot?.optimalConditions?.swellPeriod
  if (!ranges) return null

  if (ranges.epic.some((range) => isValueInRange(period, range))) return 'epic'
  if (ranges.limit.some((range) => isValueInRange(period, range)))
    return 'limit'
  if (ranges.poor.some((range) => isValueInRange(period, range))) return 'poor'

  return 'poor'
}

export const hasConditionRanges = (
  ranges?: ConditionRanges | null,
): boolean => {
  if (!ranges) return false
  return (
    ranges.epic.length > 0 || ranges.limit.length > 0 || ranges.poor.length > 0
  )
}
