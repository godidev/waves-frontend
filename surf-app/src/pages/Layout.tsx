import { Outlet } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'

export const Layout = () => (
  <div className='min-h-screen bg-gradient-to-b from-[#eef3fa] via-[#e8eef7] to-[#dfe8f4] pb-24 text-slate-900 dark:bg-[radial-gradient(circle_at_top,_#1e293b_0%,_#0f172a_35%,_#020617_100%)] dark:text-slate-100'>
    <main className='mx-auto max-w-md px-2 pb-8 pt-2'>
      <Outlet />
    </main>
    <BottomNav />
  </div>
)
