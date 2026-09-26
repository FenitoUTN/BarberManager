# Plan Estratégico de Mejoras — BarberManager SaaS

**Migración a Supabase · Modelo multi-inquilino por suscripción · Rediseño de experiencia de producto**

| Campo | Valor |
| --- | --- |
| Documento | Plan Estratégico de Mejoras (Roadmap) |
| Versión | 1.0 (borrador para revisión) |
| Fecha de emisión | 26 de septiembre de 2026 |
| Estado | Propuesta — requiere aprobación para iniciar Fase 0 |
| Producto | BarberManager — Sistema Web de Gestión para peluquerías |
| Stack actual | Node.js + Express 4 · MySQL 8 · React 19 + Vite + Tailwind CSS 4 |
| Stack objetivo | Node.js + Express · Supabase (PostgreSQL) · React 19 + Vite + Tailwind CSS 4 |

---

## 1. Resumen ejecutivo

BarberManager es hoy un sistema monolítico de gestión para una única peluquería. Fue construido como proyecto académico y su modelo de datos, su autenticación y su interfaz asumen que existe una sola empresa, un solo conjunto de usuarios y un solo administrador. Ese supuesto está presente en cada capa del sistema y es la razón por la que el producto, hoy, no puede escalar comercialmente.

Este documento propone tres líneas de trabajo que convierten BarberManager en un **producto comercializable bajo suscripción mensual**, con aislamiento de datos por empresa y una experiencia de usuario orientada al cliente final.

| # | Pilar | Propósito | Naturaleza |
| --- | --- | --- | --- |
| 1 | Migración a Supabase | Eliminar la dependencia de infraestructura propia y adoptar autenticación, tiempo real y seguridad a nivel de fila gestionados | Reestructuración técnica |
| 2 | Globalización y modelo comercial | Convertir el sistema en un SaaS multi-inquilino con planes de pago mensual por barbería | Rediseño de negocio y arquitectura |
| 3 | Rediseño visual y de experiencia | Elevar la calidad percibida, la usabilidad y la accesibilidad del producto | Rediseño de producto |

Los tres pilares son **secuenciales y acumulativos**: el Pilar 1 prepara la infraestructura, el Pilar 2 construye sobre ella el modelo de negocio, y el Pilar 3 mejora el producto que se venden. Iniciar el Pilar 3 antes que el Pilar 2 significa pulir una interfaz que luego habrá que reconstruir.

### Recomendación central

Iniciar por una **Fase 0 de estabilización** antes de cualquiera de los tres pilares. La auditoría técnica del sistema actual detectó que **el proyecto no tiene una sola prueba automatizada**, pese a gestionar dinero, saldos pendientes y reservas con concurrencia. Migrar una base de datos completa, introducir un modelo de multi-inquilino y cobrar suscripciones sin red de seguridad automática es asumir un riesgo desproporcionado. La Fase 0 es de costo bajo y es la que determina el éxito o fracaso de las fases siguientes.

---

## 2. Contexto y punto de partida

### 2.1 Estado actual verificado

El análisis se realizó directamente sobre el código, no sobre la documentación del proyecto. Los siguientes puntos están verificados con evidencia en el repositorio:

- El sistema expone una API REST completa bajo el prefijo `/api`, con ocho módulos funcionales: autenticación, clientes, agenda y citas, servicios, productos, apartados, reportes y notificaciones.
- La autenticación es un modelo de sesión propio: JWT entregado en cookie `httpOnly`, con protección CSRF de tipo *double-submit cookie*. La aplicación **falla de forma segura** si no se define `JWT_SECRET` en el entorno.
- El control de acceso se aplica en dos niveles: por rol, en las rutas; y por propietario del recurso, verificado en el controlador.
- La concurrencia está bien resuelta en los dos puntos críticos del dominio: la reserva de citas utiliza un bloqueo con nombre de MySQL (`GET_LOCK` / `RELEASE_LOCK`) por fecha, y el registro de abonos a apartados utiliza una transacción con bloqueo de fila (`SELECT ... FOR UPDATE`) que revalida saldo y estado dentro de la propia transacción.
- Todos los importes monetarios están almacenados como `DECIMAL(10,2)`, sin pérdida de precisión de punto flotante.
- Los índices de base de datos relevantes están correctamente definidos para los patrones de consulta documentados.
- La disponibilidad de la agenda se revalida en el servidor, no únicamente en el cliente.

**Conclusión:** la base de código es sólida en sus decisiones de concurrencia, dinero y seguridad. Los pilares de este plan no sustituyen esa base: la aprovechan.

### 2.2 Deuda técnica y riesgos identificados

| Severidad | Hallazgo | Impacto sobre el plan |
| --- | --- | --- |
| **Crítica** | El proyecto no contiene ninguna prueba automatizada: sin archivos de prueba, sin configuración de runner y sin script de test | Cualquier migración de esquema o refactor se ejecuta sin red de seguridad. Bloquea el Pilar 1 |
| **Alta** | El total de un apartado (`monto_total`) lo fija el personal sin cota superior y sin relación con el precio del producto | Hueco de regla de negocio en dinero. Debe corregirse antes de cobrar suscripciones, por exposición de datos |
| **Alta** | El requerimiento de actualización en tiempo real de la agenda (RNF07) no tiene implementación | La concurrencia de dos barberos sobre la misma agenda no se resuelve. Supabase Realtime es la solución natural |
| **Media** | El documento formal de requisitos (27 requerimientos funcionales, 14 no funcionales, 27 casos de uso) fue eliminado del repositorio | El producto no tiene especificación viva. Debe restaurarse como control de alcance |
| **Media** | Cifrado de comunicaciones sin implementación en el código; delegado a infraestructura | Sin TLS gestionado, el modelo de cookies de sesión queda incompleto en producción |
| **Media** | Ocho vulnerabilidades reportadas en dependencias del frontend, cinco de ellas altas | Requiere auditoría y actualización antes de exponer el producto a clientes pagadores |
| **Baja** | Paquete de frontend superior a 500 kB sin fragmentación de código | Afecta la percepción de velocidad, un factor directo de conversión en un producto de suscripción |

### 2.3 Restricción de contexto

El sistema fue desarrollado como proyecto integrador universitario para un cliente específico. Su comercialización introduce una cuestión de titularidad y licencia que debe resolverse **antes** de cobrar a terceros. Este punto se desarrolla en el Anexo B.

---

