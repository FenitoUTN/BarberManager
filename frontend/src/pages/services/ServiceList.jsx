import { useEffect, useState } from 'react';
import { getServices } from '../../api/services';

function formatPrice(precio) {
  return `₡${Number(precio).toLocaleString('es-CR')}`;
}

function ServiceList() {
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      setLoading(true);
      setError('');
      try {
        const data = await getServices();
        setServices(data);
      } catch (err) {
        setError(err.response?.data?.message || 'No fue posible cargar los servicios');
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/40">
      <h2 className="mb-1 font-display text-2xl tracking-wide text-gold-400">Servicios</h2>
      <p className="mb-4 text-sm text-neutral-400">Catálogo de cortes y servicios del local.</p>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
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
              className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-gold-500/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/10 text-gold-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <circle cx="6" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <line x1="20" y1="4" x2="8.12" y2="15.88" />
                  <line x1="14.47" y1="14.48" x2="20" y2="20" />
                  <line x1="8.12" y1="8.12" x2="12" y2="12" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-100">{service.nombre}</h3>
                <p className="mt-1 text-xs text-neutral-500">
                  {service.duracion_minutos} minutos
                </p>
              </div>
              <p className="text-lg font-bold text-gold-500">{formatPrice(service.precio)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ServiceList;
