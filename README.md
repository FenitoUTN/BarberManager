# BarberManager

Sistema web de gestión para **Kenneth's Barber**. Permite administrar clientes, agenda de citas, servicios, productos, apartados (reservas con abonos) y reportes básicos, con control de acceso por roles (administrador, barbero y cliente).

> Proyecto desarrollado como parte de "Proyecto Integrador I y Desarrollo de Software I" (Universidad Técnica Nacional). El detalle formal de requerimientos se encuentra en [`docs/Documento_Formal.md`](docs/Documento_Formal.md).

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Backend | Node.js + Express 4, MySQL (mysql2), JWT, bcryptjs, express-validator |
| Frontend | React 19 + Vite, React Router 7, Tailwind CSS 4, Axios |
| Base de datos | MySQL 8 |

## Estructura del repositorio

```
BarberManager/
├── backend/            API REST (Express)
│   ├── src/
│   │   ├── controllers/   lógica de cada módulo (auth, clientes, citas, etc.)
│   │   ├── models/        acceso a datos (consultas SQL)
│   │   ├── routes/        definición de endpoints por módulo
│   │   ├── middlewares/    autenticación, roles, manejo de errores
│   │   ├── validators/     validaciones de entrada (express-validator)
│   │   └── utils/          JWT, hashing de contraseñas, utilidades de horario
│   └── database/schema.sql  esquema de base de datos + usuario admin inicial
├── frontend/           SPA (React + Vite + Tailwind)
│   └── src/
│       ├── api/           clientes Axios por módulo
│       ├── components/     Layout, rutas protegidas, badges, iconografía
│       ├── context/        AuthContext (sesión, JWT, usuario actual)
│       └── pages/          vistas por módulo (clientes, citas, productos, etc.)
└── docs/               documento formal del proyecto (requerimientos)
```

## Roles del sistema

- **admin**: control total (clientes, productos, disponibilidad, reportes, apartados).
- **barbero**: agenda, clientes, disponibilidad, productos, apartados y reportes.
- **cliente**: agenda propia, catálogo de servicios/productos, su propio perfil y sus apartados.

La sesión se maneja con JWT (`Authorization: Bearer <token>`), guardado en `localStorage` desde el frontend (`AuthContext`).

## Funcionalidades implementadas (RF01–RF27)

### Módulo de Autenticación
| RF | Descripción | Implementación |
| --- | --- | --- |
| RF01 | Inicio de sesión | `POST /api/auth/login` + página `Login` |
| RF02 | Cierre de sesión | `POST /api/auth/logout` + botón "Cerrar sesión" en `Layout` |
| RF03 | Control de acceso por rol | Middlewares `authenticate`/`authorize` + `ProtectedRoute` en el frontend |

### Módulo de Gestión de Clientes
| RF | Descripción | Implementación |
| --- | --- | --- |
| RF04 | Registrar cliente | `POST /api/clientes` + `ClientForm` |
| RF05 | Editar información de cliente | `PUT /api/clientes/:id` + `ClientForm` |
| RF06 | Eliminar cliente | `DELETE /api/clientes/:id` (solo admin) + `ClientList` |
| RF07 | Listar y buscar clientes | `GET /api/clientes` (búsqueda por nombre/teléfono/correo) + `ClientList` |
| RF08 | Visualizar perfil de cliente | `GET /api/clientes/:id` + `ClientProfile` |