## 3. Visión y objetivos

### 3.1 Visión

> BarberManager es la plataforma de gestión para peluquerías y barberías que permite a cualquier negocio,DATOS: operar con independence: clientes, agenda, servicios, apartados y reportes desde un solo lugar, con la confianza de que sus datos están aislados de los de cualquier otra peluquería cliente de la plataforma.

### 3.2 Objetivos estratégicos

| # | Objetivo | Indicador de logro |
| --- | --- | --- |
| O1 | Eliminar la operación de infraestructura de base de datos propia | Cero servidores de base de datos operados por el equipo |
| O2 | Garantizar aislamiento fuerte de datos entre inquilinos | Cero incidentes de fuga entre empresas, verificado por pruebas automatizadas de políticas de seguridad |
| O3 | Permitir el alta autónoma de una nueva peluería | Alta completa (registro → verificación → plan → pago → activo) sin intervención manual del equipo |
| O4 | Habilitar el cobro recurrente mensual | Cobro y renovación automatizados, conHandling de impago definido |
| O5 | Elevar la calidad percibida del producto | Cumplimiento de WCAG 2.2 nivel AA y reconstrucción del sistema de diseño sobre tokens |

### 3.3 Alcance

**Incluido:** migración de base de datos y autenticación; modelo multi-inquilino; roles de plataforma; planes, suscripciones y pagos; rediseño de interfaz y sistema de diseño;/pruebas automatizadas; hardening de seguridad.

**Excluido de este ciclo:** Integraciones con contabilidad o facturación fiscal; aplicación móvil nativa; marketplace de barbudos; integración con calendarios externos; soporte multi-idioma. Estos se registran como posibles iteraciones posteriores.

---

## 4. Pilar 1 — Migración a Supabase

### 4.1 Objetivo

Trasladar la persistencia de MySQL a PostgreSQL alojado en Supabase, y adoptar sus capacidades de autenticación, seguridad a nivel de fila y tiempo real, eliminando infraestructura propia y reduciendo la superficie de código de seguridad que el equipo debe mantener.

### 4.2 Justificación

La elección responde a problemas concretos y medibles del sistema actual, no a preferencia tecnológica:

- **Autenticación.** El sistema implementa un sistema de sesión propio (emisión de JWT, cookies, CSRF, revocación) que ocupa código propio y es responsable de bugs propios. Supabase Auth elimina esa capa a la vez que añade verificación por correo, recuperación de contraseña y gestión de sesiones, que hoy no existen.
- **Aislamiento de datos.** En el modelo actual, el aislamiento entre inquilinos depende de que cada endpoint recuerde escribir la comprobación correcta. Con Row Level Security, el aislamiento lo garantiza el motor de base de datos, no la disciplina del desarrollador.
- **Tiempo real.** El requerimiento de agenda en tiempo real no tiene implementación. Supabase Realtime lo resuelve de forma nativa.
- **Operación.** Elimina el trabajo de respaldos, actualizaciones de versión, monitoreo y manejo de incidentes de base de datos.

### 4.3 Arquitectura destino

```
┌──────────────────────────────────────────────────────────┐
│  Aplicación React 19 + Vite + Tailwind 4                 │
│  (SPA — sin cambios en el modelo de componente)           │
└───────────────────────────┬──────────────────────────────┘
                            │  cliente Supabase (session)
                            ▼
┌──────────────────────────────────────────────────────────┐
│  Supabase                                                 │
│  ├── Auth          (identidad, JWT, verificación correo)  │
│  ├── PostgreSQL    (datos + Row Level Security)           │
│  ├── Realtime      (agenda y notificaciones)               │
│  └── Storage       (logos y assets de cada inquilino)      │
└──────────────────────────────────────────────────────────┘
                            ▲
                            │  API REST (Express)
                            │  servicio: reglas de negocio
                            │  NO es la frontera de seguridad
┌───────────────────────────┴──────────────────────────────┐
│  API Express — capa de dominio                            │
│  Casos de uso, transacciones, validación, orquestación   │
└──────────────────────────────────────────────────────────┘
```

**Principio de diseño:** la API Express se conserva. El sistema posee lógica de negocio no trivial (cálculo de disponibilidad, reserva concurrente, máquina de estados de citas, saldo de apartados) que no debe mudarse a funciones de base de datos. La frontera de seguridad pasa a ser Row Level Security; la API pasa a ser la frontera de negocio.

### 4.4 Equivalencias de migración de esquema

El esquema actual utiliza ocho tablas. La traducción requiere cambios sistemáticos en sintaxis y tipos.

| MySQL 8 | PostgreSQL | Nota de riesgo |
| --- | --- | --- |
| `INT AUTO_INCREMENT PRIMARY KEY` | `INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY` | Cambia el origen de valores: el ID pasa a generarse en base de datos |
| `ENUM` | `TEXT` con `CHECK` o tipo `ENUM` nativo de Postgres | Postgres admite ENUM; evaluar si conviene mantenerlo |
| `VARCHAR(n)` | `VARCHAR(n)` | Sin cambios |
| `DECIMAL(10,2)` | `NUMERIC(10,2)` | Sin cambios en la intención; **nunca** usar `FLOAT` |
| `ENGINE=InnoDB` | Eliminar | PostgreSQL es transaccional por definición |
| `utf8mb4` | `UTF8` | Sin cambios |
| `ON DUPLICATE KEY UPDATE` | `INSERT ... ON CONFLICT ... DO UPDATE` | Sintaxis distinta; aparecen en los datos semilla |
| `GET_LOCK` / `RELEASE_LOCK` | `pg_advisory_lock` / `pg_advisory_unlock` | **Punto más delicado de la migración.** Ver 4.6 |
| Funciones de fecha/hora | `EXTRACT`, `generate_series`, `date_trunc` | El cálculo de disponibilidad depende fuertemente de estas |
| Backticks para identificadores | Comillas dobles | Solo aplica si algún identificador es palabra reservada |
| Pool de conexiones `mysql2` | `pg` con `pg.Pool` | APIs de placeholders distintas: `?` pasa a `$1, $2…` |

### 4.5 Cambios en la capa de aplicación

