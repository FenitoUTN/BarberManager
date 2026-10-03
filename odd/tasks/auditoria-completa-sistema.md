# ODD — Auditoría Completa del Sistema BarberManager

**Feature**: `auditoria-completa-sistema`
**Proyecto**: `barbermanager` (git_remote, cwd: /home/feno/Escritorio/BarberManager)
**Rama detectada**: Código real en `origin/feature/barbermanager-v1` (main vacío)
**Estado**: EN PROGRESO — Fase 0 completa, Fase 1 (mapeo read-only) por iniciar
**Modo**: Read-only primero → Consolidación → Remediación incremental (slices) → Verificación integral → Cierre

## 1. Objetivo

Realizar una **auditoría completa transversal** del sistema BarberManager utilizando **todas las skills instaladas**, identificar hallazgos con evidencia (ruta + línea/selector), priorizarlos (CRITICAL/HIGH/MEDIUM/LOW/INFO), corregir lo **bloqueante para dejar el sistema 100% funcional** y documentar lo no-bloqueante. Todo sin romper funcionalidad existente.

## 2. Alcance

**Incluye**: Arquitectura, Seguridad, Calidad, Testing (unit/integration/E2E), Accesibilidad (WCAG 2.2), Performance, Backend (API/DB/Supabase), Frontend (UI/UX), DevOps/CI-CD, Observabilidad, i18n, Docs/ADRs, Constraints.

**Excluye**: Cambios de alcance funcional no necesarios para funcionalidad. Remediación únicamente de lo necesario para alcanzar estado funcional verificable.

## 3. Principios (ODD + Routing)

- **Read-only primero**: No escribir/editar hasta tener tabla maestra consolidada (Fase 0–2).
- **Organic Driven Development**: Explorar → Resolver incertidumbre → Clasificar → Trackear (este doc + mirror Engram) → Implementar tarea por tarea → Cerrar.
- **Delegation triggers**: 4+ archivos → explorar/mapping delegado. 2+ archivos no-triviales → writer delegado. Lectura preparatoria → delegar.
- **Skill routing**: Respetar ownership (SDD chain vs spec-driven-development). Complementarios dentro de fases. Sin paralelismo conflictivo.
- **Slices pequeños**: Incremental (incremental-implementation), work-unit commits (tests+docs+behavior), TDD cuando aplique (RED→GREEN→REFACTOR).
- **Evidencia**: Todo hallazgo con `ruta:línea` o selector + salida observable.
- **Honestidad**: Fallos reportados como observados, nunca inventados. Runner detectado (sin inventar comando).

## 4. Fases y Tareas

### FASE 0 — Inicialización (COMPLETADA)
- [x] T-001: Detectar proyecto (mem_current_project) — barbermanager (git_remote)
- [x] T-002: Recuperar contexto (mem_context) — sesiones/observaciones previas
- [x] T-003: Crear mirror Engram (mem_save) + juicio conflictos
- [x] T-004: Crear documento ODD `odd/tasks/auditoria-completa-sistema.md`

### FASE 1 — Mapeo exhaustivo read-only (COMPLETADA — 9/9)

> Ejecución **inline** (no delegada): el proveedor de modelos rechaza sub-agentes fuera del
> runtime de OpenCode ("free tier can only be used from within OpenCode"). Restricción de
> proveedor, no defecto de Gentle AI. Inventario obtenido por shell con exclusión explícita de
> `node_modules`/`dist`/`.git`.

