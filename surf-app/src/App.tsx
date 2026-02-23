import { Suspense, lazy } from 'react'
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { useSettings } from './hooks/useSettings'
import { Layout } from './pages/Layout'
import { HomePage } from './pages/HomePage'
import { StatusMessage } from './components/StatusMessage'

const MapPage = lazy(() =>
  import('./pages/MapPage').then((module) => ({ default: module.MapPage })),
)
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
)
const BuoyDetailPage = lazy(() =>
  import('./pages/BuoyDetailPage').then((module) => ({
    default: module.BuoyDetailPage,
  })),
)

const RouteLoading = () => <StatusMessage message='Cargando…' />

const BuoyRoute = ({ stationId }: { stationId: string }) => {
  const params = useParams()
  return <BuoyDetailPage stationId={params.id ?? stationId} />
}

const AppRoutes = () => {
  const { settings, setSettings } = useSettings()
  const navigate = useNavigate()

  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route
          index
          element={
            <HomePage
              defaultSpotId={settings.defaultSpotId}
              defaultStationId={settings.defaultStationId}
              buoySearchRadiusKm={settings.buoySearchRadiusKm}
              onSelectSpot={(id) =>
                setSettings((prev) => ({ ...prev, defaultSpotId: id }))
              }
              onSelectStation={(id) =>
                setSettings((prev) => ({ ...prev, defaultStationId: id }))
              }
              onSelectBuoySearchRadiusKm={(value) =>
                setSettings((prev) => ({ ...prev, buoySearchRadiusKm: value }))
              }
            />
          }
        />
        <Route
          path='map'
          element={
            <Suspense fallback={<RouteLoading />}>
              <MapPage
                onFocusBuoy={(id) => {
                  setSettings((prev) => ({ ...prev, defaultStationId: id }))
                  navigate(`/buoy/${id}`)
                }}
              />
            </Suspense>
          }
        />
        <Route
          path='settings'
          element={
            <Suspense fallback={<RouteLoading />}>
              <SettingsPage
                settings={settings}
                onUpdate={(next) => setSettings(next)}
              />
            </Suspense>
          }
        />
        <Route
          path='buoy/:id'
          element={
            <Suspense fallback={<RouteLoading />}>
              <BuoyRoute stationId={settings.defaultStationId} />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}

const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
)

export default App
