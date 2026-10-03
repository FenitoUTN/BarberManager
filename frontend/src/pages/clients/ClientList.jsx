import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteClient, getClients } from '../../api/clients';
import Pagination from '../../components/Pagination';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Field from '../../components/ui/Field';
import Input from '../../components/ui/Input';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';

const PAGE_SIZE = 20;

// Mismo trazo que el resto del proyecto (viewBox 24x24, fill none, stroke currentColor,
// strokeWidth 1.5). Decorativo: el EmptyState ya dice con palabras qué falta.
function UsersIcon({ className }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// Encabezado de columna. Se comparte para que las cuatro columnas midan lo mismo sin
// repetir la cadena en cada <th>.
const TH = 'px-5 py-3 text-left text-xs font-medium text-ink-subtle';

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

  // Un fallo de carga con filas todavía en pantalla no tapa las filas: se avisa arriba de la
  // tabla y el usuario sigue viendo lo último que sí llegó. El ErrorState a pantalla queda
  // para cuando no hay nada que mostrar.
  const falloDeCarga = Boolean(error) && clients.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Directorio del local: contacto e historial de cada cliente."
        actions={
          <Button as={Link} to="/clientes/nuevo">
            Registrar cliente
          </Button>
        }
      />

      {loading && <LoadingState label="Cargando los clientes" className="surface-card" />}

      {!loading && falloDeCarga && (
        <ErrorState
          title="No pudimos cargar los clientes"
          message="El listado no aparece en pantalla. Vuelve a intentarlo en un momento."
          onRetry={() => loadClients(search, pagination.page)}
          className="surface-card"
        />
      )}

      {!loading && !falloDeCarga && (
        <Card padding="none">
          <div className="border-b border-line px-5 py-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-end gap-2">
              <Field
                label="Buscar clientes"
                htmlFor="buscar-clientes"
                className="min-w-0 flex-1 basis-56"
              >
                <Input
                  id="buscar-clientes"
                  type="search"
                  placeholder="Nombre, teléfono o correo"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </Field>

              <Button type="submit" variant="secondary">
                Buscar
              </Button>
            </form>
          </div>

          {error && (
            <p
              role="alert"
              className="mx-5 mt-4 rounded-field border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
            >
              {error}
            </p>
          )}

          {clients.length === 0 ? (
            <EmptyState
              icon={<UsersIcon className="h-5 w-5" />}
              title="Todavía no hay clientes registrados"
              description="Registrar el primer cliente es lo que habilita agendar citas a su nombre."
              action={
                <Button as={Link} to="/clientes/nuevo" variant="secondary">
                  Registrar cliente
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th scope="col" className={TH}>
                        Nombre
                      </th>
                      <th scope="col" className={TH}>
                        Teléfono
                      </th>
                      <th scope="col" className={TH}>
                        Correo
                      </th>
                      <th scope="col" className={`${TH} text-right`}>
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr
                        key={client.id}
                        className="border-b border-line transition-colors duration-(--duration-fast) last:border-b-0 hover:bg-surface-sunken/70"
                      >
                        <td className="px-5 py-3 font-medium text-ink">{client.nombre}</td>
                        <td className="px-5 py-3 tabular text-ink-muted">{client.telefono}</td>
                        <td className="px-5 py-3 text-ink-muted">{client.email || '—'}</td>
                        <td className="py-1 pr-4 pl-5 text-right">
                          {/*
                            Cada acción mide 44px de alto: en un celular, en el local, con las
                            manos ocupadas, un enlace de 20px es un enlace al que no se le
                            acierta. El padding horizontal las separa sin encoger el target.
                          */}
                          <div className="flex items-center justify-end">
                            <Link
                              to={`/clientes/${client.id}`}
                              className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-brand hover:text-brand-deep"
                            >
                              Ver
                            </Link>
                            <Link
                              to={`/clientes/${client.id}/editar`}
                              className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-brand hover:text-brand-deep"
                            >
                              Editar
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(client.id)}
                              className="inline-flex min-h-11 cursor-pointer items-center px-2 text-sm font-medium text-danger hover:underline"
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

              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </Card>
      )}
    </div>
  );
}

export default ClientList;
