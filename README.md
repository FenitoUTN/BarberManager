# BarberManager

Sistema web de gestión para **Kenneth's Barber**. Permite administrar clientes, agenda de citas, catálogo de servicios y productos, apartados (reservas de producto con abonos parciales), notificaciones y reportes básicos, con control de acceso por roles (administrador, barbero y cliente).

> Proyecto desarrollado como parte de "Proyecto Integrador I y Desarrollo de Software I" (Universidad Técnica Nacional).

## Tabla de contenidos

- [Stack tecnológico](#stack-tecnológico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Arquitectura general](#arquitectura-general)
- [Autenticación y seguridad](#autenticación-y-seguridad)
- [Roles y permisos](#roles-y-permisos)
- [Modelo de datos (MySQL)](#modelo-de-datos-mysql)
- [Funcionalidades por módulo](#funcionalidades-por-módulo)
- [Sistema de notificaciones](#sistema-de-notificaciones)
- [Paginación](#paginación)
- [API REST — referencia completa](#api-rest--referencia-completa)
- [Frontend — rutas de la SPA](#frontend--rutas-de-la-spa)
- [Identidad visual](#identidad-visual)
- [Puesta en marcha](#puesta-en-marcha)
- [Credenciales de prueba](#credenciales-de-prueba)

## Stack tecnológico

| Capa | Tecnología | Notas |
| --- | --- | --- |
| Backend | Node.js + Express 4 | API REST, sirve también el build de producción del frontend |
| Autenticación | JWT (`jsonwebtoken`) + cookies httpOnly | el token nunca es accesible desde JavaScript del cliente |
| Seguridad HTTP | `helmet`, `cors` (con `credentials: true`), `express-rate-limit` | cabeceras seguras, CORS restringido a un origin explícito, límite de intentos en login/registro |
| Validación | `express-validator` | valida y sanea el body/query de cada endpoint antes de llegar al controlador |
| Contraseñas | `bcryptjs` | hash con salt, nunca se devuelve `password_hash` al cliente |
| Base de datos | MySQL 8 (`mysql2`, pool de conexiones) | transacciones y locks explícitos donde hay condiciones de carrera |
| Frontend | React 19 + Vite | SPA |
| Enrutamiento | React Router 7 | rutas protegidas por sesión y por rol |
| Estilos | Tailwind CSS 4 (`@theme` con tokens personalizados) | paleta dorada sobre fondo oscuro |
| HTTP client | Axios (`withCredentials: true`) | envía la cookie de sesión automáticamente en cada request |
| Animaciones | `motion` (Framer Motion) | usado en landing/formularios |

## Estructura del repositorio

```
BarberManager/
├── package.json            scripts de monorepo (levanta backend + frontend juntos)
├── backend/                 API REST (Express)
│   ├── database/schema.sql    esquema completo de la BD + datos semilla
│   └── src/
│       ├── app.js             configuración de Express: helmet, cors, rate limits, rutas, servido del frontend
│       ├── server.js           arranque del servidor HTTP
│       ├── config/db.js        pool de conexiones MySQL
│       ├── controllers/        lógica de cada módulo (auth, clientes, citas, servicios, productos, apartados, reportes, notificaciones)
│       ├── models/             acceso a datos: consultas SQL, transacciones y locks
│       ├── routes/              definición de endpoints por módulo (todas montadas bajo /api)
│       ├── middlewares/        authenticate (JWT + CSRF), authorize (roles), validate, errorHandler
│       ├── validators/          reglas de express-validator por recurso
│       └── utils/               jwt, password (bcrypt), csrf, pagination, time/datetime helpers
└── frontend/                SPA (React + Vite + Tailwind)
    └── src/
        ├── api/                 un cliente Axios por recurso (clients, appointments, products, apartados, services, availability, reports, notifications)
        ├── components/          Layout, ProtectedRoute, NotificationBell, Pagination, EstadoBadge, BarberIcons
        ├── context/             AuthContext (usuario actual, login/logout/register vía cookie)
        └── pages/                vistas agrupadas por módulo (clients, appointments, services, products, apartados, availability, reports)
```

## Arquitectura general

- **Un solo backend Express** expone toda la API bajo el prefijo `/api` y, además, sirve el build estático del frontend (`frontend/dist`) con fallback a `index.html` para las rutas de la SPA. Esto permite desplegar el sistema como un único servicio en producción, aunque en desarrollo cada capa corre en su propio puerto (backend `:3000`, frontend Vite `:5173`).
- **El frontend nunca habla directamente con MySQL**: todo pasa por la API REST vía Axios (`frontend/src/api/`), que centraliza la baseURL (`VITE_API_URL`) y el envío de credenciales/CSRF.
- **Capas del backend**: `routes` → `validators` (rechazan input inválido antes de tocar la BD) → `middlewares` (`authenticate`/`authorize`) → `controllers` (orquestan la lógica de negocio y las respuestas HTTP) → `models` (única capa que ejecuta SQL).

## Autenticación y seguridad

La sesión **ya no se maneja con `localStorage` ni con un header `Authorization: Bearer`**. El flujo actual es:

1. Al hacer login/registro, el backend genera un JWT y lo envía en una **cookie `token` httpOnly** (inaccesible desde JavaScript, mitiga robo de token vía XSS). Junto a ella, envía una segunda cookie `csrfToken` **no** httpOnly.
2. En cada request no seguro (`POST`/`PUT`/`PATCH`/`DELETE`), el frontend lee la cookie `csrfToken` (`axiosClient.js`) y la reenvía en el header `X-CSRF-Token`. El middleware `authenticate` exige que el header coincida con la cookie (patrón *double-submit cookie*) — así una petición forjada desde otro sitio (que no puede leer la cookie) es rechazada aunque el navegador adjunte la cookie de sesión automáticamente.
3. `authenticate` (`backend/src/middlewares/auth.middleware.js`) además **revalida el usuario contra la base de datos en cada request** (no confía solo en el payload del JWT), para que desactivar una cuenta (`activo = 0`) corte el acceso de inmediato en vez de esperar a que expire el token.
4. `logout` limpia ambas cookies desde el servidor (`res.clearCookie`), porque el cliente ya no tiene forma de borrar una cookie httpOnly.
5. El frontend (`AuthContext`) no puede "leer" si hay sesión iniciada mirando `localStorage`: al cargar la app llama a `GET /auth/me`, y si responde 401 asume que no hay sesión.

Otras medidas de seguridad activas en `backend/src/app.js`:

- **`helmet`**: cabeceras HTTP de seguridad por defecto.
- **CORS restringido**: el origin no puede ser `*` porque se usan cookies con `credentials: true`. En producción, si `CORS_ORIGIN` no está definido, la app **se rehúsa a arrancar**.
- **Rate limiting**: `POST /auth/login` limitado a 10 intentos / 15 min por IP, `POST /auth/register` a 5 intentos / hora, para dificultar fuerza bruta y registro masivo.
- **`JWT_SECRET` obligatorio**: si no está en el entorno, el proceso lanza un error al iniciar en vez de arrancar con un valor por defecto inseguro.

## Roles y permisos

- **admin**: acceso total — clientes, servicios, productos, disponibilidad, apartados, reportes, y es el único rol que puede **eliminar (dar de baja) un cliente**.
- **barbero**: igual que admin excepto la baja de clientes; gestiona agenda, clientes, disponibilidad, servicios, productos, apartados y reportes.
- **cliente**: solo ve/gestiona sus propios recursos — su agenda (`/citas/mias`), su perfil (`/clientes/:id` solo si `:id` es el suyo), sus apartados y el catálogo público de servicios/productos.

La autorización se aplica en dos niveles:

- **Por rol**, con el middleware `authorize('admin', 'barbero')` en las rutas que lo requieren.
- **Por dueño del recurso** (self-access), verificado a mano en el controlador cuando un cliente puede ver/editar *su propio* dato pero no el de otros — por ejemplo `canAccessClient()` en `client.controller.js`, o la comparación `apartado.cliente_id !== req.user.id` en `apartado.controller.js`.

## Modelo de datos (MySQL)

Definido en [`backend/database/schema.sql`](backend/database/schema.sql), 8 tablas:

| Tabla | Propósito | Detalles relevantes |
| --- | --- | --- |
| `usuarios` | clientes, barberos y administradores | `rol` enum, `password_hash` (bcrypt), `activo` para baja lógica; `email`/`password_hash` son `NULL` para clientes dados de alta manualmente por staff que aún no tienen cuenta propia |
| `servicios` | catálogo de cortes/servicios | `precio`, `duracion_minutos` (define el largo del slot de la cita), `activo` (baja lógica) |
| `productos` | catálogo de productos para apartado | `precio`, `activo` (baja lógica) |
| `disponibilidad_horarios` | horario semanal recurrente del barbero | `dia_semana` (0=domingo…6=sábado), rango `hora_inicio`/`hora_fin`, `activo` |
| `disponibilidad_excepciones` | bloqueos o disponibilidad extra puntual | `tipo`: `bloqueo` (cierra un rango en una fecha) o `extra` (abre horario adicional) |
| `citas` | reservas de agenda | `estado`: `pendiente → confirmada/cancelada`, `confirmada → completada/cancelada` (máquina de estados, ver más abajo); índices por `cliente_id` y por `(fecha, estado)` |
| `apartados` | reserva de producto con pago diferido | `monto_total` y `saldo_pendiente`, `estado`: `activo/pagado/cancelado` |
| `abonos` | pagos parciales sobre un apartado | `ON DELETE CASCADE` si se borra el apartado |
| `notificaciones` | avisos in-app por usuario | `tipo`, `mensaje`, `cita_id` opcional (referencia a la cita relacionada), `leida` |

El script incluye datos semilla: los 2 servicios actuales de la barbería, un horario semanal por defecto (lunes-sábado 8:00–18:00) y un usuario administrador inicial.

## Funcionalidades por módulo

### Autenticación
- Registro público (siempre crea rol `cliente`), login, logout, `GET /auth/me` para hidratar la sesión al recargar la app.
- Control de acceso por rol en cada endpoint protegido, y `ProtectedRoute` en el frontend redirige a `/login` o `/dashboard` según corresponda.

### Clientes
- Alta/edición manual por staff (para clientes que aún no tienen cuenta), búsqueda por nombre/teléfono/correo con **paginación**, perfil individual, y baja lógica (solo `admin`).
- Un cliente autenticado puede ver y editar su propio perfil, pero no el de otros.

### Agenda y citas
- **Disponibilidad calculada dinámicamente** (`availability.model.js: getAvailableSlots`): combina el horario semanal recurrente, las excepciones puntuales (bloqueos/extra) y las citas ya ocupadas, generando slots cada 30 min según la duración del servicio elegido; descarta horarios ya pasados si la fecha consultada es hoy.
- **Reserva de cita con protección contra condiciones de carrera**: `appointment.model.js` usa un *named lock* de MySQL (`GET_LOCK`/`RELEASE_LOCK`) por fecha para serializar el chequeo de solapamiento y el `INSERT`, evitando que dos clientes reserven el mismo horario en simultáneo. La disponibilidad también se revalida en el servidor (no solo en el frontend).
- **Máquina de estados** para las citas: `pendiente → confirmada/cancelada`, `confirmada → completada/cancelada`; `cancelada` y `completada` son estados finales. Un cliente solo puede cancelar sus propias citas y no puede cancelar una que ya pasó; staff puede transicionar cualquier cita vía `PATCH /citas/:id/estado`.
- Listado del día, historial con filtros (rango de fechas, estado, cliente) y **paginación**, y vista de "mis citas" para el cliente autenticado.
- Gestión de horario semanal y de excepciones (bloqueos/horario extra) por staff. **Crear un bloqueo cancela automáticamente, dentro de la misma transacción, cualquier cita solapada y genera una notificación al cliente afectado** — evita que una cita quede cancelada sin que el cliente se entere si algún paso falla a mitad de camino.

### Servicios
- Catálogo con alta, edición y baja lógica (staff), visible para todos los roles autenticados; staff puede incluir servicios inactivos en el listado (`?includeInactive=true`).
- El servicio elegido al reservar define automáticamente la duración del slot y el precio de la cita.

### Productos
- Catálogo con alta, edición y baja lógica (staff), mismo patrón que servicios (`?includeInactive=true` solo para staff).

### Apartados (reservas de producto con abono)
- Registro de apartado (staff) sobre un producto activo, con `monto_total` (por defecto el precio del producto).
- **Registro de abonos transaccional**: `apartado.model.js: addAbono` abre una transacción, bloquea la fila del apartado (`SELECT … FOR UPDATE`) y **revalida el saldo y el estado dentro de esa transacción** antes de aceptar el abono — así dos abonos concurrentes no pueden leer el mismo saldo desactualizado ni aplicarse sobre un apartado que fue cancelado justo antes. El saldo se recalcula y el estado pasa a `pagado` automáticamente al llegar a 0.
- Listado paginado (con filtro por estado/cliente) y detalle con historial completo de abonos; un cliente solo ve sus propios apartados.

### Reportes
- Resumen de citas agrupadas por día (totales por estado) en un rango de fechas.
- Listado de todos los apartados activos, para seguimiento de cobros pendientes.

## Sistema de notificaciones

Módulo interno (no forma parte del catálogo de requerimientos formales, pero está integrado en el sistema) que avisa a un usuario cuando algo afecta sus citas — hoy el único disparador es la cancelación automática por bloqueo de horario, pero el modelo es genérico (`tipo` + `mensaje` + `cita_id` opcional) para futuros tipos de aviso.

- `NotificationBell` (frontend) hace *polling* cada 30 segundos, muestra el conteo de no leídas y permite marcar una notificación o todas como leídas.
- Backend: `GET /notificaciones` (lista + conteo de no leídas), `PUT /notificaciones/:id/leida`, `PUT /notificaciones/leidas` (marca todas).

## Paginación

Los listados que pueden crecer mucho (clientes, historial de citas, apartados) aceptan `page`/`pageSize` en el query string y devuelven un objeto `pagination` junto a los datos:

```json
{ "clients": [...], "pagination": { "page": 1, "pageSize": 20, "total": 57, "totalPages": 3 } }
```

`pageSize` por defecto es 20 y el máximo permitido es 100 (`backend/src/utils/pagination.js`). Si un endpoint se llama **sin** `page`/`pageSize` (por ejemplo, el usado internamente por el reporte de apartados activos), devuelve todos los resultados sin paginar — mismo comportamiento que tenían estos endpoints antes de añadir paginación, para no romper a quien no la necesita.

## API REST — referencia completa

Base URL: `http://localhost:3000/api`

| Recurso | Endpoints | Acceso |
| --- | --- | --- |
| `/auth` | `POST /register`, `POST /login`, `POST /logout`, `GET /me` | público (register/login con rate limit) |
| `/clientes` | `GET /` (paginado, staff), `POST /` (staff), `GET /:id` (staff o el propio cliente), `PUT /:id` (staff o el propio cliente), `DELETE /:id` (solo admin) | mixto |
| `/servicios` | `GET /`, `POST /` (staff), `PUT /:id` (staff), `DELETE /:id` (staff) | catálogo: todos los autenticados / mutaciones: staff |
| `/productos` | `GET /`, `POST /` (staff), `PUT /:id` (staff), `DELETE /:id` (staff) | igual que servicios |
| `/disponibilidad` | `GET /slots`, `GET /horarios`, `PUT /horarios` (staff), `GET /excepciones` (staff), `POST /excepciones` (staff), `DELETE /excepciones/:id` (staff) | mixto |
| `/citas` | `GET /` (staff, paginado), `GET /mias`, `POST /`, `PATCH /:id/cancelar`, `PATCH /:id/estado` (staff) | mixto |
| `/apartados` | `GET /` (paginado; staff ve todos, cliente solo los suyos), `GET /:id`, `POST /` (staff), `POST /:id/abonos` (staff) | mixto |
| `/reportes` | `GET /citas-por-dia`, `GET /apartados-activos` | staff |
| `/notificaciones` | `GET /`, `PUT /:id/leida`, `PUT /leidas` | usuario autenticado, solo sus propias notificaciones |

Todas las rutas exigen sesión iniciada (cookie `token` validada por `authenticate`) **excepto** `POST /auth/register` y `POST /auth/login`. A diferencia de versiones anteriores, los catálogos `GET /servicios` y `GET /productos` **ya no son públicos**: requieren estar autenticado (con cualquier rol), igual que el resto de la API. Las mutaciones (`POST`/`PUT`/`PATCH`/`DELETE`) además exigen el header `X-CSRF-Token` con el valor de la cookie `csrfToken`.

## Frontend — rutas de la SPA

| Ruta | Página | Acceso |
| --- | --- | --- |
| `/login`, `/register` | `Login`, `Register` | público |
| `/dashboard` | `Dashboard` | todos los roles |
| `/agenda` | `Agenda` (agenda de staff o del cliente + formulario de reserva) | todos los roles |
| `/servicios`, `/servicios/nuevo`, `/servicios/:id/editar` | `ServiceList`, `ServiceForm` | catálogo: todos / alta y edición: admin, barbero |
| `/productos`, `/productos/nuevo`, `/productos/:id/editar` | `ProductList`, `ProductForm` | catálogo: todos / alta y edición: admin, barbero |
| `/apartados`, `/apartados/nuevo`, `/apartados/:id` | `ApartadoList`, `ApartadoForm`, `ApartadoDetail` | listado/detalle: todos (filtrado por dueño) / alta: admin, barbero |
| `/clientes`, `/clientes/nuevo`, `/clientes/:id/editar` | `ClientList`, `ClientForm` | admin, barbero |
| `/clientes/:id` | `ClientProfile` | todos (un cliente solo puede ver el propio) |
| `/disponibilidad` | `Availability` | admin, barbero |
| `/reportes` | `Reports` | admin, barbero |

`ProtectedRoute` maneja dos niveles: sin sesión → redirige a `/login`; sesión válida pero rol no permitido en esa rama de rutas → redirige a `/dashboard`.

## Identidad visual

Tema oscuro y elegante con acentos dorados:

- **Paleta**: fondo casi negro (`#0c0c0c`), texto claro (`#f0f0f0`) y una escala de dorados personalizada (`gold-50`…`gold-900`, definida como tokens `@theme` en `frontend/src/index.css`) para acentos, bordes activos y estados.
- **Tipografía**: `Playfair Display` (serif, para el nombre de marca "BarberManager" y títulos) e `Inter` (sans, para el resto de la interfaz), importadas desde Google Fonts en `frontend/index.html`.
- **Iconografía**: `ScissorsIcon` (tijeras, logo principal en el sidebar/topbar) y utilidad `GoldDivider` (línea divisoria con degradado dorado), en [`frontend/src/components/BarberIcons.jsx`](frontend/src/components/BarberIcons.jsx).
- **Layout**: sidebar fijo en desktop / topbar + nav horizontal en mobile, ambos con la navegación filtrada según el rol del usuario, avatar con inicial del nombre, y la campana de notificaciones (`NotificationBell`) integrada junto al usuario.
- **Estados**: `EstadoBadge` colorea consistentemente pendiente (ámbar), confirmada (dorado), cancelada (rojo) y completada (verde) en toda la app.

## Puesta en marcha

### Todo junto (recomendado en desarrollo)

Desde la raíz del repositorio:

```bash
npm run install:all   # instala dependencias de backend y frontend
npm run dev            # levanta backend (:3000) y frontend (:5173) en paralelo
```

### Backend por separado

```bash
cd backend
cp .env.example .env   # ajustar credenciales de MySQL y JWT_SECRET
mysql -u root -p < database/schema.sql
npm install
npm run dev             # nodemon en el puerto definido por PORT (default 3000)
```

Variables de entorno relevantes (`backend/.env`):

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | sí | conexión a MySQL |
| `JWT_SECRET` | sí | la app **no arranca** sin este valor |
| `JWT_EXPIRES_IN` | no (default `8h`) | también define el `maxAge` de la cookie de sesión |
| `CORS_ORIGIN` | sí en producción | origin exacto del frontend; requerido porque la sesión usa cookies con `credentials: true` |
| `NODE_ENV` | no | `production` activa la cookie `secure` y exige `CORS_ORIGIN` |

### Frontend por separado

```bash
cd frontend
cp .env.example .env    # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev              # Vite en http://localhost:5173
```

### Build de producción

```bash
npm run build   # genera frontend/dist; backend/src/app.js lo sirve automáticamente
npm start        # arranca solo el backend, que sirve API + frontend ya compilado
```

## Credenciales de prueba

| Rol | Email | Password |
| --- | --- | --- |
| admin | `admin@barbermanager.com` | `Admin123!` |

Los usuarios con rol `cliente` se crean desde `/register`. Los roles `admin`/`barbero` no tienen alta desde la UI — se asignan directamente en la base de datos (columna `rol` de `usuarios`).
