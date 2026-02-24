import { describe, expect, it } from 'vitest'
import { deriveMapLoadingState, deriveMapStatus } from './mapPageQueryState'

describe('mapPageQueryState', () => {
  it('is loading while queries are fetching without enough data', () => {
    expect(
      deriveMapLoadingState({
        isBuoysLoading: true,
        isSpotsLoading: false,
        buoysCount: 0,
        spotsCount: 3,
      }),
    ).toBe(true)

    expect(
      deriveMapLoadingState({
        isBuoysLoading: false,
        isSpotsLoading: true,
        buoysCount: 2,
        spotsCount: 0,
      }),
    ).toBe(true)
  })

  it('is not loading when both datasets are already available', () => {
    expect(
      deriveMapLoadingState({
        isBuoysLoading: true,
        isSpotsLoading: true,
        buoysCount: 4,
        spotsCount: 6,
      }),
    ).toBe(false)
  })

  it('returns error status when both queries fail and no map data exists', () => {
    expect(
      deriveMapStatus({
        isBuoysLoading: false,
        isSpotsLoading: false,
        hasBuoysError: true,
        hasSpotsError: true,
        buoysCount: 0,
        spotsCount: 0,
      }),
    ).toBe('error')
  })

  it('returns ready status when there is at least one dataset', () => {
    expect(
      deriveMapStatus({
        isBuoysLoading: false,
        isSpotsLoading: false,
        hasBuoysError: true,
        hasSpotsError: true,
        buoysCount: 3,
        spotsCount: 0,
      }),
    ).toBe('ready')
  })
})