- [x] T-010: Exploración estructural repo — 3 paquetes (root scripts-only, `backend/`, `frontend/`), ~7.4k líneas. Backend con capas reales (routes→controllers→models + middlewares/validators/utils/config). Frontend pages/components/context/api/utils. Resíduo tracked: `frontend/.claude-flow/` (2 archivos, state.json 26KB).
- [x] T-011: Inventario configs — Presentes: `frontend/eslint.config.js`, `frontend/vite.config.js`, `frontend/postcss.config.js`, `backend/.env.example`, `frontend/.env.example`, 2×`.gitignore`. **Ausentes**: tsconfig (moot), tailwind.config (Tailwind 4 CSS-first `@theme` ✓), prettier, biome, Dockerfile, docker-compose, Makefile, **`.gitignore` raíz**, .editorconfig.
- [x] T-012: Inventario backend — boot `server.js:1-8` → `app.js:13`. Cadena: helmet → cors(credentials) → cookieParser → json → morgan → limiters login/register → `/api` → static → catch-all → errorHandler. 9 grupos de rutas, ~35 endpoints. **SQL 100% parametrizado**, 0 concatenación de input. Auth: JWT cookie httpOnly revalidado contra BD por request, CSRF double-submit, `JWT_SECRET` lanza al boot si falta (8h). Concurrencia: `GET_LOCK` en reserva de citas, `FOR UPDATE` + transacción en abonos. Validación express-validator en todas las rutas salvo `reportController.apartadosActivos` y `logout`.
- [x] T-013: Inventario frontend — 18 rutas en `App.jsx:22-60`, **ninguna lazy/dynamic-import**. `ProtectedRoute` con estado `loading` ✓ y roles anidados ✓. axios `baseURL: VITE_API_URL || '/api'` + `withCredentials` + interceptor CSRF ✓; **sin response interceptor** (401 no dispara logout/redirect). Estado: un solo `AuthContext`. Tailwind 4 con tokens `@theme` centralizados (gold + Playfair/Inter).
- [x] T-014: Inventario DB/Supabase — `backend/database/schema.sql` única fuente de verdad: 8 tablas, FKs, índices, CHECK y ENUMs. **Sin carpeta de migraciones**. **Supabase completamente ausente**. RLS N/A.
- [x] T-015: Inventario tests — **0 artefactos**. Sin `*.test.*`/`*.spec.*`/`__tests__`/configs vitest|jest|playwright|cypress. Ninguna precedencia dispara. Sin script `test` en ningún package.json.
- [x] T-016: Inventario CI/CD — **`.github/` ausente por completo**. Sin husky, lint-staged, commitlint, semantic-release. Sin config de despliegue. `allowedHosts: true` en `vite.config.js:9`.
- [x] T-017: Inventario seguridad — env vars: NODE_ENV, PORT, JWT_SECRET, JWT_EXPIRES_IN, DB_*, CORS_ORIGIN, BUSINESS_TIMEZONE (esta última **no documentada** en `.env.example`). `.env` no tracked ✓. Rate limits: login 10/15min, register 5/h. Helmet montado sin headers deshabilitados. CORS falla cerrado en producción ✓.
- [x] T-018: Inventario a11y/i18n/docs — Superficie a11y: 34 `<label>` / 32 `htmlFor` (2 sin asociar), 27 `<button>`, **2 `aria-*`, 0 `role=`, 0 `tabIndex`, 0 `onKeyDown`**, 0 `<img>` (iconos SVG inline). `index.html:2` `lang="en"` con UI 100% español. Google Fonts CDN. Sin tooling a11y ni i18n. Docs: `README.md` + `docs/PLAN-MEJORAS-FUTURAS.md`; `schema.sql:6` referencia `docs/Documento_Formal.md` **inexistente**. Gobernanza **ausente**: AGENTS.md, CONTRIBUTING.md, CONSTRAINTS.md, CHANGELOG.md, LICENSE, CODEOWNERS.

### HALLAZGOS DE INVENTARIO (entradas crudas para Fase 3 — sin severidad aún)

| # | Evidencia | Observación |
|---|---|---|
| I-01 | `backend/database/schema.sql:170-176` | Credencial admin committed: contraseña en texto plano en un comentario (redactada aquí a propósito) **y** hash bcrypt en el INSERT de semilla |
| I-02 | `backend/src/middlewares/error.middleware.js:4-7` | `err.message` se devuelve al cliente también en 500, sin enmascarar detalle interno; sin guard `headersSent` |
| I-03 | `server.js:4` vs `backend/.env.example:2` vs `frontend/vite.config.js:12` vs `frontend/.env.example:1` | Desalineación de puerto: backend cae a **4000**, proxy/VITE apuntan a **3000**. Sin `.env` el frontend no alcanza la API |
| I-04 | `backend/src/routes/auth.routes.js:11` | `POST /logout` sin `authenticate` → sin verificación CSRF en logout |
| I-05 | `backend/src/app.js:55-62` | Catch-all `app.get('*')` sirve `index.html` para rutas `/api/*` no encontradas, en vez de 404 JSON |
| I-06 | `backend/src/validators/apartado.validator.js:9-12` | `monto_total` valida `min: 0.01` pero **sin tope máximo** (confirma hallazgo previo) |
| I-07 | `frontend/src/api/axiosClient.js` | Sin response interceptor: un 401 por sesión expirada no fuerza logout ni redirección |
| I-08 | `frontend/index.html:2` | `lang="en"` con interfaz íntegramente en español (WCAG 3.1.1) |
| I-09 | `frontend/index.html:7-12` | Google Fonts vía CDN: 2 preconnect + 1 stylesheet render-blocking de terceros |
| I-10 | Repo completo | 0 tests, 0 CI, 0 hooks: ningún cambio tiene guarda automática |
| I-11 | Repo completo | Ausentes AGENTS.md / CONTRIBUTING.md / CONSTRAINTS.md / CHANGELOG.md / LICENSE |
| I-12 | `frontend/src/App.jsx:22-60` | 18 rutas importadas de forma estática: sin code-splitting, un único bundle |
| I-13 | Repo completo | 100% JS/JSX, cero TypeScript y sin type-checking en ningún paquete |
| I-14 | `backend/src/utils/datetime.js` (BUSINESS_TIMEZONE) | Env var leída por el código y **ausente** de `backend/.env.example` |
| I-15 | `frontend/.claude-flow/` | Artefacto de herramienta **tracked** en git (2 archivos, state.json 26KB) |
| I-16 | `.gitignore` raíz ausente | Sin `node_modules` ni `.env` protegidos a nivel raíz (cada sub-paquete sí cubre `.env`) |
| I-17 | `backend/database/schema.sql:6` | Referencia colgante a `docs/Documento_Formal.md`, que no existe |
| I-18 | `frontend/eslint.config.js:10-20` | ESLint sin `eslint-plugin-jsx-a11y`: la superficie a11y no está guardada por lint |

