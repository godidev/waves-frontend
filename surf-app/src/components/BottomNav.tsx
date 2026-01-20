import { NavLink } from 'react-router-dom'

interface NavItem {
  label: string
  to: string
}

const navItems: NavItem[] = [
  { label: 'Inicio', to: '/' },
  { label: 'Mapa', to: '/map' },
  { label: 'Ajustes', to: '/settings' },
]

export const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-ocean-900/90 backdrop-blur">
    <div className="mx-auto flex max-w-3xl items-center justify-around px-4 py-3 text-xs text-ocean-50">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `rounded-full px-3 py-2 ${
              isActive ? 'bg-ocean-500 text-white shadow-glow' : 'text-ocean-100'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  </nav>
)
