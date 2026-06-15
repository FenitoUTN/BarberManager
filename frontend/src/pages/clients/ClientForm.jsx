import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createClient, getClient, updateClient } from '../../api/clients';

function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({ nombre: '', telefono: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    async function loadClient() {
      setLoading(true);
      setError('');
      try {
        const client = await getClient(id);
        setForm({
          nombre: client.nombre,
          telefono: client.telefono,
          email: client.email || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'No fue posible cargar el cliente');
      } finally {
        setLoading(false);
      }
    }

    loadClient();
  }, [id, isEditing]);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isEditing) {
        await updateClient(id, form);
        navigate(`/clientes/${id}`);
      } else {
        const client = await createClient(form);
        navigate(`/clientes/${client.id}`);
      }
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'No fue posible guardar el cliente';
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
      <h2 className="mb-4 text-xl font-bold text-white">
        {isEditing ? 'Editar cliente' : 'Registrar cliente'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Nombre completo
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            value={form.nombre}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
          />
        </div>

        <div>
          <label htmlFor="telefono" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            required
            value={form.telefono}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Correo electrónico (opcional)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
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
          className="w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}

export default ClientForm;
