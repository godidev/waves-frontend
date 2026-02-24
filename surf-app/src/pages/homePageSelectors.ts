import type { Spot, Station } from '../types'

const normalizeSpotId = (spotId: string): string =>
  spotId.trim().toLocaleLowerCase('es-ES')

export const resolveSpotId = (activeSpotId: string, spots: Spot[]): string => {
  if (!spots.length) return activeSpotId

  const byId = spots.find(
    (spot) => normalizeSpotId(spot.spotId) === normalizeSpotId(activeSpotId),
  )
  if (byId) return byId.spotId

  const byName = spots.find(
    (spot) => normalizeSpotId(spot.spotName) === normalizeSpotId(activeSpotId),
  )
  if (byName) return byName.spotId

  return spots[0].spotId
}

export const buildSpotItems = (spots: Spot[], defaultSpotId: string) => {
  const map = new Map<string, { value: string; label: string }>()

  spots.forEach((spot) => {
    const normalizedId = normalizeSpotId(spot.spotId)
    if (map.has(normalizedId)) return

    map.set(normalizedId, {
      value: spot.spotId,
      label: spot.spotName,
    })
  })

  if (!spots.length) {
    map.set(normalizeSpotId(defaultSpotId), {
      value: defaultSpotId,
      label: defaultSpotId,
    })
  }

  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label, 'es-ES'),
  )
}

export const buildBuoySelectState = (
  status: 'idle' | 'loading' | 'success' | 'error',
  stations: Station[],
  activeStationId: string,
) => {
  const optionsFromStations = stations.map((station) => ({
    value: station.buoyId,
    label: station.name,
  }))

  const hasActiveBuoy = optionsFromStations.some(
    (item) => item.value === activeStationId,
  )

  if (status === 'loading') {
    return {
      options: [
        { value: activeStationId || 'loading', label: 'Buscando boyas…' },
      ],
      value: activeStationId || 'loading',
      disabled: true,
      hasActiveBuoy,
    }
  }

  if (optionsFromStations.length > 0) {
    return {
      options: optionsFromStations,
      value: hasActiveBuoy ? activeStationId : optionsFromStations[0].value,
      disabled: false,
      hasActiveBuoy,
    }
  }

  return {
    options: [{ value: 'none', label: 'Sin boyas cercanas' }],
    value: 'none',
    disabled: true,
    hasActiveBuoy,
  }
}
