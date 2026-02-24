import type { BuoyInfoDoc } from '../types'

export const getBuoysWithCoordinates = (buoys: BuoyInfoDoc[]): BuoyInfoDoc[] =>
  buoys.filter(
    (buoy) =>
      buoy.location?.coordinates && buoy.location.coordinates.length === 2,
  )

export const getMapStats = ({
  buoysCount,
  activeSpotsCount,
  inactiveSpotsCount,
}: {
  buoysCount: number
  activeSpotsCount: number
  inactiveSpotsCount: number
}): string[] => [
  `Boyas: ${buoysCount}`,
  `Spots activos: ${activeSpotsCount}`,
  `Spots inactivos: ${inactiveSpotsCount}`,
]
