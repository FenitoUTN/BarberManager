import { useContext } from 'react';
import { FieldContext } from './Field';

// Flecha propia en vez del indicador nativo del navegador: el nativo se dibuja con la fuente
// del sistema, no respeta el borde del campo y no se puede colorear con un token.
function ChevronDownIcon({ className }) {
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Select({
  error = false,
  className = '',
  id,
  'aria-describedby': describedBy,
  children,
  ...rest
}) {
  const field = useContext(FieldContext);

  const hasError = error || Boolean(field?.hasError);

  // Sin un <Field> que renderice el mensaje no hay ningún id al que apuntar, y este <select>
  // tiene que poder usarse suelto con su propio `error`.
  const fieldErrorId = hasError && field ? field.errorId : null;

  const ariaDescribedBy =
    [field?.hasHint ? field.hintId : null, fieldErrorId, describedBy].filter(Boolean).join(' ') ||
    undefined;

  return (
    // El envoltorio es `block` porque un <span> inline no es una caja de posicionamiento
    // confiable: la flecha quedaría anclada al contenedor equivocado.
    <span className="relative block">
      <select
        id={id ?? field?.inputId}
        aria-invalid={hasError || undefined}
        aria-describedby={ariaDescribedBy}
        className={`field appearance-none pr-10${hasError ? ' field-error' : ''}${
          className ? ` ${className}` : ''
        }`}
        {...rest}
      >
        {children}
      </select>

      {/* Decorativa: el estado del control ya lo comunican el <select> y su valor. */}
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
    </span>
  );
}

export default Select;
