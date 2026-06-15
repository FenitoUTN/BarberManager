import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { deleteProduct, getProducts } from '../../api/products';
import { formatPrice } from '../../utils/format';

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

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/40">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl tracking-wide text-gold-400">Productos</h2>
        {isStaff && (
          <Link
            to="/productos/nuevo"
            className="rounded-lg bg-gold-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-gold-600/30 transition hover:bg-gold-500"
          >
            Nuevo producto
          </Link>
        )}
      </div>
      <p className="mb-4 text-sm text-neutral-400">Catálogo de productos disponibles en el local.</p>

      {isStaff && (
        <label className="mb-4 flex items-center gap-2 text-sm text-neutral-400">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(event) => setShowInactive(event.target.checked)}
            className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-gold-500 focus:ring-gold-500/30"
          />
          Mostrar productos inactivos
        </label>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay productos disponibles.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500">
                <th className="py-2 pr-4 font-medium">Nombre</th>
                <th className="py-2 pr-4 font-medium">Descripción</th>
                <th className="py-2 pr-4 font-medium">Precio</th>
                {isStaff && <th className="py-2 pr-4 font-medium">Estado</th>}
                {isStaff && <th className="py-2 pr-4"></th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-neutral-800/60">
                  <td className="py-2 pr-4 font-medium text-neutral-100">{product.nombre}</td>
                  <td className="py-2 pr-4 text-neutral-400">{product.descripcion || '—'}</td>
                  <td className="py-2 pr-4 font-semibold text-gold-500">
                    {formatPrice(product.precio)}
                  </td>
                  {isStaff && (
                    <td className="py-2 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          product.activo
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-red-500/30 bg-red-500/10 text-red-400'
                        }`}
                      >
                        {product.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  )}
                  {isStaff && (
                    <td className="py-2 pr-4 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          to={`/productos/${product.id}/editar`}
                          className="text-gold-500 hover:text-gold-400"
                        >
                          Editar
                        </Link>
                        {Boolean(product.activo) && (
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-400 hover:text-red-300"
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
    </div>
  );
}

export default ProductList;
