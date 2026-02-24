import { Suspense, lazy } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom'
import { SettingsProvider, useSettingsContext } from './context/SettingsContext'
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const BuoyRoute = () => {
  const params = useParams()
  const {
    settings: { defaultStationId },
  } = useSettingsContext()
  return <BuoyDetailPage stationId={params.id ?? defaultStationId} />
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route
          path='map'
          element={
            <Suspense fallback={<RouteLoading />}>
              <MapPage />
            </Suspense>
          }
        />
        <Route
          path='settings'
          element={
            <Suspense fallback={<RouteLoading />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route
          path='buoy/:id'
          element={
            <Suspense fallback={<RouteLoading />}>
              <BuoyRoute />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SettingsProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SettingsProvider>
  </QueryClientProvider>
)

export default App
