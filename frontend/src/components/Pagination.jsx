import Button from './ui/Button';

/*
 * Paginación de los listados.
 *
 * Tres decisiones que no son obvias:
 *
 * 1. `total` se normaliza con Number(). Viene de un `COUNT(*)` de MySQL a través del pool, y
 *    el mismo proyecto ya Suffrió que los agregados numéricos pueden llegar como texto: sin
 *    la conversión, `total === 1` nunca es verdadero y "1 resultado" se convierte en
 *    "1 resultados".
 *
 * 2. Los dos controles son `Button` de 44px, no botones de 36px. Es el último elemento de la
 *    lista y al que más se lo busca con el pulgar: reducir su área para "ahorrar" dos píxeles
 *    verticales es un mal negocio en un mostrador.
 *
 * 3. El separador de arriba lo pone el componente.Va fuera del contenedor con
 *    `overflow-x-auto` de la tabla, así el pie abarca el ancho completo de la tarjeta en vez
 *    de desplazarse con las columnas.
 */
function Pagination({ page, totalPages, total, onPageChange }) {
  if (totalPages <= 1) return null;

  const totalNumerico = Number(total) || 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
      <p className="text-sm text-ink-muted">
        Página <span className="tabular">{page}</span> de{' '}
        <span className="tabular">{totalPages}</span> ·{' '}
        <span className="tabular">{totalNumerico}</span>{' '}
        {totalNumerico === 1 ? 'resultado' : 'resultados'}
      </p>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          iconLeft={<ArrowLeftIcon className="h-4 w-4" />}
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          iconRight={<ArrowRightIcon className="h-4 w-4" />}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}

// Flechas del mismo trazo que el resto del proyecto (viewBox 24x24, fill none, stroke
// currentColor, strokeWidth 1.5, remates redondeados). Decorativas: el texto del botón ya
// dice a dónde lleva.
function ArrowLeftIcon({ className }) {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function ArrowRightIcon({ className }) {
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
      <path d="m12 5 7 7-7 7" />
      <path d="M5 12h14" />
    </svg>
  );
}

export default Pagination;