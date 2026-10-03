/*
 * Botón base de la aplicación.
 *
 * Existe para que ninguna página escriba de nuevo el trío `min-h / rounded / focus` a mano.
 * Tres decisiones que no son obvias y conviene no deshacer:
 *
 * 1. `border border-transparent` va en la base, no en cada variante. Así un botón fantasma y
 *    uno primario ocupan exactamente lo mismo y una fila de acciones no baila al cambiar de
 *    variante en runtime.
 * 2. El foco se declara explícito aunque index.css ya define un `:focus-visible` global: este
 *    componente es el contrato de accesibilidad de la capa, no puede depender de que esa
 *    regla base siga igual.
 * 3. El contenido se baja con `opacity`, no se desmonta, cuando entra `loading`. Si el texto
 *    desapareciera, el botón encogería solo y el resto de la fila se correría.
 */

// Mismo patrón de trazo que el resto del proyecto (viewBox 24x24, fill none, stroke
// currentColor, strokeWidth 1.5, remates redondeados) para que un ícono de 16px se vea
// igual que uno de 20px sin necesitar un set nuevo.
function LoaderIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-deep',
  secondary: 'bg-surface border-line-strong text-ink hover:bg-surface-sunken',
  ghost: 'bg-transparent text-ink-muted hover:bg-surface-sunken hover:text-ink',
  // No existe un token `danger-deep` como sí existe `brand-deep`, así que el hover se hace
  // con un filtro de brillo en vez de inventar un color que después nadie mantiene.
  danger: 'bg-danger text-white hover:brightness-110',
  dangerGhost: 'bg-transparent text-danger border-danger/30 hover:bg-danger-soft',
};

// Alturas mínimas: 36px en sm (uso denso, tablas, cabeceras), 44px en md y 48px en lg.
// md y lg superan el objetivo táctil de 44px, que es el piso real en un mostrador con el
// teléfono en la mano.
const SIZES = {
  sm: 'min-h-9 gap-1.5 px-3 text-sm',
  md: 'min-h-11 gap-2 px-4 text-base',
  lg: 'min-h-12 gap-2.5 px-5 text-lg',
};

// Las duraciones van como `duration-(--duration-*)` y no como `duration-fast`: Tailwind v4 no
// expone el namespace `--duration-*` como utilidades, así que `duration-fast` se compilaría a
// nada y la transición se caería al valor por defecto. La variable del tema sí es la fuente.
const BASE_CLASSES =
  'inline-flex items-center justify-center rounded-field border border-transparent font-medium ' +
  'transition-[background-color,border-color,color,filter] duration-(--duration-fast) ease-out ' +
  'select-none whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50';

function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft = null,
  iconRight = null,
  fullWidth = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const variantClasses = VARIANTS[variant] ?? VARIANTS.primary;
  const sizeClasses = SIZES[size] ?? SIZES.md;

  const buttonClasses = `${BASE_CLASSES} ${variantClasses} ${sizeClasses}${
    fullWidth ? ' w-full' : ''
  }${className ? ` ${className}` : ''}`;

  // El estado de carga bloquea el control: `loading` sin `disabled` deja al usuario
  // disparando la acción dos veces.
  const isDisabled = disabled || loading;

  /*
   * `as` sirve para que una acción de navegación ("Registrar cliente") tenga el mismo
   * aspecto que un botón de acción sin ser un <button> con un onClick que emula un enlace:
   * se navega con Link, no se simula. En ese caso no hay `type`, ni `disabled`, ni `loading`
   * --un enlace no se puede deshabilitar ni ocupar-- porque el elemento que se renderiza no
   * soporta esas promesas y aplicarlas sería mentira visual.
   */
  if (Component !== 'button') {
    return (
      <Component className={buttonClasses} {...rest}>
        {iconLeft && <span className="flex shrink-0 items-center">{iconLeft}</span>}
        {children}
        {iconRight && <span className="flex shrink-0 items-center">{iconRight}</span>}
      </Component>
    );
  }

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {iconLeft && <span className="flex shrink-0 items-center">{iconLeft}</span>}

      <span className="relative inline-flex items-center justify-center">
        <span className={loading ? 'opacity-0' : undefined}>{children}</span>
        {loading && (
          <LoaderIcon className="pointer-events-none absolute inset-0 m-auto h-4 w-4 animate-spin" />
        )}
      </span>

      {iconRight && <span className="flex shrink-0 items-center">{iconRight}</span>}
    </button>
  );
}

export default Button;
