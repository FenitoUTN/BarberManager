import { useEffect, useState } from 'react';
import {
  createException,
  deleteException,
  getExceptions,
  getWeeklySchedule,
  updateWeeklySchedule,
} from '../../api/availability';
import { formatDate, todayISO } from '../../utils/format';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Field from '../../components/ui/Field';
import Input from '../../components/ui/Input';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';
import Select from '../../components/ui/Select';

const DAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const TIPO_LABELS = {
  bloqueo: 'Bloqueo',
  extra: 'Horario extra',
};

const TH = 'px-5 py-3 text-left text-xs font-medium text-ink-subtle';

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
  // Reintento de la carga inicial: sin contador el efecto no vuelve a dispararse.
  const [intento, setIntento] = useState(0);

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
  }, [intento]);

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
      setSuccess('Horario actualizado.');
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
    return <LoadingState label="Cargando el horario semanal" />;
  }

  if (!loading && error && schedule.length === 0) {
    return (
      <ErrorState
        title="No pudimos cargar el horario"
        message="La grilla semanal no aparece en pantalla. Vuelve a intentarlo en un momento."
        onRetry={() => setIntento((n) => n + 1)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Horario semanal de atención: por día, si está abierto, y la hora de apertura y cierre.
          </caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className={TH}>
                Día
              </th>
              <th scope="col" className={TH}>
                Abierto
              </th>
              <th scope="col" className={TH}>
                Desde
              </th>
              <th scope="col" className={TH}>
                Hasta
              </th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((day) => (
              <tr
                key={day.dia_semana}
                className="border-b border-line transition-colors duration-(--duration-fast) last:border-b-0 hover:bg-surface-sunken/70"
              >
                <td className="px-5 py-3 font-medium text-ink">{DAY_LABELS[day.dia_semana]}</td>
                <td className="px-5 py-3">
                  {/*
                    El label envolvente lleva el target: con sólo el checkbox de 20px hay que
                    apuntarle a un cuadradito, y en un celular eso se convierte en un toque
                    fallido. El texto además hace que el estado se lea sin ver el color.
                  */}
                  <label className="-m-2.5 flex min-h-11 cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={day.activo}
                      onChange={(event) => updateDay(day.dia_semana, { activo: event.target.checked })}
                      className="h-5 w-5 shrink-0 cursor-pointer rounded-xs border border-ink-subtle accent-brand"
                    />
                    <span className="text-sm text-ink-muted">
                      {day.activo ? 'Abierto' : 'Cerrado'}
                    </span>
                  </label>
                </td>
                <td className="px-5 py-3">
                  <Input
                    type="time"
                    aria-label={`Hora de apertura del ${DAY_LABELS[day.dia_semana]}`}
                    value={day.hora_inicio}
                    disabled={!day.activo}
                    onChange={(event) => updateDay(day.dia_semana, { hora_inicio: event.target.value })}
                    className="w-36"
                  />
                </td>
                <td className="px-5 py-3">
                  <Input
                    type="time"
                    aria-label={`Hora de cierre del ${DAY_LABELS[day.dia_semana]}`}
                    value={day.hora_fin}
                    disabled={!day.activo}
                    onChange={(event) => updateDay(day.dia_semana, { hora_fin: event.target.value })}
                    className="w-36"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && schedule.length > 0 && (
        <p
          role="alert"
          className="rounded-field border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="rounded-field border border-success/30 bg-success-soft px-3 py-2 text-sm text-success"
        >
          {success}
        </p>
      )}

      <Button onClick={handleSave} loading={saving}>
        Guardar horario
      </Button>
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
  const [intento, setIntento] = useState(0);
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
  }, [intento]);

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

  const falloDeCarga = Boolean(error) && !loading && exceptions.length === 0;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Field label="Fecha" htmlFor="exc-fecha" className="lg:col-span-1">
          <Input
            id="exc-fecha"
            name="fecha"
            type="date"
            min={todayISO()}
            value={form.fecha}
            onChange={handleChange}
          />
        </Field>

        <Field label="Desde" htmlFor="exc-inicio">
          <Input
            id="exc-inicio"
            name="hora_inicio"
            type="time"
            value={form.hora_inicio}
            onChange={handleChange}
          />
        </Field>

        <Field label="Hasta" htmlFor="exc-fin">
          <Input
            id="exc-fin"
            name="hora_fin"
            type="time"
            value={form.hora_fin}
            onChange={handleChange}
          />
        </Field>

        <Field label="Tipo" htmlFor="exc-tipo">
          <Select id="exc-tipo" name="tipo" value={form.tipo} onChange={handleChange}>
            <option value="bloqueo">Bloqueo</option>
            <option value="extra">Horario extra</option>
          </Select>
        </Field>

        <Field label="Motivo (opcional)" htmlFor="exc-motivo" className="sm:col-span-2 lg:col-span-1">
          <Input
            id="exc-motivo"
            name="motivo"
            type="text"
            maxLength={255}
            value={form.motivo}
            onChange={handleChange}
            placeholder="Vacaciones, feriado..."
          />
        </Field>

        <div className="flex items-end">
          <Button type="submit" loading={submitting} fullWidth>
            Agregar
          </Button>
        </div>
      </form>

      {error && !falloDeCarga && (
        <p
          role="alert"
          className="rounded-field border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="rounded-field border border-success/30 bg-success-soft px-3 py-2 text-sm text-success"
        >
          {success}
        </p>
      )}

      {loading && <LoadingState label="Cargando las excepciones" />}

      {!loading && falloDeCarga && (
        <ErrorState
          title="No pudimos cargar las excepciones"
          message="El listado de bloqueos no aparece en pantalla. Vuelve a intentarlo en un momento."
          onRetry={() => setIntento((n) => n + 1)}
        />
      )}

      {!loading && !falloDeCarga && exceptions.length === 0 && (
        <EmptyState
          title="No hay excepciones próximas"
          description="Cuando bloquees un día o agregues un horario extra aparece acá."
        />
      )}

      {!loading && !falloDeCarga && exceptions.length > 0 && (
        <ul className="divide-y divide-line">
          {exceptions.map((exception) => (
            <li
              key={exception.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium tabular text-ink">
                  {formatDate(exception.fecha)} · {exception.hora_inicio?.slice(0, 5)} -{' '}
                  {exception.hora_fin?.slice(0, 5)}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {TIPO_LABELS[exception.tipo] || exception.tipo}
                  {exception.motivo ? ` · ${exception.motivo}` : ''}
                </p>
              </div>

              <Button
                variant="dangerGhost"
                loading={deletingId === exception.id}
                onClick={() => handleDelete(exception.id)}
              >
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Availability() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Disponibilidad"
        description="Definí los días y horas en que el local atiende, y los bloqueos puntuales."
      />

      <section aria-labelledby="titulo-horario">
        <Card>
          <h2 id="titulo-horario" className="font-display text-lg text-ink">
            Horario semanal
          </h2>
          <p className="mb-4 mt-1 text-sm text-ink-muted">
            Los días marcados como abiertos son los que se ofrecen para agendar.
          </p>
          <WeeklySchedule />
        </Card>
      </section>

      <section aria-labelledby="titulo-excepciones">
        <Card>
          <h2 id="titulo-excepciones" className="font-display text-lg text-ink">
            Excepciones
          </h2>
          <p className="mb-4 mt-1 text-sm text-ink-muted">
            Agregá bloqueos (vacaciones, feriados) u horarios extra puntuales.
          </p>
          <Exceptions />
        </Card>
      </section>
    </div>
  );
}

export default Availability;
