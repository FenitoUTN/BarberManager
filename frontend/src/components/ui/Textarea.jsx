import { useContext } from 'react';
import { FieldContext } from './Field';

function Textarea({
  error = false,
  className = '',
  id,
  rows = 3,
  'aria-describedby': describedBy,
  ...rest
}) {
  const field = useContext(FieldContext);

  const hasError = error || Boolean(field?.hasError);

  // Sin un <Field> que renderice el mensaje no hay ningún id al que apuntar, y este
  // <textarea> tiene que poder usarse suelto con su propio `error`.
  const fieldErrorId = hasError && field ? field.errorId : null;

  const ariaDescribedBy =
    [field?.hasHint ? field.hintId : null, fieldErrorId, describedBy].filter(Boolean).join(' ') ||
    undefined;

  return (
    <textarea
      id={id ?? field?.inputId}
      rows={rows}
      aria-invalid={hasError || undefined}
      aria-describedby={ariaDescribedBy}
      // `min-h-0` anula el min-height de 2.75rem que trae `.field`. En un textarea ese mínimo
      // es incorrecto: obliga a reservar altura para texto multilínea que no existe y empuja
      // el resto del formulario hacia abajo. El área táctil la cubre el padding y el
      // `resize-y`, no una altura artificial.
      className={`field block min-h-0 resize-y px-3 py-2.5${
        hasError ? ' field-error' : ''
      }${className ? ` ${className}` : ''}`}
      {...rest}
    />
  );
}

export default Textarea;
