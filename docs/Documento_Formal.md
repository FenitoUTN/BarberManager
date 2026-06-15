

UNIVERSIDAD TÉCNICA NACIONAL

INGENIERÍA EN TECNOLOGÍAS DE INFORMACIÓN





Proyecto Integrador I y Desarrollo de Software I



Sistema Web de Gestión para Kenneth's Barber





PROFESOR:

MSc. Linnette Roldán Morales





ESTUDIANTES:

Jefferson Alvarado Vega

Andrew Mena Camacho

Alonso Morales Vargas

Néstor Palacios Corrales





Mayo, 2026





Carta de Empresa

Espacio reservado para la carta de la empresa.



Resumen Ejecutivo

El presente proyecto tiene como finalidad el análisis y desarrollo de un sistema web denominado BarberManager, orientado a mejorar la gestión de citas y la administración básica de clientes en Kenneth's Barber, una barbería ubicada en Viento Fresco de Aguas Zarcas y administrada por su propietario, Kenneth Rodríguez. Actualmente, el negocio cuenta con un solo barbero, quien se encarga tanto de brindar los servicios de corte de cabello, corte de barba y asesoramiento, como de atender las solicitudes de citas y organizar la agenda diaria de trabajo.

La problemática principal identificada se relaciona con el manejo manual de las citas, ya que actualmente los clientes solicitan espacios por medio de WhatsApp y el barbero registra la información en la agenda personal de su celular. Este método ha generado atrasos en las respuestas, acumulación de mensajes mientras el barbero atiende a otros clientes y dificultades para mantener un control claro de la disponibilidad de horarios. Además, los clientes no pueden consultar por sí mismos los espacios disponibles, por lo que dependen completamente de la respuesta manual del barbero para poder agendar una cita.

Ante esta situación, BarberManager surge como una solución tecnológica que permitirá automatizar el proceso de reservación de citas mediante una plataforma web accesible desde computadoras y dispositivos móviles. El sistema contará con tres roles: administrador, barbero y cliente. El administrador tendrá control completo del sistema, el barbero accederá a la agenda y funciones operativas, y el cliente podrá consultar horarios disponibles, reservar y cancelar citas desde la plataforma.

Dentro del alcance del proyecto se contemplan 27 requerimientos funcionales organizados en módulos de autenticación, gestión de clientes, agenda y citas, servicios, productos, apartados y reportes. Adicionalmente, se definen 14 requerimientos no funcionales que cubren aspectos de seguridad, rendimiento, disponibilidad, usabilidad y mantenibilidad del sistema.

El sistema también tomará en cuenta los servicios actuales del negocio, los cuales corresponden principalmente al corte de cabello y corte de barba, con precios definidos de ₡5.000 y ₡2.000 respectivamente. Cada servicio tendrá una duración aproximada de 30 minutos por cliente. Además, aunque la barbería ofrece productos como colonias, productos de barbería y tenis, no se implementará un inventario formal, ya que el negocio trabaja bajo solicitud o apartado de productos y no mantiene un stock fijo disponible.

En cuanto a pagos y facturación, el negocio actualmente trabaja con efectivo y SINPE móvil. Sin embargo, en esta primera versión del sistema no se incluirán pagos en línea ni facturación electrónica. Con el desarrollo de BarberManager se espera optimizar la gestión de citas de Kenneth's Barber, reducir errores asociados al registro manual, mejorar el control de disponibilidad y brindar a los clientes una forma más rápida y ordenada de reservar sus espacios.















































Introducción

En la actualidad, muchos pequeños negocios continúan administrando sus procesos de forma manual, lo cual puede generar atrasos, desorganización y dificultades en la atención al cliente. Este es el caso de Kenneth's Barber, una barbería ubicada en Viento Fresco de Aguas Zarcas, administrada por su propietario Kenneth Rodríguez, quien además cumple el rol de barbero principal del negocio. Actualmente, la barbería cuenta con un solo empleado, por lo que la atención de clientes, la gestión de citas y la organización de horarios dependen directamente del propietario.