| Componente | Situación actual | Acción requerida |
| --- | --- | --- |
| `config/db.js` | Pool de `mysql2` | Sustituir por pool de `pg`; copiar configuración de conexión desde el panel de Supabase |
| Capa de modelos | SQL con placeholders `?` y consultas parametrizadas | Reescribir con placeholders `$n`. Las consultas ya parametrizadas se traducen mecánicamente |
| Middleware de autenticación | Verifica JWT propio, revalida contra base de datos, exige CSRF | Reemplazar por verificación de sesión de Supabase Auth. La revalidación de usuario activo queda cubierta por las políticas |
| Utilidad `jwt.js` | Emisión y verificación de tokens | Eliminar. Supabase Auth emite el token |
| Utilidad `csrf.js` y cookies de sesión | Cookies propias | Eliminar. Supabase manages cookies de sesión y refresh |
| Control de acceso por rol | Middleware `authorize` | **Se conserva como validación de negocio**, pero deja de ser la única frontera. Row Level Security pasa a ser la garantía de aislamiento |
| Bloqueo de reserva de citas | `GET_LOCK` con nombre por fecha | Traducir a bloqueo consultivo de PostgreSQL. Ver 4.6 |
| Bloqueo de abonos | Transacción + `SELECT ... FOR UPDATE` | Se mantiene sin cambios; ambos motores son transaccionales con bloqueo de fila |
| Notificaciones | Polling de 30 segundos | Complementar con Supabase Realtime; conservar el polling como respaldo |
| Configuración de entorno | Variables `DB_*` y `JWT_SECRET` | Sustituir por `SUPABASE_URL`, claves de publicación y secreto de servicio |

**Punto de seguridad crítico:** la clave secreta de servicio de Supabase **nunca** debe llegar al navegador. Toda operación que la requiera debe ejecutarse en la API Express o en una Edge Function. Una fuga de esta clave equivale a exponer la base de datos completa.

### 4.6 Estrategia para la concurrencia

Este es el punto técnico de mayor riesgo de toda la migración, porque afecta la disponibilidad y la confianza en el sistema.

`GET_LOCK` es un mecanismo de bloqueo con nombre de MySQL, con semántica propia yReleased automáticamente al cerrar la conexión. PostgreSQL ofrece `pg_advisory_lock`, de semántica cercana pero con diferencias que deben respetarse:

- El bloqueo consultivo es **de sesión**, no de transacción. Si la conexión se reinicia o se devuelve al pool sin liberar, el bloqueo persiste y puede bloquear la agenda completa.
- Se recomienda liberar el bloqueo explícitamente y, de forma adicional, usar el modo con tiempo límite (`pg_try_advisory_lock`) para evitar esperas indefinias.
- El nombre del bloqueo en MySQL es una cadena; en PostgreSQL las claves consultivas son enteros de 64 bits. Se requiere una conversión estable y determinista de la fecha a entero, y un espacio de nombres que no colisione con otros bloqueos de la aplicación.

**Requisito de aceptación:** la reserva de citas debe conservar la garantía actual de que dos solicitudes simultáneas sobre el mismo horario no pueden reservarlo dos veces, y debe contar con una prueba automatizada que lo demuestre de forma repetible. Esta garantía no es negociable: es la integridad del negocio central del producto.

### 4.7 Fases de la migración

| Fase | Contenido | Entregable verificable |
| --- | --- | --- |
| M1 | Aprovisionamiento del proyecto Supabase, configuración de red y entornos separados de desarrollo y producción | Proyecto creado, esquema desplegado en ambos entornos |
| M2 | Traducción del esquema: ocho tablas existentes más las nuevas del Pilar 2 | Script de esquema idempotente, revisado y versionado |
| M3 | Migración de datos de la base actual | Script de migración ejecutado y **conciliado**: recuento de filas y suma de importes coincidente entre origen y destino |
| M4 | Reescritura de la capa de modelos y del acceso a datos | API Express funcionando contra Supabase, con los módulos translated |
| M5 | Sustitución de autenticación por Supabase Auth | Inicio y cierre de sesión, recuperación de contraseña y verificación de correo operativos |
| M6 | Row Level Security sobre el esquema del Pilar 2 | Políticas desplegadas y probadas (ver Pilar 2) |
| M7 | Traducción de los bloqueos de concurrencia | Prueba automatizada de reserva simultánea que lo demuestra |
| M8 | Integración de Realtime para agenda y notificaciones | Actualización de la agenda sin recarga manual |
| M9 | Retiramiento de MySQL y limpieza de código muerto | Sin referencias residuales a `mysql2` ni a `DB_*` |

### 4.8 Verificación y reversibilidad

- **Conciliación obligatoria.** Antes de dar por cerrada la migración, el recuento de filas y la suma de `monto_total`, `saldo_pendiente` y `monto` de abonos deben coincidir exactamente entre MySQL y PostgreSQL. Una diferencia de un centavo invalida la migración.
- **Entorno de desarrollo separado.** Nunca se migra sobre producción. Durante M3 a M7, MySQL sigue siendo el sistema de referencia y PostgreSQL opera en paralelo.
- **Reversibilidad.** Hasta que la conciliación y las pruebas completas resulten satisfactorias, MySQL permanece intacto y es posible volver atrás sin pérdida de datos.

### 4.9 Riesgos del pilar

| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| Fuga de datos por política de seguridad mal definida | Media | **Crítico** | Pruebas automatizadas de aislamiento obligatorias antes de exponer más de un inquilino. Una política permisiva equivale a una fuga |
| Fuga de la clave de servicio de Supabase al cliente | Media | **Crítico** | Clave solo en servidor. Comprobación automatizada sobre el paquete construido |
| Réplica de la reserva concurrente al migrar el bloqueo | Media | Alto | Prueba de concurrencia como criterio de aceptación bloqueante de la fase M7 |
| Diferencias de zona horaria y de cálculo de disponibilidad | Media | Alto | Mismas fixtures de prueba de disponibilidad ejecutadas contra ambos motores; resultados comparados |
| Conciliación de datos incompleta | Media | Alto | Script de conciliación reutilizable, ejecutado y archivado como evidencia |
| Caída de rendimiento tras la migración | Baja | Medio | Medición de tiempos de consulta antes y después sobre el conjunto de datos real |

---

## 5. Pilar 2 — Globalización y modelo comercial

### 5.1 Objetivo

Transformar el sistema de un producto para una única peluquería en una plataforma por suscripción donde múltiples peluquerías y barberías operan de forma independiente, aisladas entre sí, pagando una mensualidad por el derecho de uso.

### 5.2 Principio central de la arquitectura

