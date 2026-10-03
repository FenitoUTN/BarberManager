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

/*
 * Estado de carga de un bloque de contenido.
 *
 * `role="status"` con `aria-live="polite"` no es adorno: sin él, quien navega con lector de
 * pantalla oye un silencio durante la carga y no puede distinguir "está cargando" de "se
 * colgó". El indicador es decorativo y se oculta del árbol de accesibilidad; lo que se
 * anuncia es el texto.
 *
 * El padding es generoso a propósito: reemplaza un bloque de altura real, y reservar poco
 * espacio hace que la página salte cuando llegan los datos.
 */
function LoadingState({ label = 'Cargando', className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 py-12${
        className ? ` ${className}` : ''
      }`}
    >
      <LoaderIcon className="h-5 w-5 animate-spin text-ink-subtle" />
      <p className="text-sm text-ink-muted">{label}</p>
    </div>
  );
}

export default LoadingState;
