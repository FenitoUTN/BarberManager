import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getClient } from '../../api/clients';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';

function ClientProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  // Reintento de la carga inicial: sin contador el efecto no vuelve a dispararse.
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    async function loadClient() {
      setLoading(true);
      setError('');
      try {
        const data = await getClient(id);
        setClient(data);
      } catch (err) {
        setError(err.response?.data?.message || 'No fue posible cargar el cliente');
      } finally {
        setLoading(false);
      }
    }

    loadClient();
  }, [id, intento]);

  const canManage = user?.rol === 'admin' || user?.rol === 'barbero';

  return (
    <div className="space-y-6">
      <div>
        {canManage && (
          <Link
            to="/clientes"
            className="inline-flex min-h-11 items-center text-sm font-medium text-brand underline decoration-brand-line underline-offset-4 transition-colors duration-(--duration-fast) ease-out hover:text-brand-deep hover:decoration-brand"
          >
            Volver a clientes
          </Link>
        )}

        <PageHeader
          title="Perfil del cliente"
          description="Datos de contacto y fecha de alta en el local."
          actions={
            canManage && client ? (
              <Button as={Link} to={`/clientes/${client.id}/editar`}>
                Editar información
              </Button>
            ) : null
          }
        />
      </div>

      {loading && <LoadingState label="Cargando el perfil" className="surface-card" />}

      {!loading && error && !client && (
        <ErrorState
          title="No pudimos cargar el cliente"
          message="El perfil no aparece en pantalla. Vuelve a intentarlo en un momento."
          onRetry={() => setIntento((n) => n + 1)}
          className="surface-card"
        />
      )}

      {/* Si el fallo llega con el perfil ya en pantalla, se avisa sin borrar los datos. */}
      {!loading && error && client && (
        <p
          role="alert"
          className="rounded-field border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {!loading && client && (
        <Card>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-subtle">Nombre</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink">{client.nombre}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-subtle">Teléfono</dt>
              <dd className="mt-0.5 text-sm font-medium tabular text-ink">{client.telefono}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-subtle">Correo</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink">{client.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-subtle">Cliente desde</dt>
              <dd className="mt-0.5 text-sm font-medium tabular text-ink">
                {new Date(client.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </Card>
      )}
    </div>
  );
}

export default ClientProfile;