### FASE 2 — Auditorías verticales (read-only) — COMPLETADA (12/12, vía estática)

> Modo estático por falta de navegador y MySQL en el entorno. Los gates que requieren runtime
> quedan declarados BLOQUEADOS, nunca simulados. Aplicado disciplina anti-falso-positivo: tres
> hallazgos descartados tras verificar el marcado real (`button` sin `type` = falso, `<label>`
> envolvente = asociación implícita válida, `NavLink` ya emite `aria-current`).

- [x] T-020: Arquitectura — capas reales y coherentes; sin anti-patrones. Veredicto OK
- [x] T-021: Seguridad — H-01 (CRITICAL), H-03, H-06. SQL saneo, auth y CORS sólidos
- [x] T-022: Calidad — `npm run lint` **exit 1** (H-04). Build exit 0 (H-13)
- [x] T-023: Testing — 0 tests, ninguna señal de precedencia dispara. Sin runner que auditar
- [x] T-024: Accesibilidad — H-09, H-10, H-11, H-12, H-16, H-17. Base correcta, faltan nombres
- [x] T-025: Performance — bundle 505.57 kB / 147.18 kB gzip (H-13), fuentes CDN (H-23)
- [x] T-026: Backend/DB — `schema.sql` como única fuente, sin migraciones (H-27), Supabase ausente (H-26)
- [x] T-027: Frontend/UI/UX — sin response interceptor (H-08), sin code-splitting (H-13)
- [x] T-028: DevOps/CI — `.github/` ausente, cero automatización (H-05)
- [x] T-029: Observabilidad — solo `morgan`; sondeo cada 30 s en vez de tiempo real (H-29)
- [x] T-030: i18n — sin capa de i18n; `lang="en"` con UI en español (H-11)
- [x] T-031: Docs/ADRs/Constraints — gobernanza ausente (H-14), referencias colgantes (H-21)

### FASE 3 — Consolidación hallazgos (COMPLETADA 4/4)
- [x] T-040: Crear `reports/auditoria-hallazgos.md` (tabla maestra, 29 hallazgos H-01–H-29)
- [x] T-041: Clasificar por severidad (2 CRITICAL, 2 HIGH, 11 MEDIUM, 10 LOW, 4 INFO) + bloqueante
- [x] T-042: Validar supuestos críticos — 3 falsos positivos descartados verificando marcado real
- [x] T-043: Priorizar — orden de remediación definido: H-02 → H-01 → H-03/H-04 → H-06/07/08

### FASE 4 — Remediación incremental (slices) — EN PROGRESO (10/12 resueltos)
- [x] T-050: Rama de trabajo = `feature/barbermanager-v1` (el código real ya vive ahí; no se creó rama aparte para evitar dispersión)
- [ ] T-051: `CONSTROLTS.md` — pendiente, agrupado con H-14
- [x] T-052: CRITICAL — H-01 (credencial admin) y H-02 (puerto) resueltos
- [x] T-053: HIGH — H-03 (filtración de errores) y H-04 (lint rojo) resueltos
- [x] T-054: MEDIUM/LOW/INFO — H-05 y H-14 resueltos este slice. H-13 resuelto este slice. Restan H-15
      (tope de monto), H-16 (títulos por ruta), H-19 (desindexar `.claude-flow`) y H-23..H-29
- [ ] T-055: `code-simplification` — no aplica: no se encontró deuda cognitiva alta; las extracciones (CSRF a middleware propio) ya se hicieron al remediar
- [ ] T-056: Commits — **NO se commiteó**: el usuario no lo pidió explícitamente. Los cambios quedan en el working tree

