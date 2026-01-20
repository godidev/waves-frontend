import { useEffect, useMemo, useState } from 'react'
import {
  getBuoyData,
  getSurfForecast,
  getStations,
  getTotalWaveHeight,
  getPrimarySwell,
} from '../services/api'
import './HomePage.css'
import type {
  Buoy,
  SurfForecast,
  Station,
  SelectableItem,
} from '../types'
import { BottomSheet } from '../components/BottomSheet'
import { MetricCard } from '../components/MetricCard'
import { DirectionArrow } from '../components/DirectionArrow'
import { ForecastChart } from '../components/ForecastChart'
import { ForecastChips } from '../components/ForecastChips'
import { SearchAutocomplete } from '../components/SearchAutocomplete'
import { ShareButton } from '../components/ShareButton'
import { StatusMessage } from '../components/StatusMessage'
import { SectionHeader } from '../components/SectionHeader'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { SelectorLabel } from '../components/SelectorLabel'
import { MetricGroup } from '../components/MetricGroup'
import { MetricRow } from '../components/MetricRow'

interface HomePageProps {
  defaultSpotId: string
  defaultStationId: string
  onSelectSpot: (id: string) => void
  onSelectStation: (id: string) => void
}

export const HomePage = ({
  defaultSpotId,
  defaultStationId,
  onSelectSpot,
  onSelectStation,
}: HomePageProps) => {
  const [spotId, setSpotId] = useState(defaultSpotId)
  const [stationId, setStationId] = useState(defaultStationId)
  const [forecasts, setForecasts] = useState<SurfForecast[]>([])
  const [buoys, setBuoys] = useState<Buoy[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [tab, setTab] = useState<'forecast' | 'buoy'>('forecast')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [spotSheetOpen, setSpotSheetOpen] = useState(false)
  const [buoySheetOpen, setBuoySheetOpen] = useState(false)
  const [stations, setStations] = useState<Station[]>([])
  const [stationLabel, setStationLabel] = useState('')

  useEffect(() => {
    setSpotId(defaultSpotId)
  }, [defaultSpotId])

  useEffect(() => {
    setStationId(defaultStationId)
  }, [defaultStationId])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(false)
      try {
        const [forecastResponse, buoyDataResponse, stationData] = await Promise.all(
          [
            getSurfForecast(spotId, 1, 48),
            getBuoyData(stationId, 6),
            getStations(),
          ],
        )
        if (!mounted) return
        
        // Convert BuoyDataDoc[] to Buoy[]
        const buoysConverted: Buoy[] = buoyDataResponse.map(data => ({
          date: data.date.getTime(),
          buoyId: data.buoyId,
          period: data.period,
          height: data.height,
          avgDirection: data.avgDirection,
          peakDirection: data.peakDirection ?? undefined
        }))
        
        setForecasts(forecastResponse)
        setBuoys(buoysConverted)
        setStations(stationData)
        setStationLabel(
          stationData.find((item: Station) => item.buoyId === stationId)?.name ??
            stationId,
        )
        setSelectedDate(forecastResponse[0]?.date ?? null)
      } catch {
        if (!mounted) return
        setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [spotId, stationId])

  const selected = useMemo(() => {
    if (!selectedDate) return forecasts[0]
    return forecasts.find((f) => f.date === selectedDate) ?? forecasts[0]
  }, [forecasts, selectedDate])

  const latestBuoy = useMemo(() => buoys[0], [buoys])

  const locale = 'es-ES'

  // Convert stations to selectable items
  const stationItems: SelectableItem[] = useMemo(
    () => stations.map((s) => ({ id: s.buoyId, name: s.name })),
    [stations],
  )

  if (loading) {
    return <StatusMessage message="Cargando..." />
  }

  if (error) {
    return <StatusMessage message="Error al cargar datos" variant="error" />
  }

  if (tab === 'forecast' && !forecasts.length) {
    return <StatusMessage message="No hay datos disponibles" />
  }

  if (tab === 'buoy' && !buoys.length) {
    return <StatusMessage message="No hay datos disponibles" />
  }

  const selectedTotalHeight = selected ? getTotalWaveHeight(selected) : 0
  const selectedPrimarySwell = selected ? getPrimarySwell(selected) : null

  return (
    <div className='space-y-6'>
      <div className='rounded-3xl border border-white/10 bg-ocean-800/70 p-5'>
        <SectionHeader
          title={tab === 'forecast' ? spotId : stationLabel}
          action={
            tab === 'forecast'
              ? 'Cambiar spot'
              : 'Cambiar boya'
          }
          onAction={() =>
            tab === 'forecast' ? setSpotSheetOpen(true) : setBuoySheetOpen(true)
          }
        />
        <div className='mt-4'>
          <SegmentedTabs
            options={[
              { label: 'Spots', value: 'forecast' },
              { label: 'Boyas', value: 'buoy' },
            ]}
            value={tab}
            onChange={(value) => setTab(value as 'forecast' | 'buoy')}
          />
        </div>
        <div className='mt-4'>
          <SelectorLabel
            text={
              tab === 'forecast'
                ? 'Cambiar spot'
                : 'Cambiar boya'
            }
          />
        </div>
        <div className='mt-4 flex items-center justify-end'>
          <ShareButton url={window.location.href} />
        </div>
        <div className='mt-5 grid gap-3 sm:grid-cols-3'>
          {tab === 'forecast' && selected && (
            <>
              <MetricCard
                label="Altura de ola"
                value={selectedTotalHeight.toFixed(1)}
                suffix='m'
              />
              <MetricCard
                label="Periodo"
                value={`${selectedPrimarySwell?.period ?? '--'}`}
                suffix='s'
              />
              <MetricCard
                label="Viento"
                value={`${selected.wind.speed}`}
                suffix='km/h'
                icon={<DirectionArrow degrees={selected.wind.angle} />}
              />
            </>
          )}
          {tab === 'buoy' && latestBuoy && (
            <>
              <MetricCard
                label="Altura"
                value={`${latestBuoy.height}`}
                suffix='m'
              />
              <MetricCard
                label="Periodo"
                value={`${latestBuoy.period}`}
                suffix='s'
              />
              <MetricCard
                label="Dirección"
                value={`${latestBuoy.avgDirection}°`}
                icon={<DirectionArrow degrees={latestBuoy.avgDirection} />}
              />
            </>
          )}
        </div>
      </div>

      {tab === 'forecast' && forecasts.length > 0 && (
        <>
          <ForecastChart forecasts={forecasts} locale={locale} />
          <ForecastChips
            forecasts={forecasts}
            selected={selectedDate ?? ''}
            locale={locale}
            onSelect={(date) => setSelectedDate(date)}
          />
          {selected && selected.validSwells.length > 0 && (
            <MetricGroup title="Swells">
              {selected.validSwells.map((swell, index) => (
                <MetricRow
                  key={index}
                  label={`Swell ${index + 1}`}
                  value={`${swell.height}m @ ${swell.period}s (${swell.angle}°)`}
                />
              ))}
              <MetricRow
                label="Energía"
                value={`${selected.energy}`}
              />
            </MetricGroup>
          )}
        </>
      )}

      <BottomSheet
        open={spotSheetOpen}
        title="Seleccionar spot"
        onClose={() => setSpotSheetOpen(false)}
        closeLabel="Cerrar"
      >
        <div className='p-4'>
          <label className='text-xs uppercase text-ocean-200'>
            ID del spot
            <input
              type='text'
              value={spotId}
              onChange={(e) => setSpotId(e.target.value)}
              className='mt-2 w-full rounded-xl border border-white/10 bg-ocean-800 px-3 py-2 text-sm text-white'
              placeholder='sopelana'
            />
          </label>
          <button
            onClick={() => {
              onSelectSpot(spotId)
              setSpotSheetOpen(false)
            }}
            className='mt-4 w-full rounded-xl bg-ocean-600 py-2 text-sm font-semibold text-white'
          >
            Confirmar
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        open={buoySheetOpen}
        title="Seleccionar boya"
        onClose={() => setBuoySheetOpen(false)}
        closeLabel="Cerrar"
      >
        <SearchAutocomplete
          items={stationItems}
          onSelect={(id) => {
            setStationId(id)
            onSelectStation(id)
            setBuoySheetOpen(false)
          }}
        />
      </BottomSheet>
    </div>
  )
}
