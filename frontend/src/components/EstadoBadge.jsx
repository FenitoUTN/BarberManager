// eslint-disable-next-line react-refresh/only-export-components
export const ESTADO_LABELS = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
};

const ESTADO_STYLES = {
  pendiente: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  confirmada: 'border-gold-400/30 bg-gold-400/10 text-gold-400',
  cancelada: 'border-red-400/30 bg-red-400/10 text-red-400',
  completada: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400',
};

function EstadoBadge({ estado }) {
  const style = ESTADO_STYLES[estado] || 'border-neutral-600 bg-neutral-800 text-neutral-400';

  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider whitespace-nowrap ${style}`}
    >
      {ESTADO_LABELS[estado] || estado}
    </span>
  );
}

export default EstadoBadge;
