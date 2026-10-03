import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createApartado } from '../../api/apartados';
import { getClientOptions } from '../../api/clients';
import { getProducts } from '../../api/products';
import { formatPrice } from '../../utils/format';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ErrorState from '../../components/ui/ErrorState';
import Field from '../../components/ui/Field';
import Input from '../../components/ui/Input';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';
import Select from '../../components/ui/Select';

function ApartadoForm() {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ cliente_id: '', producto_id: '', monto_total: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // Reintento de la carga inicial: los dos selectores vienen del servidor y sin ellos no hay
  // formulario que completar.
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const [clientsData, productsData] = await Promise.all([getClientOptions(), getProducts()]);
        setClients(clientsData);
        setProducts(productsData);
      } catch (err) {
        setError(err.response?.data?.message || 'No fue posible cargar los datos');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [intento]);

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
    return (
      <div className="space-y-6">
        <PageHeader title="Nuevo apartado" />
        <LoadingState label="Cargando clientes y productos" className="surface-card" />
      </div>
    );
  }

  // Sin las dos listas no hay nada que elegir: un formulario con dos selectores vacíos es un
  // callejón. Se avisa y se deja reintentar.
  if (!loading && Boolean(error) && clients.length === 0 && products.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Nuevo apartado" />
        <ErrorState
          title="No pudimos cargar los datos del formulario"
          message="Faltan los clientes y los productos. Vuelve a intentarlo en un momento."
          onRetry={() => setIntento((n) => n + 1)}
          className="surface-card"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo apartado"
        description="Registrá un producto que un cliente se lleva pagando en partes."
      />

      <Card className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Cliente" htmlFor="cliente_id" required>
            <Select
              id="cliente_id"
              name="cliente_id"
              required
              value={form.cliente_id}
              onChange={handleChange}
            >
              <option value="">Seleccione un cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nombre}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Producto" htmlFor="producto_id" required>
            <Select
              id="producto_id"
              name="producto_id"
              required
              value={form.producto_id}
              onChange={handleChange}
            >
              <option value="">Seleccione un producto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.nombre} ({formatPrice(product.precio)})
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Monto total (₡)"
            htmlFor="monto_total"
            required
            hint="Se completa con el precio del producto. Ajustalo si el precio cambió."
          >
            <Input
              id="monto_total"
              name="monto_total"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={form.monto_total}
              onChange={handleChange}
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

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" loading={submitting}>
              Registrar apartado
            </Button>
            <Button variant="ghost" as={Link} to="/apartados">
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ApartadoForm;
