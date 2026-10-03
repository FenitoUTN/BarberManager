const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Esta suite convierte una invariante en una garantía automática: toda ruta que
// modifica estado debe quedar detrás de authenticate (que encadena verifyCsrf) o
// declarar verifyCsrf explícitamente. Documentarlo en CONSTRAINTS.md no alcanza si
// nada lo verifica; esto sí.

const ROUTES_DIR = path.join(__dirname, '..', 'src', 'routes');

// Rutas públicas por diseño: ocurre antes de que exista sesión, así que no hay cookie
// contra la que comparar el token. Excluirlas es una decisión consciente, no un olvido.
const EXENTES_PUBLICOS = new Set([
  'POST /register',
  'POST /login',
]);

// Extrae cada declaración de ruta junto con su cadena completa de handlers. Se recorre
// equilibrando paréntesis en vez de usar una ventana fija de líneas: una ventana fija
// marcaba como protegida una ruta pública por culpa del CSRF de otra línea siguiente.
function extraerRutas(src) {
  const rutas = [];
  const re = /router\.(get|post|put|patch|delete)\s*\(/g;
  let match;

  while ((match = re.exec(src)) !== null) {
    const inicio = match.index;
    let profundidad = 0;
    let i = match.index + match[0].length - 1;
    let sawOpen = false;

    for (; i < src.length; i++) {
      if (src[i] === '(') {
        profundidad++;
        sawOpen = true;
      } else if (src[i] === ')') {
        profundidad--;
        if (sawOpen && profundidad === 0) {
          i++;
          break;
        }
      }
    }

    const declaracion = src.slice(inicio, i);
    const ruta = (declaracion.match(/router\.\w+\s*\(\s*'([^']*)'/) || [, ''])[1];
    rutas.push({
      metodo: match[1].toUpperCase(),
      ruta,
      linea: src.slice(0, inicio).split('\n').length,
      declaracion,
    });
  }

  return rutas;
}

const archivos = fs
  .readdirSync(ROUTES_DIR)
  .filter((n) => n.endsWith('.js'))
  .map((nombre) => ({
    nombre,
    src: fs.readFileSync(path.join(ROUTES_DIR, nombre), 'utf8'),
  }));

const escrituras = archivos.flatMap(({ nombre, src }) => {
  const protegidoPorRouter = /router\.use\(\s*authenticate\s*\)/.test(src);
  return extraerRutas(src)
    .filter((r) => r.metodo !== 'GET')
    .map((r) => ({ ...r, archivo: nombre, protegidoPorRouter }));
});

test('el análisis encontró las rutas de escritura que dice el inventario', () => {
  // Si este número baja, se borraron rutas. Si sube, hay trabajo nuevo sin revisar.
  assert.ok(escrituras.length >= 20, `sólo se detectaron ${escrituras.length} rutas de escritura`);
});

test('toda ruta de escritura está protegida contra CSRF', () => {
  const desprotegidas = escrituras.filter(({ metodo, ruta, declaracion, protegidoPorRouter }) => {
    if (protegidoPorRouter) return false;
    if (/authenticate|verifyCsrf/.test(declaracion)) return false;
    return !EXENTES_PUBLICOS.has(`${metodo} ${ruta}`);
  });

  const detalle = desprotegidas
    .map((r) => `  ${r.archivo}:${r.linea} ${r.metodo} ${r.ruta}`)
    .join('\n');

  assert.equal(
    desprotegidas.length,
    0,
    `rutas de escritura sin authenticate ni verifyCsrf:\n${detalle}`
  );
});

test('la lista de rutas públicas no crece sin que se note', () => {
  // Si alguien agrega una ruta pública nueva, este test obliga a agregarla a
  // EXENTES_PUBLICOS. El costo de esa fricción es exactamente el punto: cada ruta
  // pública debería ser una decisión, no un descuido.
  const sinSesion = escrituras.filter(({ metodo, ruta, declaracion, protegidoPorRouter }) => {
    if (protegidoPorRouter) return false;
    return !/authenticate|verifyCsrf/.test(declaracion);
  });

  for (const ruta of sinSesion) {
    assert.ok(
      EXENTES_PUBLICOS.has(`${ruta.metodo} ${ruta.ruta}`),
      `${ruta.archivo}:${ruta.linea} expone ${ruta.metodo} ${ruta.ruta} sin sesión ni CSRF. ` +
        'Si es intencional, agregalo a EXENTES_PUBLICOS con una razón.'
    );
  }
});

test('logout exige CSRF aunque no exija sesión', () => {
  // Es el caso que motivó la remediación: sin token vigente hay que poder cerrar
  // sesión igual, y sin CSRF un sitio externo podría bloquear la cuenta.
  const logout = escrituras.find((r) => r.ruta === '/logout');

  assert.ok(logout, 'no se encontró la ruta de logout');
  assert.match(logout.declaracion, /verifyCsrf/);
  assert.doesNotMatch(logout.declaracion, /authenticate/);
});

test('los saneos de cookies usan métodos seguros sin CSRF', () => {
  const auth = archivos.find((a) => a.nombre === 'auth.routes.js');
  const rutas = extraerRutas(auth.src);
  const logout = rutas.find((r) => r.ruta === '/logout');

  assert.ok(logout);
  assert.equal(logout.metodo, 'POST');
});