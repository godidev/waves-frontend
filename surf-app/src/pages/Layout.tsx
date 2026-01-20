import { Outlet } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'

export const Layout = () => (
  <div className="min-h-screen bg-gradient-to-b from-ocean-950 via-ocean-900 to-ocean-800 pb-24 text-white">
    <div className="mx-auto max-w-3xl px-4 pb-8 pt-6">
      <Outlet />
    </div>
    <BottomNav />
  </div>
)
