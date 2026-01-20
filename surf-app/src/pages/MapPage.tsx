import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapPage.css'
import type { BuoyInfoDoc } from '../types'
import { getBuoysList } from '../services/api'
import { BottomSheet } from '../components/BottomSheet'
import { PageHeader } from '../components/PageHeader'

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

export const MapPage = ({ onFocusBuoy }: MapPageProps) => {
  const [buoys, setBuoys] = useState<BuoyInfoDoc[]>([])
  const [selected, setSelected] = useState<BuoyInfoDoc | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const buoyData = await getBuoysList()
        if (!mounted) return
        setBuoys(buoyData)
      } catch (error) {
        console.error('Failed to load buoys:', error)
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
  const buoysWithCoordinates = buoys.filter(
    (buoy) =>
      buoy.location?.coordinates && buoy.location.coordinates.length === 2,
  )

  // Calculate map center from buoys or use default Spain center
  const mapCenter: [number, number] =
    buoysWithCoordinates.length > 0
      ? [
          buoysWithCoordinates[0].location!.coordinates[1],
          buoysWithCoordinates[0].location!.coordinates[0],
        ]
      : [40.4, -3.7]

  return (
    <div className='relative h-[calc(100vh-80px)]'>
      <div className='absolute left-4 top-4 z-10 space-y-3'>
        <PageHeader title='Mapa' />
        <div className='rounded-xl bg-ocean-800/90 p-3 text-xs text-ocean-200'>
          {loading ? (
            <p>Cargando boyas...</p>
          ) : (
            <>
              <p>Boyas: {buoysWithCoordinates.length}</p>
              <ul className='mt-2 space-y-1'>
                {buoysWithCoordinates.slice(0, 5).map((buoy) => (
                  <li key={buoy.buoyId}>
                    <button
                      onClick={() => setSelected(buoy)}
                      className='text-ocean-100 hover:text-white'
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
                <div className='text-sm'>
                  <h3 className='font-semibold'>{buoy.buoyName}</h3>
                  <p className='text-xs text-gray-600'>ID: {buoy.buoyId}</p>
                  {buoy.body && <p className='mt-1 text-xs'>{buoy.body}</p>}
                </div>
              </Popup>
            </Marker>
          )
        })}
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
                onFocusBuoy(selected.buoyId)
                setSelected(null)
              }}
              className='w-full rounded-xl bg-ocean-500 px-4 py-3 text-sm text-white'
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
