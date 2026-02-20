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
import { MapPage } from './pages/MapPage'
import { SettingsPage } from './pages/SettingsPage'
import { BuoyDetailPage } from './pages/BuoyDetailPage'

const BuoyRoute = ({ stationId }: { stationId: string }) => {
  const params = useParams()
  return <BuoyDetailPage stationId={params.id ?? stationId} />
}

const AppRoutes = () => {
  const { settings, setSettings } = useSettings()
  const navigate = useNavigate()
  const toggleTheme = () =>
    setSettings({
      ...settings,
      theme: settings.theme === 'dark' ? 'light' : 'dark',
    })

  return (
    <Routes>
      <Route
        path='/'
        element={<Layout theme={settings.theme} onToggleTheme={toggleTheme} />}
      >
        <Route
          index
          element={
            <HomePage
              defaultSpotId={settings.defaultSpotId}
              defaultStationId={settings.defaultStationId}
              onSelectSpot={(id) =>
                setSettings({ ...settings, defaultSpotId: id })
              }
              onSelectStation={(id) =>
                setSettings({ ...settings, defaultStationId: id })
              }
            />
          }
        />
        <Route
          path='map'
          element={
            <MapPage
              onFocusBuoy={(id) => {
                setSettings({ ...settings, defaultStationId: id })
                navigate(`/buoy/${id}`)
              }}
            />
          }
        />
        <Route
          path='settings'
          element={
            <SettingsPage
              settings={settings}
              onUpdate={(next) => setSettings(next)}
            />
          }
        />
        <Route
          path='buoy/:id'
          element={<BuoyRoute stationId={settings.defaultStationId} />}
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