Kenneth's Barber ofrece principalmente servicios de corte de cabello, corte de barba y asesoramiento. Además, el negocio también trabaja con productos como colonias, productos de barbería y tenis, los cuales se gestionan principalmente por medio de solicitudes o apartados, ya que no existe un inventario formal con stock permanente. En cuanto a la gestión de citas, actualmente los clientes solicitan sus espacios por medio de WhatsApp, y el barbero registra manualmente las citas en la agenda personal de su celular.

Este método manual ha permitido mantener el funcionamiento básico del negocio; sin embargo, también ha generado diferentes dificultades. Una de las principales es la acumulación de mensajes mientras el barbero se encuentra atendiendo clientes, lo que provoca atrasos en las respuestas y complica la organización de los horarios disponibles. Además, los clientes no pueden consultar de manera directa la disponibilidad de la barbería, por lo que dependen completamente de la respuesta del barbero para conocer si existe un espacio libre.

Ante esta situación, surge la propuesta de desarrollar BarberManager, un sistema web orientado a la gestión de citas y administración básica de clientes para Kenneth's Barber. El sistema contará con tres roles de usuario: administrador, barbero y cliente. El cliente podrá consultar una agenda virtual desde una página web, visualizar los horarios disponibles y reservar una cita según su preferencia. De esta manera, se busca reducir la dependencia del uso de WhatsApp para la gestión de citas y mejorar la organización interna del negocio.

La importancia del proyecto radica en la necesidad de optimizar un proceso que actualmente consume tiempo y genera desorden operativo. Al implementar una solución tecnológica accesible desde computadora y dispositivos móviles, se facilitará la administración de horarios, el registro de citas y la consulta de servicios. Esto permitirá que el barbero pueda concentrarse mejor en la atención presencial de los clientes, mientras el sistema apoya la gestión de reservas de forma más ordenada.

El alcance general del proyecto contempla el desarrollo de una plataforma web con 27 requerimientos funcionales organizados en módulos de autenticación, gestión de clientes, agenda y citas, servicios, productos, apartados y reportes. Complementariamente, se definen 14 requerimientos no funcionales que aseguran que el sistema sea seguro, eficiente, usable y mantenible.

Esta primera versión del sistema no incluirá pagos en línea, facturación electrónica, reportes avanzados, historial completo de clientes, recordatorios automáticos, recuperación automática de contraseñas, aplicación móvil ni control completo de inventario. El proyecto se desarrollará mediante diferentes etapas propias de la Ingeniería de Software, iniciando con el análisis de requerimientos y la identificación de necesidades del negocio, seguido del diseño del sistema, desarrollo de funcionalidades y las pruebas correspondientes.



Capítulo I. Análisis de Requerimientos

El presente capítulo desarrolla el análisis de requerimientos del sistema web BarberManager, propuesto para Kenneth's Barber. En esta sección se describe el contexto de la empresa, la problemática actual, la justificación del proyecto, los objetivos generales y específicos, así como los elementos que permitirán definir los alcances, limitaciones, actores, reglas de negocio, requerimientos funcionales, requerimientos no funcionales y casos de uso del sistema.

Descripción de la Empresa

Kenneth's Barber es una barbería ubicada en la comunidad de Viento Fresco de Aguas Zarcas. El negocio es administrado por Kenneth Rodríguez, quien además desempeña el rol de barbero principal. Actualmente, la barbería cuenta con un solo empleado, siendo el propietario el encargado de atender a los clientes, organizar las citas, administrar los horarios y gestionar las solicitudes relacionadas con los servicios ofrecidos.

La actividad principal de Kenneth's Barber se centra en brindar servicios de cuidado personal masculino, especialmente corte de cabello, corte de barba y asesoramiento. El corte de cabello tiene un precio fijo de ₡5.000, mientras que el corte de barba tiene un precio fijo de ₡2.000. Cada servicio tiene una duración aproximada de 30 minutos por cliente.

Además de los servicios principales, la barbería también trabaja con productos como colonias, productos de barbería y tenis. Sin embargo, el negocio no maneja un inventario formal, ya que los productos se gestionan principalmente por solicitud del cliente o por medio de apartados. Esto significa que no existe un control de stock permanente, sino un manejo básico de solicitudes, abonos y saldos pendientes cuando un cliente adquiere un producto mediante apartado.

