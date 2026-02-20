import { NavLink, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

interface NavItem {
  label: string
  to: string
  icon: ReactNode
}

interface BottomNavProps {
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

const HomeIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    className={className}
  >
    <path strokeLinecap='round' strokeLinejoin='round' d='M3 10.5 12 3l9 7.5' />
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M5.5 9.5v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-10'
    />
  </svg>
)

const MapIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20Z'
    />
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M9 4v13.5M15 6.5V20'
    />
  </svg>
)

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z'
    />
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='m19.4 15 .2 1.2a1 1 0 0 1-.6 1.1l-1.1.4a1 1 0 0 0-.6.6l-.5 1.1a1 1 0 0 1-1 .5l-1.2-.2a1 1 0 0 0-.8.2l-1 .8a1 1 0 0 1-1.2 0l-1-.8a1 1 0 0 0-.8-.2l-1.2.2a1 1 0 0 1-1-.5l-.5-1.1a1 1 0 0 0-.6-.6l-1.1-.4a1 1 0 0 1-.6-1.1L4.6 15a1 1 0 0 0-.2-.8l-.8-1a1 1 0 0 1 0-1.2l.8-1a1 1 0 0 0 .2-.8l-.2-1.2a1 1 0 0 1 .6-1.1l1.1-.4a1 1 0 0 0 .6-.6l.5-1.1a1 1 0 0 1 1-.5l1.2.2a1 1 0 0 0 .8-.2l1-.8a1 1 0 0 1 1.2 0l1 .8a1 1 0 0 0 .8.2l1.2-.2a1 1 0 0 1 1 .5l.5 1.1a1 1 0 0 0 .6.6l1.1.4a1 1 0 0 1 .6 1.1l-.2 1.2a1 1 0 0 0 .2.8l.8 1a1 1 0 0 1 0 1.2l-.8 1a1 1 0 0 0-.2.8Z'
    />
  </svg>
)

const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    className={className}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z'
    />
  </svg>
)

const SunIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    className={className}
  >
    <circle cx='12' cy='12' r='4' />
    <path strokeLinecap='round' strokeLinejoin='round' d='M12 2v2M12 20v2' />
    <path strokeLinecap='round' strokeLinejoin='round' d='m4.9 4.9 1.4 1.4' />
    <path strokeLinecap='round' strokeLinejoin='round' d='m17.7 17.7 1.4 1.4' />
    <path strokeLinecap='round' strokeLinejoin='round' d='M2 12h2M20 12h2' />
    <path strokeLinecap='round' strokeLinejoin='round' d='m4.9 19.1 1.4-1.4' />
    <path strokeLinecap='round' strokeLinejoin='round' d='m17.7 6.3 1.4-1.4' />
  </svg>
)

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: <HomeIcon className='h-5 w-5' /> },
  { label: 'Mapa', to: '/map', icon: <MapIcon className='h-5 w-5' /> },
  {
    label: 'Ajustes',
    to: '/settings',
    icon: <SettingsIcon className='h-5 w-5' />,
  },
]

export const BottomNav = ({ theme, onToggleTheme }: BottomNavProps) => {
  const location = useLocation()
  const showThemeToggle = location.pathname === '/'

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/90'>
      <div className='mx-auto flex max-w-md items-center justify-around px-4 py-2.5 text-xs'>
        {navItems.map((item, index) => (
          <div key={item.to} className='flex items-center gap-2'>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex min-w-20 flex-col items-center gap-1 rounded-2xl px-2 py-1.5 transition ${
                  isActive
                    ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300'
                    : 'text-slate-400 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>

            {index === 0 && showThemeToggle && (
              <button
                onClick={onToggleTheme}
                className='flex min-w-20 flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-slate-400 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                type='button'
              >
                {theme === 'dark' ? (
                  <SunIcon className='h-5 w-5' />
                ) : (
                  <MoonIcon className='h-5 w-5' />
                )}
                {theme === 'dark' ? 'Claro' : 'Oscuro'}
              </button>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}
