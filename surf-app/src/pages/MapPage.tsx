import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet'
import { DivIcon, Icon } from 'leaflet'
import type { Marker as LeafletMarker } from 'leaflet'
import { useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import './MapPage.css'
import type { BuoyInfoDoc, Spot } from '../types'
import { getBuoysList, getSpots, updateSpotInfo } from '../services/api'
import { validateSpainSeaOrBeachLocation } from '../utils/spainCoastValidation'
import { BottomSheet } from '../components/BottomSheet'
import { PageHeader } from '../components/PageHeader'
import { useSettingsContext } from '../context/SettingsContext'
import {
  getActiveSpotsWithCoordinates,
  getDraftSpotSuggestions,
  getInactiveSpotsSorted,
  getInactiveSpotsWithCoordinates,
} from './mapPageSelectors'

const COAST_BEACH_BAND_METERS = 1300
const COAST_BEACH_BAND_KM = COAST_BEACH_BAND_METERS / 1000
const SOPELANA_DEFAULT_CENTER: [number, number] = [43.3873, -3.0128]

// Custom marker icon for buoys
const buoyIcon = new Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const spotIcon = new DivIcon({
  className: 'spot-marker',
  html: '<span aria-hidden="true">🌊</span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
})

const inactiveSpotIcon = new DivIcon({
  className: 'spot-marker spot-marker--inactive',
  html: '<span aria-hidden="true">🌊</span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
})

interface SpotPlacementHandlerProps {
  onPick: (position: [number, number]) => void
  onInvalidPick: (reason: 'outside_spain' | 'inland') => void
}

const SpotPlacementHandler = ({
  onPick,
  onInvalidPick,
}: SpotPlacementHandlerProps) => {
  const map = useMapEvents({
    click: (event) => {
      const target = event.originalEvent.target as HTMLElement | null
      if (
        target?.closest(
          '.leaflet-popup, .leaflet-marker-pane, .leaflet-control, button, input, select, a',
        )
      ) {
        return
      }

      const validation = validateSpainSeaOrBeachLocation(
        event.latlng.lat,
        event.latlng.lng,
        COAST_BEACH_BAND_METERS,
      )
      if (!validation.valid) {
        onInvalidPick(validation.reason ?? 'inland')
        return
      }

      map.flyTo(event.latlng, map.getZoom(), {
        animate: true,
        duration: 0.35,
      })
      onPick([event.latlng.lat, event.latlng.lng])
    },
  })
  return null
}

const runPopupAction = (
  event: MouseEvent<HTMLButtonElement>,
  action: () => void,
) => {
  event.preventDefault()
  event.stopPropagation()
  action()
}

export const MapPage = () => {
  const navigate = useNavigate()
  const { updateSettings } = useSettingsContext()
  const [buoys, setBuoys] = useState<BuoyInfoDoc[]>([])
  const [spots, setSpots] = useState<Spot[]>([])
  const [selected, setSelected] = useState<BuoyInfoDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [draftSpotId, setDraftSpotId] = useState<string | null>(null)
  const [draftSpotQuery, setDraftSpotQuery] = useState('')
  const [draftSpotPosition, setDraftSpotPosition] = useState<
    [number, number] | null
  >(null)
  const [isSavingSpot, setIsSavingSpot] = useState(false)
  const [createSpotError, setCreateSpotError] = useState<string | null>(null)
  const [pendingSpotAction, setPendingSpotAction] = useState<{
    spotId: string
    nextActive: boolean
  } | null>(null)
  const [updatingSpotId, setUpdatingSpotId] = useState<string | null>(null)
  const draftMarkerRef = useRef<LeafletMarker | null>(null)

  const getLocationErrorMessage = (reason: 'outside_spain' | 'inland') => {
    if (reason === 'outside_spain') {
      return 'Solo puedes colocar spots o boyas en mar/playa de España.'
    }
    return `Solo puedes colocar spots en el mar o hasta ${COAST_BEACH_BAND_KM.toFixed(1)} km desde la costa.`
  }

  const clearDraftSpot = () => {
    setDraftSpotId(null)
    setDraftSpotQuery('')
    setDraftSpotPosition(null)
    setCreateSpotError(null)
    setIsSavingSpot(false)
  }

  const handlePickSpotPosition = (position: [number, number]) => {
    setDraftSpotPosition(position)
    setCreateSpotError(null)
  }

  const handleActivateDraftSpot = async () => {
    if (!draftSpotPosition) {
      setCreateSpotError('Selecciona una ubicación en el mapa')
      return
    }

    if (!draftSpotId) {
      setCreateSpotError('Selecciona un spot de la lista')
      return
    }

    try {
      setIsSavingSpot(true)
      setCreateSpotError(null)
      await updateSpotInfo(draftSpotId, {
        active: true,
        coordinates: [draftSpotPosition[1], draftSpotPosition[0]],
      })
      const updatedSpots = await getSpots()
      setSpots(updatedSpots)
      clearDraftSpot()
    } catch (error) {
      console.error('Failed to update spot:', error)
      setCreateSpotError('No se pudo activar el spot seleccionado.')
    } finally {
      setIsSavingSpot(false)
    }
  }

  const handleUpdateSpotActiveState = async (
    spot: Spot,
    nextActive: boolean,
  ) => {
    const coordinates = spot.location?.coordinates
    if (!coordinates || coordinates.length !== 2) {
      return
    }

    try {
      setUpdatingSpotId(spot.spotId)
      await updateSpotInfo(spot.spotId, {
        active: nextActive,
        coordinates,
      })
      const updatedSpots = await getSpots()
      setSpots(updatedSpots)
      setPendingSpotAction(null)
    } catch (error) {
      console.error('Failed to update spot active state:', error)
    } finally {
      setUpdatingSpotId(null)
    }
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const [buoyData, spotData] = await Promise.all([
          getBuoysList(),
          getSpots(),
        ])
        if (!mounted) return
        setBuoys(buoyData)
        setSpots(spotData)
      } catch (error) {
        console.error('Failed to load map data:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  // Filter buoys that have valid coordinates
  const buoysWithCoordinates = useMemo(
    () =>
      buoys.filter(
        (buoy) =>
          buoy.location?.coordinates && buoy.location.coordinates.length === 2,
      ),
    [buoys],
  )

  const activeSpotsWithCoordinates = useMemo(
    () => getActiveSpotsWithCoordinates(spots),
    [spots],
  )

  const inactiveSpots = useMemo(() => getInactiveSpotsSorted(spots), [spots])

  const inactiveSpotsWithCoordinates = useMemo(
    () => getInactiveSpotsWithCoordinates(spots),
    [spots],
  )

  const draftSpotSuggestions = useMemo(() => {
    return getDraftSpotSuggestions(inactiveSpots, draftSpotQuery)
  }, [draftSpotQuery, inactiveSpots])

  useEffect(() => {
    if (!draftSpotId) return
    if (inactiveSpots.some((spot) => spot.spotId === draftSpotId)) return
    setDraftSpotId(null)
  }, [draftSpotId, inactiveSpots])

  useEffect(() => {
    if (!draftSpotPosition) return
    const timerId = window.setTimeout(() => {
      draftMarkerRef.current?.openPopup()
    }, 0)
    return () => {
      window.clearTimeout(timerId)
    }
  }, [draftSpotPosition, draftSpotSuggestions.length])

  const sopelanaSpotCenter = useMemo(() => {
    const sopelanaSpot = spots.find((spot) => {
      if (
        !spot.location?.coordinates ||
        spot.location.coordinates.length !== 2
      ) {
        return false
      }
      return spot.spotName.toLocaleLowerCase('es-ES').includes('sopelana')
    })

    if (!sopelanaSpot?.location?.coordinates) return null

    return [
      sopelanaSpot.location.coordinates[1],
      sopelanaSpot.location.coordinates[0],
    ] as [number, number]
  }, [spots])

  // Default center prefers Sopelana.
  const mapCenter: [number, number] = useMemo(
    () =>
      sopelanaSpotCenter ??
      (activeSpotsWithCoordinates.length > 0
        ? [
            activeSpotsWithCoordinates[0].location!.coordinates[1],
            activeSpotsWithCoordinates[0].location!.coordinates[0],
          ]
        : buoysWithCoordinates.length > 0
          ? [
              buoysWithCoordinates[0].location!.coordinates[1],
              buoysWithCoordinates[0].location!.coordinates[0],
            ]
          : SOPELANA_DEFAULT_CENTER),
    [activeSpotsWithCoordinates, buoysWithCoordinates, sopelanaSpotCenter],
  )

  return (
    <div className='relative h-[calc(100vh-80px)]'>
      <div className='absolute left-4 top-4 z-10'>
        <PageHeader title='Mapa' />
      </div>
      {!draftSpotPosition && (
        <div className='absolute bottom-4 left-4 z-10 rounded-xl bg-ocean-800/80 px-3 py-2 text-[11px] text-ocean-200 backdrop-blur'>
          {loading ? (
            <p>Cargando mapa…</p>
          ) : (
            <div className='space-y-0.5'>
              <p>Boyas: {buoysWithCoordinates.length}</p>
              <p>Spots activos: {activeSpotsWithCoordinates.length}</p>
              <p>Spots inactivos: {inactiveSpotsWithCoordinates.length}</p>
            </div>
          )}
        </div>
      )}
      <MapContainer center={mapCenter} zoom={9} className='h-full w-full'>
        <SpotPlacementHandler
          onPick={handlePickSpotPosition}
          onInvalidPick={(reason) => {
            setCreateSpotError(getLocationErrorMessage(reason))
          }}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        {buoysWithCoordinates.map((buoy) => {
          const [lng, lat] = buoy.location!.coordinates
          return (
            <Marker
              key={buoy.buoyId}
              position={[lat, lng]}
              icon={buoyIcon}
              eventHandlers={{
                click: () => setSelected(buoy),
              }}
            >
              <Popup>
                <div
                  className='text-sm'
                  onClick={(event) => event.stopPropagation()}
                >
                  <h3 className='font-semibold'>{buoy.buoyName}</h3>
                  <p className='text-xs text-gray-600'>ID: {buoy.buoyId}</p>
                  {buoy.body && <p className='mt-1 text-xs'>{buoy.body}</p>}
                </div>
              </Popup>
            </Marker>
          )
        })}
        {activeSpotsWithCoordinates.map((spot) => {
          const [lng, lat] = spot.location!.coordinates
          const isConfirming =
            pendingSpotAction?.spotId === spot.spotId &&
            pendingSpotAction.nextActive === false
          const isUpdating = updatingSpotId === spot.spotId

          return (
            <Marker key={spot.spotId} position={[lat, lng]} icon={spotIcon}>
              <Popup>
                <div
                  className='text-sm'
                  onClick={(event) => event.stopPropagation()}
                >
                  <h3 className='font-semibold'>{spot.spotName}</h3>
                  <p className='text-xs text-gray-600'>
                    Spot ID: {spot.spotId}
                  </p>
                  {!isConfirming ? (
                    <button
                      type='button'
                      onClick={(event) =>
                        runPopupAction(event, () => {
                          setPendingSpotAction({
                            spotId: spot.spotId,
                            nextActive: false,
                          })
                        })
                      }
                      className='mt-2 w-full rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400'
                    >
                      Desactivar
                    </button>
                  ) : (
                    <div className='mt-2 space-y-2'>
                      <p className='text-xs text-slate-600'>
                        Confirmar desactivación de este spot?
                      </p>
                      <div className='flex gap-2'>
                        <button
                          type='button'
                          onClick={(event) =>
                            runPopupAction(event, () => {
                              void handleUpdateSpotActiveState(spot, false)
                            })
                          }
                          disabled={isUpdating}
                          className='flex-1 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                          {isUpdating ? 'Guardando…' : 'Confirmar'}
                        </button>
                        <button
                          type='button'
                          onClick={(event) =>
                            runPopupAction(event, () => {
                              setPendingSpotAction(null)
                            })
                          }
                          disabled={isUpdating}
                          className='flex-1 rounded-md bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
        {inactiveSpotsWithCoordinates.map((spot) => {
          const [lng, lat] = spot.location!.coordinates
          const isConfirming =
            pendingSpotAction?.spotId === spot.spotId &&
            pendingSpotAction.nextActive === true
          const isUpdating = updatingSpotId === spot.spotId

          return (
            <Marker
              key={spot.spotId}
              position={[lat, lng]}
              icon={inactiveSpotIcon}
            >
              <Popup>
                <div className='text-sm'>
                  <h3 className='font-semibold text-slate-700'>
                    {spot.spotName}
                  </h3>
                  <p className='text-xs text-slate-500'>Spot inactivo</p>
                  <p className='mt-1 text-xs text-slate-500'>
                    ID: {spot.spotId}
                  </p>
                  {!isConfirming ? (
                    <button
                      type='button'
                      onClick={(event) =>
                        runPopupAction(event, () => {
                          setPendingSpotAction({
                            spotId: spot.spotId,
                            nextActive: true,
                          })
                        })
                      }
                      className='mt-2 w-full rounded-md bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400'
                    >
                      Activar
                    </button>
                  ) : (
                    <div className='mt-2 space-y-2'>
                      <p className='text-xs text-slate-600'>
                        Confirmar activación de este spot?
                      </p>
                      <div className='flex gap-2'>
                        <button
                          type='button'
                          onClick={(event) =>
                            runPopupAction(event, () => {
                              void handleUpdateSpotActiveState(spot, true)
                            })
                          }
                          disabled={isUpdating}
                          className='flex-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                          {isUpdating ? 'Activando…' : 'Confirmar'}
                        </button>
                        <button
                          type='button'
                          onClick={(event) =>
                            runPopupAction(event, () => {
                              setPendingSpotAction(null)
                            })
                          }
                          disabled={isUpdating}
                          className='flex-1 rounded-md bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
        {draftSpotPosition && (
          <Marker
            ref={draftMarkerRef}
            position={draftSpotPosition}
            icon={spotIcon}
            draggable
            eventHandlers={{
              dragend: (event) => {
                const marker = event.target as LeafletMarker
                const { lat, lng } = marker.getLatLng()
                const validation = validateSpainSeaOrBeachLocation(
                  lat,
                  lng,
                  COAST_BEACH_BAND_METERS,
                )
                if (!validation.valid) {
                  setCreateSpotError(
                    getLocationErrorMessage(validation.reason ?? 'inland'),
                  )
                  return
                }
                setDraftSpotPosition([lat, lng])
                setCreateSpotError(null)
              },
            }}
          >
            <Popup
              autoClose={false}
              closeOnClick={false}
              closeButton={false}
              autoPan={false}
              className='draft-spot-popup'
            >
              <div
                className='w-[230px] space-y-2 text-xs'
                onClick={(event) => event.stopPropagation()}
              >
                <p className='font-semibold text-slate-700'>Nuevo spot</p>
                <div className='max-h-28 overflow-y-auto rounded-md border border-slate-200'>
                  {draftSpotSuggestions.length > 0 ? (
                    <ul>
                      {draftSpotSuggestions.map((spot) => (
                        <li key={spot.spotId}>
                          <button
                            type='button'
                            onClick={(event) =>
                              runPopupAction(event, () => {
                                setDraftSpotId(spot.spotId)
                                setDraftSpotQuery(spot.spotName)
                              })
                            }
                            className={`w-full px-2 py-1.5 text-left text-xs hover:bg-slate-100 ${
                              draftSpotId === spot.spotId
                                ? 'bg-sky-100 text-sky-800'
                                : 'text-slate-700'
                            }`}
                          >
                            {spot.spotName}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className='px-2 py-2 text-[11px] text-slate-500'>
                      Sin coincidencias
                    </p>
                  )}
                </div>

                <input
                  type='text'
                  name='spot-search'
                  value={draftSpotQuery}
                  onChange={(event) => {
                    setDraftSpotQuery(event.target.value)
                    setDraftSpotId(null)
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') return
                    event.preventDefault()
                    const firstSuggestion = draftSpotSuggestions[0]
                    if (!firstSuggestion) return
                    setDraftSpotId(firstSuggestion.spotId)
                    setDraftSpotQuery(firstSuggestion.spotName)
                  }}
                  placeholder='Buscar spot (ej: somo)'
                  autoComplete='off'
                  spellCheck={false}
                  aria-label='Buscar spot inactivo para activar'
                  className='w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-none'
                />

                <div className='flex gap-2'>
                  <button
                    type='button'
                    onClick={(event) =>
                      runPopupAction(event, () => {
                        void handleActivateDraftSpot()
                      })
                    }
                    disabled={isSavingSpot || !draftSpotId}
                    className='flex-1 rounded-md bg-emerald-600 px-2 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60'
                  >
                    {isSavingSpot ? 'Guardando…' : 'Activar'}
                  </button>
                  <button
                    type='button'
                    onClick={(event) =>
                      runPopupAction(event, () => {
                        clearDraftSpot()
                      })
                    }
                    className='flex-1 rounded-md bg-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-700'
                  >
                    Cancelar
                  </button>
                </div>

                {createSpotError && (
                  <p className='text-[11px] font-medium text-rose-600'>
                    {createSpotError}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      <BottomSheet
        open={Boolean(selected)}
        title={selected?.buoyName ?? ''}
        onClose={() => setSelected(null)}
        closeLabel='Cerrar'
      >
        {selected && (
          <div className='space-y-4'>
            <div className='rounded-2xl border border-white/10 bg-ocean-800 p-4 text-sm text-ocean-100'>
              <p>Buoy ID: {selected.buoyId}</p>
              {selected.body && <p className='mt-2'>{selected.body}</p>}
              {selected.location && (
                <p className='mt-2 text-xs text-ocean-300'>
                  Coordinates: {selected.location.coordinates[1].toFixed(4)},{' '}
                  {selected.location.coordinates[0].toFixed(4)}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                updateSettings({ defaultStationId: selected.buoyId })
                navigate(`/buoy/${selected.buoyId}`)
                setSelected(null)
              }}
              className='w-full touch-manipulation rounded-xl bg-ocean-500 px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-300'
              type='button'
            >
              Ver detalle
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
