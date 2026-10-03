/*
 * Inicio del panel: la primera pantalla que ve todo usuario después de entrar.
 *
 * El problema que este archivo viene a corregir no es de estilo. La versión anterior pintaba
 * tarjetas de módulos "futuros" para Productos, Apartados y Reportes, que ya existen,
 * funcionan y están enrutados en App.jsx: le decía al usuario que la mitad del producto no
 * existía. La corrección es de datos. Lo que se muestra sale de la API o no se muestra.
 *
 * Decisiones de fondo, que conviene no deshacer sin pensarlas:
 *
 * 1. NADA SE INVENTA. Si un endpoint falla, ErrorState con reintento; si devuelve un array
 *    vacío, un EmptyState que invita a actuar. Un cero que no viene de la API es una
 *    mentira, y en la pantalla de inicio la mentira se nota más que en cualquier otra.
 *
 * 2. LA PRÓXIMA CITA MANDA. Es lo que el barbero abre el panel para ver y también lo que
 *    abre el cliente, así que se trata distinto al resto --filo de latón, superficie tintada,
 *    sombra elevada y la hora en 30px-- en lugar de ser una fila más de una lista. Después
 *    las métricas, después la lista. El orden de la pantalla es el orden de las preguntas.
 *
 * 3. ROL Y RUTAS NO SE TOCAN. App.jsx es la única fuente de verdad de quién entra a qué:
 *    /citas y /reportes son de admin y barbero, /clientes sólo de esos dos. Un enlace a una
 *    ruta que el rol no puede abrir es un 404 con apariencia de botón.
 *
 * 4. SIN HEX, SIN ESTILO INLINE, SIN EMOJI Y CON CLASES COMPLETAS. Las duraciones van como
 *    `duration-(--duration-fast)`: Tailwind v4 no expone `--duration-*` como namespace de
 *    utilidades, así que `duration-fast` compila a nada y el build pasa igual.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAgenda, getMyAppointments } from '../api/appointments';
import { getCitasPorDia } from '../api/reports';
// EstadoBadge es el Badge del sistema con el mapeo estado → tono, compartido con las dos
// agendas: así un mismo estado no puede salir de distinto color en tres pantallas.
import EstadoBadge from '../components/EstadoBadge';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import LoadingState from '../components/ui/LoadingState';
import PageHeader from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatPrice, formatTime, todayISO } from '../utils/format';

const ROLE_LABELS = {
  admin: 'Administrador',
  barbero: 'Barbero',
  cliente: 'Cliente',
};

/*
 * Acciones rápidas. Productos, Apartados y Reportes dejaron de ser tarjetas de futuro y son
 * enlaces de verdad: los tres módulos ya funcionan. Todas apuntan a rutas existentes y a las
 * que el rol de esta vista tiene acceso.
 */
const ACCIONES_STAFF = [
  {
    to: '/clientes',
    icon: 'users',
    titulo: 'Clientes',
    descripcion: 'Alta de clientes y ficha con su historial.',
  },
  {
    to: '/servicios',
    icon: 'scissors',
    titulo: 'Servicios',
    descripcion: 'Cortes, combos, precios y duración.',
  },
  {
    to: '/disponibilidad',
    icon: 'clock',
    titulo: 'Disponibilidad',
    descripcion: 'Horario semanal y fechas bloqueadas.',
  },
  {
    to: '/productos',
    icon: 'box',
    titulo: 'Productos',
    descripcion: 'Stock y precios de los productos de venta.',
  },
  {
    to: '/apartados',
    icon: 'tag',
    titulo: 'Apartados',
    descripcion: 'Productos apartados y sus abonos.',
  },
  {
    to: '/reportes',
    icon: 'chart',
    titulo: 'Reportes',
    descripcion: 'Citas por día y apartados activos.',
  },
];

// El cliente ve lo suyo y nada del negocio: ni facturación, ni carga de trabajo, ni stock. Los
// números del local no son un dato que el cliente le deba a nadie.
const ACCIONES_CLIENTE = [
  {
    to: '/servicios',
    icon: 'scissors',
    titulo: 'Servicios y precios',
    descripcion: 'Consultá cortes, combos y sus valores.',
  },
];

