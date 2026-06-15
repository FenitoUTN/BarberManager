// eslint-disable-next-line react-refresh/only-export-components
export const ESTADO_LABELS = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
};

const ESTADO_STYLES = {
  pendiente: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  confirmada: 'border-gold-500/30 bg-gold-500/10 text-gold-400',
  cancelada: 'border-red-500/30 bg-red-500/10 text-red-400',
  completada: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
};

function EstadoBadge({ estado }) {
  const style = ESTADO_STYLES[estado] || 'border-neutral-700 bg-neutral-800 text-neutral-400';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${style}`}
    >
      {ESTADO_LABELS[estado] || estado}
    </span>
  );
}

export default EstadoBadge;
