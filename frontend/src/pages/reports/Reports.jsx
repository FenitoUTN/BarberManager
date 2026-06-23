import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApartadosActivos, getCitasPorDia } from '../../api/reports';
import { todayISO, formatPrice, formatDate } from '../../utils/format';

function Reports() {
  const [desde, setDesde] = useState(todayISO());
  const [hasta, setHasta] = useState(todayISO());
  const [resumen, setResumen] = useState([]);
  const [apartados, setApartados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [resumenData, apartadosData] = await Promise.all([
        getCitasPorDia({ desde, hasta }),
        getApartadosActivos(),
      ]);
      setResumen(resumenData);
      setApartados(apartadosData);
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible cargar los reportes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilterSubmit(event) {
    event.preventDefault();
    loadData();
  }

  const totales = resumen.reduce(
    (acc, row) => ({
      total: acc.total + Number(row.total),
      pendientes: acc.pendientes + Number(row.pendientes),
      confirmadas: acc.confirmadas + Number(row.confirmadas),
      completadas: acc.completadas + Number(row.completadas),
      canceladas: acc.canceladas + Number(row.canceladas),
    }),
    { total: 0, pendientes: 0, confirmadas: 0, completadas: 0, canceladas: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/40">
        <h2 className="mb-1 font-serif text-2xl tracking-wide text-gold-400">Resumen de citas por día</h2>
        <p className="mb-4 text-sm text-neutral-400">
          Cantidad de citas registradas por día y su estado.
        </p>

        <form onSubmit={handleFilterSubmit} className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="desde" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Desde
            </label>
            <input
              id="desde"
              type="date"
              value={desde}
              onChange={(event) => setDesde(event.target.value)}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
            />
          </div>
          <div>
            <label htmlFor="hasta" className="mb-1.5 block text-sm font-medium text-neutral-300">
              Hasta
            </label>
            <input
              id="hasta"
              type="date"
              value={hasta}
              onChange={(event) => setHasta(event.target.value)}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-gold-500/50 hover:text-gold-400"
          >
            Filtrar
          </button>
        </form>

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-neutral-500">Cargando...</p>
        ) : resumen.length === 0 ? (
          <p className="text-sm text-neutral-500">No hay citas registradas en este rango.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500">
                  <th className="py-2 pr-4 font-medium">Fecha</th>
                  <th className="py-2 pr-4 font-medium">Total</th>
                  <th className="py-2 pr-4 font-medium">Pendientes</th>
                  <th className="py-2 pr-4 font-medium">Confirmadas</th>
                  <th className="py-2 pr-4 font-medium">Completadas</th>
                  <th className="py-2 pr-4 font-medium">Canceladas</th>
                </tr>
              </thead>
              <tbody>
                {resumen.map((row) => (
                  <tr key={row.fecha} className="border-b border-neutral-800/60">
                    <td className="py-2 pr-4 font-medium text-neutral-100">
                      {formatDate(row.fecha)}
                    </td>
                    <td className="py-2 pr-4 font-semibold text-gold-500">{row.total}</td>
                    <td className="py-2 pr-4 text-neutral-400">{row.pendientes}</td>
                    <td className="py-2 pr-4 text-neutral-400">{row.confirmadas}</td>
                    <td className="py-2 pr-4 text-neutral-400">{row.completadas}</td>
                    <td className="py-2 pr-4 text-neutral-400">{row.canceladas}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-neutral-800 font-semibold text-neutral-100">
                  <td className="py-2 pr-4">Total</td>
                  <td className="py-2 pr-4 text-gold-500">{totales.total}</td>
                  <td className="py-2 pr-4 text-neutral-300">{totales.pendientes}</td>
                  <td className="py-2 pr-4 text-neutral-300">{totales.confirmadas}</td>
                  <td className="py-2 pr-4 text-neutral-300">{totales.completadas}</td>
                  <td className="py-2 pr-4 text-neutral-300">{totales.canceladas}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/40">
        <h2 className="mb-1 font-serif text-2xl tracking-wide text-gold-400">Apartados activos</h2>
        <p className="mb-4 text-sm text-neutral-400">
          Productos apartados con saldo pendiente de pago.
        </p>

        {loading ? (
          <p className="text-sm text-neutral-500">Cargando...</p>
        ) : apartados.length === 0 ? (
          <p className="text-sm text-neutral-500">No hay apartados activos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500">
                  <th className="py-2 pr-4 font-medium">Cliente</th>
                  <th className="py-2 pr-4 font-medium">Producto</th>
                  <th className="py-2 pr-4 font-medium">Monto total</th>
                  <th className="py-2 pr-4 font-medium">Saldo pendiente</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {apartados.map((apartado) => (
                  <tr key={apartado.id} className="border-b border-neutral-800/60">
                    <td className="py-2 pr-4 font-medium text-neutral-100">
                      {apartado.cliente_nombre}
                    </td>
                    <td className="py-2 pr-4 text-neutral-300">{apartado.producto_nombre}</td>
                    <td className="py-2 pr-4 text-neutral-400">
                      {formatPrice(apartado.monto_total)}
                    </td>
                    <td className="py-2 pr-4 font-semibold text-gold-500">
                      {formatPrice(apartado.saldo_pendiente)}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      <Link
                        to={`/apartados/${apartado.id}`}
                        className="text-gold-500 hover:text-gold-400"
                      >
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
    </div>
  );
}

export default Reports;
