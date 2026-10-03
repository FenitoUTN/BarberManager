/*
 * Etiqueta de estado.
 *
 * Cada tono es el mismo trípode: fondo `-soft` (presente, nunca compite con el texto), texto
 * del color fuerte (legible sobre su propio `-soft`), borde del color al 30% (marca el
 * límite sin necesidad de escribir la cifra en cada uso).
 *
 * El tono `neutral` es la excepción: la escala no tiene `neutral-soft`, así que usa
 * `surface-sunken` y `line-strong`, que cumplen el mismo papel.
 *
 * Sin `uppercase` y sin `tracking-wider`. El mayúsculas sostenido es el tell de plantilla
 * que se está eliminando: gasto ancho y tira legibilidad abajo, sobre todo en 12px.
 * Sentence case, y el peso del estado lo carga el color, no la tipografía.
 */

const TONES = {
  neutral: 'bg-surface-sunken text-ink-muted border-line-strong',
  brand: 'bg-brand-soft text-brand border-brand-line',
  brass: 'bg-brass-soft text-brass border-brass/30',
  success: 'bg-success-soft text-success border-success/30',
  warning: 'bg-warning-soft text-warning border-warning/30',
  danger: 'bg-danger-soft text-danger border-danger/30',
  info: 'bg-info-soft text-info border-info/30',
};

function Badge({ tone = 'neutral', className = '', children }) {
  const toneClasses = TONES[tone] ?? TONES.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill border px-2.5 py-1 text-2xs font-medium ${toneClasses}${
        className ? ` ${className}` : ''
      }`}
    >
      {children}
    </span>
  );
}

export default Badge;