// Cifras de las métricas. Se eligen completas, no se arman por interpolación.
const CIFRA_CONTEO = 'text-3xl';
const CIFRA_MONTO = 'text-2xl';

/* Íconos: mismo trazo que el resto del proyecto (viewBox 24x24, fill none, stroke
 * currentColor, strokeWidth 1.5, remates redondeados) para que un ícono de 16px se vea igual
 * que uno de 20px. Todos decorativos: el texto de al lado ya dice qué es. */
function IconBox({ name, className }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.5',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    'aria-hidden': 'true',
  };

  if (name === 'scissors') {
    return (
      <svg {...common}>
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    );
  }

  if (name === 'clock') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }

  if (name === 'users') {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === 'box') {
    return (
      <svg {...common}>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="M3.27 6.96 12 12.01l8.73-5.05" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    );
  }

  if (name === 'tag') {
    return (
      <svg {...common}>
        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
        <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === 'calendar') {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

// "1 cita" / "3 citas". El plural mal calculado en un contador es de esos detalles que hacen
// que una pantalla se lea como hecha sin cuidado.
function conCantidad(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural}`;
}

function saludo() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

// "HH:MM" o "HH:MM:SS" -> minutos desde medianoche. Comparar en minutos y no armando un Date
// por fila: es un número, no una fecha, y no depende de cómo se interprete la zona horaria.
function minutosDe(hora) {
  const partes = String(hora ?? '').split(':');
  const valor = Number(partes[0]) * 60 + Number(partes[1]);
  return Number.isFinite(valor) ? valor : Number.NaN;
}

function minutosDeAhora() {
  const ahora = new Date();
  return ahora.getHours() * 60 + ahora.getMinutes();
}

// Las fechas llegan como 'YYYY-MM-DD', que ordenan bien comparadas como texto; la hora del día
// se resuelve en minutos. Así no hace falta construir un Date desde una hora suelta.
//
// Cancelada y completada quedan fuera a propósito: "próximo turno" significa que todavía hay que
// presentarse. Promover como upcoming una cita ya cancelada o ya cerrada sería mostrarle al
// cliente un turno al que no tiene que ir.
function esFutura(cita, hoy, ahora) {
  if (cita.estado === 'cancelada' || cita.estado === 'completada') return false;
  if (cita.fecha > hoy) return true;
  if (cita.fecha < hoy) return false;
  return minutosDe(cita.hora_inicio) > ahora;
}

function ordenarPorInicio(a, b) {
  if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1;
  return minutosDe(a.hora_inicio) - minutosDe(b.hora_inicio);
}

// El resumen viene de SUM(...) en MySQL y mysql2 lo entrega como DECIMAL, o sea como texto:
// sin Number() un "3" + 1 se concatena en lugar de sumarse.
function aNumero(valor) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : 0;
}

/*
 * Cada request se envuelve para que nunca rechace. Con Promise.all pelado, un 403 del reporte
 * descartaría también la agenda, que ya había llegado bien: una pantalla vacía por un dato
 * secundario que nadie necesita para ver su turno.
 */
function sinRechazo(promesa) {
  return promesa.then(
    (valor) => ({ valor, fallo: false }),
    () => ({ valor: null, fallo: true })
  );
}

/*
 * Enlace de texto. Existe para no repetir la misma combinación en cuatro puntos: sin
 * subrayado un enlace se lee como texto decorativo en un móvil, y el color por sí solo no
 * comunica que algo se pueda tocar. Sin flecha pegada al texto: eso es adorno de plantilla.
 */
function TextLink({ to, children, className = '' }) {
  return (
    <Link
      to={to}
      className={`text-sm font-medium text-brand underline decoration-brand-line underline-offset-4 transition-colors duration-(--duration-fast) ease-out hover:text-brand-deep hover:decoration-brand${
        className ? ` ${className}` : ''
      }`}
    >
      {children}
    </Link>
  );
}

/*
 * La cita que manda en la pantalla, y la razón por la que la pantalla existe. Se usa igual
 * para el turno del barbero y para la próxima cita del cliente porque en los dos casos es el
 * dato que la persona abrió el panel para ver. Por eso no comparte tratamiento con el resto:
 * filo de latón, superficie tintada, sombra elevada y la hora en 30px.
 *
 * `children` va en la columna derecha, debajo de la hora: estado, precio, lo que corresponda.
 */
function CitaDestacada({
  cita,
  etiqueta,
  tonoEtiqueta,
  titulo,
  subtitulo,
  conTelefono = false,
  children = null,
}) {
  return (
    <Card padding="lg" className="border-l-4 border-l-brass bg-brand-soft shadow-raised">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Badge tone={tonoEtiqueta}>{etiqueta}</Badge>

          <h2 className="mt-3 font-display text-xl text-ink">{titulo}</h2>
          <p className="mt-1 text-sm text-ink-muted">{subtitulo}</p>

          {conTelefono && cita.cliente_telefono && (
            <p className="mt-2 text-sm text-ink-muted">
              <span className="text-ink-subtle">Teléfono</span>{' '}
              <span className="tabular">{cita.cliente_telefono}</span>
            </p>
          )}

          {/* Las notas son lo único del turno que no aparece en ninguna otra pantalla del
              personal: las escribieron al reservar y hacen falta ahora. */}
          {cita.notas && <p className="mt-3 max-w-md text-sm text-ink-muted">{cita.notas}</p>}
        </div>

        <div className="shrink-0 sm:text-right">
          <p className={`font-semibold tabular text-ink ${CIFRA_CONTEO}`}>
            <time dateTime={`${cita.fecha}T${cita.hora_inicio}`}>
              {formatTime(cita.hora_inicio)}
            </time>
          </p>
          <p className="mt-1 text-sm text-ink-muted">hasta las {formatTime(cita.hora_fin)}</p>

          {children && (
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:justify-end">{children}</div>
          )}
        </div>
      </div>
    </Card>
  );
}

/*
 * Métrica del día. El número grande es el contenido de la tarjeta, no un adorno: es lo que se
 * mira de reojo al abrir el panel. La línea de abajo existe para que el número se pueda leer
 * --"de 6 citas", "de 09:00 a 20:00"-- y no quede como un número suelto.
 */
function Metrica({ etiqueta, valor, contexto, monto = false }) {
  return (
    <Card padding="sm">
      <p className="text-sm text-ink-muted">{etiqueta}</p>
      {/* El monto va un paso más abajo que los conteos a propósito: "₡1.250.000" son diez
          caracteres y a 30px no entra en la mitad de una pantalla de 360px. Un importe partido
          en dos renglones se lee peor que un importe un poco más chico. */}
      <p className={`mt-2 font-semibold tabular text-ink ${monto ? CIFRA_MONTO : CIFRA_CONTEO}`}>
        {valor}
      </p>
      <p className="mt-1 text-2xs text-ink-subtle">{contexto}</p>
    </Card>
  );
}

/*
 * Fila de cita compartida por la vista previa del personal y el historial del cliente: misma
 * estructura de tres columnas --cuándo, qué, estado-- para que las dos listas se lean igual.
 */
function FilaCita({ cuando, que, estado }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3 transition-colors duration-(--duration-fast) ease-out hover:bg-surface-sunken">
      <p className="shrink-0 text-sm tabular text-ink-muted">{cuando}</p>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{que}</p>
      <div className="flex shrink-0 items-center gap-3">{estado}</div>
    </li>
  );
}

/* Panel de destinos: una fila por sección, con ícono, título y qué se hace ahí. */
function PanelEnlaces({ titulo, acciones, className = '' }) {
  return (
    <Card padding="none" className={className}>
      <div className="px-5 pt-5 pb-3">
        <h2 className="font-display text-lg text-ink">{titulo}</h2>
      </div>

      <ul className="divide-y divide-line border-t border-line">
        {acciones.map((accion) => (
          <li key={accion.to}>
            <Link
              to={accion.to}
              className="flex min-h-11 items-center gap-3 px-5 py-3 transition-colors duration-(--duration-fast) ease-out hover:bg-surface-sunken"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-field bg-brand-soft text-brand"
              >
                <IconBox name={accion.icon} className="h-4 w-4" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-ink">{accion.titulo}</span>
                <span className="block text-sm text-ink-muted">{accion.descripcion}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/*
 * Vista del cliente. Componente aparte y no un `if` con un tramo largo dentro del principal:
 * el panel del personal no lo paga, y obliga a que esta lista diga de dónde saca sus datos.
 *
 * Ojo con el orden: /citas/mias devuelve todo el historial del cliente en descendente, así que
 * la próxima cita NO es el primer elemento de la respuesta: hay que buscar la primera que sea
 * futura. Tomar el primer elemento mostraría la cita más reciente, que casi siempre ya pasó.
 */
function VistaCliente({ hoy, ahora, citas }) {
  const proxima = [...citas].sort(ordenarPorInicio).find((cita) => esFutura(cita, hoy, ahora));

  // Historial: lo que ya se llevó, más lo que viene después de la cita destacada. Excluir la
  // destacada evita que el mismo turno aparezca dos veces en la misma pantalla.
  const historial = [...citas]
    .filter((cita) => !proxima || cita.id !== proxima.id)
    .sort((a, b) => -ordenarPorInicio(a, b))
    .slice(0, 4);

  return (
    <>
      {proxima ? (
        <CitaDestacada
          cita={proxima}
          etiqueta="Tu próximo turno"
          tonoEtiqueta="brand"
          titulo={proxima.servicio_nombre}
          subtitulo={`${formatDate(proxima.fecha)} · ${conCantidad(
            proxima.duracion_minutos,
            'minuto',
            'minutos'
          )}`}
        >
          <EstadoBadge estado={proxima.estado} />
          <span className="text-sm tabular text-ink-muted">
            {formatPrice(proxima.servicio_precio)}
          </span>
        </CitaDestacada>
      ) : (
        <Card padding="none">
          {historial.length > 0 ? (
            <EmptyState
              icon={<IconBox name="calendar" className="h-5 w-5" />}
              title="No tenés turnos agendados"
              description="Tus citas anteriores quedaron en el historial de más abajo."
              action={<TextLink to="/agenda">Reservar un turno</TextLink>}
            />
          ) : (
            <EmptyState
              icon={<IconBox name="calendar" className="h-5 w-5" />}
              title="Todavía no reservaste ningún turno"
              description="Elegí servicio, día y horario, y el turno queda reservado al momento."
              action={<TextLink to="/agenda">Reservar un turno</TextLink>}
            />
          )}
        </Card>
      )}

      {historial.length > 0 && (
        <section aria-labelledby="titulo-historial">
          <Card padding="none">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-5 pt-5 pb-3">
              <h2 id="titulo-historial" className="font-display text-lg text-ink">
                Tus últimas citas
              </h2>
              <TextLink to="/agenda" className="shrink-0">
                Ver mis citas en la agenda
              </TextLink>
            </div>

            <ul className="divide-y divide-line border-t border-line">
              {historial.map((cita) => (
                <FilaCita
                  key={cita.id}
                  cuando={`${formatDate(cita.fecha)} · ${formatTime(cita.hora_inicio)}`}
                  que={cita.servicio_nombre}
                  estado={
                    <>
                      <EstadoBadge estado={cita.estado} />
                      <span className="text-sm tabular text-ink-muted">
                        {formatPrice(cita.servicio_precio)}
                      </span>
                    </>
                  }
                />
              ))}
            </ul>
          </Card>
        </section>
      )}
    </>
  );
}

function Dashboard() {
  const { user } = useAuth();

  const esStaff = user?.rol === 'admin' || user?.rol === 'barbero';

  // Fecha local del navegador, no UTC: `new Date().toISOString().slice(0, 10)` se corre un día
  // en zonas como Argentina y el panel pediría la agenda de mañana mientras muestra la de hoy.
  const hoy = todayISO();
  const ahora = minutosDeAhora();

  const [citas, setCitas] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [resumenFallo, setResumenFallo] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    // Un flag de vigencia en vez de dejar escribir sobre un componente desmontado: cambiar de
    // cuenta sin recargar soltaba las dos respuestas tarde, y el panel nuevo se quedaba con los
    // datos del usuario anterior.
    let vigente = true;

    async function cargar() {
      // Admin y barbero necesitan dos fuentes: la agenda del día trae horas, clientes y
      // precios; el reporte trae la agregación del servidor. Van en paralelo para que la
      // pantalla no tarde el doble, y cada una resuelve su propio error.
      const [citasRes, resumenRes] = esStaff
        ? await Promise.all([
            sinRechazo(getAgenda(hoy)),
            sinRechazo(getCitasPorDia({ desde: hoy, hasta: hoy })),
          ])
        : // El cliente no entra a /citas ni a /reportes: ambos le devuelven 403.
          [await sinRechazo(getMyAppointments()), null];

      if (!vigente) return;

      setCitas(Array.isArray(citasRes?.valor) ? citasRes.valor : []);
      setError(Boolean(citasRes?.fallo));

      // `resumen` es un ARRAY y puede venir vacío, así que la fila de hoy es [0] o nada.
      setResumen(Array.isArray(resumenRes?.valor) ? (resumenRes.valor[0] ?? null) : null);
      setResumenFallo(Boolean(resumenRes?.fallo));

      setCargando(false);
    }

    cargar();

    return () => {
      vigente = false;
    };
  }, [esStaff, hoy, intento]);

  function reintentar() {
    setCargando(true);
    setError(false);
    setIntento((n) => n + 1);
  }

  const nombre = user?.nombre ?? '';
  const ordenadas = [...citas].sort(ordenarPorInicio);

  // El turno en curso: la única cita que de verdad importa ahora mismo. Se busca primero, y
  // sólo si no hay ninguna se muestra la próxima: las dos compiten por el mismo lugar de la
  // pantalla y ahí sólo cabe una.
  const enCurso = ordenadas.find(
    (cita) => minutosDe(cita.hora_inicio) <= ahora && minutosDe(cita.hora_fin) > ahora
  );
  const siguiente = ordenadas.find((cita) => esFutura(cita, hoy, ahora));
  const destacada = enCurso ?? siguiente ?? null;

  const hayAgenda = citas.length > 0;

  const pendientes = citas.filter((cita) => cita.estado === 'pendiente').length;
  const confirmadas = citas.filter((cita) => cita.estado === 'confirmada').length;
  const completadas = citas.filter((cita) => cita.estado === 'completada').length;
  const noCanceladas = citas.filter((cita) => cita.estado !== 'cancelada');
  const canceladas = citas.length - noCanceladas.length;

  // Suma de los precios listados de las citas que no están canceladas. NO es plata cobrada:
  // el modelo no registra pagos, así que llamarlo "ingresos" sería afirmar algo que los datos
  // no dicen. De ahí el nombre "Facturación estimada" y el contexto que aclara qué se suma.
  const facturacion = noCanceladas.reduce(
    (total, cita) => total + aNumero(cita.servicio_precio),
    0
  );

  const primera = ordenadas[0];
  const ultima = ordenadas[ordenadas.length - 1];
  const ventana = primera
    ? `De ${formatTime(primera.hora_inicio)} a ${formatTime(ultima.hora_fin)}`
    : '';

  const preview = ordenadas.slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${saludo()}, ${nombre}`}
        description={
          esStaff ? `${ROLE_LABELS[user?.rol]} · Hoy, ${formatDate(hoy)}` : `Hoy es ${formatDate(hoy)}`
        }
      />

      {cargando && (
        <LoadingState
          label={esStaff ? 'Cargando la agenda de hoy' : 'Cargando tus citas'}
          className="surface-card"
        />
      )}

      {!cargando && error && (
        <ErrorState
          title="No pudimos cargar las citas"
          message={
            esStaff
              ? 'La agenda de hoy no aparece en pantalla. Volvé a intentarlo en un momento.'
              : 'Tus citas no aparecen en pantalla. Volvé a intentarlo en un momento.'
          }
          onRetry={reintentar}
          className="surface-card"
        />
      )}

      {!cargando && !error && esStaff && (
        <>
          {/* 1. Lo que hay que saber antes que nada. */}
          {destacada ? (
            <CitaDestacada
              cita={destacada}
              etiqueta={enCurso ? 'Turno en curso' : 'Próximo turno'}
              tonoEtiqueta={enCurso ? 'success' : 'brand'}
              titulo={destacada.cliente_nombre}
              subtitulo={`${destacada.servicio_nombre} · ${conCantidad(
                destacada.duracion_minutos,
                'minuto',
                'minutos'
              )}`}
              conTelefono
            >
              <EstadoBadge estado={destacada.estado} />
            </CitaDestacada>
          ) : (
            <Card padding="none">
              {hayAgenda ? (
                <EmptyState
                  icon={<IconBox name="calendar" className="h-5 w-5" />}
                  title="No te quedan citas para hoy"
                  description="La agenda de hoy ya está recorrida. Mañana empieza de nuevo."
                  action={<TextLink to="/agenda">Abrir la agenda</TextLink>}
                />
              ) : (
                <EmptyState
                  icon={<IconBox name="calendar" className="h-5 w-5" />}
                  title="Hoy no hay citas en la agenda"
                  description="Cuando reserven un turno aparece acá, con su hora y su estado."
                  action={<TextLink to="/agenda">Abrir la agenda</TextLink>}
                />
              )}
            </Card>
          )}

          {/* 2. Las cuatro cifras del día. Con la agenda vacía no se muestran: cuatro ceros
              seguidos no informan nada y tapan el único mensaje que importa, que es que hoy no
              se agendó nada. */}
          {hayAgenda && (
            <section aria-labelledby="titulo-resumen">
              <h2 id="titulo-resumen" className="sr-only">
                Resumen del día
              </h2>

              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <Metrica etiqueta="Citas de hoy" valor={citas.length} contexto={ventana} />
                <Metrica
                  etiqueta="Por confirmar"
                  valor={pendientes}
                  contexto={`De ${conCantidad(citas.length, 'cita', 'citas')} en la agenda`}
                />
                <Metrica
                  etiqueta="Completadas"
                  valor={completadas}
                  contexto={
                    confirmadas > 0
                      ? `${conCantidad(confirmadas, 'confirmada', 'confirmadas')} por atender`
                      : 'Sin citas por atender'
                  }
                />
                <Metrica
                  etiqueta="Facturación estimada"
                  valor={formatPrice(facturacion)}
                  monto
                  contexto={`Precios listados de ${conCantidad(
                    noCanceladas.length,
                    'cita',
                    'citas'
                  )}${
                    canceladas > 0
                      ? ` · ${conCantidad(canceladas, 'cancelada', 'canceladas')} sin sumar`
                      : ''
                  }`}
                />
              </div>
            </section>
          )}

          {/* 3. La lista y, al costado, a dónde ir. */}
          {hayAgenda && (
            <div className="grid gap-4 xl:grid-cols-3">
              <Card padding="none" className="xl:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-5 pt-5 pb-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg text-ink">Agenda de hoy</h2>

                    {/* Desglose por estado según la agregación del servidor. Aporta lo que las
                        cuatro métricas no muestran --confirmadas y canceladas-- y si la fila no
                        viene no se inventa nada: el array puede volver vacío y `resumen` queda
                        en null. */}
                    {resumen && (
                      <p className="mt-0.5 text-sm text-ink-muted">
                        {conCantidad(aNumero(resumen.total), 'cita', 'citas')}:{' '}
                        {aNumero(resumen.pendientes)} pendientes ·{' '}
                        {aNumero(resumen.confirmadas)} confirmadas ·{' '}
                        {aNumero(resumen.completadas)} completadas ·{' '}
                        {aNumero(resumen.canceladas)} canceladas
                      </p>
                    )}

                    {resumenFallo && (
                      <p className="mt-0.5 text-sm text-ink-subtle">
                        El resumen del día no se pudo cargar.
                      </p>
                    )}
                  </div>

                  <TextLink to="/agenda" className="shrink-0">
                    Ver la agenda completa
                  </TextLink>
                </div>

                <ul className="divide-y divide-line border-t border-line">
                  {preview.map((cita) => (
                    <FilaCita
                      key={cita.id}
                      cuando={formatTime(cita.hora_inicio)}
                      que={
                        <>
                          {cita.cliente_nombre}{' '}
                          <span className="font-normal text-ink-muted">
                            · {cita.servicio_nombre}
                          </span>
                        </>
                      }
                      estado={<EstadoBadge estado={cita.estado} />}
                    />
                  ))}
                </ul>
              </Card>

              <PanelEnlaces titulo="Acciones rápidas" acciones={ACCIONES_STAFF} />
            </div>
          )}
        </>
      )}

      {!cargando && !error && !esStaff && (
        <>
          <VistaCliente hoy={hoy} ahora={ahora} citas={citas} />

          <PanelEnlaces titulo="Reservar y consultar" acciones={ACCIONES_CLIENTE} />
        </>
      )}
    </div>
  );
}

export default Dashboard;