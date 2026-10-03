import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApartados } from '../../api/apartados';
import { formatPrice, formatDate } from '../../utils/format';
import Pagination from '../../components/Pagination';
import ApartadoBadge from '../../components/ApartadoBadge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Field from '../../components/ui/Field';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';
import Select from '../../components/ui/Select';

const PAGE_SIZE = 20;

// Mismo trazo que el resto del proyecto. Decorativo: la tarjeta de estado vacío ya habla.
function TagIcon({ className }) {
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
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const TH = 'px-5 py-3 text-left text-xs font-medium text-ink-subtle';

function ApartadoList() {
  const { user } = useAuth();
  const isStaff = user?.rol === 'admin' || user?.rol === 'barbero';

  const [apartados, setApartados] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 });
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadApartados(page = 1) {
    setLoading(true);
    setError('');
    try {
      const data = await getApartados({ estado: estado || undefined, page, pageSize: PAGE_SIZE });
      setApartados(data.apartados);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible cargar los apartados');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadApartados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  const falloDeCarga = Boolean(error) && apartados.length === 0;

  // Un filtro activo cambia el mensaje del vacío: "no hay apartados" y "no hay apartados con
  // ese estado" son dos cosas distintas y la segunda no manda al usuario a cargar de nuevo.
  const filtrando = Boolean(estado);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apartados"
        description={
          isStaff
            ? 'Apartados de productos registrados por los clientes.'
            : 'Tus productos apartados y el saldo pendiente.'
        }
        actions={
          isStaff ? (
            <Button as={Link} to="/apartados/nuevo">
              Nuevo apartado
            </Button>
          ) : null
        }
      />

      {loading && <LoadingState label="Cargando los apartados" className="surface-card" />}

      {!loading && falloDeCarga && (
        <ErrorState
          title="No pudimos cargar los apartados"
          message="El listado no aparece en pantalla. Vuelve a intentarlo en un momento."
          onRetry={() => loadApartados(pagination.page)}
          className="surface-card"
        />
      )}

      {!loading && !falloDeCarga && (
        <Card padding="none">
          <div className="border-b border-line px-5 py-4">
            <Field label="Filtrar por estado" htmlFor="estado" className="w-full sm:w-56">
              <Select id="estado" value={estado} onChange={(event) => setEstado(event.target.value)}>
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="pagado">Pagado</option>
                <option value="cancelado">Cancelado</option>
              </Select>
            </Field>
          </div>

          {error && (
            <p
              role="alert"
              className="mx-5 mt-4 rounded-field border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
            >
              {error}
            </p>
          )}

          {apartados.length === 0 ? (
            <EmptyState
              icon={<TagIcon className="h-5 w-5" />}
              title={filtrando ? 'Ningún apartado con ese estado' : 'Todavía no hay apartados'}
              description={
                filtrando
                  ? 'Probá con otro estado, o volvé a ver la lista completa.'
                  : isStaff
                    ? 'Cuando apartes un producto de un cliente aparece acá, con su saldo.'
                    : 'Cuando apartes un producto vas a ver acá cuánto falta pagar.'
              }
              action={
                filtrando ? (
                  <Button variant="secondary" onClick={() => setEstado('')}>
                    Ver todos
                  </Button>
                ) : isStaff ? (
                  <Button as={Link} to="/apartados/nuevo" variant="secondary">
                    Nuevo apartado
                  </Button>
                ) : null
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      {isStaff && (
                        <th scope="col" className={TH}>
                          Cliente
                        </th>
                      )}
                      <th scope="col" className={TH}>
                        Producto
                      </th>
                      <th scope="col" className={TH}>
                        Monto total
                      </th>
                      <th scope="col" className={TH}>
                        Saldo pendiente
                      </th>
                      <th scope="col" className={TH}>
                        Estado
                      </th>
                      <th scope="col" className={TH}>
                        Fecha
                      </th>
                      <th scope="col" className={`${TH} text-right`}>
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {apartados.map((apartado) => (
                      <tr
                        key={apartado.id}
                        className="border-b border-line transition-colors duration-(--duration-fast) last:border-b-0 hover:bg-surface-sunken/70"
                      >
                        {isStaff && (
                          <td className="px-5 py-3 font-medium text-ink">
                            {apartado.cliente_nombre}
                          </td>
                        )}
                        <td className="px-5 py-3 text-ink">{apartado.producto_nombre}</td>
                        <td className="px-5 py-3 tabular text-ink-muted">
                          {formatPrice(apartado.monto_total)}
                        </td>
                        <td className="px-5 py-3 font-semibold tabular text-ink">
                          {formatPrice(apartado.saldo_pendiente)}
                        </td>
                        <td className="px-5 py-3">
                          <ApartadoBadge estado={apartado.estado} />
                        </td>
                        <td className="px-5 py-3 tabular text-ink-muted">
                          {formatDate(apartado.created_at.slice(0, 10))}
                        </td>
                        <td className="py-1 pr-4 pl-5 text-right">
                          <div className="flex items-center justify-end">
                            <Link
                              to={`/apartados/${apartado.id}`}
                              className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-brand hover:text-brand-deep"
                            >
                              Ver
                            </Link>
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
                onPageChange={loadApartados}
              />
            </>
          )}
        </Card>
      )}
    </div>
  );
}

export default ApartadoList;
