import { useEffect, useState } from 'react';
import { cancelAppointment, getMyAppointments } from '../../api/appointments';
import EstadoBadge from '../../components/EstadoBadge';
import BookingForm from './BookingForm';
import { formatDate, formatPrice, formatTime } from '../../utils/format';

function canCancel(cita) {
  if (!['pendiente', 'confirmada'].includes(cita.estado)) return false;
  return new Date(`${cita.fecha}T${cita.hora_inicio}`) > new Date();
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-1 pb-3 text-sm font-medium transition ${
        active
          ? 'border-gold-500 text-gold-400'
          : 'border-transparent text-neutral-500 hover:text-neutral-300'
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
    return <p className="text-sm text-neutral-500">Cargando...</p>;
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {citas.length === 0 ? (
        <p className="text-sm text-neutral-500">Todavía no tenés citas reservadas.</p>
      ) : (
        citas.map((cita) => (
          <div
            key={cita.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4"
          >
            <div>
              <p className="text-sm font-semibold text-neutral-100">{cita.servicio_nombre}</p>
              <p className="text-sm text-neutral-400">
                {formatDate(cita.fecha)} · {formatTime(cita.hora_inicio)} - {formatTime(cita.hora_fin)}
              </p>
              {cita.notas && <p className="mt-1 text-xs text-neutral-500">{cita.notas}</p>}
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-gold-500">
                {formatPrice(cita.servicio_precio)}
              </p>
              <EstadoBadge estado={cita.estado} />
              {canCancel(cita) && (
                <button
                  type="button"
                  onClick={() => handleCancel(cita.id)}
                  disabled={cancelingId === cita.id}
                  className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  {cancelingId === cita.id ? 'Cancelando...' : 'Cancelar'}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ClientAgenda() {
  const [tab, setTab] = useState('reservar');

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/40">
      <h2 className="mb-1 font-serif text-2xl tracking-wide text-gold-400">Agenda</h2>
      <p className="mb-4 text-sm text-neutral-400">Reservá tu turno o revisá tus citas.</p>

      <div className="mb-6 flex gap-6 border-b border-neutral-800">
        <TabButton active={tab === 'reservar'} onClick={() => setTab('reservar')}>
          Reservar turno
        </TabButton>
        <TabButton active={tab === 'mis-citas'} onClick={() => setTab('mis-citas')}>
          Mis citas
        </TabButton>
      </div>

      {tab === 'reservar' ? (
        <BookingForm onViewAppointments={() => setTab('mis-citas')} />
      ) : (
        <MyAppointments />
      )}
    </div>
  );
}

export default ClientAgenda;
