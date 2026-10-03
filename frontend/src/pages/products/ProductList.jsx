import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deleteProduct, getProducts } from '../../api/products';
import { formatPrice } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';

// Mismo trazo que el resto del proyecto. Decorativo: el nombre del producto está en la celda.
function BoxIcon({ className }) {
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
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

const TH = 'px-5 py-3 text-left text-xs font-medium text-ink-subtle';

function ProductList() {
  const { user } = useAuth();
  const isStaff = user?.rol === 'admin' || user?.rol === 'barbero';

  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts({ includeInactive: isStaff && showInactive });
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible cargar los productos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInactive]);

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este producto?')) return;

    try {
      await deleteProduct(id);
      setProducts((prev) =>
        showInactive
          ? prev.map((product) => (product.id === id ? { ...product, activo: 0 } : product))
          : prev.filter((product) => product.id !== id)
      );
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible eliminar el producto');
    }
  }

  const falloDeCarga = Boolean(error) && products.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Catálogo de productos del local, con su precio y su stock."
        actions={
          isStaff ? (
            <Button as={Link} to="/productos/nuevo">
              Nuevo producto
            </Button>
          ) : null
        }
      />

      {loading && <LoadingState label="Cargando los productos" className="surface-card" />}

      {!loading && falloDeCarga && (
        <ErrorState
          title="No pudimos cargar los productos"
          message="El catálogo no aparece en pantalla. Vuelve a intentarlo en un momento."
          onRetry={loadProducts}
          className="surface-card"
        />
      )}

      {!loading && !falloDeCarga && (
        <Card padding="none">
          {isStaff && (
            <div className="border-b border-line px-5 py-4">
              <label className="-mt-1 flex min-h-11 w-fit cursor-pointer items-center gap-2.5 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(event) => setShowInactive(event.target.checked)}
                  className="h-5 w-5 shrink-0 cursor-pointer rounded-xs border border-ink-subtle accent-brand"
                />
                Mostrar productos inactivos
              </label>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mx-5 mt-4 rounded-field border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
            >
              {error}
            </p>
          )}

          {products.length === 0 ? (
            <EmptyState
              icon={<BoxIcon className="h-5 w-5" />}
              title="Todavía no hay productos cargados"
              description="Cargá el primer producto para poder venderlo o apartarlo."
              action={
                isStaff ? (
                  <Button as={Link} to="/productos/nuevo" variant="secondary">
                    Nuevo producto
                  </Button>
                ) : null
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className={TH}>
                      Nombre
                    </th>
                    <th scope="col" className={TH}>
                      Descripción
                    </th>
                    <th scope="col" className={TH}>
                      Precio
                    </th>
                    {isStaff && (
                      <th scope="col" className={TH}>
                        Estado
                      </th>
                    )}
                    {isStaff && (
                      <th scope="col" className={`${TH} text-right`}>
                        <span className="sr-only">Acciones</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-line transition-colors duration-(--duration-fast) last:border-b-0 hover:bg-surface-sunken/70"
                    >
                      <td className="px-5 py-3 font-medium text-ink">{product.nombre}</td>
                      <td className="px-5 py-3 text-ink-muted">{product.descripcion || '—'}</td>
                      <td className="px-5 py-3 font-semibold tabular text-ink">
                        {formatPrice(product.precio)}
                      </td>
                      {isStaff && (
                        <td className="px-5 py-3">
                          <Badge tone={product.activo ? 'success' : 'danger'}>
                            {product.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                      )}
                      {isStaff && (
                        <td className="py-1 pr-4 pl-5 text-right">
                          <div className="flex items-center justify-end">
                            <Link
                              to={`/productos/${product.id}/editar`}
                              className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-brand hover:text-brand-deep"
                            >
                              Editar
                            </Link>
                            {Boolean(product.activo) && (
                              <button
                                type="button"
                                onClick={() => handleDelete(product.id)}
                                className="inline-flex min-h-11 cursor-pointer items-center px-2 text-sm font-medium text-danger hover:underline"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default ProductList;
