import { Outlet } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'

export const Layout = () => (
  <div className='min-h-screen bg-gradient-to-b from-[#f4f7fb] to-[#e8edf4] pb-24 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100'>
    <div className='mx-auto max-w-md px-2 pb-8 pt-2'>
      <Outlet />
    </div>
    <BottomNav />
  </div>
)
