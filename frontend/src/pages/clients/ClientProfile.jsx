import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getClient } from '../../api/clients';

function ClientProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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
  }, [id]);

  const canManage = user?.rol === 'admin' || user?.rol === 'barbero';

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/40">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Perfil del cliente</h2>
        {canManage && (
          <Link to="/clientes" className="text-sm text-orange-500 hover:text-orange-400">
            ← Volver a clientes
          </Link>
        )}
      </div>

      {loading && <p className="text-sm text-neutral-500">Cargando...</p>}
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {client && (
        <div className="space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">Nombre</p>
            <p className="text-sm text-neutral-100">{client.nombre}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">Teléfono</p>
            <p className="text-sm text-neutral-100">{client.telefono}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">Correo</p>
            <p className="text-sm text-neutral-100">{client.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">Cliente desde</p>
            <p className="text-sm text-neutral-100">
              {new Date(client.created_at).toLocaleDateString()}
            </p>
          </div>

          {canManage && (
            <Link
              to={`/clientes/${client.id}/editar`}
              className="mt-2 inline-block rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500"
            >
              Editar información
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default ClientProfile;
