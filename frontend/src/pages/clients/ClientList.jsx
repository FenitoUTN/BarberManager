import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteClient, getClients } from '../../api/clients';

function ClientList() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadClients(term = '') {
    setLoading(true);
    setError('');
    try {
      const data = await getClients(term);
      setClients(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible cargar los clientes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClients();
  }, []);

  function handleSearchSubmit(event) {
    event.preventDefault();
    loadClients(search);
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este cliente?')) return;

    try {
      await deleteClient(id);
      setClients((prev) => prev.filter((client) => client.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible eliminar el cliente');
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/40">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl tracking-wide text-gold-400">Clientes</h2>
        <Link
          to="/clientes/nuevo"
          className="rounded-lg bg-gold-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-gold-600/30 transition hover:bg-gold-500"
        >
          Registrar cliente
        </Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o correo"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
        />
        <button
          type="submit"
          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-gold-500/50 hover:text-gold-400"
        >
          Buscar
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando...</p>
      ) : clients.length === 0 ? (
        <p className="text-sm text-neutral-500">No se encontraron clientes.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500">
                <th className="py-2 pr-4 font-medium">Nombre</th>
                <th className="py-2 pr-4 font-medium">Teléfono</th>
                <th className="py-2 pr-4 font-medium">Correo</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-neutral-800/60">
                  <td className="py-2 pr-4 font-medium text-neutral-100">{client.nombre}</td>
                  <td className="py-2 pr-4 text-neutral-400">{client.telefono}</td>
                  <td className="py-2 pr-4 text-neutral-400">{client.email || '—'}</td>
                  <td className="py-2 pr-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        to={`/clientes/${client.id}`}
                        className="text-gold-500 hover:text-gold-400"
                      >
                        Ver
                      </Link>
                      <Link
                        to={`/clientes/${client.id}/editar`}
                        className="text-gold-500 hover:text-gold-400"
                      >
                        Editar
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(client.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ClientList;