El horario de atención de la barbería es variable y depende de la disponibilidad del barbero. El principal medio de contacto del negocio es el número telefónico 6406-3210, utilizado principalmente para la comunicación por WhatsApp.

1.2 Problemática Actual

Actualmente, Kenneth's Barber administra sus citas de manera manual mediante mensajes de WhatsApp y anotaciones en la agenda personal del celular del barbero. Este método permite registrar las solicitudes básicas de los clientes, pero presenta diversas limitaciones que afectan la organización del negocio y la calidad de la atención brindada.

La principal dificultad identificada es la acumulación de mensajes mientras el barbero se encuentra atendiendo clientes de forma presencial. Debido a que el negocio cuenta únicamente con un empleado, el propietario debe encargarse al mismo tiempo de cortar cabello, atender consultas, responder mensajes, revisar disponibilidad y registrar citas. Esta situación provoca atrasos en las respuestas y puede generar molestias en los clientes que esperan confirmación de un horario disponible.

Otro problema importante es que los clientes no pueden consultar por sí mismos la disponibilidad de la barbería. Para conocer si existe un espacio libre, deben escribir por WhatsApp y esperar la respuesta del barbero. Esto vuelve el proceso más lento y dependiente de la disponibilidad del propietario para responder mensajes, especialmente durante horas de alta demanda o mientras se encuentra atendiendo a otro cliente.

El registro manual de citas también aumenta el riesgo de errores en la organización de horarios. Al depender de una agenda personal, pueden presentarse confusiones, olvidos o dificultades para visualizar rápidamente los espacios disponibles. Además, este método no permite centralizar adecuadamente la información de clientes, citas, servicios y disponibilidad en una sola plataforma.

En cuanto a productos y pagos, la barbería no cuenta con un sistema que permita controlar de forma básica los apartados, abonos o saldos pendientes de clientes que solicitan productos. Por estas razones, se identifica la necesidad de desarrollar un sistema web que permita automatizar la gestión de citas, mejorar el control de disponibilidad y brindar a los clientes una forma más rápida y ordenada de reservar sus espacios.

1.3 Justificación del Proyecto

El desarrollo del sistema web BarberManager se justifica por la necesidad de mejorar la organización de las citas y reducir la carga administrativa que actualmente recae sobre el propietario de Kenneth's Barber. Al tratarse de un negocio atendido por una sola persona, el manejo manual de mensajes, horarios y registros puede afectar la eficiencia del servicio y la experiencia de los clientes.

La implementación de una plataforma web permitirá automatizar el proceso de reservación de citas, facilitando que los clientes consulten horarios disponibles y seleccionen el espacio de su preferencia sin depender de una respuesta manual por WhatsApp. Esto representa una mejora significativa en la atención, a que el cliente podrá conocer la disponibilidad de forma más rápida y el barbero podrá reducir el tiempo dedicado a responder consultas repetitivas.

Desde el punto de vista operativo, BarberManager permitirá centralizar información básica relacionada con clientes, citas, servicios, disponibilidad, productos y apartados. Esta centralización facilitará el control de los horarios, reducirá el riesgo de errores en la agenda y permitirá una mejor organización del trabajo diario. El proyecto también resulta importante porque propone una solución ajustada al tamaño y contexto del negocio, sin implementar funciones innecesarias.

Asimismo, el desarrollo de BarberManager representa una oportunidad para aplicar conocimientos de análisis de requerimientos, diseño de sistemas, bases de datos, desarrollo web y pruebas funcionales dentro de un caso real.

1.4 Objetivo General

Desarrollar un sistema web denominado BarberManager para Kenneth's Barber, que permita automatizar la gestión de citas, administrar la disponibilidad de horarios y centralizar información básica de clientes, servicios, productos y apartados, con el fin de mejorar la organización interna del negocio y optimizar la atención brindada a los clientes.

1.5 Objetivos Específicos

Analizar las necesidades actuales de Kenneth's Barber relacionadas con la gestión de citas, disponibilidad de horarios, atención al cliente y administración básica de información.

Diseñar una plataforma web que permita a los clientes consultar horarios disponibles y registrar citas de forma rápida, clara y ordenada.

