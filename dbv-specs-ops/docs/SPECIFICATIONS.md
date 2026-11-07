# 📋 Especificaciones: SteamStats

> **Fase:** `/spec` (Especificación)  
> **Estado:** Validado  
> **Última Revisión:** 2026-11-07  
> Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops

---

## 🎯 1. Contexto y Objetivos

- **Problema:** Los usuarios de Steam y entusiastas del homelab desean visualizar estadísticas profundas sobre su biblioteca (horas invertidas, coste económico, pile of shame, desglose de nivel e insignias) en un dashboard propio, accesible, rápido y cohesionado con el ecosistema web personal de GuacamoleGH, sin depender de herramientas lentas o cargadas de anuncios de terceros.
- **Objetivo (Éxito):** Desarrollar y desplegar `SteamStats` en el homelab personal de GuacamoleGH (`steamstats.guacamolegh.es`) mediante Docker Compose, ofreciendo una experiencia fluida, cálculo preciso de costes en euros, seguimiento diario de actividad mediante un worker programado, y herramientas prácticas de biblioteca y rebajas.

---

## 👥 2. Usuarios y Escenarios

- **Perfil de Usuario:**
  - Propietario del homelab (GuacamoleGH) y visitantes de la comunidad gamer.
- **Escenarios Clave:**
  - *Escenario A:* El usuario ingresa su vanity URL (ej: `GuacamoleSteam`) o SteamID64 para obtener en segundos una radiografía completa de su cuenta: horas, valor estimado y ratio de juegos sin jugar.
  - *Escenario B:* El usuario compara su perfil con el de un amigo para ver qué juegos tienen en común y quién ha jugado más horas en cada uno.
  - *Escenario C:* El usuario consulta la fecha de la próxima gran rebaja de Steam o explora los próximos lanzamientos para añadir títulos a su lista de deseados local.

---

## ✨ 3. Funcionalidades Principales (Requisitos)

### Requisitos Funcionales

- [ ] **REQ-01 · Búsqueda y Resolución de Perfiles:** Permitir buscar perfiles de Steam por vanity URL (`GuacamoleSteam`), URL completa de la comunidad o SteamID64 numérico de 17 dígitos. La API debe resolver el identificador canónico mediante `ResolveVanityURL` y redirigir a `/profile/[steamid]` o responder en `/id/[vanity]`.
- [ ] **REQ-02 · Tarjetas de Resumen de Biblioteca:** Presentar tarjetas con horas totales de juego, horas de las últimas 2 semanas, conteo de juegos jugados vs. nunca jugados (*Pile of Shame*), porcentaje del backlog, nivel actual, insignias acumuladas y XP total.
- [ ] **REQ-03 · Nivel y Algoritmo de XP de Steam:** Calcular con precisión matemática el XP restante para alcanzar el siguiente nivel utilizando la regla oficial de Steam:  
  $$\text{Coste del nivel } L = 100 \times (\lfloor L / 10 \rfloor + 1)$$  
  Incluir barra de progreso porcentual entre el nivel actual y el siguiente.
- [ ] **REQ-04 · Top de Juegos Más Jugados:** Listar los títulos con mayor tiempo de juego, mostrando su carátula oficial, horas jugadas, precio actual en la tienda de Steam y ratio de coste por hora jugada.
- [ ] **REQ-05 · Calculadora de Valor de Cuenta:** Sumar el valor de la biblioteca en euros (`€`, formato `es-ES`) usando precios actuales de la tienda española (`cc=es`) y mínimos históricos vía IsThereAnyDeal (ITAD). Desglosar el coste por hora en tres modos: todos los juegos, solo juegos de pago y solo juegos jugados. Contabilizar títulos gratuitos y juegos retirados de la tienda (*delisted*).
- [ ] **REQ-06 · Distribuciones Estadísticas con Recharts:** Generar gráficas interactivas con Recharts para visualizar:
  1. Juegos por tramo de horas (0-1, 1-2, 2-3, 3-6, 6-12, 12-25, 25+, nunca jugado).
  2. Juegos por tramo de precio actual (Gratis, <5€, 5-10€, 10-20€, 20-40€, 40-60€, 60€+).
