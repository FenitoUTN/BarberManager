/*
 * Armazón de navegación: sidebar de tinta en escritorio, header fijo + drawer en móvil.
 *
 * Tres decisiones de fondo, que conviene no deshacer sin pensarlo:
 *
 * 1. EL SIDEBAR ES OSCURO A PROPÓSITO. La app se usa de pie, con el teléfono en la mano, bajo
 *    luz de fluorescente. El contenido tiene que permanecer claro y legible; el color de
 *    identidad va en la superficie de navegación, no encima del texto que hay que leer. Un
 *    sidebar claro competiría con las tablas de agenda y clientes, que son lo denso del día.
 *
 * 2. EN MÓVIL NO HAY BARRA HORIZONTAL, HAY DRAWER. Antes había un <nav> con overflow-x-auto:
 *    ocho items de ~36px de alto en una fila que había que deslizar para descubrir secciones
 *    que quedaban fuera de pantalla, sin ninguna señal de cuántas había. Con el teléfono en una
 *    mano, un destino que exige scroll horizontal es un destino que no se usa. El drawer
 *    muestra las ocho secciones de una, con label, a 44px, y se cierra al navegar.
 *
 * 3. EL ESTADO ACTIVO NO SE COMUNICA SÓLO POR COLOR. Además del fondo petróleo, el item
 *    activo lleva un filo de latón de 2px y `aria-current="page"` (que react-router ya emite
 *    solo en la URL exacta). El color de fondo solo falla con daltonismo o con un monitor
 *    calibrado bajo: el filo y el peso tipográfico no.
 *
 * REGLA DEL PROYECTO: ningún hex literal y ningún style inline en este archivo. Todo sale de
 * tokens de index.css y de clases Tailwind completas y estáticas. Las duraciones van como
 * `duration-(--duration-fast)` porque Tailwind v4 no expone `--duration-*` como namespace de
 * utilidades: `duration-fast` compila a nada y la transición se cae al valor por defecto.
 */

import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ScissorsIcon } from './BarberIcons';
import NotificationBell from './NotificationBell';

const ROLE_LABELS = {
  admin: 'Administrador',
  barbero: 'Barbero',
  cliente: 'Cliente',
};

// Las rutas y los roles son un invariante: la lista de secciones y quién puede ver cada una
// no son una decisión estética y no se tocan en un rediseño de navegación.
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

/*
 * Foco sobre superficie oscura. El anillo global de index.css usa --color-brand, que sobre
 * tinta es casi invisible (petróleo sobre casi-negro). En sidebar y drawer el anillo va en
 * latón, y se declara por elemento en vez de confiar en que la regla base siga igual.
 */
const FOCUS_ON_INK =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass';

/*
 * Alto mínimo 2.75rem = 44px, el mínimo táctil (WCAG 2.2 objetivo 2.5.8 con holgura real).
 * Con `py-2.5` el item quedaba en ~36px. `border-l-2` va en los DOS estados, no sólo en el
 * activo: si el filo apareciera sólo al activarse, el label se correría 2px en cada clic.
 */
const NAV_ITEM_BASE =
  'flex min-h-11 items-center gap-3 rounded-field border-l-2 px-3 text-base ' +
  'transition-[background-color,border-color,color] duration-(--duration-fast) ease-out ';

const NAV_ITEM_ACTIVE = `${NAV_ITEM_BASE} border-brass bg-brand font-semibold text-white`;
const NAV_ITEM_IDLE =
  `${NAV_ITEM_BASE} border-transparent font-medium text-on-ink-muted ` +
  `hover:bg-ink-soft hover:text-on-ink ${FOCUS_ON_INK}`;