Implementar un módulo de gestión de citas que permita reservar y cancelar espacios, considerando la disponibilidad del barbero y la duración aproximada de los servicios.

Definir perfiles de usuario para administrador, barbero y cliente, estableciendo permisos diferenciados según las funciones que cada rol debe realizar dentro del sistema.

Incorporar la gestión de productos y apartados, permitiendo registrar clientes que adquieren productos mediante apartado, registrar abonos y consultar saldos pendientes.

Facilitar la administración de disponibilidad del barbero mediante un sistema flexible que permita ajustar horarios según las necesidades del negocio.

Establecer los requerimientos funcionales y no funcionales del sistema, así como los casos de uso necesarios para orientar el diseño, desarrollo y validación de BarberManager.

1.6 Alcances del Proyecto

El proyecto BarberManager contempla el desarrollo de un sistema web orientado a la gestión de citas y administración básica de información para Kenneth's Barber. La solución estará enfocada en mejorar el proceso actual de reservación, el cual se realiza manualmente mediante WhatsApp y anotaciones en la agenda personal del barbero.

El sistema contará con tres roles de usuario: administrador, barbero y cliente. El administrador tendrá control completo del sistema, incluyendo la gestión de clientes, productos, disponibilidad y apartados. El barbero podrá visualizar citas, gestionar disponibilidad y consultar información operativa. El cliente podrá consultar horarios disponibles, reservar citas, cancelar citas dentro del tiempo permitido y visualizar el catálogo de servicios y productos.

Dentro del alcance se contempla el desarrollo de 27 requerimientos funcionales organizados en módulos de autenticación, gestión de clientes, agenda y citas, servicios, productos, apartados y reportes. El sistema también incluirá la gestión de apartados de productos, permitiendo registrar abonos y consultar saldos pendientes por cliente.

La plataforma será accesible desde computadoras y dispositivos móviles mediante navegador web, sin necesidad de instalar una aplicación móvil independiente.

1.7 Limitaciones del Proyecto

Durante esta primera versión del sistema BarberManager, no se contemplará la implementación de pagos en línea. Los métodos de pago actuales (efectivo y SINPE móvil) continuarán manejándose de forma externa al sistema.

Tampoco se incluirá facturación electrónica ni generación formal de comprobantes digitales. El sistema no incluirá reportes avanzados de ingresos diarios, semanales o mensuales, ni recordatorios automáticos de citas para los clientes. No se implementará recuperación automática de contraseñas en esta versión.

El proyecto tampoco incluirá un sistema completo de inventario, ya que la barbería no maneja stock fijo. El sistema solo podrá manejar información básica relacionada con productos o apartados, pero no entradas, salidas, alertas de stock ni control formal de inventario.

Finalmente, no se desarrollará una aplicación móvil independiente. BarberManager funcionará como una plataforma web adaptable a computadoras y dispositivos móviles mediante navegador.

1.8 Actores del Sistema

Los actores del sistema BarberManager representan los tipos de usuarios o entidades que interactuarán con la plataforma web. Para este proyecto se identifican cuatro actores principales.



Tabla 2. Actores del sistema





1.9 Reglas de Negocio

Las reglas de negocio definen las condiciones, restricciones y criterios propios de Kenneth's Barber que deben respetarse dentro del sistema BarberManager.



Tabla 3. Reglas de negocio del sistema





1.10 Requerimientos Funcionales

Los requerimientos funcionales describen las acciones y servicios que el sistema BarberManager deberá realizar para satisfacer las necesidades identificadas en Kenneth's Barber. Se definen 27 requerimientos funcionales organizados por módulo, cada uno documentado con el formato solicitado.



Módulo de Autenticación

RF01 — Inicio de sesión



RF02 — Cierre de sesión



RF03 — Control de acceso por rol



Módulo de Gestión de Clientes

RF04 — Registrar cliente



RF05 — Editar información de cliente



RF06 — Eliminar cliente



RF07 — Listar y buscar clientes



RF08 — Visualizar perfil de cliente



Módulo de Agenda y Citas

RF09 — Visualizar disponibilidad



RF10 — Reservar cita



RF11 — Cancelar cita



RF12 — Validar duplicidad de citas



