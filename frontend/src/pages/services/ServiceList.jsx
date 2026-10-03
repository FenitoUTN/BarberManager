import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deleteService, getServices } from '../../api/services';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';

function formatPrice(precio) {
  return `₡${Number(precio).toLocaleString('es-CR')}`;
}

// Mismo trazo que el resto del proyecto. Decorativo: el nombre del servicio está en el título
// de la tarjeta.
function ScissorsIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

function ServiceList() {
  const { user } = useAuth();
  const isStaff = user?.rol === 'admin' || user?.rol === 'barbero';

  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  async function loadServices() {
    setLoading(true);
    setError('');
    try {
      const data = await getServices({ includeInactive: isStaff && showInactive });
      setServices(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible cargar los servicios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInactive]);

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este servicio?')) return;

    try {
      await deleteService(id);
      setServices((prev) =>
        showInactive
          ? prev.map((service) => (service.id === id ? { ...service, activo: 0 } : service))
          : prev.filter((service) => service.id !== id)
      );
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible eliminar el servicio');
    }
  }

  const falloDeCarga = Boolean(error) && services.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Servicios"
        description="Catálogo de cortes y servicios del local, con su duración y su precio."
        actions={
          isStaff ? (
            <Button as={Link} to="/servicios/nuevo">
              Nuevo servicio
            </Button>
          ) : null
        }
      />

      {loading && <LoadingState label="Cargando los servicios" className="surface-card" />}

      {!loading && falloDeCarga && (
        <ErrorState
          title="No pudimos cargar los servicios"
          message="El catálogo no aparece en pantalla. Vuelve a intentarlo en un momento."
          onRetry={loadServices}
          className="surface-card"
        />
      )}

      {!loading && !falloDeCarga && (
        <Card>
          {isStaff && (
            <label className="-mt-1 mb-4 flex min-h-11 w-fit cursor-pointer items-center gap-2.5 text-sm text-ink">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(event) => setShowInactive(event.target.checked)}
                className="h-5 w-5 shrink-0 cursor-pointer rounded-xs border border-ink-subtle accent-brand"
              />
              Mostrar servicios inactivos
            </label>
          )}

          {error && (
            <p
              role="alert"
              className="mb-4 rounded-field border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
            >
              {error}
            </p>
          )}

          {services.length === 0 ? (
            <EmptyState
              icon={<ScissorsIcon className="h-5 w-5" />}
              title="Todavía no hay servicios cargados"
              description="Cargá el primer servicio para poder cobrarlo y agendarlo."
              action={
                isStaff ? (
                  <Button as={Link} to="/servicios/nuevo" variant="secondary">
                    Nuevo servicio
                  </Button>
                ) : null
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service.id}
                  className="flex flex-col gap-3 rounded-field border border-line bg-surface p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-field border border-brand-line bg-brand-soft text-brand">
                      <ScissorsIcon className="h-5 w-5" />
                    </span>

                    {isStaff && !service.activo && <Badge tone="danger">Inactivo</Badge>}
                  </div>

                  <div>
                    <h2 className="font-display text-base text-ink">{service.nombre}</h2>
                    <p className="mt-0.5 text-sm tabular text-ink-muted">
                      {service.duracion_minutos} minutos
                    </p>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                    <p className="text-lg font-semibold tabular text-ink">
                      {formatPrice(service.precio)}
                    </p>

                    {isStaff && (
                      <div className="flex items-center">
                        <Link
                          to={`/servicios/${service.id}/editar`}
                          className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-brand hover:text-brand-deep"
                        >
                          Editar
                        </Link>
                        {Boolean(service.activo) && (
                          <button
                            type="button"
                            onClick={() => handleDelete(service.id)}
                            className="inline-flex min-h-11 cursor-pointer items-center px-2 text-sm font-medium text-danger hover:underline"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default ServiceList;