El cambio de un sistema de una empresa a un sistema de many-to-many es el mayor riesgo del proyecto. La decisión de aislamiento determina la arquitectura, el costo y la seguridad de todo lo demás.

| Modelo | Descripción | Ventajas | Desventajas |
| --- | --- | --- | --- |
| **A. Esquema compartido con RLS** *(recomendado)* | Una sola base de datos; todas las tablas incluyen `tenant_id`; el aislamiento lo aplica el motor mediante políticas | Costo mínimo y predecible; migraciones triviales; consultas entre inquilinos para analítica; operación simple | Una política mal definida expone datos de todos los inquilinos |
| B. Base de datos por inquilino | Una base por peluquería | Aislamiento físico máximo | Costo lineal por cliente; migraciones repetidas N veces; complejidad operativa prohibitiva para el tamaño esperado |
| C. Esquema por inquilino | Un esquema por peluquería en la misma instancia | Estado intermedio | Complejidad de gestión sin la simplicidad del esquema compartido |

**Se recomienda el Modelo A.** El aislamiento de nivel físico es innecesario para este producto: el riesgo real no es que un atacante acceda al servidor, sino que el sistema entregue datos de una peluquería a otra por una consulta mal escrita. Row Level Security resuelve exactamente ese riesgo, en la capa correcta, y de forma verificable mediante pruebas.

Esta recomendación asume que el número de inquilinos se sitúe en el orden de decenas a pocos cientos. Si el modelo de negocio se orientara a miles de clientes de pequeña barbería, el modelo A sigue siendo válido pero exigiría particionado y una revisión del costo de conexión.

### 5.3 Modelo de datos propuesto

El esquema existente se conserva en su estructura y se le añade una columna `tenant_id` a cada tabla de dominio, más cinco tablas nuevas.

**Tablas de dominio con `tenant_id`:** servicios, productos, disponibilidad_horarios, disponibilidad_excepciones, citas, apartados, abonos, notificaciones.

**Tablas nuevas:**

| Tabla | Propósito | Campos esenciales |
| --- | --- | --- |
| `tenants` | Cada peluSHOTía o barbería cliente de la plataforma | `id`, `nombre`, `slug` único, `plan_id`, `estado`, `logo_url`, `configuracion` (JSON), `creado_en` |
| `tenant_members` | Relación entre personas y empresas, con rol dentro de la empresa | `tenant_id`, `user_id`, `rol`, `invitado_por` |
| `plans` | Catálogo de planes comercializables | `id`, `nombre`, `precio_mensual`, `limite_usuarios`, `limite_barberos`, `limite_citas_activas`, `funcionalidades` (JSON) |
| `subscriptions` | Suscripción activa de cada empresa | `tenant_id`, `plan_id`, `estado`, `inicio_periodo`, `fin_periodo`, `inicio_gracia`, `proveedor`, `referencia_externa` |
| `payments` | Historial financiero auditable | `tenant_id`, `subscription_id`, `monto`, `moneda`, `estado`, `metodo`, `referencia_externa`, `pagado_en` |

**Decisión de diseño relevante:** `tenant_id` debe ser **obligatorio y sin valor por defecto** en toda tabla de dominio. Una columna nullable es la causa más frecuente de fugas en un modelo multi-inquilino: un `INSERT` que olvide la columna deja la fila fuera del alcance de cualquier política. Una restricción `NOT NULL` lo convierte en un error en desarrollo, no en un incidente en producción.

### 5.4 Matriz de roles y permisos

El sistema pasa de tres roles a cuatro, con un rol de plataforma que existe por encima de las empresas.

| Rol | Ámbito | Capacidades |
| --- | --- | --- |
| `platform_admin` | Global | Gestiona inquilinos, planes, suscripciones,Incidentes de acceso y soporte. No ve datos operativos de las peluquerías salvo en procedimiento de soporte auditado |
| `owner` | Empresa | Propietario de la peluquería. Facturación, configuración, gestión de barbberos, todo lo operativo |
| `barbero` | Empresa | Gestión de agenda, clientes, servicios, productos, apartados y reportes. Sin facturación ni baja de clientes fuera de su empresa |
| `cliente` | Empresa | Solo sus propios datos: agenda, perfil, apartados, catálogo |

El acceso a datos se controla por la pertenencia en `tenant_members` combinada con políticas de seguridad a nivel de fila. El rol se resuelve en la base de datos, no en el cliente.

### 5.5 Planes y suscripción

Estructura inicial propuesta, sujeta a validación de negocio:

| Plan | Precio de referencia | Límite de barbberos | Límite de citas activas | Funcionalidades |
| --- | --- | --- | --- | --- |
| **Inicial** | Defined | 1 | 100 | Agenda, clientes, servicios, catálogo |
| **Profesional** | Definido | 3 | 500 | Todo lo anterior + apartados, reportes, notificaciones, logo propio |
| **Negocio** | Definido | 10 | Ilimitadas | Todo lo anterior + Multi-sucursal, exportaciones, soporte prioritario |

**Límites aplicados en la base de datos.** La guía oficial de Supabase admite aplicar límites de plan directamente dentro de las políticas de seguridad, de modo que una operación que exceda el contrato sea rechazada por el motor. Esta aproximación es significativamente más robusta que validar el límite en el controlador, porque no depende de que cada endpoint recuerde la comprobación.

### 5.6 Flujo de alta de un nuevo cliente

El objetivo declarado es que el alta sea autónoma. El flujo propuesto:

1. El/barbero se registra con correo y contraseña. Supabase Auth emite el token; el perfil vive en `profiles`.
2. Se crea una organización: se solicita nombre de la peluquería y se genera un `slug` único, que se convierte en la URL pública del sistema.
3. Se autentica el correo y se elige plan.
4. Se completa el pago.
5. La suscripción queda en estado `activa` y la sede del inquilino se crea con los servicios semilla y un horario de trabajo por defecto.
6. El propietario invita a su equipo mediante un flujo de invitación por correo.

### 5.7 Acceso, suspensión y recuperación

El control de acceso comercial debe estar definido con precisión, porque es donde sedefined la experiencia del cliente que paga:

