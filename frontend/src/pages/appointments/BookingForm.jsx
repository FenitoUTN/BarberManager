import { useEffect, useState } from 'react';
import { getServices } from '../../api/services';
import { getSlots } from '../../api/availability';
import { getClients } from '../../api/clients';
import { bookAppointment } from '../../api/appointments';
import { formatPrice, formatTime, todayISO } from '../../utils/format';

function BookingForm({ showClientSelect = false, onBooked, onViewAppointments }) {
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [servicioId, setServicioId] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [fecha, setFecha] = useState(todayISO());
  const [slots, setSlots] = useState([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [notas, setNotas] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadOptions() {
      try {
        const data = await getServices();
        setServices(data);
        if (data.length > 0) setServicioId(String(data[0].id));
      } catch (err) {
        setError(err.response?.data?.message || 'No fue posible cargar los servicios');
      }

      if (showClientSelect) {
        try {
          const data = await getClients();
          setClients(data);
          if (data.length > 0) setClienteId(String(data[0].id));
        } catch (err) {
          setError(err.response?.data?.message || 'No fue posible cargar los clientes');
        }
      }
    }

    loadOptions();
  }, [showClientSelect]);

  useEffect(() => {
    if (!servicioId || !fecha) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHoraInicio('');
    setSlots([]);
    setLoadingSlots(true);
    setError('');

    getSlots(fecha, servicioId)
      .then(setSlots)
      .catch((err) =>
        setError(err.response?.data?.message || 'No fue posible cargar los horarios disponibles')
      )
      .finally(() => setLoadingSlots(false));
  }, [servicioId, fecha]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!horaInicio) {
      setError('Seleccioná un horario disponible');
      return;
    }

    if (showClientSelect && !clienteId) {
      setError('Seleccioná un cliente');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        servicio_id: Number(servicioId),
        fecha,
        hora_inicio: horaInicio,
        notas: notas || undefined,
      };
      if (showClientSelect) {
        payload.cliente_id = Number(clienteId);
      }

      await bookAppointment(payload);
      setSuccess('¡Cita reservada con éxito!');
      setNotas('');
      setHoraInicio('');
      setSlots((prev) => prev.filter((slot) => slot !== horaInicio));
      onBooked?.();
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'No fue posible reservar la cita';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {showClientSelect && (
          <div>
            <label htmlFor="cliente" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Cliente
            </label>
            <select
              id="cliente"
              value={clienteId}
              onChange={(event) => setClienteId(event.target.value)}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nombre} · {client.telefono}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="servicio" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Servicio
          </label>
          <select
            id="servicio"
            value={servicioId}
            onChange={(event) => setServicioId(event.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.nombre} · {formatPrice(service.precio)} · {service.duracion_minutos} min
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fecha" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Fecha
          </label>
          <input
            id="fecha"
            type="date"
            min={todayISO()}
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
          />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-neutral-300">Horario disponible</p>
        {loadingSlots ? (
          <p className="text-sm text-neutral-500">Buscando horarios...</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-neutral-500">No hay horarios disponibles para esa fecha.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setHoraInicio(slot)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  horaInicio === slot
                    ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                    : 'border-neutral-700 text-neutral-300 hover:border-orange-500/50 hover:text-orange-400'
                }`}
              >
                {formatTime(slot)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="notas" className="mb-1.5 block text-sm font-medium text-neutral-300">
          Notas (opcional)
        </label>
        <textarea
          id="notas"
          rows={3}
          maxLength={255}
          value={notas}
          onChange={(event) => setNotas(event.target.value)}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
          placeholder="Indicaciones para el barbero"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {success && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          <span>{success}</span>
          {onViewAppointments && (
            <button
              type="button"
              onClick={onViewAppointments}
              className="font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Ver mis citas →
            </button>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !horaInicio}
        className="w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
      >
        {submitting ? 'Reservando...' : 'Reservar turno'}
      </button>
    </form>
  );
}

export default BookingForm;
