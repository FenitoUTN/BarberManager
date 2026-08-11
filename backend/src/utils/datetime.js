// Centraliza el cálculo de "hoy"/"ahora" en la zona horaria del negocio. Antes el
// código mezclaba new Date().toISOString() (UTC) con getHours()/getDay() (zona local
// del servidor), lo que desalinea el filtro de horarios "ya pasados" y el "hoy" de los
// reportes si el servidor no corre en la misma zona horaria que la barbería.
const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE || 'America/Costa_Rica';

function nowParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const get = (type) => parts.find((p) => p.type === type).value;
  return {
    dateISO: `${get('year')}-${get('month')}-${get('day')}`,
    hours: Number(get('hour')),
    minutes: Number(get('minute')),
  };
}

// Fecha de hoy (YYYY-MM-DD) en la zona horaria del negocio.
function todayISO() {
  return nowParts().dateISO;
}

// Minutos transcurridos desde medianoche, en la zona horaria del negocio.
function nowMinutesSinceMidnight() {
  const { hours, minutes } = nowParts();
  return hours * 60 + minutes;
}

function timeToMinutesOfDay(horaHHMM) {
  const [h, m] = horaHHMM.split(':').map(Number);
  return h * 60 + m;
}

// true si fecha+hora ya pasó estrictamente respecto al momento actual del negocio.
function isBeforeNow(fechaISO, horaHHMM) {
  const { dateISO, hours, minutes } = nowParts();
  if (fechaISO !== dateISO) return fechaISO < dateISO;
  return timeToMinutesOfDay(horaHHMM) < hours * 60 + minutes;
}

// true si fecha+hora ya pasó o es el momento actual del negocio.
function isAtOrBeforeNow(fechaISO, horaHHMM) {
  const { dateISO, hours, minutes } = nowParts();
  if (fechaISO !== dateISO) return fechaISO < dateISO;
  return timeToMinutesOfDay(horaHHMM) <= hours * 60 + minutes;
}

module.exports = {
  BUSINESS_TIMEZONE,
  todayISO,
  nowMinutesSinceMidnight,
  isBeforeNow,
  isAtOrBeforeNow,
};
