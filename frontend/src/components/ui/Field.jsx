import { createContext } from 'react';

/*
 * Field es el patrón base de todo formulario de la app.
 *
 * Por qué existe el contexto y no un simple label suelto: un `<label>` sin relación con su
 * mensaje de error deja al lector de pantalla announcing "campo inválido" sin decir qué
 * hacer. El contexto conecta el error y el hint con el control sin obligar a la página a
 * calcular ids a mano en cada campo, que es exactamente donde se rompe la accesibilidad
 * cuando hay prisa.
 *
 * Los ids se derivan de `htmlFor`, así que son estables entre renders y predecibles desde
 * las pruebas.
 */

// El contexto es un valor, no un componente: la regla de react-refresh lo marca, pero el
// archivo tiene que exportarlo o Input/Select/Textarea no pueden heredar los ids.
// eslint-disable-next-line react-refresh/only-export-components
export const FieldContext = createContext(null);

/**
 * Deriva los ids de un campo. Se exporta para los controles que se usan sueltos, fuera de
 * un <Field>, y para las pruebas.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useFieldIds(htmlFor) {
  return {
    inputId: htmlFor,
    errorId: `${htmlFor}-error`,
    hintId: `${htmlFor}-hint`,
  };
}

function AlertIcon({ className }) {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function Field({ label, htmlFor, error, hint, required = false, children, className = '' }) {
  const ids = useFieldIds(htmlFor);

  // El contexto no se arma con un objeto literal en el JSX a propósito: recrearlo en cada
  // render invalida la memoización de los hijos que lean del contexto.
  const contextValue = {
    inputId: ids.inputId,
    errorId: ids.errorId,
    hintId: ids.hintId,
    hasError: Boolean(error),
    hasHint: Boolean(hint),
  };

  return (
    <FieldContext value={contextValue}>
      <div className={`flex flex-col gap-1.5${className ? ` ${className}` : ''}`}>
        {/*
          El asterisco es decorativo: `aria-hidden` porque el atributo `required` real va en
          el control hijo y el lector de pantalla ya anuncia "obligatorio". Un asterisco leído
          en voz alta como "asterisco" no aporta nada.
        */}
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
          )}
        </label>

        {/* El hijo (Input, Select o Textarea) lee FieldContext y se aplica a sí mismo el id
            y los aria-describedby. Si se mete un control propio, hay que cablearlo a mano. */}
        {children}

        {/* El error va pegado al campo, antes del hint: si el mensaje queda debajo de una
            línea de ayuda, pasa desapercibido justo cuando más hay que leerlo. */}
        {error && (
          <p id={ids.errorId} role="alert" className="flex items-start gap-1.5 text-xs text-danger">
            <AlertIcon className="mt-px h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {hint && (
          <p id={ids.hintId} className="text-xs text-ink-subtle">
            {hint}
          </p>
        )}
      </div>
    </FieldContext>
  );
}

export default Field;
