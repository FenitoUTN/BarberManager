import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { addAbono, getApartado } from '../../api/apartados';
import { formatPrice, formatDate } from '../../utils/format';

const ESTADO_LABELS = {
  activo: 'Activo',
  pagado: 'Pagado',
  cancelado: 'Cancelado',
};

const ESTADO_STYLES = {
  activo: 'border-gold-500/30 bg-gold-500/10 text-gold-400',
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

function ApartadoDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isStaff = user?.rol === 'admin' || user?.rol === 'barbero';

  const [apartado, setApartado] = useState(null);
  const [abonos, setAbonos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, [id]);

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
    return <p className="text-sm text-neutral-500">Cargando...</p>;
  }

  if (error || !apartado) {
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
        {error || 'Apartado no encontrado'}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/40">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/apartados" className="text-sm text-gold-500 hover:text-gold-400">
              ← Volver a apartados
            </Link>
            <h2 className="mt-1 font-serif text-2xl tracking-wide text-gold-400">{apartado.producto_nombre}</h2>
          </div>
          <ApartadoBadge estado={apartado.estado} />
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isStaff && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-neutral-500">Cliente</dt>
              <dd className="text-sm font-medium text-neutral-100">{apartado.cliente_nombre}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Monto total</dt>
            <dd className="text-sm font-medium text-neutral-100">
              {formatPrice(apartado.monto_total)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Saldo pendiente</dt>
            <dd className="text-lg font-bold text-gold-500">
              {formatPrice(apartado.saldo_pendiente)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-500">Fecha de registro</dt>
            <dd className="text-sm font-medium text-neutral-100">
              {formatDate(apartado.created_at.slice(0, 10))}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-lg shadow-black/40">
        <h3 className="mb-4 font-serif text-xl tracking-wide text-gold-400">Historial de abonos</h3>

        {abonos.length === 0 ? (
          <p className="text-sm text-neutral-500">Aún no se han registrado abonos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-500">
                  <th className="py-2 pr-4 font-medium">Fecha</th>
                  <th className="py-2 pr-4 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {abonos.map((abono) => (
                  <tr key={abono.id} className="border-b border-neutral-800/60">
                    <td className="py-2 pr-4 text-neutral-400">{formatDate(abono.fecha)}</td>
                    <td className="py-2 pr-4 font-medium text-neutral-100">
                      {formatPrice(abono.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isStaff && apartado.estado === 'activo' && (
          <form onSubmit={handleAddAbono} className="mt-6 flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="monto" className="mb-1.5 block text-sm font-medium text-neutral-300">
                Registrar abono (₡)
              </label>
              <input
                id="monto"
                name="monto"
                type="number"
                min="0.01"
                max={apartado.saldo_pendiente}
                step="0.01"
                required
                value={monto}
                onChange={(event) => setMonto(event.target.value)}
                className="w-48 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-gold-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gold-600/30 transition hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Registrar abono'}
            </button>
          </form>
        )}

        {abonoError && (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {abonoError}
          </p>
        )}
      </div>
    </div>
  );
}

export default ApartadoDetail;