### FASE 5 — Verificación integral (Gate final obligatorio) — PENDIENTE
- [ ] T-060: Detectar runner tests (orden de precedencia) y ejecutar suite completa — reportar `<comando>: <resultado observado>`
- [ ] T-061: Type-check + Build (tsc --noEmit + scripts build) — resultados observados
- [ ] T-062: Lint/Format (eslint/biome/prettier) si existen
- [ ] T-063: A11y crítico — `accessibility-scan` + `accessibility-inspect` páginas clave (0 violations críticos/serios nuevos)
- [ ] T-064: Security crítico — `security-review` bloques críticos + deps
- [ ] T-065: E2E smoke (rutas críticas) + flakiness
- [ ] T-066: Console errors frontend (0 errores nuevos flujos críticos)
- [ ] T-067: Funcionalidad core verificada end-to-end

### FASE 6 — Cierre y entrega — PENDIENTE
- [ ] T-070: Reporte final ejecutivo + estado por área (OK/WARN/ISSUES)
- [ ] T-071: ADRs si decisiones relevantes (`documentation-and-adrs`)
- [ ] T-072: Guardar hallazgos/decisiones con `mem_save` (proactivo)
- [ ] T-073: `mem_session_summary` OBLIGATORIO (Goal/Instructions/Discoveries/Accomplished/Next Steps/Relevant Files)
- [ ] T-074: Commits finales + PRs (`pr-writer`) si procede (chained si >400L)

## 5. Criterios de Aceptación (Definition of Done)

- [ ] **Tabla maestra consolidada** existe (`reports/auditoria-hallazgos.md`) con evidencia completa
- [ ] **0 bloqueantes para 100% funcional** pendientes (CRITICAL/HIGH resueltos o justificados con evidencia)
- [ ] **Gate completo pasa** (T-060–T-067) con resultados **observados** (no esperados)
- [ ] **Build/type-check limpios** (o issues documentados + plan)
- [ ] **Tests relevantes pasan** (suite completa ejecutada, reporte observado)
- [ ] **A11y crítico OK** en páginas clave
- [ ] **Security crítico OK** en bloques sensibles
- [ ] **Console errors 0** en flujos críticos
- [ ] **Work-unit commits** (si hubo correcciones), convencionales, sin Co-Authored-By
- [ ] **Memoria persistida** + `mem_session_summary` obligatorio

## 6. Riesgos Conocidos

- **Tests**: Posible 0 tests (hallazgo previo RF/RNF). No inventar cobertura.
- **Rama**: Código real en `feature/barbermanager-v1`, main vacío. Considerar branch auditoría desde feature o rama actual.
- **Alcance**: Auditoría transversal usa muchas skills → volumen tokens alto pero necesario. Usar delegación (triggers) para mantener contexto del parent.
- **Remediación**: Solo bloqueantes para 100% funcional. No-bloqueantes → backlog documentado.

## 7. Progreso

- Fase 0: **100%** (4/4)
- Fase 1: **100%** (9/9) — 18 hallazgos de inventario (I-01–I-18)
- Fase 2: **100%** (12/12) — auditorías estáticas, 11 hallazgos nuevos
- Fase 3: **100%** (4/4) — tabla maestra `reports/auditoria-hallazgos.md`, 29 hallazgos
- Fase 4: **83%** (10/12) — 15 de 29 hallazgos resueltos, gates en verde
- Fase 5: **parcial** (T-060, T-061, T-062 ejecutados; T-063–T-067 bloqueados por entorno)
- Fase 6: **0%** (0/5)

**Estado real del sistema (post-inventario)**: la base de código es pequeña (~7.4k líneas), está
bien estructurada en capas y es **más sólida de lo que se suponía**: SQL 100% parametrizado,
transacciones correctas con `FOR UPDATE`/`GET_LOCK`, auth con cookie httpOnly + CSRF double-submit,
`JWT_SECRET` sin fallback inseguro, CORS que falla cerrado en producción, Tailwind 4 con tokens
centralizados. Los riesgos reales NO están en la lógica de negocio sino en la **ausencia de
red de seguridad**: cero tests, cero CI, cero gobernanza, más 3 fugas concretas (credencial
committed, error no enmascarado, puertos desalineados).

**Siguiente acción**: H-15/H-16 — invariants de `CONSTRAINTS.md` ya escritas
remediación acaba de hacer explícitas (SQL parametrizado, cookie httpOnly, CSRF en métodos de
escritura, errores 5xx enmascarados, lint en verde), y luego commitear los slices como work units
**cuando el usuario lo pida explícitamente**.

**Rotación pendiente de H-01**: eliminar la credencial del archivo no la borra de los commits
anteriores. Cualquier base ya sembrada mantiene válido el hash viejo. Requiere `npm run
create-admin` con `ADMIN_PASSWORD` en esas bases y decidir sobre reescritura de historial.

> Nota de delegación: los sub-agentes están bloqueados por el proveedor ("OpenCode's free tier
> can only be used from within OpenCode"). Fases 1–3 se ejecutaron inline con shell + inspección
> estática, con resultados observados en cada gate ejecutable.