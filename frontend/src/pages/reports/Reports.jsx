import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getApartadosActivos, getCitasPorDia } from '../../api/reports';
import { todayISO, formatPrice, formatDate } from '../../utils/format';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Field from '../../components/ui/Field';
import Input from '../../components/ui/Input';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';

const TH = 'px-5 py-3 text-left text-xs font-medium text-ink-subtle';

function Reports() {
  const [desde, setDesde] = useState(todayISO());
  const [hasta, setHasta] = useState(todayISO());
  const [resumen, setResumen] = useState([]);
  const [apartados, setApartados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Reintento del rango por defecto: sin contador el efecto no vuelve a dispararse.
  const [intento, setIntento] = useState(0);

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
  }, [intento]);

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

  const falloDeCarga = Boolean(error) && !loading && resumen.length === 0 && apartados.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Citas por día en el rango elegido y apartados que siguen con saldo."
      />

      {falloDeCarga && (
        <ErrorState
          title="No pudimos cargar los reportes"
          message="Los datos no aparecen en pantalla. Vuelve a intentarlo en un momento."
          onRetry={() => setIntento((n) => n + 1)}
          className="surface-card"
        />
      )}

      {!falloDeCarga && (
        <>
          <section aria-labelledby="titulo-citas">
            <Card padding="none">
              <div className="px-5 pt-5 pb-4">
                <h2 id="titulo-citas" className="font-display text-lg text-ink">
                  Resumen de citas por día
                </h2>
                <p className="mt-0.5 text-sm text-ink-muted">
                  Cantidad de citas registradas por día y su estado.
                </p>

                <form
                  onSubmit={handleFilterSubmit}
                  className="mt-4 flex flex-wrap items-end gap-3"
                >
                  <Field label="Desde" htmlFor="desde" className="w-full sm:w-44">
                    <Input
                      id="desde"
                      type="date"
                      value={desde}
                      onChange={(event) => setDesde(event.target.value)}
                    />
                  </Field>

                  <Field label="Hasta" htmlFor="hasta" className="w-full sm:w-44">
                    <Input
                      id="hasta"
                      type="date"
                      value={hasta}
                      onChange={(event) => setHasta(event.target.value)}
                    />
                  </Field>

                  <Button type="submit" variant="secondary" loading={loading}>
                    Filtrar
                  </Button>
                </form>
              </div>

              {error && !falloDeCarga && (
                <p
                  role="alert"
                  className="mx-5 mb-4 rounded-field border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
                >
                  {error}
                </p>
              )}

              {loading && <LoadingState label="Cargando el resumen de citas" />}

              {!loading && !error && resumen.length === 0 && (
                <EmptyState
                  title="No hay citas en ese rango"
                  description="Ampliá las fechas de arriba para mirar más días."
                />
              )}

              {!loading && resumen.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">
                      Citas por día en el rango seleccionado, desglosadas por estado.
                    </caption>
                    <thead>
                      <tr className="border-b border-line">
                        <th scope="col" className={TH}>
                          Fecha
                        </th>
                        <th scope="col" className={`${TH} text-right`}>
                          Total
                        </th>
                        <th scope="col" className={`${TH} text-right`}>
                          Pendientes
                        </th>
                        <th scope="col" className={`${TH} text-right`}>
                          Confirmadas
                        </th>
                        <th scope="col" className={`${TH} text-right`}>
                          Completadas
                        </th>
                        <th scope="col" className={`${TH} text-right`}>
                          Canceladas
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumen.map((row) => (
                        <tr
                          key={row.fecha}
                          className="border-b border-line transition-colors duration-(--duration-fast) last:border-b-0 hover:bg-surface-sunken/70"
                        >
                          <td className="px-5 py-3 font-medium tabular text-ink">
                            {formatDate(row.fecha)}
                          </td>
                          <td className="px-5 py-3 text-right font-semibold tabular text-ink">
                            {row.total}
                          </td>
                          <td className="px-5 py-3 text-right tabular text-ink-muted">
                            {row.pendientes}
                          </td>
                          <td className="px-5 py-3 text-right tabular text-ink-muted">
                            {row.confirmadas}
                          </td>
                          <td className="px-5 py-3 text-right tabular text-ink-muted">
                            {row.completadas}
                          </td>
                          <td className="px-5 py-3 text-right tabular text-ink-muted">
                            {row.canceladas}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-line bg-surface-sunken font-semibold text-ink">
                        <td className="px-5 py-3">Total</td>
                        <td className="px-5 py-3 text-right tabular">{totales.total}</td>
                        <td className="px-5 py-3 text-right tabular">{totales.pendientes}</td>
                        <td className="px-5 py-3 text-right tabular">{totales.confirmadas}</td>
                        <td className="px-5 py-3 text-right tabular">{totales.completadas}</td>
                        <td className="px-5 py-3 text-right tabular">{totales.canceladas}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </Card>
          </section>

          <section aria-labelledby="titulo-apartados">
            <Card padding="none">
              <div className="px-5 pt-5 pb-4">
                <h2 id="titulo-apartados" className="font-display text-lg text-ink">
                  Apartados activos
                </h2>
                <p className="mt-0.5 text-sm text-ink-muted">
                  Productos apartados con saldo pendiente de pago.
                </p>
              </div>

              {loading && <LoadingState label="Cargando los apartados activos" />}

              {!loading && apartados.length === 0 && (
                <EmptyState
                  title="No hay apartados activos"
                  description="Cuando un cliente aparte un producto con saldo, aparece acá."
                />
              )}

              {!loading && apartados.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">
                      Productos apartados con su monto total y su saldo pendiente.
                    </caption>
                    <thead>
                      <tr className="border-b border-line">
                        <th scope="col" className={TH}>
                          Cliente
                        </th>
                        <th scope="col" className={TH}>
                          Producto
                        </th>
                        <th scope="col" className={`${TH} text-right`}>
                          Monto total
                        </th>
                        <th scope="col" className={`${TH} text-right`}>
                          Saldo pendiente
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
                          <td className="px-5 py-3 font-medium text-ink">
                            {apartado.cliente_nombre}
                          </td>
                          <td className="px-5 py-3 text-ink">{apartado.producto_nombre}</td>
                          <td className="px-5 py-3 text-right tabular text-ink-muted">
                            {formatPrice(apartado.monto_total)}
                          </td>
                          <td className="px-5 py-3 text-right font-semibold tabular text-ink">
                            {formatPrice(apartado.saldo_pendiente)}
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
              )}
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

export default Reports;
