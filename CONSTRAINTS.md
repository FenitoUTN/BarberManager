# CONSTRAINTS — BarberManager

Invariantes del sistema. Cada una dice cómo se verifica. Si un cambio obliga a romper una,
primero se discute y se actualiza este archivo: no se baja el listón en silencio.

Se distinguen dos clases: las **verificadas automáticamente** por un test o un gate de CI,
y las que exigen **revisión humana**. Decir "verificado" sin un comando que falle cuando la
invariante se rompe es una mentira, así que aquí está explícito cuál es cuál.

Origen: auditoría completa del sistema, 29 hallazgos. Ver `reports/auditoria-hallazgos.md`.

## Seguridad

| # | Invariante | Verificación |
| --- | --- | --- |
| S1 | Todo acceso a datos es parametrizado. Prohibido concatenar input en SQL, incluso en el `WHERE` dinámico | **revisión humana.** `grep -rn '\${' backend/src/models/` lista 24 interpolaciones; todas deben ser fragmentos literales (`PUBLIC_FIELDS`, `BASE_QUERY`, `where`). Automatizarlo es deuda pendiente |
| S2 | La sesión viaja en cookie `httpOnly`. Prohibido guardar tokens en `localStorage` o `sessionStorage` | **automático.** `grep -rn 'localStorage\|sessionStorage' frontend/src/` debe salir vacío |
| S3 | Toda ruta que modifica estado exige CSRF. Hoy hay 22 rutas de escritura protegidas y 2 públicas por diseño: `POST /login` y `POST /register`, que ocurren antes de que exista sesión | **automático.** `backend/test/csrf-coverage.test.js`. El test falla si una ruta de escritura queda sin `authenticate` ni `verifyCsrf`, y también si la lista de rutas públicas crece sin que se registre explícitamente |
| S4 | `JWT_SECRET` no tiene valor por defecto: sin él la app no arranca | **automático.** `backend/test/jwt.test.js` |
| S5 | Los errores 5xx nunca envían su mensaje al cliente | **automático.** `backend/test/error.middleware.test.js` |
| S6 | En producción, `CORS_ORIGIN` es obligatorio y la app se niega a arrancar sin él | **revisión humana.** `backend/src/app.js:20-22` lanza si falta |
| S7 | Ninguna credencial se versiona, ni siquiera con hash. El admin se crea con `npm run create-admin` | **automático.** `grep -rn 'password_hash.*\$2' backend/database/` debe salir vacío |

## Puertos y configuración

| # | Invariante | Cómo se verifica |
| --- | --- | --- |
| C1 | El backend escucha en **3000** por defecto, y ese mismo número aparece en `backend/.env.example`, el proxy de Vite y el README | `grep -rn '\b3000\b' backend/src/server.js backend/.env.example frontend/vite.config.js README.md` |

Si cambia el puerto, cambian los cuatro a la vez. Ese desacuerdo ya costó un CRITICAL (H-02).

## Accesibilidad

| # | Invariante | Verificación |
| --- | --- | --- |
| A1 | Todo control de formulario tiene nombre accesible: `id` + label, o `aria-label`, o label envolvente | **revisión humana.** Estado actual: 38/38 controles con nombre (36 explícitos, 2 por label envolvente), medido durante la auditoría. **No hay verificador automático todavía**; construirlo es deuda pendiente |
| A2 | `lang` del documento coincide con el idioma de la interfaz | **revisión humana.** `frontend/index.html` debe llevar `lang="es"` |
| A3 | Los cambios de contenido que no mueven el foco se anuncian con `role="status"` + `aria-live` | **revisión humana.** `frontend/src/components/NotificationBell.jsx` |

## Calidad

| # | Invariante | Cómo se verifica |
| --- | --- | --- |
| Q1 | `npm run verify` (lint + build + tests) pasa antes de dar por terminado cualquier cambio | `npm run verify` |
| Q2 | Los tests unitarios del backend no importan el pool de MySQL | paso propio del workflow de CI |
| Q3 | Lint en verde. Cero errores, cero supresiones nuevas | `npm run lint` |
| Q4 | Ningún chunk supera 500 kB. Antes de este límite un solo chunk de 506 kB obligaba a todos a descargar las 16 páginas | `npm run build` no debe emitir el aviso de chunk grande |
| Q5 | Las páginas se cargan con `lazy()` por ruta. Quitar el `lazy` reintroduce el bundle monolítico sin que ninguna prueba lo detecte | **revisión humana.** Los 16 `lazy()` de `frontend/src/App.jsx`; el reparto por chunk se comprueba en el output del build |

## Deuda conocida

Estas cosas están identificadas y aceptadas. No son invariantes rotas, pero conviene no
olvidarlas al tocar el código que las rodea:

- No hay tests de integración contra MySQL, ni de componentes en el frontend. Los tests
  actuales son unitarios a propósito, para que corran sin infraestructura.
- S1 y A1 se verifican por revisión humana, no de forma automática.
- La animación de `Login` y `Register` usa `motion`, que pesa ~120 kB. Se sólo descarga
  al entrar a esas dos rutas, así que los usuarios autenticados no la pagan, pero sigue
  siendo la dependencia más grande del proyecto.