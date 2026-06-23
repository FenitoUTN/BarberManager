import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, getProduct, updateProduct } from '../../api/products';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    async function loadProduct() {
      setLoading(true);
      setError('');
      try {
        const product = await getProduct(id);
        if (!product) {
          setError('Producto no encontrado');
          return;
        }
        setForm({
          nombre: product.nombre,
          descripcion: product.descripcion || '',
          precio: product.precio,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'No fue posible cargar el producto');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
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
        descripcion: form.descripcion,
        precio: form.precio,
      };

      if (isEditing) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate('/productos');
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'No fue posible guardar el producto';
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
        {isEditing ? 'Editar producto' : 'Nuevo producto'}
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
          <label htmlFor="descripcion" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Descripción (opcional)
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            rows={3}
            value={form.descripcion}
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

export default ProductForm;
