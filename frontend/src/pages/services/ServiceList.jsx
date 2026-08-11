import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deleteService, getServices } from '../../api/services';

function formatPrice(precio) {
  return `₡${Number(precio).toLocaleString('es-CR')}`;
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

  return (
    <div className="rounded-xl border border-gold-800/20 bg-[#141414] p-6">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-2xl text-gold-400">Servicios</h2>
        {isStaff && (
          <Link
            to="/servicios/nuevo"
            className="rounded-lg border border-gold-600/60 bg-gold-600/20 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-gold-400 transition hover:bg-gold-600/30"
          >
            Nuevo servicio
          </Link>
        )}
      </div>
      <p className="mb-5 text-sm text-neutral-500">Catalogo de cortes y servicios del local.</p>

      {isStaff && (
        <label className="mb-4 flex items-center gap-2 text-sm text-neutral-400">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(event) => setShowInactive(event.target.checked)}
            className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-gold-500 focus:ring-gold-500/30"
          />
          Mostrar servicios inactivos
        </label>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando...</p>
      ) : services.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay servicios disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col gap-3 rounded-xl border border-gold-800/20 bg-[#1a1a1a] p-5 transition hover:border-gold-600/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-600/30 bg-gold-400/5 text-gold-400">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <circle cx="6" cy="6" r="3" />
                    <circle cx="6" cy="18" r="3" />
                    <line x1="20" y1="4" x2="8.12" y2="15.88" />
                    <line x1="14.47" y1="14.48" x2="20" y2="20" />
                    <line x1="8.12" y1="8.12" x2="12" y2="12" />
                  </svg>
                </div>
                {isStaff && !service.activo && (
                  <span className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                    Inactivo
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-200">{service.nombre}</h3>
                <p className="mt-1 text-xs text-neutral-500">
                  {service.duracion_minutos} minutos
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-bold text-gold-400">{formatPrice(service.precio)}</p>
                {isStaff && (
                  <div className="flex gap-3 text-sm">
                    <Link
                      to={`/servicios/${service.id}/editar`}
                      className="text-gold-500 hover:text-gold-400"
                    >
                      Editar
                    </Link>
                    {Boolean(service.activo) && (
                      <button
                        type="button"
                        onClick={() => handleDelete(service.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ServiceList;