- **Suscripción vencida.** La aplicación sigue accesible en modo de solo lectura durante un **período de gracia de siete días**, con un aviso visible. Vencido el período, se bloquean las operaciones de escritura, nunca la lectura de datos históricos ni el acceso a los datos del cliente final.
- **Bloqueo deliberado del acceso al cliente que ya agendó** dañaría la confianza y generaría costo de soporte without recovering revenue. **Decisión de negocio a validar.**
- **Suspensión manual.** Reservada a fraude o incumplimiento. Requiere registro de quién la ejecutó y por qué.
- **Reactivación.** El pago restablece el estado y el acceso se recupera sin intervención técnica.

### 5.8 Facturación y pagos

| Aspecto | Recomendación | Alternativa a considerar |
| --- | --- | --- |
| Proveedor | Pasarela con suscripción recurrente y facturación en la región objetivo | Processing manual, activación por parte del administrador. Más lento, pero viable en la etapa inicial |
| Webhooks | Obligatorios. La API de pagos es la fuente de verdad del estado de la suscripción | — |
| Idempotencia | Toda operación de cobro debe ser idempotente, protegida por una clave única, para que un reintento no cobre dos veces | — |
| Impuestos | Cálculo de impuestos y facturación electrónica según la jurisdicción de operación | outsourced a proveedor |
| Moneda | Definir una moneda base única de referencia | Multimoneda con tipo de cambio, solo si el mercado lo exige |

**Recomendación operativa:** lanzar con activación manual de la suscripción asistida por un proveedor de pago. El cobro recurrente automatizado es un diferenciador de madurez, no un requisito para validar el modelo de negocio, y automatizarlo antes de tener clientes reales multiplica el riesgo sin)^\ validar la hipótesis.

### 5.9 Personalización de marca (etiqueta blanca)

Cada empresa podrá tener logo, nombre y colores. La implementación requiere que toda la paleta del sistema pase a ser derivable de tokens de tema en lugar de valores fijos, lo que conecta directamente con el Pilar 3. Un tenant de más bajo nivel usa el tema de la plataforma; los niveles superiores pueden definir el propio.

### 5.10 Fases del pilar

| Fase | Contenido | Entregable verificable |
| --- | --- | --- |
| T1 | Tablas `tenants`, `tenant_members`, `plans` y scripts de provisión | Esquema desplegado |
| T2 | Asignación de `tenant_id` a las ocho tablas de dominio, con `NOT NULL` y claves foráneas | Script de backfill ejecutado y conciliado |
| T3 | Row Level Security sobre todas las tablas | Políticas desplegadas |
| T4 | Pruebas de aislamiento entre inquilinos | Suite de pruebas que demuestra que el inquilino A no puede leer ni escribir datos del B |
| T5 | Flujo de onboarding y creación de empresa | Alta completa sin intervención manual |
| T6 | Roles de plataforma y panel de administración de la plataforma | Panel operativo funcional |
| T7 | Planes, suscripciones y función de alta de **TEN**trial | Trial y expiración funcionando |
| T8 | Integración de pagos y webhooks | Cobro y renovación automatizados, con prueba de idempotencia |
| T9 | Período de gracia, suspensión y reactivación | Flujo de impago probado de extremo a extremo |
| T10 | Personalización de marca por empresa | Logo y colores aplicados por empresa |

### 5.11 Criterios de aceptación del pilar

El Pilar 2 se considera completo cuando se cumplen, de forma demostrable, las siguientes condiciones:

1. Dos empresas coexisten en producción con el mismo proceso, sin ninguna referencia cruzada en sus datos.
2. La suite de pruebas de aislamiento de T4 pasa sin excepciones y se ejecuta de forma automática en cada integración.
3. Una empresa newly creada se activa por sí sola desde el registro hasta el primer uso, sin intervención del equipo.
4. Un cobro fallido produce el estado de suscripción correcto, la pérdida de acceso de escritura tras el período de gracia, y la restauración completa tras el pago, todo verificado por prueba automatizada.
5. Un intento de lectura de un registro de otra empresa es rechazado por la base de datos, no por el código de aplicación.

### 5.12 Riesgos del pilar

| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| Fuga de datos entre empresas | Media | **Catastrófico** | Row Level Security con probatorio, pruebas T4 obligatorias, revisión de políticas antes de cada ampliación |
| Valores de `tenant_id` nulos en inserciones futuras | Alta | Alto | Restricción `NOT NULL` que hace fallar la escritura en lugar de dejar la fila sin dueño |
| Rol de plataforma con acceso excesivo | Media | Alto | El rol de plataforma no recibe acceso a datos operativos por defecto; el acceso a soporte es un procedimiento auditado y temporal |
| Errores de facturación duplicada | Media | Alto | Idempotencia obligatoria en toda operación de cobro y en el procesamiento de webhooks |
| Ruptura de servicio al cliente de pago | Media | Alto | Período de gracia antes del bloqueo; nunca se corta el acceso a los datos del cliente final |
| Migración incompleta de datos existentes al modelo multi-inquilino | Media | Alto | Script de backfill y conciliación con recuento de filas; toda empresa existente debe quedar asignada explícitamente |

---

## 6. Pilar 3 — Rediseño visual y de experiencia

### 6.1 Objetivo

Elevar la calidad percibida del producto, la usabilidad y la accesibilidad, construyendo un sistema de diseño coherente y una interfaz que el cliente final considere profesional.

### 6.2 Diagnóstico de la interfaz actual

El sistema posee una identidad visual definida y coherente —paleta oscura con acentos dorados, tipografía con contraste entre una serif de titular y una sans de lectura, iconografía propia, y componentes de estado reutilizables. Ese trabajo de base es sólido y debe conservarse como punto de partida, no reemplazarse.

Las oportunidades de mejora se concentran en:

| Área | Situación actual | Oportunidad |
| --- | --- | --- |
| Sistema de diseño | La paleta dorada existe como tokens de tema en CSS; el resto de decisiones (espaciado, escalas tipográficas, radios, sombras, alturas de control) **no están tokenizadas** | Sin tokens, cada pantalla nueva improvisa. Es la causa raíz de la inconsistencia visual a medida que el producto crece |
| Accesibilidad | No hay evidencia de trabajo de accesibilidad | WCAG 2.2 nivel AA es un requisito explícito del proyecto y también un requisito de venta |
| Estados de interfaz | El patrón de carga y error no es un lenguaje de diseño | Cada pantalla comunica de forma distinta la ausencia de datos, la carga y el error |
| Responsive | La navegación adapta correctamente entre escritorio y móvil | Debe validarse en la experiencia de reserva, que es el flujo crítico de conversión |
| Realimentación al usuario | Parcial | Requerimiento explícito del proyecto (RNF11) |
| Errores de formulario | Validación en el servidor sí existe | Falta el diseño del mensaje de error en cliente, que es lo que el usuario ve |
| Marca por empresa | La marca es fija | Debe derivarse de tokens para permitir la personalización del Pilar 2 |

