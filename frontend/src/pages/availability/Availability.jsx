import { useEffect, useState } from 'react';
import {
  createException,
  deleteException,
  getExceptions,
  getWeeklySchedule,
  updateWeeklySchedule,
} from '../../api/availability';
import { formatDate, todayISO } from '../../utils/format';

const DAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const TIPO_LABELS = {
  bloqueo: 'Bloqueo',
  extra: 'Horario extra',
};

function buildSchedule(existing) {
  return Array.from({ length: 7 }, (_, dia) => {
    const found = existing.find((item) => item.dia_semana === dia);
    return {
      dia_semana: dia,
      hora_inicio: found?.hora_inicio?.slice(0, 5) || '09:00',
      hora_fin: found?.hora_fin?.slice(0, 5) || '18:00',
      activo: found ? Boolean(found.activo) : false,
    };
  });
}

function WeeklySchedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getWeeklySchedule();
        setSchedule(buildSchedule(data));
      } catch (err) {
        setError(err.response?.data?.message || 'No fue posible cargar el horario');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function updateDay(dia, changes) {
    setSchedule((prev) =>
      prev.map((item) => (item.dia_semana === dia ? { ...item, ...changes } : item))
    );
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const data = await updateWeeklySchedule(schedule);
      setSchedule(buildSchedule(data));
      setSuccess('Horario actualizado correctamente');
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'No fue posible guardar el horario';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-500">
              <th className="py-2 pr-4 font-medium">Día</th>
              <th className="py-2 pr-4 font-medium">Abierto</th>
              <th className="py-2 pr-4 font-medium">Desde</th>
              <th className="py-2 pr-4 font-medium">Hasta</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((day) => (
              <tr key={day.dia_semana} className="border-b border-neutral-800/60">
                <td className="py-2 pr-4 font-medium text-neutral-100">
                  {DAY_LABELS[day.dia_semana]}
                </td>
                <td className="py-2 pr-4">
                  <input
                    type="checkbox"
                    checked={day.activo}
                    onChange={(event) => updateDay(day.dia_semana, { activo: event.target.checked })}
                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-gold-500 accent-gold-500 focus:ring-gold-500/30"
                  />
                </td>
                <td className="py-2 pr-4">
                  <input
                    type="time"
                    value={day.hora_inicio}
                    disabled={!day.activo}
                    onChange={(event) => updateDay(day.dia_semana, { hora_inicio: event.target.value })}
                    className="rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-white outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 disabled:opacity-40"
                  />
                </td>
                <td className="py-2 pr-4">
                  <input
                    type="time"
                    value={day.hora_fin}
                    disabled={!day.activo}
                    onChange={(event) => updateDay(day.dia_semana, { hora_fin: event.target.value })}
                    className="rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1.5 text-sm text-white outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 disabled:opacity-40"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          {success}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-gold-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gold-600/30 transition hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? 'Guardando...' : 'Guardar horario'}
      </button>
    </div>
  );
}

function Exceptions() {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({
    fecha: todayISO(),
    hora_inicio: '08:00',
    hora_fin: '12:00',
    tipo: 'bloqueo',
    motivo: '',
  });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getExceptions({ desde: todayISO() });
      setExceptions(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible cargar las excepciones');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const { citasCanceladas } = await createException(form);
      setForm((prev) => ({ ...prev, motivo: '' }));
      if (citasCanceladas > 0) {
        setSuccess(
          `Bloqueo agregado. Se cancelaron ${citasCanceladas} cita(s) y se notificó a los clientes.`
        );
      }
      await load();
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'No fue posible crear la excepción';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar esta excepción?')) return;

    setDeletingId(id);
    try {
      await deleteException(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible eliminar la excepción');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <label htmlFor="exc-fecha" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Fecha
          </label>
          <input
            id="exc-fecha"
            name="fecha"
            type="date"
            min={todayISO()}
            value={form.fecha}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
          />
        </div>
        <div>
          <label htmlFor="exc-inicio" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Desde
          </label>
          <input
            id="exc-inicio"
            name="hora_inicio"
            type="time"
            value={form.hora_inicio}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
          />
        </div>
        <div>
          <label htmlFor="exc-fin" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Hasta
          </label>
          <input
            id="exc-fin"
            name="hora_fin"
            type="time"
            value={form.hora_fin}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
          />
        </div>
        <div>
          <label htmlFor="exc-tipo" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Tipo
          </label>
          <select
            id="exc-tipo"
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
          >
            <option value="bloqueo">Bloqueo</option>
            <option value="extra">Horario extra</option>
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor="exc-motivo" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Motivo (opcional)
          </label>
          <input
            id="exc-motivo"
            name="motivo"
            type="text"
            maxLength={255}
            value={form.motivo}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
            placeholder="Vacaciones, feriado..."
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-gold-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gold-600/30 transition hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </form>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          {success}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando...</p>
      ) : exceptions.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay excepciones próximas registradas.</p>
      ) : (
        <div className="space-y-2">
          {exceptions.map((exception) => (
            <div
              key={exception.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-3"
            >
              <div>
                <p className="text-sm font-medium text-neutral-100">
                  {formatDate(exception.fecha)} · {exception.hora_inicio?.slice(0, 5)} -{' '}
                  {exception.hora_fin?.slice(0, 5)}
                </p>
                <p className="text-xs text-neutral-500">
                  {TIPO_LABELS[exception.tipo] || exception.tipo}
                  {exception.motivo ? ` · ${exception.motivo}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(exception.id)}
                disabled={deletingId === exception.id}
                className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
              >
                {deletingId === exception.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Availability() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/40">
        <h2 className="mb-1 font-serif text-2xl tracking-wide text-gold-400">Horario semanal</h2>
        <p className="mb-4 text-sm text-neutral-400">
          Definí los días y horas en que el local atiende.
        </p>
        <WeeklySchedule />
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/40">
        <h2 className="mb-1 font-serif text-2xl tracking-wide text-gold-400">Excepciones</h2>
        <p className="mb-4 text-sm text-neutral-400">
          Agregá bloqueos (vacaciones, feriados) u horarios extra puntuales.
        </p>
        <Exceptions />
      </div>
    </div>
  );
}

export default Availability;
