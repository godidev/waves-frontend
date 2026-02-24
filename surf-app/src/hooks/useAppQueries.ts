import { useQuery } from '@tanstack/react-query'
import {
  getBuoyData,
  getBuoyInfo,
  getBuoysList,
  getBuoysNear,
  getSpots,
  getStations,
  getSurfForecast,
} from '../services/api'

export const queryKeys = {
  spots: ['spots'] as const,
  stations: ['stations'] as const,
  buoysList: ['buoys-list'] as const,
  buoyInfo: (buoyId: string) => ['buoy-info', buoyId] as const,
  buoyData: (buoyId: string, limit: number) =>
    ['buoy-data', buoyId, limit] as const,
  surfForecast: (
    spotId: string,
    variant: 'hourly' | 'general',
    page: number,
    limit: number,
  ) => ['surf-forecast', spotId, variant, page, limit] as const,
  buoysNear: (longitude: number, latitude: number, maxDistanceKm: number) =>
    ['buoys-near', longitude, latitude, maxDistanceKm] as const,
}

export const useSpotsQuery = () =>
  useQuery({
    queryKey: queryKeys.spots,
    queryFn: getSpots,
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  })

export const useStationsQuery = () =>
  useQuery({
    queryKey: queryKeys.stations,
    queryFn: getStations,
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  })

export const useBuoysListQuery = () =>
  useQuery({
    queryKey: queryKeys.buoysList,
    queryFn: getBuoysList,
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  })

export const useBuoyInfoQuery = (buoyId: string) =>
  useQuery({
    queryKey: queryKeys.buoyInfo(buoyId),
    queryFn: () => getBuoyInfo(buoyId),
    enabled: buoyId.trim().length > 0,
    staleTime: 2 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  })

export const useBuoyDataQuery = (buoyId: string, limit: number) =>
  useQuery({
    queryKey: queryKeys.buoyData(buoyId, limit),
    queryFn: () => getBuoyData(buoyId, limit),
    enabled: buoyId.trim().length > 0,
    staleTime: 15 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  })

export const useSurfForecastQuery = (
  spotId: string,
  variant: 'hourly' | 'general',
  page = 1,
  limit = 50,
) =>
  useQuery({
    queryKey: queryKeys.surfForecast(spotId, variant, page, limit),
    queryFn: () => getSurfForecast(spotId, variant, page, limit),
    enabled: spotId.trim().length > 0,
    staleTime: 20 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  })

export const useBuoysNearQuery = (
  longitude: number | null,
  latitude: number | null,
  maxDistanceKm: number,
) =>
  useQuery({
    queryKey:
      longitude === null || latitude === null
        ? ['buoys-near', 'empty']
        : queryKeys.buoysNear(longitude, latitude, maxDistanceKm),
    queryFn: () => {
      if (longitude === null || latitude === null) return []
      return getBuoysNear(longitude, latitude, maxDistanceKm)
    },
    enabled: longitude !== null && latitude !== null,
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  })
