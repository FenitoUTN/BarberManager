# Auditoría de Hallazgos — BarberManager

**Feature**: `auditoria-completa-sistema`
**Rama**: `feature/barbermanager-v1`
**Alcance**: fases de inventario (Fase 1) y auditoría estática (Fase 2) sobre backend Express + MySQL y frontend React 19 + Vite 8.

## 0. Estado de verificación (resultados OBSERVADOS, no esperados)

| Gate | Comando | Resultado observado |
|---|---|---|
| Lint | `frontend: npm run lint` | **exit 0** — limpio (antes: exit 1, 1 error) |
| Build | `frontend: npm run build` | **exit 0** — 506.68 kB JS / 147.55 kB gzip, 1 warning de chunk >500 kB |
| Sintaxis backend | `node --check` en los 7 archivos tocados | **exit 0** en todos |
| Smoke de arranque | `require('./src/app')` con JWT/CORS de prueba | **carga sin error**, árbol de rutas resuelto |
| Tests | — | **Sin runner.** Ninguna señal de precedencia dispara. 0 archivos de test |
| Runtime API | — | **BLOQUEADO** — sin MySQL en el entorno |
| A11y navegador / console | — | **BLOQUEADO** — sin Chrome en el entorno |

Lo bloqueado por entorno queda declarado, nunca simulado.

### Accesibilidad: medido por parser, no estimado

Antes: 6 controles sin `id` y 2 labels sin `htmlFor` según grep lineal. Verificado con parser
JSX multi-línea: los 27 `<button>` **sí** tienen `type`, y los 2 labels envuelven su checkbox
(asociación implícita válida). Resultado final: **38 de 38 controles con nombre accesible**
(36 explícitos + 2 por asociación implícita).

## 1. Veredicto por área

| Área | Estado | Nota |
|---|---|---|
| Arquitectura | OK | Capas reales y coherentes en backend; capas limpias en frontend |
| SQL / persistencia | OK | 100% parametrizado, transacciones y locks correctos |
| Autenticación | WARN | Sólida en diseño; fuga de detalle en errores |
| Datos / credenciales | **CRITICAL** | Credencial de admin committed al repo |
| Entorno / configuración | **CRITICAL** | Puertos desalineados: el sistema no arranca bien por defecto |
| Testing | **ISSUES** | 0 tests |
| CI/CD | **ISSUES** | Sin automatización de ningún tipo |
| Accesibilidad | WARN | Base correcta (labels, focus, botones nativos); faltan nombres accesibles |
| Performance | WARN | Bundle monolítico, fuentes de terceros render-blocking |
| Gobernanza | **ISSUES** | Sin AGENTS.md, CONTRIBUTING.md, CONSTRAINTS.md, CHANGELOG.md ni LICENSE |

## 2. Tabla maestra de hallazgos

`Bloq.` = bloqueante para dejar el sistema 100% funcional.