### Módulo de Agenda y Citas
| RF | Descripción | Implementación |
| --- | --- | --- |
| RF09 | Visualizar disponibilidad | `GET /api/disponibilidad/slots` + `Agenda` / `BookingForm` |
| RF10 | Reservar cita | `POST /api/citas` + `BookingForm` |
| RF11 | Cancelar cita | `PATCH /api/citas/:id/cancelar` |
| RF12 | Validar duplicidad de citas | Validación de solapamiento en `appointment.model.js` antes de crear |
| RF13 | Visualizar citas del día | `GET /api/citas` (filtro por fecha) + `StaffAgenda` |
| RF14 | Visualizar historial de citas | Pestaña "Historial" en `StaffAgenda` / `ClientAgenda` |
| RF15 | Gestionar disponibilidad de horarios | `GET/PUT /api/disponibilidad/horarios`, excepciones (`POST`/`DELETE /api/disponibilidad/excepciones`) + página `Availability` |
| RF16 | Visualizar citas del cliente | `GET /api/citas/mias` + `ClientAgenda` |

### Módulo de Servicios
| RF | Descripción | Implementación |
| --- | --- | --- |
| RF17 | Visualizar catálogo de servicios | `GET /api/servicios` + `ServiceList` |
| RF18 | Seleccionar servicio al agendar cita | Selector de servicio en `BookingForm` (define duración y precio) |

### Módulo de Productos
| RF | Descripción | Implementación |
| --- | --- | --- |
| RF19 | Registrar producto | `POST /api/productos` + `ProductForm` |
| RF20 | Editar producto | `PUT /api/productos/:id` + `ProductForm` |
| RF21 | Eliminar producto | `DELETE /api/productos/:id` (baja lógica) |
| RF22 | Visualizar catálogo de productos | `GET /api/productos` + `ProductList` (con filtro de inactivos) |

### Módulo de Apartados
| RF | Descripción | Implementación |
| --- | --- | --- |
| RF23 | Registrar apartado de producto | `POST /api/apartados` + `ApartadoForm` |
| RF24 | Registrar abono a apartado | `POST /api/apartados/:id/abonos` + `ApartadoDetail` (actualiza saldo y cambia estado a "pagado" al llegar a 0) |
| RF25 | Visualizar saldo pendiente de apartados | `GET /api/apartados/:id` + historial de abonos en `ApartadoDetail` |

### Módulo de Reportes
| RF | Descripción | Implementación |
| --- | --- | --- |
| RF26 | Visualizar resumen de citas por día | `GET /api/reportes/citas-por-dia` + `Reports` |
| RF27 | Visualizar listado de apartados activos | `GET /api/reportes/apartados-activos` + `Reports` |

## Modelo de datos (MySQL)

Definido en [`backend/database/schema.sql`](backend/database/schema.sql):

- **usuarios**: clientes, barberos y administradores (`rol`: admin/barbero/cliente), con `password_hash` (bcrypt).
- **servicios**: catálogo de cortes/servicios (precio, duración).
- **productos**: catálogo de productos para apartado (baja lógica con `activo`).
- **disponibilidad_horarios**: horario semanal recurrente del barbero (día de semana, hora inicio/fin).
- **disponibilidad_excepciones**: bloqueos o disponibilidad extra puntual por fecha.
- **citas**: reservas (cliente, servicio, fecha/hora, `estado`: pendiente/confirmada/cancelada/completada).
- **apartados**: reservas de producto con `monto_total` y `saldo_pendiente` (`estado`: activo/pagado/cancelado).
- **abonos**: pagos parciales asociados a un apartado.

El script incluye un usuario administrador inicial (`admin@barbermanager.com` / `Admin123!`).

## API REST

Base URL: `http://localhost:3000/api`

| Recurso | Endpoints |
| --- | --- |
| `/auth` | `POST /register`, `POST /login`, `POST /logout`, `GET /me` |
| `/clientes` | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `/servicios` | `GET /` |
| `/disponibilidad` | `GET /slots`, `GET /horarios`, `PUT /horarios`, `GET /excepciones`, `POST /excepciones`, `DELETE /excepciones/:id` |
| `/citas` | `GET /`, `GET /mias`, `POST /`, `PATCH /:id/cancelar`, `PATCH /:id/estado` |
| `/productos` | `GET /`, `POST /`, `PUT /:id`, `DELETE /:id` |
| `/apartados` | `GET /`, `GET /:id`, `POST /`, `POST /:id/abonos` |
| `/reportes` | `GET /citas-por-dia`, `GET /apartados-activos` |

