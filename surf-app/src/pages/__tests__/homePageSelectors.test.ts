import { describe, expect, it } from 'vitest'
import type { Spot, Station } from '../../types'
import {
  buildBuoySelectState,
  buildSpotItems,
  resolveSpotId,
} from '../homePageSelectors'

const makeSpot = (spot: Partial<Spot>): Spot => ({
  spotId: spot.spotId ?? 'spot-id',
  spotName: spot.spotName ?? 'Spot',
  active: spot.active ?? true,
  location: spot.location ?? null,
  optimalConditions: spot.optimalConditions,
})

describe('homePageSelectors', () => {
  describe('resolveSpotId', () => {
    it('returns canonical spot id when default id matches with different casing', () => {
      const spots: Spot[] = [
        makeSpot({
          spotId: '99d02a5c-ebed-4591-8514-52a14a9fa13f',
          spotName: 'Sopelana',
        }),
      ]

      expect(resolveSpotId('99D02A5C-EBED-4591-8514-52A14A9FA13F', spots)).toBe(
        '99d02a5c-ebed-4591-8514-52a14a9fa13f',
      )
    })

    it('resolves by spot name when default value is legacy name', () => {
      const spots: Spot[] = [
        makeSpot({ spotId: 'uuid-1', spotName: 'Sopelana' }),
        makeSpot({ spotId: 'uuid-2', spotName: 'Mundaka' }),
      ]

      expect(resolveSpotId('sopelana', spots)).toBe('uuid-1')
    })

    it('falls back to first spot when default is unknown', () => {
      const spots: Spot[] = [
        makeSpot({ spotId: 'uuid-1', spotName: 'Sopelana' }),
        makeSpot({ spotId: 'uuid-2', spotName: 'Mundaka' }),
      ]

      expect(resolveSpotId('unknown', spots)).toBe('uuid-1')
    })
  })

  describe('buildSpotItems', () => {
    it('creates sorted options and dedupes by normalized spot id', () => {
      const spots: Spot[] = [
        makeSpot({ spotId: 'ABC', spotName: 'Zarautz' }),
        makeSpot({ spotId: 'abc', spotName: 'Duplicado' }),
        makeSpot({ spotId: 'DEF', spotName: 'Sopelana' }),
      ]

      expect(buildSpotItems(spots, 'fallback')).toEqual([
        { value: 'DEF', label: 'Sopelana' },
        { value: 'ABC', label: 'Zarautz' },
      ])
    })
  })

  describe('buildBuoySelectState', () => {
    it('shows loading placeholder while nearby buoys are loading', () => {
      const stations: Station[] = []

      expect(buildBuoySelectState('loading', stations, '2136')).toEqual({
        options: [{ value: '2136', label: 'Buscando boyas…' }],
        value: '2136',
        disabled: true,
        hasActiveBuoy: false,
      })
    })

    it('returns first option when default station is missing', () => {
      const stations: Station[] = [
        { buoyId: '1111', name: 'Santander' },
        { buoyId: '2222', name: 'Bilbao-Vizcaya' },
      ]

      expect(buildBuoySelectState('success', stations, '9999')).toEqual({
        options: [
          { value: '1111', label: 'Santander' },
          { value: '2222', label: 'Bilbao-Vizcaya' },
        ],
        value: '1111',
        disabled: false,
        hasActiveBuoy: false,
      })
    })
  })
})
