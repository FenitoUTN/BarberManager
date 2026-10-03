import Button from './Button';

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

function RefreshIcon({ className }) {
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
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

/*
 * Estado de error de un bloque de contenido.
 *
 * `role="alert"` porque este estado aparece después de que la persona ya está mirando la
 * pantalla esperando datos: si se anuncia en silencio, lee una lista vacía y no sabe que
 * hubo un fallo.
 *
 * El copy describe lo que pasa en pantalla, no la causa interna del backend. "Algo salió
 * mal" no le dice a nadie que hacer; "La informacion no aparece en pantalla" si, y por eso
 * el boton de reintentar se ofrece apenas el consumidor pasa onRetry.
 */
function ErrorState({
  title = 'No pudimos cargar los datos',
  message = 'La información no aparece en pantalla. Vuelve a intentarlo en un momento.',
  onRetry = null,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 py-14 text-center${
        className ? ` ${className}` : ''
      }`}
    >
      <span
        aria-hidden="true"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger"
      >
        <AlertIcon className="h-6 w-6" />
      </span>

      <div className="max-w-md">
        <h2 className="font-display text-lg text-ink">{title}</h2>
        {message && <p className="mt-1 text-sm text-ink-muted">{message}</p>}
      </div>

      {onRetry && (
        <Button
          variant="secondary"
          className="mt-1"
          iconLeft={<RefreshIcon className="h-4 w-4" />}
          onClick={onRetry}
        >
          Reintentar
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
