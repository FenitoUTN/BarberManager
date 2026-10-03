import Badge from './ui/Badge';

// eslint-disable-next-line react-refresh/only-export-components
export const ESTADO_LABELS = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
};

/*
 * Estado de una cita. Es el mismo Badge del sistema con el mapeo puesto una sola vez, para
 * que la agenda del barbero, la del cliente y el panel principal no puedan desincronizarse
 * en el color de un mismo estado.
 *
 * Se evita `brass` a propósito: el latón sobre su propio fondo suave queda en ~2.6:1 y
 * Badge imprime en 12px, donde el mínimo es 4.5:1.
 */
const ESTADO_TONES = {
  pendiente: 'warning',
  confirmada: 'brand',
  completada: 'success',
  cancelada: 'danger',
};

function EstadoBadge({ estado }) {
  return (
    <Badge tone={ESTADO_TONES[estado] ?? 'neutral'}>
      {ESTADO_LABELS[estado] || estado}
    </Badge>
  );
}

export default EstadoBadge;
