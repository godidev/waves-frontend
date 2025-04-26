import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import BuoyTable from './components/buoys/BuoyTable'
import SurfForecastPage from './pages/SurfForecastPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/buoys', element: <BuoyTable /> },
      { path: '/forecast', element: <SurfForecastPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
