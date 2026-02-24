import { describe, expect, it } from 'vitest'
import { deriveMapLoadingState } from './mapPageQueryState'

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
})
