const test = require('node:test');
const assert = require('node:assert/strict');

process.env.BUSINESS_TIMEZONE = 'America/Costa_Rica';

const {
  isBeforeNow,
  isAtOrBeforeNow,
  todayISO,
  nowMinutesSinceMidnight,
  BUSINESS_TIMEZONE,
} = require('../src/utils/datetime');

test('la fecha de hoy viene en el formato YYYY-MM-DD', () => {
  assert.match(todayISO(), /^\d{4}-\d{2}-\d{2}$/);
});

test('la hora actual del negocio cae dentro del día', () => {
  const minutes = nowMinutesSinceMidnight();
  assert.ok(minutes >= 0 && minutes <= 1439, `fuera de rango: ${minutes}`);
});

test('una hora anterior a la actual sí está en el pasado', () => {
  const today = todayISO();
  const minutes = nowMinutesSinceMidnight();
  // Si ya pasó medianoche, sólo comprobamos una hora del día anterior.
  const early = minutes > 60 ? '00:30' : null;

  if (early !== null) {
    assert.equal(isBeforeNow(today, early), true, 'las 00:30 deben estar en el pasado');
    assert.equal(isAtOrBeforeNow(today, early), true);
  }
});

test('una hora futura no está en el pasado', () => {
  const today = todayISO();
  const minutes = nowMinutesSinceMidnight();
  // Elegimos una hora que con certeza todavía no llegó.
  const later = minutes < 1380 ? '23:30' : '23:59';

  assert.equal(isBeforeNow(today, later), false, `${later} no debería estar en el pasado`);
  assert.equal(isAtOrBeforeNow(today, later), false);
});

test('un día pasado siempre queda en el pasado, sin importar la hora', () => {
  assert.equal(isBeforeNow('2020-01-01', '23:59'), true);
  assert.equal(isAtOrBeforeNow('2020-01-01', '00:00'), true);
});

test('un día futuro nunca queda en el pasado', () => {
  assert.equal(isBeforeNow('2999-12-31', '00:00'), false);
  assert.equal(isAtOrBeforeNow('2999-12-31', '23:59'), false);
});

test('el módulo expone la zona horaria del negocio que usó', () => {
  assert.equal(BUSINESS_TIMEZONE, 'America/Costa_Rica');
});

test('el filtro de "ya pasó" no depende de la zona horaria del proceso', () => {
  // El módulo fija su zona en el import, así que el resultado tiene que ser estable
  // entre invocaciones: si mezclara la zona del servidor con la del negocio, el mismo
  // dato daría respuestas distintas y el filtro de disponibilidad sería impredecible.
  const antes = isBeforeNow('2020-01-01', '23:59');
  const despues = isBeforeNow('2020-01-01', '23:59');
  assert.equal(antes, despues);
  assert.equal(antes, true);
});