| ID | Sev | Bloq. | Hallazgo | Evidencia |
|---|---|---|---|---|
| H-01 | **RESUELTO** | No | Credencial de administrador committed: eliminada del seed y del README. El admin ahora se crea con `npm run create-admin`, que genera una contraseña aleatoria y la imprime una vez. **Pendiente: rotar la contraseña en bases ya sembradas, y evaluar reescritura del historial de git** | `backend/database/schema.sql`, `backend/scripts/create-admin.js`, `README.md` |
| H-02 | **RESUELTO** | **Sí** | Puertos desalineados: el backend caía a 4000 mientras `.env.example`, el proxy de Vite, `VITE_API_URL` y el propio README (5 menciones, incluido "default 3000") usan 3000. Alineado a 3000 | `backend/src/server.js:4` |
| H-03 | **RESUELTO** | No | El manejador de errores devolvía `err.message` al cliente también en 500, filtrando detalle interno. Ahora los 4xx previstos pasan su mensaje y los 5xx se registran y responden genérico; se agrega guard de `headersSent` | `backend/src/middlewares/error.middleware.js` |
| H-04 | **RESUELTO** | **Sí** | `npm run lint` fallaba con exit 1 en un árbol limpio. Causa: `load()` llamaba setState de forma síncrona dentro del efecto. Reemplazado por sondeo recursivo con `setTimeout`, que además evita solapar peticiones | `frontend/src/components/NotificationBell.jsx` |
| H-05 | **RESUELTO** | Sí | Red de seguridad creada: 40 tests con `node:test` (0 dependencias nuevas), script raíz `npm run verify` (lint + build + tests) y workflow de CI que corre los tres gates. Verificado con mutaciones: romper CSRF → 4 fallos, reactivar la fuga de errores 5xx → 2 fallos. **Restan** hooks de commit y tests de integración con MySQL | `backend/test/`, `.github/workflows/ci.yml`, `package.json` |
| H-06 | **RESUELTO** | No | `POST /logout` sin verificación CSRF. La comprobación se extrajo a un middleware propio y se aplicó a logout | `backend/src/middlewares/csrf.middleware.js`, `backend/src/routes/auth.routes.js:11` |
| H-07 | **RESUELTO** | No | El catch-all servía `index.html` con 200 para rutas `/api/*` inexistentes. Ahora responden 404 en JSON | `backend/src/app.js:52-54` |
| H-08 | **RESUELTO** | No | Sin respuesta a 401: un token caducado dejaba la UI con datos viejos. Ahora el interceptor emite `auth:unauthorized` y AuthContext limpia la sesión, y ProtectedRoute redirige | `frontend/src/api/axiosClient.js`, `frontend/src/context/AuthContext.jsx` |
| H-09 | **RESUELTO** | No | 3 controles sin nombre accesible en el editor de horario. Ahora con `aria-label` derivado del día | `frontend/src/pages/availability/Availability.jsx` |
| H-10 | **RESUELTO** | No | El input de búsqueda solo tenía nombre por `placeholder`. Ahora con label visualmente oculto | `frontend/src/pages/clients/ClientList.jsx:66-69` |
| H-11 | **RESUELTO** | No | `lang="en"` con interfaz en español (WCAG 3.1.1). Ahora `lang="es"` | `frontend/index.html:2` |
| H-12 | **RESUELTO** | No | La campana no exponía `aria-expanded` ni anunciaba el contador. Ahora `aria-expanded`, `aria-haspopup` y región `role="status"` con `aria-live="polite"` | `frontend/src/components/NotificationBell.jsx:109-127` |
| H-13 | **RESUELTO** | Sí | 16 páginas con `lazy()` y `Suspense` por ruta. Bundle de entrada 506.68 kB → 295.95 kB (gzip 147.55 → 96.04 kB) y desapareció el aviso de chunk >500 kB. `motion` (~121 kB) salió del bundle inicial: quedó en un chunk async que sólo piden `/login` y `/register`, verificado que en el entry la referencia está dentro de `__vite__mapDeps` y no es un import estático, así que los usuarios autenticados no lo descargan. El `Suspense` va dentro de cada ruta para que el `Layout` no desaparezca al navegar. Se agregó `RouteErrorBoundary`: el chunk dinámico introduce un modo de falla nuevo (un `index.html` viejo en caché pide un chunk ya borrado) que antes no existía | `frontend/src/App.jsx`, `frontend/src/components/RouteFallback.jsx`, `frontend/src/components/ProtectedRoute.jsx` |
| H-14 | **RESUELTO PARCIAL** | No | `CONSTRAINTS.md` creado con 13 invariantes, cada una etiquetada como automática o de revisión humana, y tres invariantes convertidas en tests. **Restan** `AGENTS.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE`, `CODEOWNERS` y hooks de commit | `CONSTRAINTS.md` |
| H-15 | LOW | No | `monto_total` valida mínimo pero no tiene tope máximo | `backend/src/validators/apartado.validator.js:9-12` |
| H-16 | LOW | No | El título del documento nunca cambia: el SPA siempre se llama "BarberManager" (WCAG 2.4.2) | repo completo |
| H-17 | **RESUELTO** | No | Tabla de disponibilidad sin `<caption>` ni `scope`. Ahora con caption en `sr-only` y `scope="col"` | `frontend/src/pages/availability/Availability.jsx` |
| H-18 | **RESUELTO** | No | `BUSINESS_TIMEZONE` se leía en código sin estar documentado. Ahora documentado con su default `America/Costa_Rika` | `backend/.env.example` |
| H-19 | LOW | No | Artefacto de herramienta versionado en git: `frontend/.claude-flow/` con un `state.json` de 26 KB | `frontend/.claude-flow/policy/state.json` |
| H-20 | **RESUELTO** | No | Sin `.gitignore` raíz. Agregado, verificado sin tapar nada ya versionado | `.gitignore` |
| H-21 | **RESUELTO** | No | Referencia colgante a `docs/Documento_Formal.md`. Ahora apunta al README | `backend/database/schema.sql:5-7` |
| H-22 | LOW | No | `DB_PASSWORD` cae silenciosamente a cadena vacía si falta | `backend/src/config/db.js:8` |
| H-23 | LOW | No | Fuentes servidas desde CDN de terceros: 2 preconnect + 1 stylesheet render-blocking | `frontend/index.html:7-12` |
| H-24 | LOW | No | ESLint sin `eslint-plugin-jsx-a11y`: la superficie de accesibilidad no está guardada por lint | `frontend/eslint.config.js:10-20` |
| H-25 | INFO | No | Código 100% JS/JSX, sin TypeScript ni type-checking en ningún paquete | repo completo |
| H-26 | INFO | No | Supabase completamente ausente | repo completo |
| H-27 | INFO | No | `schema.sql` es la única fuente de verdad; no hay carpeta de migraciones versionadas | `backend/database/` |
| H-28 | INFO | No | `allowedHosts: true` en el servidor de desarrollo de Vite | `frontend/vite.config.js:9` |
| H-29 | INFO | No | Notificaciones por sondeo cada 30 s en lugar de tiempo real | `frontend/src/components/NotificationBell.jsx:4,44` |

