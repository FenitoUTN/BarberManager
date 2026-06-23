import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  admin: 'Administrador',
  barbero: 'Barbero',
  cliente: 'Cliente',
};

const QUICK_LINKS = [
  {
    title: 'Agenda',
    description: 'Reserva y gestiona los turnos de cada barbero.',
    icon: 'calendar',
    to: '/agenda',
    roles: ['admin', 'barbero', 'cliente'],
  },
  {
    title: 'Servicios',
    description: 'Consulta cortes, combos y precios del local.',
    icon: 'scissors',
    to: '/servicios',
    roles: ['admin', 'barbero', 'cliente'],
  },
  {
    title: 'Disponibilidad',
    description: 'Define el horario semanal y las excepciones.',
    icon: 'clock',
    to: '/disponibilidad',
    roles: ['admin', 'barbero'],
  },
];

const UPCOMING_MODULES = [
  {
    title: 'Productos',
    description: 'Controla el stock de productos de venta.',
    icon: 'package',
  },
  {
    title: 'Apartados',
    description: 'Reserva productos para tus clientes.',
    icon: 'bookmark',
  },
  {
    title: 'Reportes',
    description: 'Visualiza ingresos y desempeno del local.',
    icon: 'chart',
  },
];

function ModuleIcon({ name, className }) {
  const paths = {
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
    scissors: (
      <>
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </>
    ),
    package: (
      <>
        <path d="M16.5 9.4 7.5 4.21" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </>
    ),
    bookmark: (
      <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    ),
    chart: (
      <>
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    user: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Hero welcome */}
      <div className="rounded-xl border border-gold-800/30 bg-[#141414] p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-500">
          {ROLE_LABELS[user?.rol] || user?.rol}
        </p>
        <h2 className="mt-2 font-serif text-3xl text-gold-400">Bienvenido, {user?.nombre}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
          Este es el panel principal de BarberManager. Desde aqui vas a poder administrar la
          agenda, los servicios, los productos y los reportes del local segun tu rol.
        </p>

        <div className="mt-5">
          {(user?.rol === 'admin' || user?.rol === 'barbero') && (
            <Link
              to="/clientes"
              className="inline-flex items-center gap-2 rounded-lg border border-gold-600/60 bg-gold-600/20 px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-gold-400 transition hover:bg-gold-600/30"
            >
              <ModuleIcon name="users" className="h-4 w-4" />
              Gestion de clientes
            </Link>
          )}

          {user?.rol === 'cliente' && (
            <Link
              to={`/clientes/${user.id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-gold-600/60 bg-gold-600/20 px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-gold-400 transition hover:bg-gold-600/30"
            >
              <ModuleIcon name="user" className="h-4 w-4" />
              Ver mi perfil
            </Link>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h3 className="mb-4 font-serif text-lg text-gold-400">
          Accesos rapidos
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.filter((link) => link.roles.includes(user?.rol)).map((link) => (
            <Link
              key={link.title}
              to={link.to}
              className="group rounded-xl border border-gold-800/20 bg-[#141414] p-5 transition hover:border-gold-600/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-600/30 bg-gold-400/5 text-gold-400">
                  <ModuleIcon name={link.icon} className="h-5 w-5" />
                </div>
                <span className="text-gold-500/60 transition group-hover:translate-x-1 group-hover:text-gold-400">&#8594;</span>
              </div>
              <h4 className="mt-4 text-sm font-semibold text-neutral-200">{link.title}</h4>
              <p className="mt-1 text-sm text-neutral-500">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming modules */}
      <div>
        <h3 className="mb-4 font-serif text-lg text-gold-400">
          Proximos modulos
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {UPCOMING_MODULES.map((module) => (
            <div
              key={module.title}
              className="rounded-xl border border-neutral-800/60 bg-[#141414] p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-700/40 bg-white/5 text-neutral-500">
                  <ModuleIcon name={module.icon} className="h-5 w-5" />
                </div>
                <span className="rounded border border-neutral-700/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-600">
                  Proximamente
                </span>
              </div>
              <h4 className="mt-4 text-sm font-semibold text-neutral-300">{module.title}</h4>
              <p className="mt-1 text-sm text-neutral-600">{module.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
