import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApartado } from '../../api/apartados';
import { getClients } from '../../api/clients';
import { getProducts } from '../../api/products';
import { formatPrice } from '../../utils/format';

function ApartadoForm() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ cliente_id: '', producto_id: '', monto_total: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [clientsData, productsData] = await Promise.all([getClients(), getProducts()]);
        setClients(clientsData);
        setProducts(productsData);
      } catch (err) {
        setError(err.response?.data?.message || 'No fue posible cargar los datos');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'producto_id') {
        const producto = products.find((p) => String(p.id) === value);
        next.monto_total = producto ? producto.precio : '';
      }
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        cliente_id: Number(form.cliente_id),
        producto_id: Number(form.producto_id),
      };
      if (form.monto_total !== '') {
        payload.monto_total = form.monto_total;
      }

      const apartado = await createApartado(payload);
      navigate(`/apartados/${apartado.id}`);
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'No fue posible registrar el apartado';
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
      <h2 className="mb-4 text-xl font-bold text-white">Nuevo apartado</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cliente_id" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Cliente
          </label>
          <select
            id="cliente_id"
            name="cliente_id"
            required
            value={form.cliente_id}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
          >
            <option value="">Seleccione un cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="producto_id" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Producto
          </label>
          <select
            id="producto_id"
            name="producto_id"
            required
            value={form.producto_id}
            onChange={handleChange}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
          >
            <option value="">Seleccione un producto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.nombre} ({formatPrice(product.precio)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="monto_total" className="mb-1.5 block text-sm font-medium text-neutral-300">
            Monto total (₡)
          </label>
          <input
            id="monto_total"
            name="monto_total"
            type="number"
            min="0.01"
            step="0.01"
            required
            value={form.monto_total}
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
          {submitting ? 'Guardando...' : 'Registrar apartado'}
        </button>
      </form>
    </div>
  );
}

export default ApartadoForm;