function NavIcon({ name, className }) {
  const shared = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    // Decorativo: el nombre de la sección ya está en el texto del enlace. Sin esto, un lector
    // de pantalla anuncia "users" o "box" antes de "Clientes".
    'aria-hidden': 'true',
  };

  if (name === 'users') {
    return (
      <svg {...shared}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === 'calendar') {
    return (
      <svg {...shared}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }

  if (name === 'scissors') {
    return (
      <svg {...shared}>
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
      <svg {...shared}>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="M3.27 6.96 12 12.01l8.73-5.05" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    );
  }

  if (name === 'chart') {
    return (
      <svg {...shared}>
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    );
  }

  if (name === 'tag') {
    return (
      <svg {...shared}>
        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
        <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === 'clock') {
    return (
      <svg {...shared}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }

  return (
    <svg {...shared}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function MenuIcon({ className }) {
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
      aria-hidden="true"
    >
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  );
}

function CloseIcon({ className }) {
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
      aria-hidden="true"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
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
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/*
 * NotificationBell llega con su propia paleta (escala neutral/gold del tema anterior) y está
 * calibrada para fondo oscuro. No se puede corregir ese archivo en este cambio, así que en
 * vez de dejarlo caer sobre el header claro --donde su ícono quedaría en ~2.5:1, muy por
 * debajo del mínimo-- se le da un soporte de tinta propio. El mismo padding lleva su botón de
 * 36px a 44px, que era el otro defecto.
 */
function BellSlot() {
  return (
    <div className="shrink-0 rounded-field bg-ink p-1 md:rounded-pill md:bg-transparent md:p-0">
      <NotificationBell />
    </div>
  );
}

function UserAvatar({ initial }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brass/30 bg-ink-soft text-base font-semibold text-brass">
      {initial}
    </div>
  );
}

/*
 * La lista de secciones, compartida por sidebar y drawer. Un solo lugar donde el estado activo
 * se define, para que las dos navegaciones no se desincronicen.
 */
function NavList({ links, onNavigate, navLabel }) {
  return (
    <nav aria-label={navLabel} className={onNavigate ? 'flex-1 overflow-y-auto px-3 py-3' : 'flex-1 overflow-y-auto px-3 py-4'}>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              onClick={onNavigate}
              // react-router emite `aria-current="page"` sólo en la URL exacta (no en los
              // prefijos), que es justo el matiz que un resaltado por color no distingue.
              className={({ isActive }) => (isActive ? NAV_ITEM_ACTIVE : NAV_ITEM_IDLE)}
            >
              <NavIcon name={link.icon} className="h-5 w-5 shrink-0" />
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Layout() {
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const panelRef = useRef(null);

  const links = NAV_LINKS.filter((link) => link.roles.includes(user?.rol));
  const initial = user?.nombre?.charAt(0)?.toUpperCase() || '?';
  const roleLabel = ROLE_LABELS[user?.rol] || user?.rol;

  /*
   * Cerrar el drawer devuelve el foco al botón que lo abrió. Sin esto, al cerrarlo el foco
   * cae al <body> y el usuario de teclado tiene que tabular desde el principio de la página
   * para seguir donde estaba.
   */
  function closeMenu() {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }

  // Escape cierra. Va en document porque el foco puede estar en cualquier link del panel.
  useEffect(() => {
    if (!menuOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  /*
   * Al abrir: foco al botón de cerrar y scroll del body bloqueado. El body bloqueado evita
   * el scroll de fondo con el dedo sobre el overlay, que deja el drawer pegado al borde
   * mientras el contenido de atrás se mueve.
   */
  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  /*
   * Trampa de foco. `aria-modal="true"` promete que el contenido de atrás no es alcanzable;
   * sin esto la promesa es falsa y el tabulador se escapa al header por debajo del overlay.
   */
  function handlePanelKeyDown(event) {
    if (event.key !== 'Tab') return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusables = panel.querySelectorAll('a[href], button:not([disabled])');
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const avatar = <UserAvatar initial={initial} />;

  return (
    <div className="flex min-h-screen flex-col bg-canvas md:flex-row">
      {/*
        Skip link: en escritorio hay nueve paradas (ocho secciones más el header) antes de
        llegar al contenido. Va primero en el orden de tabulación y sólo existe para teclado.
      */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-30 focus:rounded-field focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Saltar al contenido
      </a>

      {/* Sidebar de escritorio: superficie de tinta,fija en el alto de la pantalla. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink md:flex">
        <div className="px-5 pb-5 pt-6">
          {/* Marca. Es un <p>, no un <h1>: el h1 de la página es el título de la sección
              (PageHeader), y el logo no puede competir con él en el árbol de encabezados. */}
          <div className="flex items-center gap-3">
            <ScissorsIcon className="h-7 w-7 shrink-0 text-brass" />
            <div className="min-w-0">
              <p className="font-display text-lg leading-tight text-on-ink">BarberManager</p>
              <p className="mt-0.5 text-2xs text-on-ink-muted">Kenneth&apos;s Barber</p>
            </div>
          </div>
        </div>

        {/* Filo de latón: reemplaza al `gold-divider` del tema anterior, que ya no existe en
            index.css y sin su regla se dibujaba como nada. */}
        <div className="h-px shrink-0 bg-brass/30" />

        <NavList links={links} navLabel="Navegación principal" />

        <div className="h-px shrink-0 bg-on-ink/10" />

        <div className="p-4">
          <div className="flex items-center gap-3">
            {avatar}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-on-ink">{user?.nombre}</p>
              <p className="text-2xs text-on-ink-muted">{roleLabel}</p>
            </div>
            <BellSlot />
          </div>

          {/*
            Botón nativo y no <Button>: las cinco variantes de Button están calibradas para
            superficie clara (bg-surface, bg-ink, ghost con text-ink-muted) y ninguna de ellas
            es legible sobre tinta. Agregar una variante `onInk` al componente compartido es
            un cambio de otro archivo, fuera de esta capa.
          */}
          <button
            type="button"
            onClick={logout}
            className={`mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-field border border-on-ink/15 px-3 text-sm font-medium text-on-ink-muted transition-[border-color,color] duration-(--duration-fast) ease-out hover:border-brass/40 hover:text-brass ${FOCUS_ON_INK}`}
          >
            <LogoutIcon className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/*
        Columna de contenido. El header tiene que vivir acá adentro y no como hermano del
        sidebar: en un row el header se iría al borde superior de la ventana, no del área de
        contenido.
      */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/*
          Header móvil. `pt-[env(safe-area-inset-top)]` suma el hueco de la notch sólo donde
          existe: en el resto de los dispositivos la variable vale 0 y el padding del row
          interior define la altura.
        */}
        <header className="sticky top-0 z-30 border-b border-line bg-surface pt-[env(safe-area-inset-top)] md:hidden">
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-field text-ink-muted transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-surface-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <MenuIcon className="h-6 w-6" />
            </button>

            <div className="flex min-w-0 items-center gap-2">
              <ScissorsIcon className="h-5 w-5 shrink-0 text-brass" />
              <p className="truncate font-display text-base text-ink">BarberManager</p>
            </div>

            <BellSlot />
          </div>
        </header>

        {/*
          `min-w-0` es lo que hace que esta columna no crezca con un hijo ancho: en flex, el
          ancho mínimo automático de un item es su contenido, y sin esto una tabla de clientes
          se come el viewport y aparece scroll horizontal en toda la página.
        */}
        <main
          id="contenido"
          className="min-w-0 flex-1 p-4 pb-24 sm:p-6 sm:pb-20 lg:p-8 lg:pb-8"
        >
          {/* max-w-7xl: a 2560px las tablas de clientes se vuelven ilegibles porque el ojo
              pierde la columna al recorrerla de un extremo al otro. */}
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {menuOpen && (
        <>
          {/* Overlay: clic en el fondo oscuro cierra. aria-hidden porque no es interactivo para
              el lector de pantalla --el cierre real es el botón y Escape-- y no queremos que se
              anuncie como un grupo sin nombre. */}
          <div
            className="fixed inset-0 z-40 bg-ink/60"
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/*
            Panel lateral, no modal centrado. Un modal centrado obligaría a tapar pantalla
            completa para navegar ocho secciones; un panel de 18rem deja ver el contenido de
            fondo y comunica "menú" mejor que una caja flotante.
          */}
          <div
            id="menu-movil"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            onKeyDown={handlePanelKeyDown}
            className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-ink pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-overlay"
          >
            <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <ScissorsIcon className="h-6 w-6 shrink-0 text-brass" />
                <div className="min-w-0">
                  <p className="font-display text-base leading-tight text-on-ink">BarberManager</p>
                  <p className="mt-0.5 text-2xs text-on-ink-muted">Kenneth&apos;s Barber</p>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeMenu}
                aria-label="Cerrar menú"
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-field text-on-ink-muted transition-[background-color,color] duration-(--duration-fast) ease-out hover:bg-ink-soft hover:text-on-ink ${FOCUS_ON_INK}`}
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="h-px shrink-0 bg-on-ink/10" />

            {/* onClick=closeMenu: navegar cierra el drawer. Un menú que queda abierto encima
                de la pantalla nueva es la mitad de los menús mal implementados. */}
            <NavList links={links} navLabel="Secciones" onNavigate={closeMenu} />

            <div className="h-px shrink-0 bg-on-ink/10" />

            <div className="p-4">
              <div className="flex items-center gap-3">
                {avatar}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-on-ink">{user?.nombre}</p>
                  <p className="text-2xs text-on-ink-muted">{roleLabel}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className={`mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-field border border-on-ink/15 px-3 text-sm font-medium text-on-ink-muted transition-[border-color,color] duration-(--duration-fast) ease-out hover:border-brass/40 hover:text-brass ${FOCUS_ON_INK}`}
              >
                <LogoutIcon className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Layout;