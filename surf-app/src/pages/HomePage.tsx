import { useEffect, useMemo, useState } from 'react'
import {
  getSurfForecast,
  getStations,
  getTotalWaveHeight,
  getPrimarySwell,
  getBuoyData,
} from '../services/api'
import './HomePage.css'
import type {
  SurfForecast,
  Station,
  SelectableItem,
  BuoyDataDoc,
} from '../types'
import { degreesToCardinal } from '../types'
import { BottomSheet } from '../components/BottomSheet'
import { ForecastChart } from '../components/Forecast/ForecastChart'
import { SearchAutocomplete } from '../components/SearchAutocomplete'
import { StatusMessage } from '../components/StatusMessage'
import { BuoyDetailContent } from '../components/BuoyDetailContent'
import { SectionHeader } from '../components/SectionHeader'
import { HomeSummaryCards } from '../components/HomeSummaryCards'
import { BuoySectionHeader } from '../components/BuoySectionHeader'
import { SpotSelectorContent } from '../components/SpotSelectorContent'

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
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  )
  const [spotSheetOpen, setSpotSheetOpen] = useState(false)
  const [buoySheetOpen, setBuoySheetOpen] = useState(false)
  const [stations, setStations] = useState<Station[]>([])
  const [latestBuoyRecord, setLatestBuoyRecord] = useState<BuoyDataDoc | null>(
    null,
  )
  const [buoyHours, setBuoyHours] = useState<'6' | '12' | '24'>('6')
  const activeSpotId = spotSheetOpen ? spotId : defaultSpotId
  const activeStationId = buoySheetOpen ? stationId : defaultStationId

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setStatus('loading')
      try {
        const forecastResponse = await getSurfForecast(activeSpotId, 1, 72)
        if (!mounted) return

        setForecasts(forecastResponse)
        setStatus('success')
      } catch {
        if (!mounted) return
        setStatus('error')
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [activeSpotId])

  useEffect(() => {
    let mounted = true
    const loadStations = async () => {
      try {
        const stationData = await getStations()
        if (!mounted) return
        setStations(stationData)
      } catch (err) {
        console.error('Failed to load stations:', err)
      }
    }

    void loadStations()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const loadLatestBuoy = async () => {
      try {
        const latest = await getBuoyData(activeStationId, 1)
        if (!mounted) return
        setLatestBuoyRecord(latest[0] ?? null)
      } catch (err) {
        console.error('Failed to load latest buoy record:', err)
        if (!mounted) return
        setLatestBuoyRecord(null)
      }
    }

    void loadLatestBuoy()
    return () => {
      mounted = false
    }
  }, [activeStationId])

  const selected = useMemo(
    () => forecasts[2] ?? forecasts[0] ?? null,
    [forecasts],
  )

  const locale = 'es-ES'

  // Derived values
  const stationLabel = useMemo(
    () =>
      stations.find((s) => s.buoyId === activeStationId)?.name ??
      activeStationId,
    [stations, activeStationId],
  )

  const stationItems: SelectableItem[] = useMemo(
    () => stations.map((s) => ({ id: s.buoyId, name: s.name })),
    [stations],
  )

  const latestReadingText = latestBuoyRecord
    ? `${latestBuoyRecord.height.toFixed(2)}m | ${latestBuoyRecord.period.toFixed(1)}s`
    : '--'

  if (status === 'loading') {
    return <StatusMessage message='Cargando...' />
  }

  if (status === 'error') {
    return <StatusMessage message='Error al cargar datos' variant='error' />
  }

  if (!forecasts.length) {
    return <StatusMessage message='No hay datos disponibles' />
  }

  const selectedTotalHeight = selected ? getTotalWaveHeight(selected) : 0
  const selectedPrimarySwell = selected ? getPrimarySwell(selected) : null
  const selectedWaveDirection =
    selectedPrimarySwell?.angle !== undefined
      ? `${degreesToCardinal(selectedPrimarySwell.angle)} ${selectedPrimarySwell.angle.toFixed(0)}°`
      : '--'
  const selectedWindDirection =
    selected?.wind.angle !== undefined
      ? `${degreesToCardinal(selected.wind.angle)} ${selected.wind.angle.toFixed(0)}°`
      : '--'

  return (
    <div className='space-y-4'>
      {selected && (
        <HomeSummaryCards
          totalHeight={selectedTotalHeight}
          primaryPeriod={selectedPrimarySwell?.period ?? null}
          energy={selected.energy}
          waveAngle={selectedPrimarySwell?.angle ?? null}
          waveDirection={selectedWaveDirection}
          windAngle={selected.wind.angle}
          windDirection={selectedWindDirection}
          windSpeed={selected.wind.speed}
          latestBuoyRecord={latestBuoyRecord}
        />
      )}

      <div className='rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900'>
        <SectionHeader
          title='Forecast'
          action={activeSpotId}
          onAction={() => {
            setSpotId(defaultSpotId)
            setSpotSheetOpen(true)
          }}
        />
        <ForecastChart forecasts={forecasts} locale={locale} />
        <div className='mt-2 border-t border-slate-200 pt-5 dark:border-slate-700'>
          <BuoySectionHeader
            stationLabel={stationLabel}
            defaultStationId={defaultStationId}
            buoyHours={buoyHours}
            onChangeHours={setBuoyHours}
            latestReading={latestReadingText}
            onOpenSelector={() => {
              setStationId(defaultStationId)
              setBuoySheetOpen(true)
            }}
          />
          <BuoyDetailContent
            stationId={activeStationId}
            viewMode='chart'
            hours={buoyHours}
            showRangeSelector={false}
            showMetrics={false}
          />
        </div>
      </div>

      <BottomSheet
        open={spotSheetOpen}
        title='Seleccionar spot'
        onClose={() => setSpotSheetOpen(false)}
        closeLabel='Cerrar'
      >
        <SpotSelectorContent
          spotId={spotId}
          onSpotIdChange={setSpotId}
          onConfirm={() => {
            onSelectSpot(spotId)
            setSpotSheetOpen(false)
          }}
        />
      </BottomSheet>

      <BottomSheet
        open={buoySheetOpen}
        title='Seleccionar boya'
        onClose={() => setBuoySheetOpen(false)}
        closeLabel='Cerrar'
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