### 6.3 Sistema de diseño

**Tokenización completa como requisito previo.** Antes de rediseñar pantalla, todos los valores de estilo deben existir como tokens con nombre semántico. No se rediseña a ojo.

| Grupo | Contenido |
| --- | --- |
| Color | Superficies, texto con niveles de contraste verificados, acento de marca, estados semánticos, bordes y divisores |
| Tipografía | Escala de títulos y cuerpos, pesos, alturas de línea, medidas máximas de línea |
| Espaciado | Escala base consistente; la alineación vertical se logra con espaciado, no con ajustes manuales |
| Radios, sombras y bordes | Valores únicos y nombrados, sin valores arbitrarios por pantalla |
| Movimiento | Duración, curvas y qué transiciones son permitidas. El movimiento se usa para orientar, nunca para decorar |
| Puntos de ruptura | Puntos únicos de responsive definidos como tokens |

**Gobernanza:** una pantalla nueva no se incorpora si introduce un valor de estilo no presente en el sistema. La regla se verifica idealmente con una comprobación automática de estilo presentacional, no mediante revisión manual.

### 6.4 Arquitectura de información y navegación

Hoy la navegación se deriva de tres roles. Con el modelo multi-inquilino, debe derivar de dos variables simultáneas: **el rol** y **el contexto de la empresa activa**. Este es un problema de arquitectura de información, no solo de navegación, y debe resolverse antes de construir la interfaz de activación de tenant.

Definir explícitamente:

- Cómo se selecciona y cambia la empresa activa cuando un usuario pertenece a más de una.
- Qué navegación ve un `platform_admin`, que no pertenece a ninguna peluquería.
- El comportamiento de la navegación al expirar una suscripción: qué se oculta, qué se muestra en solo lectura y qué mensaje se presenta.

### 6.5 Flujos críticos a rediseñar

| Flujo | Prioridad | Motivo |
| --- | --- | --- |
| Alta de nueva empresa | Máxima | Es el primer contacto de un cliente que paga. Define la conversión |
| Reserva de cita por parte del cliente final | Máxima | Es la acción de mayor volumen y la razón principal por la que el cliente final usa el sistema |
| Agenda del barbero | Alta | Es la pantalla de trabajo diario del personal de la peluquería |
| Detalle de apartado y registro de abono | Alta | Involucra dinero y confianza; requiere un lenguaje claro y no ambiguo |
| Panel de estado de suscripción | Media | Comunica el estado comercial sin resultar hostil |

### 6.6 Accesibilidad

Objetivo: **WCAG 2.2 nivel AA**. Es un requerimiento del documento formal del proyecto, y en un producto de pago por suscripción es además un argumento de venta para empresas que atienden a personas con discapacidad.

| Área | Requisito |
| --- | --- |
| Contraste | Verificar todos los pares texto/fondo; la paleta dorada sobre fondo oscuro requiere comprobación explícita, no suposición |
| Foco visible | Indicador de foco visible y consistente en todos los componentes interactivos |
| Navegación por teclado | Todas las funciones alcanzables por teclado; modales con foco atrapado y retorno al elemento de origen |
| Formularios | Etiquetas asociadas; errores identificados y descritos programáticamente; no solo signaled por color |
| Anuncios | Cambios de contenido relevantes anunciados a lectores de pantalla |
| Objetivos táctiles | Cumplimiento del tamaño mínimo de área interactiva en móvil |
| Movimiento | Respeto a la preferencia de movimiento reducido del sistema |
| Formularios de pago | Etiquetas visibles y permanentes; nunca solo el marcador de posición |

La verificación se realiza con una herramienta automática en cada integración, más una revisión manual de los flujos críticos.

### 6.7 Estados de interfaz

Definir y documentar cuatro estados con comportamiento y estilo consistentes en todo el producto:

| Estado | Tratamiento |
| --- | --- |
| **Carga** | Esqueleto de la forma esperada, no un spinner genérico. Evita el salto de layout al cargar |
| **Vacío** | Estado vacío diseñado, que indica qué hacer a continuación. Es la oportunidad de venta más desatendida del producto |
| **Error** | Mensaje en lenguaje comprensible, con acción de reintento cuando la causa es recuperable. Sin pila de error técnico visible |
| **Éxito** | Confirmación visible y breve de la operación realizada |

### 6.8 Fases del pilar

| Fase | Contenido | Entregable verificable |
| --- | --- | --- |
| D1 | Auditoría visual del producto actual, inventario de pantallas y catálogo de inconsistencias | Inventario documentado |
| D2 | Definición del sistema de tokens | Documentación de tokens, aplicada al tema actual sin cambios visuales |
| D3 | Biblioteca de componentes base: botones, campos, tablas, modales, avisos, estados | Componentes con estados documentados y accesibles |
| D4 | Rediseño de los flujos críticos | Flujos de onboarding, reserva, agenda y apartado rediseñados |
| D5 | Modo claro y oscuro | Tema oscuro como predeterminado, claro disponible |
| D6 | Accesibilidad: corrección y verificación | Auditoría externa o con herramienta especializada; informe de cumplimiento |
| D7 | Personalización de marca por empresa | Tokens de tema por tenant, aplicado desde el Pilar 2 |
| D8 | Rendimiento: fragmentación de código y optimización | Bundle inicial por debajo del umbral acordado, definido con la métrica de campo Core Web Vitals |

### 6.9 Criterios de aceptación del pilar

1. Cero valores de estilo arbitrarios en la interfaz: todo se resuelve a tokens del sistema.
2. Auditoría de accesibilidad sin errores de nivel A ni AA, con informe archivado.
3. Navegación completa por teclado en todos los flujos, verificada manualmente.
4. Los cinco flujos críticos rediseñados, con sus cuatro estados implementados.
5. Ninguna pantalla presenta un error sin una acción de reintento o una siguiente acción clara.
6. Tema por empresa aplicado sin bifurcación del código de interfaz.

---

## 7. Hoja de ruta consolidada

### 7.1 Estructura de fases

