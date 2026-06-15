import { useEffect, useState } from 'react';
import { getAgenda, getAppointmentHistory, updateAppointmentStatus } from '../../api/appointments';
import EstadoBadge, { ESTADO_LABELS } from '../../components/EstadoBadge';
import BookingForm from './BookingForm';
import { formatDate, formatPrice, formatTime, todayISO } from '../../utils/format';

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-1 pb-3 text-sm font-medium transition ${
        active
          ? 'border-orange-500 text-orange-400'
          : 'border-transparent text-neutral-500 hover:text-neutral-300'
      }`}
    >
      {children}
    </button>
  );
}

function ActionButton({ onClick, disabled, tone, children }) {
  const tones = {
    orange: 'border-orange-500/40 text-orange-400 hover:bg-orange-500/10',
    emerald: 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10',
    red: 'border-red-500/40 text-red-400 hover:bg-red-500/10',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

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

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="fecha-agenda" className="mb-1.5 block text-sm font-medium text-neutral-300">
          Fecha
        </label>
        <input
          id="fecha-agenda"
          type="date"
          value={fecha}
          onChange={(event) => setFecha(event.target.value)}
          className="w-full max-w-xs rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando...</p>
      ) : citas.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay citas para este día.</p>
      ) : (
        <div className="space-y-3">
          {citas.map((cita) => (
            <div
              key={cita.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-neutral-100">
                  {formatTime(cita.hora_inicio)} - {formatTime(cita.hora_fin)} · {cita.servicio_nombre}
                </p>
                <p className="text-sm text-neutral-400">
                  {cita.cliente_nombre} · {cita.cliente_telefono}
                </p>
                {cita.notas && <p className="mt-1 text-xs text-neutral-500">{cita.notas}</p>}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-orange-500">
                  {formatPrice(cita.servicio_precio)}
                </p>
                <EstadoBadge estado={cita.estado} />
                {cita.estado === 'pendiente' && (
                  <>
                    <ActionButton
                      tone="emerald"
                      disabled={updatingId === cita.id}
                      onClick={() => handleEstado(cita.id, 'confirmada')}
                    >
                      Confirmar
                    </ActionButton>
                    <ActionButton
                      tone="red"
                      disabled={updatingId === cita.id}
                      onClick={() => handleEstado(cita.id, 'cancelada')}
                    >
                      Cancelar
                    </ActionButton>
                  </>
                )}
                {cita.estado === 'confirmada' && (
                  <>
                    <ActionButton
                      tone="emerald"
                      disabled={updatingId === cita.id}
                      onClick={() => handleEstado(cita.id, 'completada')}
                    >
                      Completar
                    </ActionButton>
                    <ActionButton
                      tone="red"
                      disabled={updatingId === cita.id}
                      onClick={() => handleEstado(cita.id, 'cancelada')}
                    >
                      Cancelar
                    </ActionButton>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function History() {
  const [filters, setFilters] = useState({ desde: '', hasta: '', estado: '' });
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  function handleChange(event) {
    setFilters((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const params = {};
      if (filters.desde) params.desde = filters.desde;
      if (filters.hasta) params.hasta = filters.hasta;
      if (filters.estado) params.estado = filters.estado;

      const data = await getAppointmentHistory(params);
      setCitas(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible cargar el historial');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="desde" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Desde
          </label>
          <input
            id="desde"
            name="desde"
            type="date"
            value={filters.desde}
            onChange={handleChange}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
          />
        </div>
        <div>
          <label htmlFor="hasta" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Hasta
          </label>
          <input
            id="hasta"
            name="hasta"
            type="date"
            value={filters.hasta}
            onChange={handleChange}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
          />
        </div>
        <div>
          <label htmlFor="estado" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            value={filters.estado}
            onChange={handleChange}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
          >
            <option value="">Todos</option>
            {Object.entries(ESTADO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500 disabled:opacity-50"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {!loading && searched && (
        citas.length === 0 ? (
          <p className="text-sm text-neutral-500">No se encontraron citas con esos filtros.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500">
                  <th className="py-2 pr-4 font-medium">Fecha</th>
                  <th className="py-2 pr-4 font-medium">Hora</th>
                  <th className="py-2 pr-4 font-medium">Cliente</th>
                  <th className="py-2 pr-4 font-medium">Servicio</th>
                  <th className="py-2 pr-4 font-medium">Precio</th>
                  <th className="py-2 pr-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {citas.map((cita) => (
                  <tr key={cita.id} className="border-b border-neutral-800/60">
                    <td className="py-2 pr-4 text-neutral-100">{formatDate(cita.fecha)}</td>
                    <td className="py-2 pr-4 text-neutral-400">
                      {formatTime(cita.hora_inicio)} - {formatTime(cita.hora_fin)}
                    </td>
                    <td className="py-2 pr-4 text-neutral-100">{cita.cliente_nombre}</td>
                    <td className="py-2 pr-4 text-neutral-400">{cita.servicio_nombre}</td>
                    <td className="py-2 pr-4 text-orange-500">{formatPrice(cita.servicio_precio)}</td>
                    <td className="py-2 pr-4">
                      <EstadoBadge estado={cita.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

function StaffAgenda() {
  const [tab, setTab] = useState('hoy');

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/40">
      <h2 className="mb-1 text-xl font-bold text-white">Agenda</h2>
      <p className="mb-4 text-sm text-neutral-400">
        Gestioná las citas del día, el historial y nuevas reservas.
      </p>

      <div className="mb-6 flex gap-6 border-b border-neutral-800">
        <TabButton active={tab === 'hoy'} onClick={() => setTab('hoy')}>
          Agenda del día
        </TabButton>
        <TabButton active={tab === 'historial'} onClick={() => setTab('historial')}>
          Historial
        </TabButton>
        <TabButton active={tab === 'nueva'} onClick={() => setTab('nueva')}>
          Nueva cita
        </TabButton>
      </div>

      {tab === 'hoy' && <TodayAgenda />}
      {tab === 'historial' && <History />}
      {tab === 'nueva' && <BookingForm showClientSelect onBooked={() => setTab('hoy')} />}
    </div>
  );
}

export default StaffAgenda;
