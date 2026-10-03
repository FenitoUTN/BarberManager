// Estado de carga compartido por dos motivos que antes estaba duplicados: la espera de
// sesión en ProtectedRoute y la descarga de un chunk de ruta. Un solo lugar donde ajustar
// colores, tamaños o atributos de accesibilidad.
//
// El indicador es decorativo: se oculta del árbol de accesibilidad y el anuncio va en el
// texto, que es lo que un lector de pantalla necesita. Sin `role="status"` el usuario
// ciego oye un silencio y no sabe si la app se colgó.

function RouteFallback({ label = 'Cargando...', fullScreen = false }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        fullScreen
          ? 'flex h-screen items-center justify-center bg-ink'
          : 'flex min-h-[50vh] items-center justify-center'
      }
    >
      <div
        className={`flex items-center gap-3 ${
          fullScreen ? 'text-on-ink-muted' : 'text-ink-muted'
        }`}
      >
        <div
          aria-hidden="true"
          className={`h-5 w-5 animate-spin rounded-full border-2 ${
            fullScreen
              ? 'border-on-ink/25 border-t-brass'
              : 'border-line-strong border-t-brand'
          }`}
        />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}

export default RouteFallback;