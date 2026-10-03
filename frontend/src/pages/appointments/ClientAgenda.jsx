import { useEffect, useState } from 'react';
import { cancelAppointment, getMyAppointments } from '../../api/appointments';
import EstadoBadge from '../../components/EstadoBadge';
import BookingForm from './BookingForm';
import { formatDate, formatPrice, formatTime } from '../../utils/format';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';

function canCancel(cita) {
  if (!['pendiente', 'confirmada'].includes(cita.estado)) return false;
  return new Date(`${cita.fecha}T${cita.hora_inicio}`) > new Date();
}

/*
 * Pestañas de la vista. El cambio de contenido no navega, así que esto es un tablist de
 * verdad: `aria-selected` le dice al lector de pantalla cuál está viendo y `aria-controls`
 * a dónde va. Sólo con color, alguien con baja visión ve dos etiquetas grises y no sabe
 * cuál está activa.
 *
 * El filo activo va con `-mb-px` para pisar la línea del contenedor: sin eso hay dos
 * bordes apilados de 1px y la pestaña activa parece desalineada.
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

function MyAppointments() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelingId, setCancelingId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getMyAppointments();
      setCitas(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible cargar tus citas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleCancel(id) {
    if (!window.confirm('¿Cancelar esta cita?')) return;

    setCancelingId(id);
    try {
      await cancelAppointment(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible cancelar la cita');
    } finally {
      setCancelingId(null);
    }
  }

  if (loading) {
    return <LoadingState label="Cargando tus citas" />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p
          role="alert"
          className="rounded-field border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {citas.length === 0 && !error ? (
        <EmptyState
          title="Todavía no tenés citas reservadas"
          description="Elegí servicio, día y horario en la pestaña de arriba, y el turno queda reservado."
        />
      ) : (
        <ul className="divide-y divide-line">
          {citas.map((cita) => (
            <li
              key={cita.id}
              className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 py-4 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-base font-medium text-ink">{cita.servicio_nombre}</p>
                <p className="mt-0.5 text-sm tabular text-ink-muted">
                  {formatDate(cita.fecha)} · {formatTime(cita.hora_inicio)} -{' '}
                  {formatTime(cita.hora_fin)}
                </p>
                {cita.notas && <p className="mt-1 text-xs text-ink-muted">{cita.notas}</p>}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold tabular text-ink">
                  {formatPrice(cita.servicio_precio)}
                </p>
                <EstadoBadge estado={cita.estado} />

                {canCancel(cita) && (
                  <Button
                    variant="dangerGhost"
                    loading={cancelingId === cita.id}
                    onClick={() => handleCancel(cita.id)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ClientAgenda() {
  const [tab, setTab] = useState('reservar');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        description="Reservá tu turno o revisá las citas que ya tenés."
      />

      <Card padding="none">
        <div
          role="tablist"
          aria-label="Secciones de la agenda"
          className="flex gap-6 border-b border-line px-5 pt-2"
        >
          <TabButton id="reservar" active={tab === 'reservar'} onClick={() => setTab('reservar')}>
            Reservar turno
          </TabButton>
          <TabButton id="mis-citas" active={tab === 'mis-citas'} onClick={() => setTab('mis-citas')}>
            Mis citas
          </TabButton>
        </div>

        <div className="p-5">
          {tab === 'reservar' ? (
            <div role="tabpanel" id="panel-reservar" aria-labelledby="tab-reservar">
              <BookingForm onViewAppointments={() => setTab('mis-citas')} />
            </div>
          ) : (
            <div role="tabpanel" id="panel-mis-citas" aria-labelledby="tab-mis-citas">
              <MyAppointments />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default ClientAgenda;