RF13 — Visualizar citas del día



RF14 — Visualizar historial citas



RF15 — Gestionar disponibilidad de horarios



RF16 — Visualizar citas del cliente



Módulo de Servicios

RF17 — Visualizar catálogo de servicios



RF18 — Seleccionar servicio al agendar cita



Módulo de Productos

RF19 — Registrar producto



RF20 — Editar producto



RF21 — Eliminar producto



RF22 — Visualizar catálogo de productos



Módulo de Apartados

RF23 — Registrar apartado de producto



RF24 — Registrar abono a apartado



RF25 — Visualizar saldo pendiente de apartados



Módulo de Reportes

RF26 — Visualizar resumen de citas por día



RF27 — Visualizar listado de apartados activos





1.11 Requerimientos No Funcionales

Los requerimientos no funcionales establecen las características de calidad que el sistema BarberManager deberá cumplir, abarcando aspectos de seguridad, rendimiento, disponibilidad, usabilidad y mantenibilidad. Se definen 14 requerimientos no funcionales con referencia directa a los requerimientos funcionales relacionados.



Seguridad

RNF01 — Seguridad de autenticación



RNF02 — Control de acceso por roles



RNF03 — Integridad de datos ingresados



RNF04 — Cifrado de comunicaciones



Rendimiento

RNF05 — Tiempo de respuesta aceptable



RNF06 — Consistencia de datos en operaciones críticas



Disponibilidad

RNF07 — Actualización en tiempo real de la agenda



RNF08 — Legibilidad y claridad de la información



Usabilidad

RNF09 — Validación de reglas de negocio en reservaciones



RNF10 — Compatibilidad multiplataforma



RNF11 — Mensajes de retroalimentación al usuario



RNF12 — Navegación intuitiva y consistente



Mantenibilidad

RNF13 — Estructura modular del código



RNF14 — Escalabilidad básica del sistema





1.12 Casos de Uso

Los casos de uso representan las interacciones entre los actores y el sistema BarberManager. Se definen 27 casos de uso alineados directamente con los requerimientos funcionales del sistema, cubriendo los módulos de autenticación, gestión de clientes, agenda y citas, servicios, productos, apartados y reportes.



Tabla 4. Casos de uso generales del sistema BarberManager



1.13 Tablas Descriptivas de Casos de Uso

Las siguientes tablas detallan cada caso de uso identificado, especificando el actor principal, el requerimiento funcional relacionado, objetivo, precondiciones, flujo principal, flujo alternativo y postcondiciones.



Tabla 5. Caso de uso CU-01 — Iniciar sesión



Tabla 6. Caso de uso CU-02 — Cerrar sesión



Tabla 7. Caso de uso CU-03 — Controlar acceso



Tabla 8. Caso de uso CU-04 — Registrar cliente



Tabla 9. Caso de uso CU-05 — Editar información de cliente



Tabla 10. Caso de uso CU-06 — Eliminar cliente



Tabla 11. Caso de uso CU-07 — Buscar clientes



Tabla 12. Caso de uso CU-08 — Visualizar perfil de cliente



Tabla 13. Caso de uso CU-09 — Visualizar disponibilidad



Tabla 14. Caso de uso CU-10 — Reservar cita



Tabla 15. Caso de uso CU-11 — Cancelar cita



Tabla 16. Caso de uso CU-12 — Validar duplicidad de citas



Tabla 17. Caso de uso CU-13 — Visualizar citas del día



Tabla 18. Caso de uso CU-14 — Visualizar historial general de citas



Tabla 19. Caso de uso CU-15 — Gestionar disponibilidad de horarios



Tabla 20. Caso de uso CU-16 — Visualizar citas del cliente



Tabla 21. Caso de uso CU-17 — Visualizar catálogo de servicios



Tabla 22. Caso de uso CU-18 — Seleccionar servicio



Tabla 23. Caso de uso CU-19 — Registrar producto



Tabla 24. Caso de uso CU-20 — Editar producto



Tabla 25. Caso de uso CU-21 — Eliminar producto



Tabla 26. Caso de uso CU-22 — Visualizar catálogo de productos



Tabla 27. Caso de uso CU-23 — Registrar apartado de producto



