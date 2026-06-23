import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ScissorsIcon } from './BarberIcons';

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
  { to: '/apartados', label: 'Apartados', icon: 'tag', roles: ['admin', 'barbero', 'cliente'] },
  { to: '/clientes', label: 'Clientes', icon: 'users', roles: ['admin', 'barbero'] },
  { to: '/disponibilidad', label: 'Disponibilidad', icon: 'clock', roles: ['admin', 'barbero'] },
  { to: '/reportes', label: 'Reportes', icon: 'chart', roles: ['admin', 'barbero'] },
];

function NavIcon({ name, className }) {
  if (name === 'users') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === 'calendar') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }

  if (name === 'scissors') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
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
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="M3.27 6.96 12 12.01l8.73-5.05" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    );
  }

  if (name === 'chart') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    );
  }

  if (name === 'tag') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
        <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === 'clock') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function LogoutIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
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
    <div className="flex min-h-screen flex-col text-neutral-100 md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 flex-col border-r border-gold-800/30 bg-[#111111] md:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <ScissorsIcon className="h-7 w-7 text-gold-400" />
          <div>
            <h1 className="font-serif text-lg leading-tight text-gold-400">
              BarberManager
            </h1>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
              Kenneth&apos;s Barber
            </p>
          </div>
        </div>

        <div className="gold-divider mx-5" />

        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gold-400/10 text-gold-400'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                }`
              }
            >
              <NavIcon name={link.icon} className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="gold-divider mx-5" />

        <div className="p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-600/40 bg-gold-400/10 text-sm font-semibold text-gold-400">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-200">{user?.nombre}</p>
              <p className="text-[11px] text-neutral-500">{ROLE_LABELS[user?.rol] || user?.rol}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-700/50 px-3 py-2 text-sm font-medium text-neutral-400 transition hover:border-gold-600/40 hover:text-gold-400"
          >
            <LogoutIcon className="h-4 w-4" />
            Cerrar sesion
          </button>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="flex flex-col border-b border-gold-800/30 bg-[#111111] md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ScissorsIcon className="h-5 w-5 text-gold-400" />
            <div>
              <h1 className="font-serif text-base leading-tight text-gold-400">
                BarberManager
              </h1>
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-500">Kenneth&apos;s Barber</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-700/50 px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:border-gold-600/40 hover:text-gold-400"
          >
            <LogoutIcon className="h-3.5 w-3.5" />
            Salir
          </button>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto border-t border-gold-800/20 px-3 py-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-gold-400/10 text-gold-400'
                    : 'text-neutral-400 hover:text-neutral-200'
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
