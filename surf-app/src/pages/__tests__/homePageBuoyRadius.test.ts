import { describe, expect, it } from 'vitest'
import { clampBuoySearchRadiusKm } from '../homePageBuoyRadius'

describe('clampBuoySearchRadiusKm', () => {
  it('returns rounded values inside the valid range', () => {
    expect(clampBuoySearchRadiusKm(245.2)).toBe(245)
    expect(clampBuoySearchRadiusKm(245.8)).toBe(246)
  })

  it('clamps values to min and max bounds', () => {
    expect(clampBuoySearchRadiusKm(0)).toBe(10)
    expect(clampBuoySearchRadiusKm(1500)).toBe(1000)
  })
})
