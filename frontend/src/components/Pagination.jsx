function Pagination({ page, totalPages, total, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-400">
      <p>
        Página {page} de {totalPages} · {total} resultado{total === 1 ? '' : 's'}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-neutral-700/50 px-3 py-1.5 font-medium text-neutral-400 transition hover:border-gold-600/40 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-neutral-700/50 px-3 py-1.5 font-medium text-neutral-400 transition hover:border-gold-600/40 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default Pagination;
