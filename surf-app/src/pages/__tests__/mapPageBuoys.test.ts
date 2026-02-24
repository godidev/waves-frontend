import { describe, expect, it } from 'vitest'
import type { BuoyInfoDoc } from '../../types'
import { getBuoysWithCoordinates, getMapStats } from '../mapPageBuoys'

const makeBuoy = (
  buoy: Partial<BuoyInfoDoc> & { buoyId: string; buoyName: string },
): BuoyInfoDoc => ({
  buoyId: buoy.buoyId,
  buoyName: buoy.buoyName,
  location:
    'location' in buoy
      ? (buoy.location ?? null)
      : ({ type: 'Point', coordinates: [-3.1, 43.4] } as const),
})

describe('mapPageBuoys', () => {
  it('keeps only buoys with valid coordinates', () => {
    const buoys: BuoyInfoDoc[] = [
      makeBuoy({ buoyId: '1', buoyName: 'A' }),
      makeBuoy({ buoyId: '2', buoyName: 'B', location: null }),
      makeBuoy({
        buoyId: '3',
        buoyName: 'C',
        location: { type: 'Point', coordinates: [-2.9, 43.3] },
      }),
    ]

    expect(getBuoysWithCoordinates(buoys).map((buoy) => buoy.buoyId)).toEqual([
      '1',
      '3',
    ])
  })

  it('builds map stats labels with counts', () => {
    const stats = getMapStats({
      buoysCount: 4,
      activeSpotsCount: 2,
      inactiveSpotsCount: 7,
    })

    expect(stats).toEqual([
      'Boyas: 4',
      'Spots activos: 2',
      'Spots inactivos: 7',
    ])
  })
})
