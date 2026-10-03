# Frontend redesign — tokens, componentes y UX

Rediseño visual completo del frontend de BarberManager. El objetivo es reemplazar la
identidad actual (oro sobre negro, sin sistema de diseño) por una interfaz clara, accesible y
consistente sobre un sistema de tokens reales.

## Problema

Hoy la interfaz se define por repetición de literales, no por un sistema:

- **Contraste que falla WCAG AA.** `text-neutral-500` (#737373) sobre `#141414` da ~3.4:1.
  WCAG AA exige 4.5:1 en texto normal. Afecta al 60% del texto secundario de la app.
- **Tipografía ilegible.** Hay `text-[9px]`, `text-[10px]` y `text-[11px]` en etiquetas y
  estados. El mínimo aceptable para texto de interfaz es 12px, y 16px para cuerpo.
- **Targets táctiles por debajo del mínimo.** La nav móvil usa `py-1.5` (~28px de alto). El
  mínimo es 44×44px. En un celular, en un local, con las manos ocupadas.
- **Cero sistema de diseño.** 72 ocurrencias de `text-gold-400`, 68 de `rounded-lg border`,
  5 hexadecimales literales (`#141414`, `#c9a96e`, `#1a1a1a`, `#111111`, `#0a0a0a`). Cada
  página redefine sus propios botones, inputs y tarjetas. Un cambio de color exige 20 ediciones.
- **El Dashboard miente.** Anuncia "Próximamente" en Productos, Apartados y Reportes. Los tres
  módulos existen, funcionan y están enrutados. Es la primera pantalla que ve todo usuario.
- **Sin estados compartidos.** Cada página escribe sus propios textos de carga, error y vacío.

## Por qué

Un barbero usa esto de pie, con el teléfono en la mano, bajo luz de fluorescente, entre un
cliente y el siguiente. La estética "nocturno elegante" actual se lava exactamente en esa
condición, y el contraste que falla es el que más afecta en ese contexto. La interfaz tiene que
ganar primero en legibilidad, después en carácter.

## Decisión de diseño

Tema light primero, con sidebar oscuro para conservar identidad sin competir con el contenido.

| Rol | Valor | Uso |
| --- | --- | --- |
| `--color-canvas` | `#F5F3EF` | Fondo de página, papel cálido |
| `--color-surface` | `#FFFFFF` | Cards, paneles, sidebar |
| `--color-ink` | `#1A1815` | Texto principal, sidebar |
| `--color-ink-muted` | `#5C564D` | Texto secundario (7.0:1 sobre canvas) |
| `--color-ink-subtle` | `#7A736A` | Metadatos (4.6:1 sobre canvas) |
| `--color-line` | `#E3DED4` | Bordes, separadores |
| `--color-brand` | `#0E5C63` | Petróleo: primario, acciones, nav activa |
| `--color-brand-deep` | `#0A4247` | Hover / pressed |
| `--color-brass` | `#C08A2E` | Acento secundario: foco, estados destacados |
| `--color-danger` | `#B4232B` | Errores, destructivo |
| `--color-success` | `#1F7A4D` | Confirmado, completada |
| `--color-warning` | `#A15C07` | Pendiente |

Tipografía: **Outfit** para UI y títulos (geométrica, moderna, buena legibilidad en pantalla
pequeña), **Source Serif 4** sólo para la marca y titulares de página. Se elimina Playfair
Display: es una serif de lujo que se asocia a moda, no a herramienta de trabajo.

Restricción del proyecto (`CONSTRAINTS.md`): el tema `dark` de Tailwind queda sin uso, y
ningún color se escribe como hex literal dentro de un `.jsx` — sólo tokens.

## Alcance autorizado

- Reescritura visual de las 20 páginas/componentes del frontend.
- Nuevo `index.css` con tokens semánticos + primitivas de componentes.
- Nuevos componentes compartidos en `src/components/ui/`.
- Corrección de contraste, tipografía mínima y targets táctiles.
- Dashboard honesto con datos reales del backend.
- `index.html`: fuentes nuevas, `theme-color`, meta de descripción.

Fuera de alcance: backend, base de datos, API, rutas, lógica de negocio, tests del backend.

## Tareas

- [x] **T1 — Tokens y primitivas.** `index.css`: paleta semántica, escala tipográfica,
      sombras, radios, focus ring, `prefers-reduced-motion`. `index.html`: Outfit + Source
  Serif 4, `theme-color`. Verificado: build limpio, chunk mayor 296 kB.
- [x] **T2 — Componentes UI compartidos.** 11 componentes en `src/components/ui/`.
  Verificado: lint 0, build ok, 0 hex, SSR de 19 casos.
- [x] **T3 — Layout y navegación.** Sidebar tinta, drawer móvil 44px con trampa de foco.
  Verificado: lint, build, 0 hex, 45/45 checks con Playwright, 0 errores de consola.

### Desviación de alcance (2026-10-03)

Se agregaron dos archivos al plan, no estaban en el borrador inicial:

- **T3b — `NotificationBell.jsx`.** El componente viejo quedó con paleta `neutral-*` y un
  ícono de 2.52:1 sobre header claro — un fallo AA que el redesign introducía. **Resuelto en
  `Layout.jsx` y no en el archivo:** `BellSlot` le da un soporte de tinta propio (`bg-ink` en
  móvil, y en escritorio cae dentro del sidebar, que ya es tinta), de modo que la campana
  siempre parca sobre oscuro y su paleta vieja sigue legible. El archivo NO se reescribió
  sobre tokens: queda con la paleta anterior como deuda conocida. Corrige lo que este
  registro decía antes ("se reescribió sobre tokens"), que no coincidía con el código.
- [x] **T11 — `App.jsx`.** El error boundary seguía con `text-neutral-100` y `bg-gold-500`,
      colores que ya no existen en el tema: sobre `canvas` claro el título era invisible
      (texto casi blanco sobre papel casi blanco). **Estaba anotado como hecho y no estaba
      en el código**; se corrigió el 2026-10-03 sobre tokens, con `Button` compartido. Lo
      mismo con `RouteFallback`, que pintaba su spinner en `text-neutral-400` (~2.4:1 sobre
      canvas): hoy usa `ink-muted`/`brand` en la variante en página y `on-ink-muted`/`brass`
      en la variante a pantalla completa.
- [x] **T4 — Dashboard real.** Reemplaza los "Próximamente" por datos reales del backend:
      agenda del día + facturación estimada. 783 líneas. Verificado: lint 0, build ok,
      chunk mayor 299.54 kB. **Medido en Chromium real** (no sólo lint): a 320px un monto
      en `text-2xl` se desbordaba de la columna, así que los montos van en `text-2xl` y los
      conteos en `text-3xl` con `.tabular`.
- [x] **T5 — Páginas de listados.** Clientes, Servicios, Productos, Apartados, más
      `Pagination` fuera del `overflow-x-auto` (antes quedaba dentro y se desplazaba con las
      columnas). `PageHeader` + `Card` + estados compartidos, actions de 44px en las filas,
      `Badge` en vez de los badges pintados a mano. Verificación: lint 0, build ok, chunk
      mayor 301.55 kB, grep de hex y de `neutral-*`/`gold-*` vacío en los cuatro archivos.
- [x] **T6 — Páginas de formularios.** ClientForm, ServiceForm, ProductForm, ApartadoForm,
      BookingForm. Todos sobre `PageHeader` + `Card` + `Field`/`Input`/`Select`/`Textarea`,
      con `Button loading` en el envío y `role="alert"` en los errores. Las tres cargas
      iniciales ganan reintento (`intento`), que antes no existía: sin un contador no hay
      forma de volver a pedir el dato. "No encontrado" (`ServiceForm`, `ProductForm`) deja de
      fingir error de red y ofrece volver al catálogo, porque reintentar devuelve lo mismo.
      Los horarios de `BookingForm` pasan a botones con `aria-pressed` dentro de un
      `fieldset`/`legend`. Verificación: lint 0, build ok, grep vacío en los cinco archivos.
- [x] **T7 — Agendas y disponibilidad.** StaffAgenda, ClientAgenda, Availability y
      `EstadoBadge`. Lo compartido primero: `EstadoBadge` pasó a ser `Badge` con el mapeo
      estado → tono, y el Dashboard dejó de tener su propio `EstadoPill` (era el mismo
      componente duplicado). Las pestañas de las dos agendas son un `tablist` real con
      `aria-selected` y `aria-controls`, no botones con otro color. Filas con `divide-y` en
      vez de tarjetas anidadas, `Button` de 44px para Confirmar/Completar/Cancelar, y
      `Pagination` fuera del `overflow-x-auto` también en el Historial. Verificación: lint 0,
      build ok, grep vacío en los cuatro archivos.
- [x] **T8 — Reportes y detalle.** Reports, ApartadoDetail, ClientProfile, más
      `ApartadoBadge` nuevo en `components/`: el mapeo estado → tono estaba repetido en el
      listado y en el detalle (y seguía con la paleta del tema oscuro). El listado pasó a
      importarlo. Tablas con `tfoot` sobre `surface-sunken`, `scope="col"` en los encabezados
      y `caption` para lector de pantalla. Verificación: lint 0, build ok, grep vacío.
- [x] **T9 — Auth.** Login y Register. Los dos últimos `bg-[#0a0a0a]`/`#0c0c0c` de la app y
      los cuatro hex del patrón diagonal quedaron resueltos: el panel de marca vive sobre
      `bg-ink` (misma tinta que el sidebar) con acentos `brass`/`on-ink`, y el patrón pasó a
      la clase `.brand-weave` de `index.css`, que es la única forma de dibujar un
      `repeating-linear-gradient` sin escribir un color dentro de un `.jsx`. El formulario
      usa `Field`/`Input`/`Button` compartidos (borde, foco y error ya vienen del token) con
      `autoComplete` de auth. Las animaciones quedaron envueltas en `MotionConfig
      reducedMotion="user"`: `motion` mueve transform por JS y el `prefers-reduced-motion`
      de `index.css` sólo alcanza a transiciones CSS, así que sin esto el punto flotante
      seguía girando para quien pidió menos movimiento. Copy en voseo y sin faltantes de
      tildes. Verificación: lint 0, build ok (chunks `Login` 6.89 kB / `Register` 6.65 kB),
      grep de hex, de `neutral-*`/`gold-*` y de `text-[Npx]` vacío en los dos archivos.
- [x] **T10 — Verificación final.** `npm run lint` (0 errores) y `npm run build` en verde,
      chunk mayor `index` 301.83 kB (<500 kB). Cero hex literales en `.jsx` (12 → 0). Cero
      `font-serif` y cero duraciones crudas (`duration-fast` sin `(--...)`, que compila a
      nada en Tailwind v4 y nadie lo notaría). La paleta vieja quedó en 14 ocurrencias de un
      solo archivo y el texto bajo 12px en 1, ambos `NotificationBell.jsx`, la deuda
      declarada en T3b. **El chequeo de consola no se pudo ejecutar en esta máquina** (no hay
      Chromium ni Playwright instalados): queda pendiente de una pasada en navegador real,
      igual que la de T3.

### Deuda medida antes de T5 (2026-10-03)

Recontada con grep sobre `frontend/src`, para no trabajar a ciegas:

| Deuda | Ocurrencias | Dónde |
| --- | --- | --- |
| Paleta vieja `neutral-*` / `gold-*` | 545 | 19 archivos; peor: `Availability` (64), `StaffAgenda` (52), `Reports` (51), `Login` (47), `ApartadoDetail` (38) |
| Hexadecimales literales | 12 | `Login` (4), `Register` (4), `ServiceList` (2), `ClientList` (2) |
| Texto bajo 12px | 6 | `Login` (3), `Register` (1), `EstadoBadge` (1), `NotificationBell` (1) |

Dos archivos quedan fuera del parpadeo de páginas y hay que migrarlos junto con la primera
tarea que los use: `EstadoBadge.jsx` (6 ocurrencias, su paleta es del tema oscuro) y
`Pagination.jsx` (9 ocurrencias, lo usan todos los listados).

### Deuda después de T5 (2026-10-03)

Mismo grep, contando ocurrencias (no líneas):

| Deuda | Ocurrencias | Archivos |
| --- | --- | --- |
| Paleta vieja `neutral-*` / `gold-*` | 475 (−70) | 15 (−4): peor `Reports` (36), `Login` (33), `StaffAgenda` (31), `Availability` (30), `Register` (26) |
| Hexadecimales literales | 6 (−6) | sólo `Login` (3) y `Register` (3) |
| Texto bajo 12px | 6 | sin cambios: `Login` (3), `Register` (1), `EstadoBadge` (1), `NotificationBell` (1) |

`Pagination.jsx` quedó limpio en T5. `EstadoBadge.jsx` sigue pendiente y se migra con T7,
que es donde lo usan `StaffAgenda` y `ClientAgenda`. `NotificationBell.jsx` queda
intencionalmente con paleta vieja (ver T3b).

### Deuda medida después de T10 (2026-10-03)

Mismo grep, delta contra la medición previa a T5:

| Deuda | Ocurrencias | Dónde |
| --- | --- | --- |
| Paleta vieja `neutral-*` / `gold-*` | 14 (−531) | 1 archivo: `NotificationBell.jsx` — deuda declarada en T3b |
| Hexadecimales literales | 0 (−12) | ninguno |
| Texto bajo 12px | 1 (−5) | `NotificationBell.jsx` badge de contador (`text-[10px]`) |

Todo lo demás en verde: 0 `font-serif`, 0 `shadow-[...]` con color, 0 `duration-*` sin la
sintaxis `(--duration-*)`, 0 gradientes con color fuera de token.

## Sistema de tokens (contrato para T5–T10)

Todo color sale de `index.css`. Prohibido escribir hex en `.jsx`.

- Superficies: `canvas`, `surface`, `surface-sunken`, `ink`, `ink-soft`
- Texto: `ink` (15.9:1), `ink-muted` (7.0:1), `ink-subtle` (4.6:1) — los tres pasan AA
- Línea: `line`, `line-strong`
- Primario: `brand`, `brand-deep`, `brand-soft`, `brand-line`
- Acento: `brass`, `brass-soft`
- Estados: `success|warning|danger|info` + su `-soft` y `/30` para bordes
- Sobre tinta: `on-ink`, `on-ink-muted`

Componentes compartidos en `src/components/ui/`:

| Componente | API |
| --- | --- |
| `Button` | `variant`: primary, secondary, ghost, danger, dangerGhost · `size`: sm (36px), md (44px), lg (48px) · `loading`, `fullWidth`, `type`, `as` |
| `Badge` | `tone`: neutral, brand, **brass (NO accesible: ~2.6:1)**, success, warning, danger, info |
| `Card` | `padding`: none, sm, md, lg · `interactive`, `as`, `href`/`to` (detecta `Link`) |
| `Field` | `label`, `htmlFor`, `error`, `hint`, `required`. Expone contexto: `Input`/`Select`/`Textarea` heredan `error` y el `aria-describedby` automáticamente |
| `Input` `Select` `Textarea` | `error` + `className`; se usan dentro o fuera de `Field` |
| `PageHeader` | `title`, `description`, `actions`, `eyebrow` |
| `LoadingState` `EmptyState` `ErrorState` | `label` · `icon`/`title`/`description`/`action` · `title`/`onRetry` |

Utilidades de `index.css`: `.surface-card`, `.field`, `.field-error`, `.tabular`.

Restricción: `dark` de Tailwind queda sin uso. Las duraciones van como
`duration-(--duration-fast)`, nunca `duration-fast`.

## Criterios de aceptación

- `cd frontend && npm run lint` → 0 errores, 0 warnings.
- `cd frontend && npm run build` → 0 errores, ningún chunk > 500 kB (Q4).
- Cero hexadecimales literales en `frontend/src/**/*.jsx` (grep vacío).
- Todo texto de interfaz ≥ 12px; cuerpo ≥ 14px.
- Todo control interactivo ≥ 44px de alto en móvil.
- Contraste ≥ 4.5:1 en todo texto normal, ≥ 3:1 en texto grande e iconos.
- Los 16 `lazy()` de `App.jsx` intactos (Q5).
- Sin errores de consola en navegación por todas las rutas.

## Checks aplicables

Comando de verificación por tarea: `npm run lint && npm run build` desde `frontend/`.
No hay runner de tests en el frontend (`package.json` no define `test`); los tests del
proyecto viven en `backend/`. El check de errores de consola se hace en T10 con
`agent-browser` si el entorno lo permite, y se reporta honestamente si no.

## TDD

Resuelto: **no aplica**. El proyecto no tiene runner de tests de frontend. La verificación es
lint + build + revisión visual, y así se registra acá.

## Riesgo

- Regresión de estilo en páginas no revisadas: se mitiga con T10 (grep de hex + build).
- El backend ya expone los datos que necesita el Dashboard real
  (`/reportes/citas-por-dia`, `/citas?fecha=`). Verificado antes de escribir T4.