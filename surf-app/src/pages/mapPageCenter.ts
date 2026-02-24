import type { BuoyInfoDoc, Spot } from '../types'

const SOPELANA_DEFAULT_CENTER: [number, number] = [43.3873, -3.0128]

export const getSopelanaSpotCenter = (
  spots: Spot[],
): [number, number] | null => {
  const sopelanaSpot = spots.find((spot) => {
    if (!spot.location?.coordinates || spot.location.coordinates.length !== 2) {
      return false
    }

    return spot.spotName.toLocaleLowerCase('es-ES').includes('sopelana')
  })

  if (!sopelanaSpot?.location?.coordinates) return null

  return [
    sopelanaSpot.location.coordinates[1],
    sopelanaSpot.location.coordinates[0],
  ]
}

interface MapCenterInput {
  sopelanaSpotCenter: [number, number] | null
  activeSpotsWithCoordinates: Spot[]
  buoysWithCoordinates: BuoyInfoDoc[]
}

export const getMapCenter = ({
  sopelanaSpotCenter,
  activeSpotsWithCoordinates,
  buoysWithCoordinates,
}: MapCenterInput): [number, number] => {
  if (sopelanaSpotCenter) {
    return sopelanaSpotCenter
  }

  if (activeSpotsWithCoordinates.length > 0) {
    return [
      activeSpotsWithCoordinates[0].location!.coordinates[1],
      activeSpotsWithCoordinates[0].location!.coordinates[0],
    ]
  }

  if (buoysWithCoordinates.length > 0) {
    return [
      buoysWithCoordinates[0].location!.coordinates[1],
      buoysWithCoordinates[0].location!.coordinates[0],
    ]
  }

  return SOPELANA_DEFAULT_CENTER
}
