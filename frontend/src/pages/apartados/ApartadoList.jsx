import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApartados } from '../../api/apartados';
import { formatPrice, formatDate } from '../../utils/format';

const ESTADO_LABELS = {
  activo: 'Activo',
  pagado: 'Pagado',
  cancelado: 'Cancelado',
};

const ESTADO_STYLES = {
  activo: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  pagado: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  cancelado: 'border-red-500/30 bg-red-500/10 text-red-400',
};

function ApartadoBadge({ estado }) {
  const style = ESTADO_STYLES[estado] || 'border-neutral-700 bg-neutral-800 text-neutral-400';
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${style}`}
    >
      {ESTADO_LABELS[estado] || estado}
    </span>
  );
}

function ApartadoList() {
  const { user } = useAuth();
  const isStaff = user?.rol === 'admin' || user?.rol === 'barbero';

  const [apartados, setApartados] = useState([]);
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadApartados() {
    setLoading(true);
    setError('');
    try {
      const data = await getApartados(estado ? { estado } : {});
      setApartados(data);
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible cargar los apartados');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApartados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/40">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">Apartados</h2>
        {isStaff && (
          <Link
            to="/apartados/nuevo"
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500"
          >
            Nuevo apartado
          </Link>
        )}
      </div>
      <p className="mb-4 text-sm text-neutral-400">
        {isStaff
          ? 'Apartados de productos registrados por los clientes.'
          : 'Tus productos apartados y el saldo pendiente.'}
      </p>

      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="estado" className="text-sm font-medium text-neutral-300">
          Estado
        </label>
        <select
          id="estado"
          value={estado}
          onChange={(event) => setEstado(event.target.value)}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
        >
          <option value="">Todos</option>
          <option value="activo">Activo</option>
          <option value="pagado">Pagado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando...</p>
      ) : apartados.length === 0 ? (
        <p className="text-sm text-neutral-500">No hay apartados registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500">
                {isStaff && <th className="py-2 pr-4 font-medium">Cliente</th>}
                <th className="py-2 pr-4 font-medium">Producto</th>
                <th className="py-2 pr-4 font-medium">Monto total</th>
                <th className="py-2 pr-4 font-medium">Saldo pendiente</th>
                <th className="py-2 pr-4 font-medium">Estado</th>
                <th className="py-2 pr-4 font-medium">Fecha</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {apartados.map((apartado) => (
                <tr key={apartado.id} className="border-b border-neutral-800/60">
                  {isStaff && (
                    <td className="py-2 pr-4 font-medium text-neutral-100">
                      {apartado.cliente_nombre}
                    </td>
                  )}
                  <td className="py-2 pr-4 text-neutral-300">{apartado.producto_nombre}</td>
                  <td className="py-2 pr-4 text-neutral-400">
                    {formatPrice(apartado.monto_total)}
                  </td>
                  <td className="py-2 pr-4 font-semibold text-orange-500">
                    {formatPrice(apartado.saldo_pendiente)}
                  </td>
                  <td className="py-2 pr-4">
                    <ApartadoBadge estado={apartado.estado} />
                  </td>
                  <td className="py-2 pr-4 text-neutral-500">
                    {formatDate(apartado.created_at.slice(0, 10))}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    <Link to={`/apartados/${apartado.id}`} className="text-orange-500 hover:text-orange-400">
                      Ver
                    </Link>
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

export default ApartadoList;
