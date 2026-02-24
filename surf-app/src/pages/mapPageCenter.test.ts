import { describe, expect, it } from 'vitest'
import type { BuoyInfoDoc, Spot } from '../types'
import { getMapCenter, getSopelanaSpotCenter } from './mapPageCenter'

const makeSpot = (spot: Partial<Spot>): Spot => ({
  spotId: spot.spotId ?? 'spot-id',
  spotName: spot.spotName ?? 'spot',
  active: spot.active ?? true,
  location: spot.location ?? null,
  optimalConditions: spot.optimalConditions,
})

const makeBuoy = (
  buoy: Partial<BuoyInfoDoc> & { buoyId: string; buoyName: string },
): BuoyInfoDoc => ({
  buoyId: buoy.buoyId,
  buoyName: buoy.buoyName,
  location:
    buoy.location ?? ({ type: 'Point', coordinates: [-3.1, 43.4] } as const),
})

describe('mapPageCenter', () => {
  it('prioritizes sopelana coordinates when present', () => {
    const spots: Spot[] = [
      makeSpot({
        spotId: '1',
        spotName: 'Mundaka',
        location: { type: 'Point', coordinates: [-2.7, 43.4] },
      }),
      makeSpot({
        spotId: '2',
        spotName: 'Sopelana',
        location: { type: 'Point', coordinates: [-2.995, 43.3884] },
      }),
    ]

    expect(getSopelanaSpotCenter(spots)).toEqual([43.3884, -2.995])
  })

  it('uses active spots then buoys when sopelana is missing', () => {
    const activeSpots: Spot[] = [
      makeSpot({
        spotId: '3',
        spotName: 'Bakio',
        active: true,
        location: { type: 'Point', coordinates: [-2.81, 43.43] },
      }),
    ]

    const buoys: BuoyInfoDoc[] = [
      makeBuoy({
        buoyId: '2136',
        buoyName: 'Bilbao',
        location: { type: 'Point', coordinates: [-3.2, 43.5] },
      }),
    ]

    expect(
      getMapCenter({
        sopelanaSpotCenter: null,
        activeSpotsWithCoordinates: activeSpots,
        buoysWithCoordinates: buoys,
      }),
    ).toEqual([43.43, -2.81])
  })

  it('falls back to sopelana default center when there is no data', () => {
    expect(
      getMapCenter({
        sopelanaSpotCenter: null,
        activeSpotsWithCoordinates: [],
        buoysWithCoordinates: [],
      }),
    ).toEqual([43.3873, -3.0128])
  })
})