| Fase | Nombre | Pilar | Depende de | Tamaño relativo |
| --- | --- | --- | --- | --- |
| **F0** | Estabilización y control de alcance | Transversal | — | Media |
| **F1** | Infraestructura Supabase | 1 | F0 | Media |
| **F2** | Traducción de esquema y datos | 1 | F1 | Media |
| **F3** | Reescritura de datos y autenticación | 1 | F2 | Alta |
| **F4** | Concurrencia y tiempo real | 1 | F3 | Media |
| **F5** | Modelo multi-inquilino y aislamiento | 2 | F3 | Alta |
| **F6** | Onboarding y roles de plataforma | 2 | F5 | Media |
| **F7** | Planes, suscripción y pagos | 2 | F6 | Alta |
| **F8** | Sistema de diseño | 3 | F0 | Media |
| **F9** | Rediseño de flujos críticos | 3 | F8 | Alta |
| **F10** | Accesibilidad y rendimiento | 3 | F9 | Media |
| **F11** | Lanzamiento y estabilización | Transversal | F4, F7, F10 | Media |

Los tamaños son **estimaciones relativas** y requieren recalibración con el equipo real. Convertir esto a fechas requiere conocer la disponibilidad efectiva de personas, que este documento no puede estimar.

### 7.2 Contenido de la Fase 0

Es la fase que condiciona todas las demás y la de mejor relación costo-beneficio:

1. **Restaurar el documento formal de requisitos** al repositorio, de modo que el alcance de cada fase sea verificable. Recuperable del historial de Git.
2. **Configurar una base de pruebas automatizadas** sobre los dos pilares más delicados del sistema: reserva concurrente de citas y registro de abonos a apartados. Ambos son corregibles y su comportamiento debe quedar congelado por pruebas antes de cualquier refactor.
3. **Corregir el hueco de `monto_total`** identificado en la auditoría, con su prueba correspondiente.
4. **Auditoría y actualización de dependencias** con vulnerabilidades reportadas.
5. **Definir la propiedad del código y la autorización de comercialización** antes de cobrar a terceros (ver Anexo B).
6. **Restaurar el documento de requisitos** como control de alcance de las fases siguientes.

### 7.3 Caminos críticos y paralelización

- El Pilar 3 (diseño) es el único que **no depende** de la migración a Supabase. Puede avanzar en paralelo desde la F0, ya que opera sobre tokens y componentes del frontend. Iniciar el diseño antes de tiempo reduce el camino total.
- La F4 (concurrencia) es **bloqueante** para exponer el sistema a clientes reales. Un error en la reserva de citas bajo carga simultánea daña la confianza de forma irreversible.
- La F5 (aislamiento) es **bloqueante** para el modelo comercial. Sin aislamiento demostrado, no se vende.
- La F7 (pagos) puede simplificarse en una primera iteración a activación asistida, difiriendo la automatización.

---

## 8. Matriz consolidada de riesgos

| # | Riesgo | Pilar | Prob. | Impacto | Nivel | Mitigación principal |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | Fuga de datos entre empresas | 2 | Media | Catastrófico | **Crítico** | Row Level Security con probatorio; pruebas de aislamiento obligatorias en cada integración |
| R2 | Fuga de la clave de servicio de Supabase | 1 | Media | Catastrófico | **Crítico** | Clave solo en servidor; comprobación automatizada sobre el paquete construido |
| R3 | Reserva simultánea duplicada tras migrar el bloqueo | 1 | Media | Alto | **Alto** | Prueba de concurrencia como criterio bloqueante de la fase |
| R4 | Cero pruebas en un sistema que maneja dinero | Transversal | Cierta | Alto | **Alto** | Fase 0: pruebas sobre los dos pilares de dinero y concurrencia antes de migrar |
| R5 | Imposibilidad de verificar el alcance | Transversal | Cierta | Medio | **Alto** | Restaurar el documento formal de requisitos como control de alcance |
| R6 | Cobro duplicado por reintento o webhook duplicado | 2 | Media | Alto | **Alto** | Idempotencia obligatoria en el cobro y en el procesamiento de webhooks |
| R7 | Cobre a un cliente que ya agendó, dañando la relación | 2 | Baja | Alto | **Alto** | Período de gracia; nunca bloquear datos del cliente final |
| R8 | Roles de plataforma con exceso de privilegio | 2 | Media | Alto | **Alto** | Sin acceso a datos operativos por defecto; soporte auditado y temporal |
| R9 | Datos existentes mal asignados a un tenant en la migración | 2 | Media | Alto | **Alto** | `tenant_id NOT NULL`; backfill con conciliación de recuento de filas |
| R10 | Conflictos de titularidad sobre la comercialización | Transversal | Media | Alto | **Alto** | Resolver antes de cobrar a terceros (Anexo B) |
| R11 | Diferencias de zona horaria en el cálculo de disponibilidad | 1 | Media | Medio | **Medio** | Fixtures de prueba comparadas entre motores |
| R12 | Caída de rendimiento tras migrar | 1 | Baja | Medio | **Medio** | Medición de tiempos antes y después sobre datos reales |
| R13 | Dependencias con vulnerabilidades conocidas | Transversal | Cierta | Medio | **Medio** | Auditoría y actualización en Fase 0 |
| R14 | Superación del alcance y retraso de la fecha de lanzamiento | Transversal | Media | Medio | **Medio** | Definir un primer lanzamiento mínimo en dos inquilinos reales |
| R15 | Sobrecomplejación del modelo de tokens de diseño | 3 | Media | Bajo | **Bajo** | Los tokens pueden diferirse al primer cliente que lo pida |

---

## 9. Indicadores de éxito

| Dimensión | Indicador | Meta propuesta |
| --- | --- | --- |
| Seguridad | Incidentes de fuga de datos entre empresas | **Cero** |
| Seguridad | Pruebas de aislamiento que pasan en cada integración | 100% |
| Seguridad | Clave de servicio expuesta en el paquete del cliente | Cero |
| Fiabilidad | Reserva duplicada bajo carga simultánea | Cero |
| Comercial | Alta autónoma de empresa sin intervención del equipo | Medible desde el primer cliente |
| Comercial | Cambios de plan o cancelaciones involuntarias | Medición posterior al lanzamiento |
| Producto | Cumplimiento de accesibilidad | WCAG 2.2 AA sin hallazgos de nivel A ni AA |
| Producto | Errores de consola en los flujos críticos | Cero |
| Producto | Errores de JavaScript registrados en producción | Tendencia a cero |
| Rendimiento | Métricas de campo de carga y respuesta | Objetivos por definir en F1 |
| Mantenibilidad | Cobertura de pruebas sobre módulos de dinero y concurrencia | Definida en F0 |
| Operación | Horas de trabajo correctivo por cliente | Tendencia a cero en los primeros tres meses |

