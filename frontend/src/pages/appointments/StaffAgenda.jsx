import { useEffect, useState } from 'react';
import { getAgenda, getAppointmentHistory, updateAppointmentStatus } from '../../api/appointments';
import EstadoBadge, { ESTADO_LABELS } from '../../components/EstadoBadge';
import BookingForm from './BookingForm';
import Pagination from '../../components/Pagination';
import { formatDate, formatPrice, formatTime, todayISO } from '../../utils/format';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Field from '../../components/ui/Field';
import Input from '../../components/ui/Input';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';
import Select from '../../components/ui/Select';

const PAGE_SIZE = 20;

/*
 * Pestañas de la agenda. El cambio de contenido no navega, así que esto es un tablist de
 * verdad: `aria-selected` le dice al lector de pantalla cuál se está viendo y `aria-controls`
 * a dónde apunta. Sólo con color, alguien con baja visión ve tres etiquetas y no sabe cuál
 * está activa.
 *
 * El filo activo va con `-mb-px` para pisar la línea del contenedor: sin eso hay dos bordes
 * apilados de 1px y la pestaña activa queda desalineada.
 */
function TabButton({ id, active, onClick, children }) {
  return (
    <button
      id={`tab-${id}`}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={`panel-${id}`}
      onClick={onClick}
      className={`-mb-px min-h-11 border-b-2 px-1 text-sm font-medium transition-[border-color,color] duration-(--duration-fast) ease-out ${
        active
          ? 'border-brand font-semibold text-brand'
          : 'border-transparent text-ink-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}

const TH = 'px-5 py-3 text-left text-xs font-medium text-ink-subtle';

function TodayAgenda() {
  const [fecha, setFecha] = useState(todayISO());
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getAgenda(fecha);
      setCitas(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible cargar la agenda');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  async function handleEstado(id, estado) {
    setUpdatingId(id);
    try {
      await updateAppointmentStatus(id, estado);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible actualizar la cita');
    } finally {
      setUpdatingId(null);
    }
  }

  const falloDeCarga = Boolean(error) && citas.length === 0;

  return (
    <div className="space-y-4">
      <Field label="Fecha" htmlFor="fecha-agenda" className="w-full sm:w-56">
        <Input
          id="fecha-agenda"
          type="date"
          value={fecha}
          onChange={(event) => setFecha(event.target.value)}
        />
      </Field>

      {error && !falloDeCarga && (
        <p
          role="alert"
          className="rounded-field border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {loading && <LoadingState label="Cargando la agenda del día" />}

      {!loading && falloDeCarga && (
        <ErrorState
          title="No pudimos cargar la agenda"
          message="Las citas de ese día no aparecen en pantalla. Vuelve a intentarlo en un momento."
          onRetry={load}
        />
      )}

      {!loading && !falloDeCarga && citas.length === 0 && (
        <EmptyState
          title="No hay citas para este día"
          description="Cambiá la fecha de arriba, o reservá una nueva en la pestaña Nueva cita."
        />
      )}

      {!loading && !falloDeCarga && citas.length > 0 && (
        <ul className="divide-y divide-line">
          {citas.map((cita) => (
            <li
              key={cita.id}
              className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 py-4 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-base font-medium tabular text-ink">
                  {formatTime(cita.hora_inicio)} - {formatTime(cita.hora_fin)} ·{' '}
                  {cita.servicio_nombre}
                </p>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {cita.cliente_nombre} · <span className="tabular">{cita.cliente_telefono}</span>
                </p>
                {cita.notas && <p className="mt-1 text-xs text-ink-muted">{cita.notas}</p>}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <p className="mr-1 text-sm font-semibold tabular text-ink">
                  {formatPrice(cita.servicio_precio)}
                </p>
                <EstadoBadge estado={cita.estado} />

                {cita.estado === 'pendiente' && (
                  <>
                    <Button
                      disabled={updatingId === cita.id}
                      onClick={() => handleEstado(cita.id, 'confirmada')}
                    >
                      Confirmar
                    </Button>
                    <Button
                      variant="dangerGhost"
                      disabled={updatingId === cita.id}
                      onClick={() => handleEstado(cita.id, 'cancelada')}
                    >
                      Cancelar
                    </Button>
                  </>
                )}

                {cita.estado === 'confirmada' && (
                  <>
                    <Button
                      disabled={updatingId === cita.id}
                      onClick={() => handleEstado(cita.id, 'completada')}
                    >
                      Completar
                    </Button>
                    <Button
                      variant="dangerGhost"
                      disabled={updatingId === cita.id}
                      onClick={() => handleEstado(cita.id, 'cancelada')}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function History() {
  const [filters, setFilters] = useState({ desde: '', hasta: '', estado: '' });
  const [citas, setCitas] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  function handleChange(event) {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function search(page = 1) {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const params = { page, pageSize: PAGE_SIZE };
      if (filters.desde) params.desde = filters.desde;
      if (filters.hasta) params.hasta = filters.hasta;
      if (filters.estado) params.estado = filters.estado;

      const data = await getAppointmentHistory(params);
      setCitas(data.citas);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible cargar el historial');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    search(1);
  }

  const falloDeCarga = Boolean(error) && !searched;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <Field label="Desde" htmlFor="desde" className="w-full sm:w-44">
          <Input
            id="desde"
            name="desde"
            type="date"
            value={filters.desde}
            onChange={handleChange}
          />
        </Field>

        <Field label="Hasta" htmlFor="hasta" className="w-full sm:w-44">
          <Input
            id="hasta"
            name="hasta"
            type="date"
            value={filters.hasta}
            onChange={handleChange}
          />
        </Field>

        <Field label="Estado" htmlFor="estado" className="w-full sm:w-48">
          <Select
            id="estado"
            name="estado"
            value={filters.estado}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            {Object.entries(ESTADO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Button type="submit" loading={loading}>
          Buscar
        </Button>
      </form>

      {error && !falloDeCarga && (
        <p
          role="alert"
          className="rounded-field border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {!loading && falloDeCarga && (
        <ErrorState
          title="No pudimos cargar el historial"
          message="La búsqueda no se pudo completar. Vuelve a intentarlo en un momento."
          onRetry={() => search(1)}
        />
      )}

      {!loading && !falloDeCarga && searched && (
        citas.length === 0 ? (
          <Card padding="none">
            <EmptyState
              title="No se encontraron citas con esos filtros"
              description="Ampliá el rango de fechas o quitá el filtro de estado."
            />
          </Card>
        ) : (
          // Tarjeta propia para que la paginación quede al pie del bloque y no flotando en
          // el aire: su separador superior es un borde de la tarjeta, no una línea suelta.
          // Va fuera del `overflow-x-auto`, así el pie no se desplaza con las columnas.
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className={TH}>
                      Fecha
                    </th>
                    <th scope="col" className={TH}>
                      Hora
                    </th>
                    <th scope="col" className={TH}>
                      Cliente
                    </th>
                    <th scope="col" className={TH}>
                      Servicio
                    </th>
                    <th scope="col" className={TH}>
                      Precio
                    </th>
                    <th scope="col" className={TH}>
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((cita) => (
                    <tr
                      key={cita.id}
                      className="border-b border-line transition-colors duration-(--duration-fast) last:border-b-0 hover:bg-surface-sunken/70"
                    >
                      <td className="px-5 py-3 tabular text-ink">{formatDate(cita.fecha)}</td>
                      <td className="px-5 py-3 tabular text-ink-muted">
                        {formatTime(cita.hora_inicio)} - {formatTime(cita.hora_fin)}
                      </td>
                      <td className="px-5 py-3 font-medium text-ink">{cita.cliente_nombre}</td>
                      <td className="px-5 py-3 text-ink-muted">{cita.servicio_nombre}</td>
                      <td className="px-5 py-3 font-semibold tabular text-ink">
                        {formatPrice(cita.servicio_precio)}
                      </td>
                      <td className="px-5 py-3">
                        <EstadoBadge estado={cita.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={search}
            />
          </Card>
        )
      )}
    </div>
  );
}

function StaffAgenda() {
  const [tab, setTab] = useState('hoy');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        description="Gestioná las citas del día, el historial y nuevas reservas."
      />

      <Card padding="none">
        <div
          role="tablist"
          aria-label="Secciones de la agenda"
          className="flex flex-wrap gap-6 border-b border-line px-5 pt-2"
        >
          <TabButton id="hoy" active={tab === 'hoy'} onClick={() => setTab('hoy')}>
            Agenda del día
          </TabButton>
          <TabButton id="historial" active={tab === 'historial'} onClick={() => setTab('historial')}>
            Historial
          </TabButton>
          <TabButton id="nueva" active={tab === 'nueva'} onClick={() => setTab('nueva')}>
            Nueva cita
          </TabButton>
        </div>

        <div className="p-5">
          {tab === 'hoy' && (
            <div role="tabpanel" id="panel-hoy" aria-labelledby="tab-hoy">
              <TodayAgenda />
            </div>
          )}
          {tab === 'historial' && (
            <div role="tabpanel" id="panel-historial" aria-labelledby="tab-historial">
              <History />
            </div>
          )}
          {tab === 'nueva' && (
            <div role="tabpanel" id="panel-nueva" aria-labelledby="tab-nueva">
              <BookingForm showClientSelect onBooked={() => setTab('hoy')} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default StaffAgenda;
