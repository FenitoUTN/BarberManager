/*
 * Cabecera de página: título, contexto y acciones.
 *
 * En móvil las acciones bajan a una columna en vez de intentar encogerse al lado del
 * título. Enseñar dos botones de 44px en una fila de 360px produce textos partidos y
 * targets de la mitad del ancho, que es exactamente el fallo táctil que este rediseño viene
 * a matar.
 *
 * `eyebrow` sí es un eyebrow, a diferencia de los que se están eliminando en el resto de la
 * app: acá codifica jerarquía real (el nombre de la sección a la que pertenece este h1), no
 * decoración tipográfica.
 */
function PageHeader({ title, description, actions = null, eyebrow, className = '' }) {
  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between${
        className ? ` ${className}` : ''
      }`}
    >
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-xs font-medium text-brand">{eyebrow}</p>}

        <h1 className="font-display text-2xl text-ink">{title}</h1>

        {description && <p className="mt-1 max-w-2xl text-sm text-ink-muted">{description}</p>}
      </div>

      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export default PageHeader;
