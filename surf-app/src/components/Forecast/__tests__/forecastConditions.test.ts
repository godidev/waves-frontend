import { describe, expect, it } from 'vitest'
import type { Spot } from '../../../types'
import {
  getSpotSwellPeriodQuality,
  getSpotWindQuality,
  hasConditionRanges,
  isAngleInRange,
} from '../forecastConditions'

const makeSpot = (spot: Partial<Spot>): Spot => ({
  spotId: spot.spotId ?? 'spot',
  spotName: spot.spotName ?? 'spot',
  active: spot.active ?? true,
  location: spot.location ?? null,
  optimalConditions: spot.optimalConditions,
})

describe('forecastConditions', () => {
  it('matches angle ranges that wrap around 0 degrees', () => {
    expect(isAngleInRange(355, { from: 340, to: 20 })).toBe(true)
    expect(isAngleInRange(10, { from: 340, to: 20 })).toBe(true)
    expect(isAngleInRange(200, { from: 340, to: 20 })).toBe(false)
  })

  it('treats 360 as inclusive upper bound', () => {
    expect(isAngleInRange(359.9, { from: 280, to: 360 })).toBe(true)
  })

  it('prioritizes epic over limit and poor for wind quality', () => {
    const spot = makeSpot({
      optimalConditions: {
        windDirection: {
          epic: [{ from: 180, to: 220 }],
          limit: [{ from: 170, to: 230 }],
          poor: [{ from: 0, to: 360 }],
        },
      },
    })

    expect(getSpotWindQuality(200, spot)).toBe('epic')
  })

  it('returns poor when swell ranges exist but no range matches', () => {
    const spot = makeSpot({
      optimalConditions: {
        swellPeriod: {
          epic: [{ from: 15, to: 20 }],
          limit: [{ from: 11, to: 14 }],
          poor: [{ from: 0, to: 9 }],
        },
      },
    })

    expect(getSpotSwellPeriodQuality(10, spot)).toBe('poor')
  })

  it('detects if any condition ranges are present', () => {
    expect(
      hasConditionRanges({
        epic: [],
        limit: [],
        poor: [{ from: 0, to: 360 }],
      }),
    ).toBe(true)

    expect(
      hasConditionRanges({
        epic: [],
        limit: [],
        poor: [],
      }),
    ).toBe(false)
  })
})
