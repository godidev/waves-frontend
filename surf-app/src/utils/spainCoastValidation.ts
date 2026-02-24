import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { point } from '@turf/helpers'
import pointToLineDistance from '@turf/point-to-line-distance'
import type {
  Feature,
  LineString,
  MultiLineString,
  MultiPolygon,
  Polygon,
} from 'geojson'
import spainCoastlineGeoJson from '../data/spainCoastline.geo.json'
import spainLandGeoJson from '../data/spainLand.geo.json'

interface ValidationResult {
  valid: boolean
  reason?: 'outside_spain' | 'inland'
  distanceToCoastMeters?: number
}

const MAX_SEA_DISTANCE_TO_SPAIN_COAST_METERS = 160000

const spainLandFeature = spainLandGeoJson as Feature<
  Polygon | MultiPolygon,
  Record<string, unknown>
>

const spainCoastlineFeature = spainCoastlineGeoJson as Feature<
  MultiLineString,
  Record<string, unknown>
>

const spainCoastlineSegments: Feature<LineString, Record<string, unknown>>[] =
  spainCoastlineFeature.geometry.coordinates.map((coordinates) => ({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates,
    },
  }))

const getDistanceToCoastMeters = (lng: number, lat: number): number => {
  const location = point([lng, lat])
  let minDistanceKm = Number.POSITIVE_INFINITY

  spainCoastlineSegments.forEach((segment) => {
    const distanceKm = pointToLineDistance(location, segment, {
      units: 'kilometers',
      method: 'geodesic',
    })

    if (distanceKm < minDistanceKm) {
      minDistanceKm = distanceKm
    }
  })

  return minDistanceKm * 1000
}

export const validateSpainSeaOrBeachLocation = (
  lat: number,
  lng: number,
  beachBandMeters = 1300,
): ValidationResult => {
  const location = point([lng, lat])
  const distanceToCoastMeters = getDistanceToCoastMeters(lng, lat)
  const isInsideSpainLand = booleanPointInPolygon(location, spainLandFeature)

  if (isInsideSpainLand) {
    if (distanceToCoastMeters <= beachBandMeters) {
      return {
        valid: true,
        distanceToCoastMeters,
      }
    }

    return {
      valid: false,
      reason: 'inland',
      distanceToCoastMeters,
    }
  }

  if (distanceToCoastMeters <= MAX_SEA_DISTANCE_TO_SPAIN_COAST_METERS) {
    return {
      valid: true,
      distanceToCoastMeters,
    }
  }

  return {
    valid: false,
    reason: 'outside_spain',
    distanceToCoastMeters,
  }
}
