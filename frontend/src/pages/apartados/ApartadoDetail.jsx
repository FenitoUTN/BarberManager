import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { addAbono, getApartado } from '../../api/apartados';
import { formatPrice, formatDate } from '../../utils/format';
import ApartadoBadge from '../../components/ApartadoBadge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Field from '../../components/ui/Field';
import Input from '../../components/ui/Input';
import LoadingState from '../../components/ui/LoadingState';
import PageHeader from '../../components/ui/PageHeader';

const TH = 'px-5 py-3 text-left text-xs font-medium text-ink-subtle';

function ApartadoDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isStaff = user?.rol === 'admin' || user?.rol === 'barbero';

  const [apartado, setApartado] = useState(null);
  const [abonos, setAbonos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Reintento de la carga inicial: sin contador el efecto no vuelve a dispararse.
  const [intento, setIntento] = useState(0);

  const [monto, setMonto] = useState('');
  const [abonoError, setAbonoError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadApartado() {
    setLoading(true);
    setError('');
    try {
      const data = await getApartado(id);
      setApartado(data.apartado);
      setAbonos(data.abonos);
    } catch (err) {
      setError(err.response?.data?.message || 'No fue posible cargar el apartado');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadApartado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, intento]);

  async function handleAddAbono(event) {
    event.preventDefault();
    setAbonoError('');
    setSubmitting(true);

    try {
      const updated = await addAbono(id, { monto });
      setApartado(updated);
      setMonto('');
      const data = await getApartado(id);
      setAbonos(data.abonos);
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'No fue posible registrar el abono';
      setAbonoError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Apartado" />
        <LoadingState label="Cargando el apartado" className="surface-card" />
      </div>
    );
  }

  // Un id que no existe no es un error de red: reintentar devuelve lo mismo.
  if (!loading && !error && !apartado) {
    return (
      <div className="space-y-6">
        <PageHeader title="Apartado" />
        <Card padding="none">
          <EmptyState
            title="Ese apartado no existe"
            description="Puede que se haya eliminado mientras tenías esta pestaña abierta."
            action={
              <Button as={Link} to="/apartados" variant="secondary">
                Volver a apartados
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  if (!loading && error && !apartado) {
    return (
      <div className="space-y-6">
        <PageHeader title="Apartado" />
        <ErrorState
          title="No pudimos cargar el apartado"
          message="El detalle no aparece en pantalla. Vuelve a intentarlo en un momento."
          onRetry={() => setIntento((n) => n + 1)}
          className="surface-card"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/apartados"
          className="inline-flex min-h-11 items-center text-sm font-medium text-brand underline decoration-brand-line underline-offset-4 transition-colors duration-(--duration-fast) ease-out hover:text-brand-deep hover:decoration-brand"
        >
          Volver a apartados
        </Link>

        <PageHeader
          title={apartado.producto_nombre}
          description={
            isStaff ? `Cliente: ${apartado.cliente_nombre}` : 'Tu apartado y su saldo.'
          }
          actions={<ApartadoBadge estado={apartado.estado} />}
        />
      </div>

      <Card>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isStaff && (
            <div>
              <dt className="text-xs text-ink-subtle">Cliente</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink">{apartado.cliente_nombre}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-ink-subtle">Monto total</dt>
            <dd className="mt-0.5 text-sm font-medium tabular text-ink">
              {formatPrice(apartado.monto_total)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-subtle">Saldo pendiente</dt>
            <dd className="mt-0.5 text-xl font-semibold tabular text-ink">
              {formatPrice(apartado.saldo_pendiente)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-subtle">Fecha de registro</dt>
            <dd className="mt-0.5 text-sm font-medium tabular text-ink">
              {formatDate(apartado.created_at.slice(0, 10))}
            </dd>
          </div>
        </dl>
      </Card>

      <section aria-labelledby="titulo-abonos">
        <Card>
          <h2 id="titulo-abonos" className="font-display text-lg text-ink">
            Historial de abonos
          </h2>

          <div className="mt-4">
            {abonos.length === 0 ? (
              <EmptyState
                title="Todavía no hay abonos"
                description={
                  isStaff
                    ? 'Cada abono que registres queda anotado acá, con su fecha.'
                    : 'Cuando hagas un abono queda anotado acá, con su fecha.'
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Abonos registrados, con fecha y monto.</caption>
                  <thead>
                    <tr className="border-b border-line">
                      <th scope="col" className={TH}>
                        Fecha
                      </th>
                      <th scope="col" className={`${TH} text-right`}>
                        Monto
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {abonos.map((abono) => (
                      <tr
                        key={abono.id}
                        className="border-b border-line transition-colors duration-(--duration-fast) last:border-b-0 hover:bg-surface-sunken/70"
                      >
                        <td className="px-5 py-3 tabular text-ink-muted">{formatDate(abono.fecha)}</td>
                        <td className="px-5 py-3 text-right font-medium tabular text-ink">
                          {formatPrice(abono.monto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {isStaff && apartado.estado === 'activo' && (
            <form onSubmit={handleAddAbono} className="mt-6 flex flex-wrap items-end gap-3">
              <Field label="Registrar abono (₡)" htmlFor="monto" className="w-full sm:w-48">
                <Input
                  id="monto"
                  name="monto"
                  type="number"
                  min="0.01"
                  max={apartado.saldo_pendiente}
                  step="0.01"
                  required
                  value={monto}
                  onChange={(event) => setMonto(event.target.value)}
                />
              </Field>

              <Button type="submit" loading={submitting}>
                Registrar abono
              </Button>
            </form>
          )}

          {abonoError && (
            <p
              role="alert"
              className="mt-3 rounded-field border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger"
            >
              {abonoError}
            </p>
          )}
        </Card>
      </section>
    </div>
  );
}

export default ApartadoDetail;
