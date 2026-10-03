import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createProduct, getProduct, updateProduct } from '../../api/products';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Field from '../../components/ui/Field';
import Input from '../../components/ui/Input';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';
import Textarea from '../../components/ui/Textarea';

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [noEncontrado, setNoEncontrado] = useState(false);
  // Reintento de la carga inicial: sin este contador el efecto no vuelve a dispararse y el
  // botón de reintentar no tendría a qué responder.
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!isEditing) return;

    async function loadProduct() {
      setLoading(true);
      setError('');
      setNoEncontrado(false);
      try {
        const product = await getProduct(id);
        if (!product) {
          setNoEncontrado(true);
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
  }, [id, isEditing, intento]);

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

  const titulo = isEditing ? 'Editar producto' : 'Nuevo producto';

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title={titulo} />
        <LoadingState label="Cargando el producto" className="surface-card" />
      </div>
    );
  }

  // Un id que no existe no es un error de red: reintentar devuelve lo mismo. Se ofrece
  // volver al catálogo, que es lo único que tiene sentido hacer desde acá.
  if (noEncontrado) {
    return (
      <div className="space-y-6">
        <PageHeader title={titulo} />
        <Card padding="none">
          <EmptyState
            title="Ese producto no existe"
            description="Puede que se haya eliminado mientras tenías esta pestaña abierta."
            action={
              <Button as={Link} to="/productos" variant="secondary">
                Volver al catálogo
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const falloDeCarga = isEditing && Boolean(error) && !form.nombre;

  if (falloDeCarga) {
    return (
      <div className="space-y-6">
        <PageHeader title={titulo} />
        <ErrorState
          title="No pudimos cargar el producto"
          message="El formulario no aparece en pantalla. Vuelve a intentarlo en un momento."
          onRetry={() => setIntento((n) => n + 1)}
          className="surface-card"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={titulo}
        description={
          isEditing
            ? 'Actualizá la descripción o el precio del producto.'
            : 'El producto nuevo queda disponible para vender o apartar al guardarlo.'
        }
      />

      <Card className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre" htmlFor="nombre" required>
            <Input
              id="nombre"
              name="nombre"
              type="text"
              required
              value={form.nombre}
              onChange={handleChange}
            />
          </Field>

          <Field label="Descripción (opcional)" htmlFor="descripcion">
            <Textarea
              id="descripcion"
              name="descripcion"
              rows={3}
              value={form.descripcion}
              onChange={handleChange}
            />
          </Field>

          <Field label="Precio (₡)" htmlFor="precio" required>
            <Input
              id="precio"
              name="precio"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.precio}
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
              {isEditing ? 'Guardar cambios' : 'Crear producto'}
            </Button>
            <Button variant="ghost" as={Link} to="/productos">
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ProductForm;
