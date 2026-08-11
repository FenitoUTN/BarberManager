export function todayISO() {
  // Fecha local del navegador (no UTC): toISOString() puede saltar al día
  // siguiente/anterior según la zona horaria del usuario y la hora del día.
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatPrice(precio) {
  return `₡${Number(precio).toLocaleString('es-CR')}`;
}

export function formatDate(fecha) {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-CR');
}

export function formatTime(time) {
  return time?.slice(0, 5);
}
