import Badge from './ui/Badge';

// eslint-disable-next-line react-refresh/only-export-components
export const APARTADO_LABELS = {
  activo: 'Activo',
  pagado: 'Pagado',
  cancelado: 'Cancelado',
};

/*
 * Estado de un apartado. El mismo Badge del sistema con el mapeo puesto una sola vez, para
 * que el listado, el detalle y el reporte no puedan pintar el mismo estado de distinto
 * color.
 *
 * Se evita `brass` a propósito: el latón sobre su propio fondo suave queda en ~2.6:1 y
 * Badge imprime en 12px, donde el mínimo es 4.5:1.
 */
const APARTADO_TONES = {
  activo: 'warning',
  pagado: 'success',
  cancelado: 'danger',
};

function ApartadoBadge({ estado }) {
  return (
    <Badge tone={APARTADO_TONES[estado] ?? 'neutral'}>
      {APARTADO_LABELS[estado] || estado}
    </Badge>
  );
}

export default ApartadoBadge;