Tabla 28. Caso de uso CU-24 — Registrar abono a apartado



Tabla 29. Caso de uso CU-25 — Visualizar saldo pendiente de apartados



Tabla 30. Caso de uso CU-26 — Visualizar resumen de citas por día



Tabla 31. Caso de uso CU-27 — Visualizar listado de apartados activos





1.14 Planificación del Proyecto

La planificación del proyecto establece la organización general de actividades, recursos y herramientas que guiarán el desarrollo del sistema BarberManager durante el II Cuatrimestre 2026. Esta sección define la metodología adoptada por el equipo, el cronograma oficial de actividades basado en las etapas del curso, la distribución de responsabilidades entre los integrantes, las herramientas tecnológicas empleadas y los entregables esperados en cada etapa.



1.14.1 Metodología de Desarrollo

El proyecto adoptará una metodología de desarrollo incremental, organizada en cuatro etapas definidas por el plan del curso: análisis de requerimientos, diseño y arquitectura, desarrollo, y plan de pruebas. Esta metodología permite avanzar de forma progresiva, donde cada etapa produce resultados concretos que sirven de base para la siguiente, facilitando la detección temprana de errores y el ajuste del desarrollo según el avance real del equipo.

Durante la Etapa I se identificarán y documentarán los requerimientos del sistema, se diseñarán los casos de uso y sus tablas descriptivas, y se elaborará la planificación del proyecto. En la Etapa II se realizará el diseño técnico completo del sistema, incluyendo la base de datos, los diagramas UML, la interfaz de usuario y los prototipos interactivos. La Etapa III corresponde al desarrollo e implementación de los módulos del sistema, incluyendo la base de datos, los módulos CRUD, procesos, consultas y reportes. Finalmente, la Etapa IV contempla la ejecución del plan de pruebas, la validación del sistema y la presentación final del proyecto.

La coordinación del equipo se realizará mediante reuniones semanales presenciales y virtuales utilizando Google Meet y WhatsApp. El código fuente del sistema se gestionará en un repositorio de GitHub compartido, lo que permitirá mantener un historial de cambios y facilitar el trabajo colaborativo entre los integrantes del equipo.



1.14.2 Cronograma de Actividades

El cronograma presentado a continuación está basado en las fechas y etapas definidas por la docente para el II Cuatrimestre 2026. Las actividades de cada etapa se distribuyen entre las sesiones de clase correspondientes y el trabajo extraclase del equipo.



Tabla 5. Cronograma de actividades del proyecto BarberManager — II Cuatrimestre 2026



1.14.3 Distribución de Responsabilidades

El equipo de trabajo está conformado por cuatro estudiantes. Aunque todos participan en las diferentes etapas del proyecto, cada integrante tiene responsabilidades principales asignadas según sus habilidades y las necesidades del proyecto.



Tabla 6. Distribución de responsabilidades del equipo de trabajo



1.14.4 Herramientas de Desarrollo

A continuación se describen las herramientas tecnológicas y de gestión que se utilizarán durante el desarrollo del sistema BarberManager.



Tabla 7. Herramientas que se van a utilizar en el desarrollo del sistema BarberManager



1.14.5 Entregables del Proyecto

La siguiente tabla resume los entregables formales del proyecto, organizados según las etapas del cronograma oficial del curso.



Tabla 8. Entregables del proyecto BarberManager



Anexos

Anexo 1. Levantamiento de requisitos aplicado  a Kenneth's Barber

El siguiente levantamiento de requisitos fue realizado mediante una entrevista con el propietario Kenneth Rodríguez, con el fin de identificar las necesidades

del negocio y definir el alcance del sistema.

Preguntas para el Levantamiento de Requisitos

Gestión de Clientes y Citas



Información General del Negocio

•	Nombre de la barbería: Kenneth´s Barber

•	Encargado o propietario: Kenneth Rodríguez

•	Cantidad de empleados/barberos: 1 Empleado, el propietario

•	Horario de atención: Es variable, dependiendo de disponibilidad

•	Dirección del negocio: Viento Fresco de Aguas Zarcas

•	Servicios principales: Corte de cabello, corte de barba y asesoramiento

