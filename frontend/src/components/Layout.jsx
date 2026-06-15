import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  admin: 'Administrador',
  barbero: 'Barbero',
  cliente: 'Cliente',
};

const NAV_LINKS = [
  { to: '/dashboard', label: 'Inicio', icon: 'home', roles: ['admin', 'barbero', 'cliente'] },
  { to: '/agenda', label: 'Agenda', icon: 'calendar', roles: ['admin', 'barbero', 'cliente'] },
  { to: '/servicios', label: 'Servicios', icon: 'scissors', roles: ['admin', 'barbero', 'cliente'] },
  { to: '/productos', label: 'Productos', icon: 'box', roles: ['admin', 'barbero', 'cliente'] },
  { to: '/clientes', label: 'Clientes', icon: 'users', roles: ['admin', 'barbero'] },
  { to: '/disponibilidad', label: 'Disponibilidad', icon: 'clock', roles: ['admin', 'barbero'] },
];

function NavIcon({ name, className }) {
  if (name === 'users') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === 'calendar') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }

  if (name === 'scissors') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    );
  }

  if (name === 'box') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="M3.27 6.96 12 12.01l8.73-5.05" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    );
  }

  if (name === 'clock') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ScissorsLogo({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

function LogoutIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function Layout() {
  const { user, logout } = useAuth();

  const links = NAV_LINKS.filter((link) => link.roles.includes(user?.rol));
  const initial = user?.nombre?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 flex-col border-r border-neutral-800 bg-neutral-900 md:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-500/30">
            <ScissorsLogo className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-white">BarberManager</h1>
            <p className="text-xs text-orange-500">Kenneth's Barber</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                    : 'border-transparent text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
                }`
              }
            >
              <NavIcon name={link.icon} className="h-4.5 w-4.5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-neutral-800 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 text-sm font-semibold text-orange-400">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-100">{user?.nombre}</p>
              <p className="text-xs text-neutral-500">{ROLE_LABELS[user?.rol] || user?.rol}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-700 px-3 py-2 text-sm font-medium text-neutral-300 transition hover:border-orange-500/50 hover:text-orange-400"
          >
            <LogoutIcon className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="flex flex-col border-b border-neutral-800 bg-neutral-900 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-700">
              <ScissorsLogo className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight text-white">BarberManager</h1>
              <p className="text-[10px] text-orange-500">Kenneth's Barber</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-700 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-orange-500/50 hover:text-orange-400"
          >
            <LogoutIcon className="h-3.5 w-3.5" />
            Salir
          </button>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto border-t border-neutral-800 px-3 py-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-orange-500/10 text-orange-400'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`
              }
            >
              <NavIcon name={link.icon} className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