Los indicadores de carga y respuesta se fijan en la F1, cuando exista un entorno real en producción y puedan fijarse objetivos con datos de campo en lugar de estimaciones.

---

## 10. Decisiones pendientes

Requieren confirmación antes de iniciar la ejecución:

| # | Decisión | Por qué importa | Recomendación del equipo |
| --- | --- | --- | --- |
| D1 | ¿Esquema compartido con RLS o base de datos por inquilino? | Define la arquitectura, el costo y el modelo de seguridad de todo el sistema | Esquema compartido con RLS. El aislamiento físico no aporta valor a esta escala |
| D2 | ¿Cuántos inquilinos se prevén en los primeros 12 meses? | Valida la elección del modelo de aislamiento y la proyección de costo | Por confirmar |
| D3 | ¿Proveedor de pagos? | Determina la complejidad del Pilar 2 y el tratamiento fiscal | Activación asistida en v1; pasarela con suscripción recurrente en v2 |
| D4 | ¿Personalización de marca por empresa desde la v1? | Duplica parte del trabajo del Pilar 3 | Sí, pero como derivación de tokens ya existente |
| D5 | ¿La API Express se mantiene o se migra a funciones de base de datos? | Define el perfil de la arquitectura y el costo operativo | Mantener Express. La lógica de negocio no debe mudarse a la base de datos |
| D6 | ¿Supabase Auth reemplaza por completo la autenticación propia? | Elimina código propio, pero cambia el modelo de sesión y las cookies | Sí, reemplazarlo por completo |
| D7 | ¿Moneda, impuestos y jurisdicción de facturación? | Es una decisión legal y de negocio, no técnica | Por definir con asesoría |
| D8 | ¿Titularidad del código y autorización de comercialización? | Condición para cobrar a terceros | Resolver antes de la F7. Ver Anexo B |
| D9 | ¿Dónde se aloja la aplicación (la API y el frontend)? | Supabase aloja la base; el resto de la aplicación tiene su propio alojamiento | Por definir. React en un servicio de borde y API en un contenedor, por ejemplo |
| D10 | ¿Alcance del primer lanzamiento? | Determina la secuencia real de trabajo y evita ampliar el alcance | Activación asistida, un solo plan, sin personalización de marca en el primer lanzamiento |

---

## Anexo A — Glosario

| Término | Definición |
| --- | --- |
| **Inquilino (tenant)** | Cada peluquería o barbería que opera su propia instancia lógica del sistema, aislada de las demás |
| **Plataforma** | El operador del sistema, que gestiona inquilinos, planes y suscripciones |
| **Row Level Security (RLS)** | Mecanismo de PostgreSQL que aplica políticas de acceso fila por fila dentro del motor de base de datos |
| **Filtrado por fila** | Restricción de las consultas para que solo devuelvan filas del inquilino correspondiente |
| **Retención de datos** | Período durante el cual se conservan los datos tras la cancelación de una suscripción |
| **Conciliación** | Verificación de que el conjunto de datos migrado coincide exactamente con el origen |
| **Período de gracia** | Intervalo tras el vencimiento de la suscripción durante el cual el sistema sigue aceptando operaciones |
| **Etiqueta blanca** | Personalización de marca de la plataforma con la identidad visual de cada cliente |
| **Transacción** | Unidad de trabajo indivisible: se aplica completa o no se aplica |
| **Idempotencia** | Propiedad de una operación que, al repetirse, produce el mismo resultado sin duplicar efectos |

---

## Anexo B — Titularidad del código y autorización de comercialización

El sistema fue desarrollado como proyecto integrador universitario, en el marco de una asignatura de la Universidad Técnica Nacional, para un cliente específico.

Antes de cobrar suscripciones a terceros, deben resolverse tres preguntas con la universidad y, en su caso, con el cliente original:

1. **Titularidad de la propiedad intelectual** de un proyecto académico. En muchas instituciones, el trabajo académico pertenece a la institución o al equipo de forma diferenciada respecto del código fuentePatrimonio Intelectual; en otras, la titularidad es del equipo. Debe confirmarse por escrito.
2. **Alcance de la autorización:** una carta de Permission de la Assignment o de la universidad que cubra la explotación comercial del software. Esta autorización debe incluir el uso del nombre de la Assignment, si se utiliza con fines comerciales.
3. **Compromisos con el cliente original:** si el código se construyó para una peluquería identificable, existen datos, marca y posibles acuerdos de confidencialidad que condicionan su uso por terceros. Los datos de clientes de la peluquería original **nunca** deben trasladarse a un entorno comercial nuevo.

Este anexo no constituye asesoría legal. Su propósito es dejar constancia de que existe un requisito previo de orden legal y administrativo que condiciona la viabilidad comercial, para que no se descubra en el momento de cobrar el primer cliente.

---

## Anexo C — Trazabilidad de hallazgos de la auditoría

| Hallazgo verificado en auditoría | Pilar que lo resuelve | Fase |
| --- | --- | --- |
| Sin pruebas automatizadas | Transversal | F0 |
| `monto_total` de apartado sin cota ni relación con el precio del producto | 1 | F0 |
| Requerimiento de tiempo real de la agenda sin implementar | 1 | F4 |
| Cifrado de comunicaciones no implementado en código | 1 | F1 |
| Vulnerabilidades en dependencias del frontend | Transversal | F0 |
| Paquete de frontend superior a 500 kB sin fragmentar | 3 | D8 |
| Documento formal de requisitos eliminado del repositorio | Transversal | F0 |
| Aislamiento entre empresas no existe por diseño | 2 | F5 |
| Validación y orden de los bloqueos de concurrencia dependientes de MySQL | 1 | F4 |
| Tipos de importe ya correctos en `DECIMAL(10,2)` | — | Sin cambio. Preservar en la traducción |
| Índices de base de datos ya definidos para los patrones de consulta | — | Sin cambio. Preservar y extender con las tablas nuevas |

---

*Documento generado para planificación estratégica. Las estimaciones de esfuerzo son relativas y requieren validación con el equipo. Los objetivos y precios citados son propuestas sujetas a validación de negocio.*
