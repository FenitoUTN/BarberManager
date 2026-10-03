import { useEffect, useState } from 'react';
import { getServices } from '../../api/services';
import { getSlots } from '../../api/availability';
import { getClientOptions } from '../../api/clients';
import { bookAppointment } from '../../api/appointments';
import { formatPrice, formatTime, todayISO } from '../../utils/format';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';

/*
 * Reserva de turno. No renderiza una tarjeta: el que lo monta (Agenda) decide el contenedor,
 * porque la misma pieza se usa dentro de la vista del cliente y dentro de la del barbero.
 *
 * Dos decisiones que no son de estilo:
 *
 * 1. LOS HORARIOS SON BOTONES CON `aria-pressed`, NO ENLACES DE COLOR. Elegir hora es el
 *    único paso del formulario que no se puede hacer con teclado de sistema: el estado
 *    seleccionado se comunica por `aria-pressed` y por el filo, no sólo por el color.
 * 2. EL BOTÓN DE ENVIAR ESTÁ DESHABILITADO SIN HORARIO. Reservar sin hora elegida es un
 *    error que el servidor va a rechazar igual; no enviarlo ahorra el viaje y el mensaje.
 */
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
          const data = await getClientOptions();
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
      setSuccess('Cita reservada con éxito.');
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
          <Field label="Cliente" htmlFor="cliente">
            <Select id="cliente" value={clienteId} onChange={(event) => setClienteId(event.target.value)}>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nombre} · {client.telefono}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field label="Servicio" htmlFor="servicio">
          <Select id="servicio" value={servicioId} onChange={(event) => setServicioId(event.target.value)}>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.nombre} · {formatPrice(service.precio)} · {service.duracion_minutos} min
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Fecha" htmlFor="fecha">
          <Input
            id="fecha"
            type="date"
            min={todayISO()}
            value={fecha}
            onChange={(event) => setFecha(event.target.value)}
          />
        </Field>
      </div>

      {/*
        fieldset/legend y no un <p>: el grupo de horarios es un conjunto de controles con un
        nombre común, y eso es exactamente lo que el lector de pantalla necesita anunciar
        antes de empezar a leer horas.
      */}
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Horario disponible</legend>

        {loadingSlots && (
          <p role="status" aria-live="polite" className="text-sm text-ink-muted">
            Buscando horarios...
          </p>
        )}

        {!loadingSlots && slots.length === 0 && (
          <p className="text-sm text-ink-muted">
            No hay horarios disponibles para esa fecha. Probá con otro día.
          </p>
        )}

        {!loadingSlots && slots.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => {
              const seleccionada = horaInicio === slot;

              return (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={seleccionada}
                  onClick={() => setHoraInicio(slot)}
                  className={`inline-flex min-h-11 items-center rounded-field border px-4 text-sm font-medium tabular transition-[background-color,border-color,color] duration-(--duration-fast) ease-out ${
                    seleccionada
                      ? 'border-brand bg-brand-soft font-semibold text-brand'
                      : 'border-line-strong bg-surface text-ink hover:border-brand hover:text-brand'
                  }`}
                >
                  {formatTime(slot)}
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      <Field label="Notas (opcional)" htmlFor="notas">
        <Textarea
          id="notas"
          rows={3}
          maxLength={255}
          value={notas}
          onChange={(event) => setNotas(event.target.value)}
          placeholder="Indicaciones para el barbero"
        />
      </Field>

      {error && (
        <p
          role="alert"
          className="rounded-field border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {success && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-field border border-success/30 bg-success-soft px-3 py-2 text-sm text-success"
        >
          <span>{success}</span>
          {onViewAppointments && (
            <button
              type="button"
              onClick={onViewAppointments}
              className="min-h-11 cursor-pointer font-semibold hover:underline"
            >
              Ver mis citas
            </button>
          )}
        </div>
      )}

      <Button type="submit" loading={submitting} disabled={!horaInicio}>
        Reservar turno
      </Button>
    </form>
  );
}

export default BookingForm;