•	Redes sociales o medios de contacto: Número telefónico: 6406-3210



1.	¿Cómo administran actualmente las citas de los clientes?

Se administran por medio de solicitud de cita al número de Whatsapp del barbero, él tiene en su agenda personal del celular las personas las cuales tiene que atender en el horario de trabajo.

2.	¿Desean que los clientes puedan reservar citas en línea?

Si, ese es el objetivo principal, que los clientes puedan revisar una agenda virtual del barbero en una página web, así sabiendo cual es la disponibilidad que tiene la barbería, seguido de esto poder en la misma página agendar una cita de su preferencia

3.	¿Qué información desean almacenar de cada cliente?

Únicamente el Nombre, número de teléfono y la hora en la que agenda la cita

4.	¿Desean visualizar un historial de citas por cliente?

De momento no es lo más importante, pero si pudiera llegar a visualizar en un futuro sería grandioso

5.	¿Se permitirán cancelaciones o reprogramaciones de citas?

Estaría bien que, si se puedan cancelar las citas, la reprogramación tal vez no es tan necesaria, con que la persona pueda cancelar y luego agendar en otro campo disponible sirve

6.	¿Cuánto tiempo dura aproximadamente cada servicio?

El servicio tiene un tiempo aproximado de 30 minutos por cliente

7.	¿Desean enviar recordatorios de citas a los clientes?

No es muy importante de momentoGestión de Servicios

9.	¿Cuáles servicios ofrece actualmente la barbería?

Corte de cabello, corte de barba

10.	¿Cada servicio tiene un precio fijo o variable?

Ambos servicios tienen un precio fijo de 5.000 colones el corte de cabello y 2.000 colones el corte de barba.

11.	¿Desean agregar nuevos servicios desde el sistema?

No, los servicios con los que se cuentan ahora mismo son los únicos servicios disponibles

12.	¿Desean manejar promociones o descuentos especiales?

No, por el momento no

13.	¿Qué otros productos venden en la barbería?

Venta de colonias, productos de barbería y tenis

14.	¿Desean controlar inventario de productos?

No, ya que no tenemos un inventario como tal, se trabaja de la siguiente forma, la persona solicita un producto y en la barbería lo conseguimos, no se tiene una cierta cantidad de productos en la barbería.

15.	¿Desean registrar entradas y salidas de productos?

No, tal vez únicamente que se lleve un control de las personas que adquirieron un producto por medio de apartado, tener un registro de abonos que se realizan y cuanto debe.

16.	¿Desean recibir alertas por productos con poco stock?

No, ya que no tenemos stock

17.	¿Cómo manejan actualmente los pagos y facturación?

Por medio de pago en efectivo o SINPE móvil, si es en efectivo se hace el pago y listo, y si es por SINPE móvil se debe enviar el comprobante de pago al número de WhatsApp del barbero

18.	¿Qué métodos de pago aceptan?

Únicamente efectivo o SINPE móvil

19.	¿Desean generar comprobantes o facturas?

No es necesario, pero si se puede llegar a implementar en un futuro sería muy bueno

20.	¿Desean visualizar reportes de ingresos diarios, semanales o mensuales?

No por el momento, pero si se puede llegar a implementar en un futuro sería muy bueno

Seguridad y Plataforma

21.	¿Cuántos tipos de usuarios utilizarán el sistema?

Únicamente el de administrador y el perfil de el barbero

22.	¿Qué permisos tendrá cada tipo de usuario?

El usuario de admin tendrá un control completo del sistema, y el perfil de barbero tendrá acceso a la visualización y manejo de ciertas funciones

23.	¿Desean iniciar sesión mediante usuario y contraseña?

Si, para poder a cada uno de los perfiles

24.	¿Desean acceder al sistema desde celular, computadora o ambos?

Desde ambos

25.	¿Qué problemas presenta actualmente el método manual o sistema actual?

El método manual genera varias complicaciones, las más importante, que el barbero no tiene tiempo para responder mensajes mientras está trabajando con otros clientes, entonces a veces se le acumulan demasiados mensajes y de esta forma se atrasa mucho, además, de que tiene que estar apuntando manualmente las citas en su agenda, lo  que lo complica aún más.













