import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteClient, getClients } from '../../api/clients';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 20;

function ClientList() {
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadClients(term = '', page = 1) {
    setLoading(true);
    setError('');
    try {
      const data = await getClients(term, { page, pageSize: PAGE_SIZE });
      setClients(data.clients);
      setPagination(data.pagination);
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
    loadClients(search, 1);
  }

  function handlePageChange(page) {
    loadClients(search, page);
  }

  async function handleDelete(id) {
    if (!window.confirm('Eliminar este cliente?')) return;

    try {
      await deleteClient(id);
      loadClients(search, pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible eliminar el cliente');
    }
  }

  return (
    <div className="rounded-xl border border-gold-800/20 bg-[#141414] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif text-2xl text-gold-400">Clientes</h2>
        <Link
          to="/clientes/nuevo"
          className="rounded-lg border border-gold-600/60 bg-gold-600/20 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-gold-400 transition hover:bg-gold-600/30"
        >
          Registrar cliente
        </Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por nombre, telefono o correo"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full max-w-sm rounded-lg border border-neutral-700/50 bg-[#1a1a1a] px-3 py-2 text-sm text-white placeholder-neutral-600 outline-none transition focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/20"
        />
        <button
          type="submit"
          className="rounded-lg border border-neutral-700/50 px-4 py-2 text-sm font-medium text-neutral-400 transition hover:border-gold-600/40 hover:text-gold-400"
        >
          Buscar
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
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
              <tr className="border-b border-gold-800/20 text-neutral-500">
                <th className="py-2.5 pr-4 font-medium">Nombre</th>
                <th className="py-2.5 pr-4 font-medium">Telefono</th>
                <th className="py-2.5 pr-4 font-medium">Correo</th>
                <th className="py-2.5 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-neutral-800/40">
                  <td className="py-2.5 pr-4 font-medium text-neutral-200">{client.nombre}</td>
                  <td className="py-2.5 pr-4 text-neutral-400">{client.telefono}</td>
                  <td className="py-2.5 pr-4 text-neutral-400">{client.email || '—'}</td>
                  <td className="py-2.5 pr-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Link to={`/clientes/${client.id}`} className="text-gold-400 hover:text-gold-300">
                        Ver
                      </Link>
                      <Link to={`/clientes/${client.id}/editar`} className="text-gold-400 hover:text-gold-300">
                        Editar
                      </Link>
                      <button type="button" onClick={() => handleDelete(client.id)} className="text-red-400 hover:text-red-300">
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

export default ClientList;