## 3. Lo que está bien (para no romperlo al remediar)

- **SQL 100% parametrizado.** El `WHERE` dinámico solo se compone con fragmentos literales fijos y
  marcadores `?`. No hay concatenación de input en ningún modelo.
- **Concurrencia resuelta correctamente.** La reserva de citas serializa por fecha con
  `GET_LOCK`; el abono a apartados usa transacción con `FOR UPDATE` y revalida el saldo después
  de tomar el lock.
- **Errores async cubierto.** Los 9 controllers usan `try/catch` + `next(error)`, necesario en
  Express 4, que no captura rechazos de promesas por sí solo.
- **Auth bien planteada.** Cookie httpOnly, CSRF double-submit, `JWT_SECRET` sin valor por
  defecto inseguro (lanza al arrancar), y revalidación del usuario contra la base en cada request.
- **CORS falla cerrado en producción.** Sin origin comodín con `credentials: true`.
- **Base de accesibilidad correcta.** 27/27 botones nativos con `type` explícito, 34 labels
  correctamente asociados, estilos de foco presentes (35 `focus:ring-gold-*`), sin `onClick` en
  elementos no interactivos.
- **Tailwind 4 CSS-first** con tokens centralizados en `@theme`.

## 4. Orden de remediación — estado

| Slice | Hallazgos | Estado |
|---|---|---|
| 1 | H-02, H-18 | Hecho. Puerto alineado a 3000; `BUSINESS_TIMEZONE` documentado |
| 2 | H-01, H-21 | Hecho. Seed sin credencial; admin vía `npm run create-admin`; README actualizado |
| 3 | H-03, H-04, H-12 | Hecho. Errores enmascarados en 5xx; lint en exit 0; campana accesible |
| 4 | H-06, H-07, H-08 | Hecho. CSRF extraído a middleware; 404 de API en JSON; 401 propagado a sesión |
| 5 | H-09, H-10, H-11, H-17, H-20 | Hecho. Bloque de accesibilidad y `.gitignore` raíz |

**Pendiente, en orden de valor:**

1. **H-01 (resto)** — rotar la contraseña del admin en cualquier base ya sembrada y decidir
   sobre reescritura del historial de git. Borrar el hash del archivo **no** lo borra de los
   commits anteriores.
2. **H-05** — la red de seguridad: hoy no hay forma de detectar una regresión. Es lo que
   permitió que H-02 y H-04 sobrevivieran tanto tiempo.
3. **H-14** — gobernanza: `CONSTRAINTS.md` y `AGENTS.md` para que las invariantes (SQL
   parametrizado, cookie httpOnly, CSRF en métodos de escritura) queden escritas y no en la
   memoria de nadie.
4. **H-13** — code-splitting por ruta; elimina el warning de 500 kB.
5. **H-16** — el título del documento nunca cambia entre rutas.
6. **H-19** — sacar `frontend/.claude-flow/` del control de versiones.

## 5. Restricciones del entorno para fases siguientes

Sin MySQL ni Chrome no se pueden ejecutar los gates de runtime (API en vivo, auditoría de
accesibilidad en navegador, errores de consola, smoke E2E). La fase de remediación debe resolver
esos gates o declarar su bloqueo de forma explícita; no se reportan como aprobados.

Con la instalación actual, `npm run create-admin` y el arranque del backend fallan con
`connect ECONNREFUSED 127.0.0.1:3306` de forma controlada, lo que confirma que falta MySQL local.