import { describe, expect, it } from 'vitest'
import type { Spot } from '../../types'
import {
  getActiveSpotsWithCoordinates,
  getDraftSpotSuggestions,
  getInactiveSpotsSorted,
  getInactiveSpotsWithCoordinates,
} from '../mapPageSelectors'

const makeSpot = (spot: Partial<Spot>): Spot => ({
  spotId: spot.spotId ?? 'spot-id',
  spotName: spot.spotName ?? 'spot',
  active: spot.active ?? false,
  location: spot.location ?? null,
  optimalConditions: spot.optimalConditions,
})

describe('mapPageSelectors', () => {
  it('filters active spots that contain valid coordinates', () => {
    const spots: Spot[] = [
      makeSpot({
        spotId: '1',
        spotName: 'A',
        active: true,
        location: { type: 'Point', coordinates: [-3, 43] },
      }),
      makeSpot({
        spotId: '2',
        spotName: 'B',
        active: true,
        location: null,
      }),
      makeSpot({
        spotId: '3',
        spotName: 'C',
        active: false,
        location: { type: 'Point', coordinates: [-2, 44] },
      }),
    ]

    expect(
      getActiveSpotsWithCoordinates(spots).map((spot) => spot.spotId),
    ).toEqual(['1'])
  })

  it('sorts inactive spots by name', () => {
    const spots: Spot[] = [
      makeSpot({ spotId: '1', spotName: 'Mundaka', active: false }),
      makeSpot({ spotId: '2', spotName: 'Sopelana', active: true }),
      makeSpot({ spotId: '3', spotName: 'Bakio', active: false }),
    ]

    expect(getInactiveSpotsSorted(spots).map((spot) => spot.spotName)).toEqual([
      'Bakio',
      'Mundaka',
    ])
  })

  it('keeps only inactive spots with non-zero coordinates', () => {
    const spots: Spot[] = [
      makeSpot({
        spotId: '1',
        spotName: 'A',
        active: false,
        location: { type: 'Point', coordinates: [0, 0] },
      }),
      makeSpot({
        spotId: '2',
        spotName: 'B',
        active: false,
        location: { type: 'Point', coordinates: [-2.9, 43.3] },
      }),
      makeSpot({
        spotId: '3',
        spotName: 'C',
        active: true,
        location: { type: 'Point', coordinates: [-2.8, 43.2] },
      }),
    ]

    expect(
      getInactiveSpotsWithCoordinates(spots).map((spot) => spot.spotId),
    ).toEqual(['2'])
  })

  it('returns fuzzy suggestions for inactive spots query', () => {
    const inactiveSpots: Spot[] = [
      makeSpot({ spotId: '1', spotName: 'Somo', active: false }),
      makeSpot({ spotId: '2', spotName: 'Sopelana', active: false }),
      makeSpot({ spotId: '3', spotName: 'Mundaka', active: false }),
    ]

    const suggestions = getDraftSpotSuggestions(inactiveSpots, 'somo').map(
      (spot) => spot.spotId,
    )

    expect(suggestions).toContain('1')
    expect(suggestions).not.toContain('3')
  })
})
