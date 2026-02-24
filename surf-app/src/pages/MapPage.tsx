import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet'
import { DivIcon, Icon } from 'leaflet'
import type { Marker as LeafletMarker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapPage.css'
import type { BuoyInfoDoc, Spot } from '../types'
import { getBuoysList, getSpots, updateSpotInfo } from '../services/api'
import { BottomSheet } from '../components/BottomSheet'
import { PageHeader } from '../components/PageHeader'
import { SelectMenu } from '../components/SelectMenu'

interface MapPageProps {
  onFocusBuoy: (id: string) => void
}

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
}

const SpotPlacementHandler = ({ onPick }: SpotPlacementHandlerProps) => {
  useMapEvents({
    click: (event) => {
      const target = event.originalEvent.target as HTMLElement | null
      if (
        target?.closest(
          '.leaflet-popup, .leaflet-marker-pane, .leaflet-control, button, input, select, a',
        )
      ) {
        return
      }
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

export const MapPage = ({ onFocusBuoy }: MapPageProps) => {
  const [buoys, setBuoys] = useState<BuoyInfoDoc[]>([])
  const [spots, setSpots] = useState<Spot[]>([])
  const [selected, setSelected] = useState<BuoyInfoDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSpotFormOpen, setIsSpotFormOpen] = useState(false)
  const [draftSpotId, setDraftSpotId] = useState('')
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

  const closeAddSpot = () => {
    setIsSpotFormOpen(false)
    setDraftSpotId('')
    setCreateSpotError(null)
    setIsSavingSpot(false)
  }

  const openSpotForm = () => {
    if (!draftSpotPosition) {
      setCreateSpotError('Selecciona una ubicación en el mapa')
      return
    }
    setIsSpotFormOpen(true)
    setCreateSpotError(null)
  }

  const handleCreateSpot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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
      setDraftSpotPosition(null)
      closeAddSpot()
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
    () =>
      spots.filter(
        (spot) =>
          spot.active === true &&
          spot.location?.coordinates &&
          spot.location.coordinates.length === 2,
      ),
    [spots],
  )

  const inactiveSpotOptions = useMemo(
    () =>
      spots
        .filter((spot) => spot.active !== true)
        .sort((a, b) => a.spotName.localeCompare(b.spotName, 'es-ES'))
        .map((spot) => ({
          value: spot.spotId,
          label: spot.spotName,
        })),
    [spots],
  )

  const inactiveSpotsWithCoordinates = useMemo(
    () =>
      spots.filter((spot) => {
        if (spot.active === true) return false
        const coordinates = spot.location?.coordinates
        if (!coordinates || coordinates.length !== 2) return false
        return !(coordinates[0] === 0 && coordinates[1] === 0)
      }),
    [spots],
  )

  useEffect(() => {
    if (!isSpotFormOpen) return
    if (inactiveSpotOptions.length === 0) return
    if (inactiveSpotOptions.some((spot) => spot.value === draftSpotId)) return
    setDraftSpotId(inactiveSpotOptions[0].value)
  }, [draftSpotId, inactiveSpotOptions, isSpotFormOpen])

  // Calculate map center from buoys/spots or use default Spain center
  const mapCenter: [number, number] = useMemo(
    () =>
      buoysWithCoordinates.length > 0
        ? [
            buoysWithCoordinates[0].location!.coordinates[1],
            buoysWithCoordinates[0].location!.coordinates[0],
          ]
        : activeSpotsWithCoordinates.length > 0
          ? [
              activeSpotsWithCoordinates[0].location!.coordinates[1],
              activeSpotsWithCoordinates[0].location!.coordinates[0],
            ]
          : [40.4, -3.7],
    [activeSpotsWithCoordinates, buoysWithCoordinates],
  )

  return (
    <div className='relative h-[calc(100vh-80px)]'>
      <div className='absolute left-4 top-4 z-10 space-y-3'>
        <PageHeader title='Mapa' />
        <div className='rounded-xl bg-ocean-800/90 p-3 text-xs text-ocean-200'>
          <p className='mb-2 text-[11px] text-ocean-100'>
            Click en el mapa para colocar un pin nuevo
          </p>
          {loading ? (
            <p>Cargando mapa...</p>
          ) : (
            <>
              <p>Boyas: {buoysWithCoordinates.length}</p>
              <p>Spots activos: {activeSpotsWithCoordinates.length}</p>
              <p>Spots inactivos: {inactiveSpotsWithCoordinates.length}</p>
              <ul className='mt-2 space-y-1'>
                {buoysWithCoordinates.slice(0, 5).map((buoy) => (
                  <li key={buoy.buoyId}>
                    <button
                      type='button'
                      onClick={() => setSelected(buoy)}
                      className='touch-manipulation text-ocean-100 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-300'
                    >
                      {buoy.buoyName} ({buoy.buoyId})
                    </button>
                  </li>
                ))}
                {buoysWithCoordinates.length > 5 && (
                  <li className='text-ocean-300'>
                    +{buoysWithCoordinates.length - 5} more
                  </li>
                )}
              </ul>
            </>
          )}
        </div>
      </div>
      <MapContainer center={mapCenter} zoom={6} className='h-full w-full'>
        <SpotPlacementHandler onPick={setDraftSpotPosition} />
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
            position={draftSpotPosition}
            icon={spotIcon}
            draggable
            eventHandlers={{
              dragend: (event) => {
                const marker = event.target as LeafletMarker
                const { lat, lng } = marker.getLatLng()
                setDraftSpotPosition([lat, lng])
              },
            }}
          >
            <Popup>Nuevo spot (pendiente)</Popup>
          </Marker>
        )}
      </MapContainer>

      {draftSpotPosition && !isSpotFormOpen && (
        <div className='pointer-events-none absolute bottom-4 left-0 right-0 z-20 flex justify-center'>
          <button
            type='button'
            onClick={openSpotForm}
            className='pointer-events-auto touch-manipulation rounded-xl bg-ocean-500 px-5 py-3 text-sm font-semibold text-white shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-300'
          >
            Añadir spot aquí
          </button>
        </div>
      )}

      <BottomSheet
        open={isSpotFormOpen}
        title='Añadir spot'
        onClose={closeAddSpot}
        closeLabel='Cancelar'
      >
        <form className='space-y-4' onSubmit={handleCreateSpot}>
          <p className='text-sm text-slate-700 dark:text-slate-200'>
            Haz click en el mapa para colocar el pin y selecciona un spot de la
            lista para activarlo.
          </p>

          <div className='space-y-1'>
            <span className='text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300'>
              Spot de forecast
            </span>
            <SelectMenu
              value={draftSpotId || inactiveSpotOptions[0]?.value || 'none'}
              onChange={setDraftSpotId}
              ariaLabel='Seleccionar spot de forecast'
              disabled={inactiveSpotOptions.length === 0}
              className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
              options={
                inactiveSpotOptions.length > 0
                  ? inactiveSpotOptions
                  : [{ value: 'none', label: 'No hay spots disponibles' }]
              }
            />
          </div>

          <div className='rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'>
            {draftSpotPosition
              ? `Coordenadas: ${draftSpotPosition[1].toFixed(4)}, ${draftSpotPosition[0].toFixed(4)}`
              : 'Selecciona una ubicación en el mapa'}
          </div>

          {createSpotError && (
            <p className='text-xs font-medium text-rose-600 dark:text-rose-300'>
              {createSpotError}
            </p>
          )}

          <button
            type='submit'
            disabled={
              isSavingSpot ||
              !draftSpotPosition ||
              !draftSpotId ||
              inactiveSpotOptions.length === 0
            }
            className='w-full touch-manipulation rounded-xl bg-ocean-500 px-4 py-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-300 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isSavingSpot ? 'Guardando…' : 'Activar spot'}
          </button>
        </form>
      </BottomSheet>

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
                onFocusBuoy(selected.buoyId)
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
