import { describe, expect, it } from 'vitest'
import {
  deriveForecastStatus,
  deriveNearbyBuoysStatus,
} from './homePageQueryState'

describe('homePageQueryState', () => {
  describe('deriveForecastStatus', () => {
    it('returns loading while forecast is fetching without data', () => {
      expect(
        deriveForecastStatus({
          isFetchingMain: true,
          isFetchingHourly: false,
          mainHasData: false,
          hasError: false,
        }),
      ).toBe('loading')
    })

    it('returns error when request fails and there is no data', () => {
      expect(
        deriveForecastStatus({
          isFetchingMain: false,
          isFetchingHourly: false,
          mainHasData: false,
          hasError: true,
        }),
      ).toBe('error')
    })

    it('returns success when main forecast has data', () => {
      expect(
        deriveForecastStatus({
          isFetchingMain: false,
          isFetchingHourly: true,
          mainHasData: true,
          hasError: false,
        }),
      ).toBe('success')
    })
  })

  describe('deriveNearbyBuoysStatus', () => {
    it('returns error when spot coordinates are missing', () => {
      expect(
        deriveNearbyBuoysStatus({
          hasCoordinates: false,
          isFetching: false,
          hasError: false,
        }),
      ).toBe('error')
    })

    it('returns loading while nearby query is fetching', () => {
      expect(
        deriveNearbyBuoysStatus({
          hasCoordinates: true,
          isFetching: true,
          hasError: false,
        }),
      ).toBe('loading')
    })

    it('returns error when nearby query fails', () => {
      expect(
        deriveNearbyBuoysStatus({
          hasCoordinates: true,
          isFetching: false,
          hasError: true,
        }),
      ).toBe('error')
    })

    it('returns success when query has finished without errors', () => {
      expect(
        deriveNearbyBuoysStatus({
          hasCoordinates: true,
          isFetching: false,
          hasError: false,
        }),
      ).toBe('success')
    })
  })
})