- [ ] **REQ-07 · Listado e Inspección de Insignias:** Mostrar la colección de insignias del usuario con su icono oficial, nivel alcanzado, fecha de obtención, puntos de XP aportados y rareza.
- [ ] **REQ-08 · Snapshots Diarios y Heatmap de Actividad:** Proceso worker en segundo plano que almacena capturas diarias de tiempo jugado. La web calculará la actividad diaria por diferencia de minutos y la representará en una cuadrícula estilo GitHub / Steam activity, con estado vacío amigable para nuevos perfiles y filtro por juego individual.
- [ ] **REQ-09 · Comparador de Perfiles Lado a Lado:** Vista `/compare` para contrastar dos perfiles de Steam en paralelo, calculando juegos compartidos en común, horas de cada jugador y biblioteca exclusiva.
- [ ] **REQ-10 · Calendario de Próximos Lanzamientos:** Consultar próximos estrenos de videojuegos mediante la API de IGDB, con portadas, géneros, plataformas, filtros por mes y género, y opción "Me interesa" persistida en el navegador (`localStorage`).
- [ ] **REQ-11 · Cuenta Atrás a Grandes Rebajas de Steam:** Widget dinámico y página `/sales` que lee el archivo `data/sales.json`. Debe calcular la cuenta atrás exacta en días, horas, minutos y segundos asumiendo las 10:00 AM hora del Pacífico (19:00 España peninsular) y adaptarse a la zona horaria del visitante.
- [ ] **REQ-12 · Herramientas Auxiliares de Steam:**
  - Conversor de identificadores de Steam (SteamID64, SteamID3, SteamID2, AccountID).
  - Ruleta / selector aleatorio de juego de la biblioteca ("¿A qué juego hoy?") con filtros rápidos.
- [ ] **REQ-13 · Rastreador de Logros y Platinos (Achievements Tracker):** Consultar el progreso de logros de los juegos del perfil, calcular el ratio de completitud global y por título, y resaltar los juegos completados al 100% (*perfect games* / platinos).
- [ ] **REQ-14 · Generador de Tarjeta de Perfil / Banner Compartible:** Generar una tarjeta gráfica resumen del perfil (avatar, nivel, valor total de cuenta, horas totales, porcentaje de *pile of shame* y juego más jugado) con opción de copia al portapapeles y descarga en PNG nativo.
- [ ] **REQ-15 · Exportador de Biblioteca (CSV y JSON):** Permitir al usuario descargar su biblioteca analizada con todos sus campos (appId, nombre, horas jugadas, precio en euros y coste por hora) en formatos estándar CSV y JSON.

---

### Requisitos No Funcionales

- [ ] **RNF-01 · Arquitectura y Entorno:** Implementado con Next.js 15 (App Router), TypeScript en modo estricto, Tailwind CSS, Prisma ORM y despliegue desacoplado mediante Docker Compose (contenedor web + contenedor worker).
- [ ] **RNF-02 · Rendimiento y Estrategia de Caché:**
  - Perfiles de Steam: TTL de 1 hora en base de datos.
  - Precios de Steam Storefront: TTL de 24 horas en base de datos.
  - Cola de peticiones con tasa controlada y *exponential backoff* ante HTTP 429/503.
- [ ] **RNF-03 · Accesibilidad y Ergonomía (WCAG AA):** Contraste mínimo 4.5:1 para texto normal y 7:1 para titulares, navegación por teclado completa, foco visual visible en verde neón (`#00f59b`), atajos de teclado (`/` para buscar, `Esc` para cancelar) y diseño responsive en móvil/tablet/escritorio.
- [ ] **RNF-04 · Seguridad y Validación:** Validación estricta de parámetros de entrada con Zod, rate limiting en endpoints públicos, cabeceras HTTP de seguridad (CSP, HSTS, X-Content-Type-Options) y cero claves ni tokens en el repositorio.
- [ ] **RNF-05 · Internacionalización y Localización:** Interfaz en español por defecto, con importes monetarios formateados en euros (`€`) según estándar `es-ES` (`Intl.NumberFormat`).
- [ ] **RNF-06 · Resiliencia ante Fallos Externos:** Tolerancia a caídas o ausencia de APIs secundarias (ITAD, IGDB). En caso de perfiles privados o con detalles de juego restringidos, mostrar un mensaje explicativo y una guía visual paso a paso para abrir la privacidad en Steam.

---

### 4. Agent Readiness Checklist (Proyectos Web)

- [ ] **robots.txt**: Configurar con directiva `Content-Signal: ai-train=no, search=yes, ai-input=yes` y enlace al sitemap.
- [ ] **llms.txt**: Documentar el mapa web y endpoints en Markdown optimizado para agentes de IA.
- [ ] **auth.md**: Describir que el acceso a datos es público y de solo lectura.
- [ ] **Metadatos en `.well-known/`**: Catálogo de APIs y manifiesto de Agent Plugin.

---

## 🚫 5. Fuera de Alcance (Out of Scope)

- Sistema de login de usuario con contraseñas o base de datos de usuarios registrados (la plataforma es una utilidad pública sin autenticación obligatoria).
- Compras o transacciones dentro de Steam (SteamStats es exclusivamente informativa y analítica).
- Historial de partidas en tiempo real tick a tick (Steam Web API solo provee minutos totales y de 2 semanas).