Todas las rutas (excepto `/auth/*` y los catálogos públicos `GET /servicios` / `GET /productos`) requieren JWT vía `Authorization: Bearer <token>`. Las operaciones administrativas usan los middlewares `authorize('admin', 'barbero')` o `authorize('admin')`.

## Frontend — rutas de la SPA

| Ruta | Página | Acceso |
| --- | --- | --- |
| `/login`, `/register` | `Login`, `Register` | público |
| `/dashboard` | `Dashboard` | todos los roles |
| `/agenda` | `Agenda` (agenda del barbero / del cliente + reserva) | todos los roles |
| `/servicios` | `ServiceList` | todos los roles |
| `/productos`, `/productos/nuevo`, `/productos/:id/editar` | `ProductList`, `ProductForm` | catálogo: todos / alta y edición: admin, barbero |
| `/apartados`, `/apartados/nuevo`, `/apartados/:id` | `ApartadoList`, `ApartadoForm`, `ApartadoDetail` | listado/detalle: todos / alta: admin, barbero |
| `/clientes`, `/clientes/nuevo`, `/clientes/:id/editar` | `ClientList`, `ClientForm` | admin, barbero |
| `/clientes/:id` | `ClientProfile` | todos (cliente solo el propio) |
| `/disponibilidad` | `Availability` | admin, barbero |
| `/reportes` | `Reports` | admin, barbero |

## Identidad visual — "Barbería urbana / gótica"

Rediseño completo de la interfaz (manteniendo toda la funcionalidad) con una estética de barbería urbana old-school:

- **Paleta**: fondo negro (`#0a0a0a`), acentos dorados (`gold-*`, reemplaza la paleta `orange` original) y rojo sangre (`blood-*`) para detalles decorativos y estados activos.
- **Tipografía**: `UnifrakturMaguntia` (gótica) para el branding principal "BarberManager" y `MedievalSharp` (`font-display`) para títulos de página, importadas desde Google Fonts en `frontend/index.html`.
- **Iconografía decorativa**: nuevo componente [`frontend/src/components/BarberIcons.jsx`](frontend/src/components/BarberIcons.jsx) con `BarberPoleIcon` (poste de barbería), `FlameIcon` (llamas) y `RazorIcon` (navaja), más `FlameDivider` como separador decorativo.
- **Detalles globales** en `frontend/src/index.css`: tema `@theme` con las paletas `gold`/`blood`, utilidades `.barber-stripes` (franjas diagonales rojo/blanco/negro tipo poste de barbería) y `.text-glow-gold` / `.text-glow-blood`.
- **Layout**: barra lateral/superior con logo de poste de barbería, título en gótico con resplandor dorado, indicador de sección activa en rojo.
- **Login / Register**: hero con poste de barbería, llamas decorativas de fondo, título en `UnifrakturMaguntia` y botón con degradado rojo→dorado.
- **Dashboard y páginas internas**: encabezados en `MedievalSharp` color dorado, tarjetas con bordes oscuros y acentos dorados/rojos, franja de poste de barbería como detalle superior.

## Puesta en marcha

### Backend

```bash
cd backend
cp .env.example .env   # ajustar credenciales de MySQL si es necesario
mysql -u root -p < database/schema.sql
npm install
npm run dev             # nodemon en el puerto 3000 (PORT en .env)
```

### Frontend

```bash
cd frontend
cp .env.example .env    # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev              # Vite en http://localhost:5173
```

### Credenciales de prueba

| Rol | Email | Password |
| --- | --- | --- |
| admin | `admin@barbermanager.com` | `Admin123!` |

Los usuarios con rol `cliente` se crean desde `/register`; los roles `admin`/`barbero` se asignan directamente en la base de datos.
