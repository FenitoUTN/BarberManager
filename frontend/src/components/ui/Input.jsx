import { useContext } from 'react';
import { FieldContext } from './Field';

/*
 * Input. La altura mínima ya viene de `.field` en index.css (2.75rem), que es el piso táctil
 * de 44px. No se vuelve a declarar acá: duplicarlo convierte el token en dos fuentes de
 * verdad y la próxima medición los contradice.
 *
 * Usa contexto de dos formas: hereda los ids del <Field> que lo envuelve, y acepta `error`
 * explícito para usarse suelto.
 */
function Input({ error = false, className = '', id, 'aria-describedby': describedBy, ...rest }) {
  const field = useContext(FieldContext);

  const hasError = error || Boolean(field?.hasError);

  // Sin un <Field> que renderice el mensaje no hay ningún id al que apuntar. Este control
  // tiene que poder usarse suelto con su propio `error`, y `field` es null en ese caso.
  const fieldErrorId = hasError && field ? field.errorId : null;

  // Se une lo que llega del contexto y lo que pase el consumidor, sin pisar ninguno de los
  // dos: el orden hint → error reproduce el orden natural de lectura (la ayuda primero, el
  // problema después).
  const ariaDescribedBy =
    [field?.hasHint ? field.hintId : null, fieldErrorId, describedBy].filter(Boolean).join(' ') ||
    undefined;

  return (
    <input
      id={id ?? field?.inputId}
      aria-invalid={hasError || undefined}
      aria-describedby={ariaDescribedBy}
      className={`field${hasError ? ' field-error' : ''}${className ? ` ${className}` : ''}`}
      {...rest}
    />
  );
}

export default Input;
