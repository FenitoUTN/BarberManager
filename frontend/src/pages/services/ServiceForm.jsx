import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createService, getService, updateService } from '../../api/services';

function ServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({ nombre: '', precio: '', duracion_minutos: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    async function loadService() {
      setLoading(true);
      setError('');
      try {
        const service = await getService(id);
        if (!service) {
          setError('Servicio no encontrado');
          return;
        }
        setForm({
          nombre: service.nombre,
          precio: service.precio,
          duracion_minutos: service.duracion_minutos,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'No fue posible cargar el servicio');
      } finally {
        setLoading(false);
      }
    }

    loadService();
  }, [id, isEditing]);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        nombre: form.nombre,
        precio: form.precio,
        duracion_minutos: Number(form.duracion_minutos),
      };

      if (isEditing) {
        await updateService(id, payload);
      } else {
        await createService(payload);
      }
      navigate('/servicios');
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'No fue posible guardar el servicio';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Cargando...</p>;
  }

  return (
    <div className="max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/40">
      <h2 className="mb-4 font-serif text-2xl tracking-wide text-gold-400">
        {isEditing ? 'Editar servicio' : 'Nuevo servicio'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            value={form.nombre}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
          />
        </div>

        <div>
          <label htmlFor="precio" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Precio (₡)
          </label>
          <input
            id="precio"
            name="precio"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.precio}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
          />
        </div>

        <div>
          <label htmlFor="duracion_minutos" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Duración (minutos)
          </label>
          <input
            id="duracion_minutos"
            name="duracion_minutos"
            type="number"
            min="1"
            step="1"
            required
            value={form.duracion_minutos}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-gold-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gold-600/30 transition hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}

export default ServiceForm;
