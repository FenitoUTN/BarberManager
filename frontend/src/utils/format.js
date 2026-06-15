export function todayISO() {
  return new Date().toISOString().slice(0, 10);
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
