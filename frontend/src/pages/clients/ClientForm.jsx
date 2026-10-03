import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createClient, getClient, updateClient } from '../../api/clients';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ErrorState from '../../components/ui/ErrorState';
import Field from '../../components/ui/Field';
import Input from '../../components/ui/Input';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';

function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({ nombre: '', telefono: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  // Reintento de la carga inicial. Sin este contador no hay forma de volver a pedir el
  // cliente: el efecto ya corrió y no se va a volver a disparar solo.
  const [intento, setIntento] = useState(0);

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
  }, [id, isEditing, intento]);

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

  // Mientras carga el cliente a editar no hay formulario que mostrar, y un formulario medio
  // lleno que después se puebla salta en pantalla: se espera con el estado compartido.
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar cliente" />
        <LoadingState label="Cargando el cliente" className="surface-card" />
      </div>
    );
  }

  // El fallo de carga deja el formulario vacío y sin datos: en vez de mostrar campos en
  // blanco como si fueran el cliente, se avisa y se ofrece reintentar. Sólo aplica a la
  // edición, donde el formulario depende de lo que venga del servidor.
  const falloDeCarga = isEditing && !loading && Boolean(error) && !form.nombre;

  if (falloDeCarga) {
    return (
      <div className="space-y-6">
        <PageHeader title="Editar cliente" />
        <ErrorState
          title="No pudimos cargar el cliente"
          message="El formulario no aparece en pantalla. Vuelve a intentarlo en un momento."
          onRetry={() => setIntento((n) => n + 1)}
          className="surface-card"
        />
      </div>
    );
  }

  const volverA = isEditing ? `/clientes/${id}` : '/clientes';

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Editar cliente' : 'Registrar cliente'}
        description={
          isEditing
            ? 'Actualizá los datos de contacto del cliente.'
            : 'Nombre y teléfono son los dos datos que el sistema necesita para agendar.'
        }
      />

      <Card className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre completo" htmlFor="nombre" required>
            <Input
              id="nombre"
              name="nombre"
              type="text"
              required
              autoComplete="name"
              value={form.nombre}
              onChange={handleChange}
            />
          </Field>

          <Field label="Teléfono" htmlFor="telefono" required>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              required
              autoComplete="tel"
              value={form.telefono}
              onChange={handleChange}
            />
          </Field>

          <Field label="Correo electrónico (opcional)" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
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
              {isEditing ? 'Guardar cambios' : 'Registrar cliente'}
            </Button>
            <Button variant="ghost" as={Link} to={volverA}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ClientForm;
