/*
 * Estado vacío.
 *
 * Copy: imperativo y en positivo. Un estado vacío es una invitación a actuar —"Cargá tu
 * primer cliente"— no un lugar para disculparse. "No hay datos" es una descripción del
 * software; "Registrá un cliente para empezar a agendar" es una instrucción, y encima el
 * título se lee igual de bien si la pantalla nunca se ve, porque el `action` es opcional y el
 * componente no obliga a inventar uno.
 *
 * `icon` espera un nodo SVG dimensionado por el consumidor (h-5 w-5 funciona bien): el
 * círculo de fondo lo pone el componente, no el ícono.
 */
function EmptyState({ icon = null, title, description, action = null, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-14 text-center${
        className ? ` ${className}` : ''
      }`}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand"
        >
          {icon}
        </span>
      )}

      <div className="max-w-md">
        {/* h2 y no h1: la página ya tiene su h1 en PageHeader y romper el orden de
            encabezados desorienta la navegación por headings del lector de pantalla. */}
        <h2 className="font-display text-lg text-ink">{title}</h2>

        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>

      {action && <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export default EmptyState;
