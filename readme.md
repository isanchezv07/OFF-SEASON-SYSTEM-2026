<!--Created and Developed by @Isanchezv07-->
# FTC Local Scoring System

Sistema local de puntuación inspirado en FTC Live Scoring. Diseñado para eventos presenciales (pantalla principal, panel de control por roles y presentaciones animadas), comunicación en tiempo real y persistencia local.

---

## Tabla de contenidos

- [FTC Local Scoring System](#ftc-local-scoring-system)
  - [Tabla de contenidos](#tabla-de-contenidos)
  - [Descripción](#descripción)
  - [Características principales](#características-principales)
  - [Arquitectura y archivos clave](#arquitectura-y-archivos-clave)
  - [Instalación rápida](#instalación-rápida)
  - [Desarrollo y ejecución (detalles)](#desarrollo-y-ejecución-detalles)
  - [Rutas / Páginas importantes](#rutas--páginas-importantes)
  - [API y eventos en tiempo real](#api-y-eventos-en-tiempo-real)
  - [Tipos y contratos importantes](#tipos-y-contratos-importantes)
  - [Buenas prácticas y recomendaciones para eventos](#buenas-prácticas-y-recomendaciones-para-eventos)
  - [Cómo contribuir](#cómo-contribuir)
  - [Credenciales por defecto (solo desarrollo)](#credenciales-por-defecto-solo-desarrollo)
  - [Cambiar credenciales en despliegues reales.](#cambiar-credenciales-en-despliegues-reales)
  - [Licencia temporal — Uso exclusivo "Hyper Hurdle 2026"](#licencia-temporal--uso-exclusivo-hyper-hurdle-2025)
  - [Contacto](#contacto)

---

## Descripción

Este proyecto implementa un sistema de puntuación local para competiciones de FTC con:

- Pantalla de visualización (Game Display) y pantalla de presentación de equipos.
- Panel de control para roles: ADMIN, SCOREKEEPER, HEAD REFEREE, RED REFEREE, BLUE REFEREE.
- Comunicación en tiempo real vía Socket.IO y sincronización adicional con BroadcastChannel.
- Persistencia simple mediante LowDB (archivo JSON).
- Animaciones de presentación con Framer Motion y componentes React embebidos en Astro.

---

## Características principales

- Actualización de puntuaciones en tiempo real para todos los clientes conectados.
- Temporizador de partido con start/pause/reset y notificaciones sonoras.
- Manejo de puntuaciones detalladas (auto, teleop, endgame) por equipo y por robot.
- Presentaciones animadas sincronizadas entre ventana de control y pantalla de presentación.
- Historial de partidos guardado localmente.
- Interfaz responsive para dispositivos móviles y pantallas grandes.

---

## Arquitectura y archivos clave

- Frontend: Astro + React + Tailwind CSS
  - Presentación y animaciones:
    - [Pantalla de Presentacion de los Equipos antes del match](src/components/animations/PresentacionScreen.tsx)
    - [src/components/animations/ControlPanel.tsx](src/components/animations/ControlPanel.tsx)
    - [src/components/animations/WaterBackground.tsx](src/components/animations/WaterBackground.tsx)
    - [src/components/animations/ScoreComparison.tsx](src/components/animations/ScoreComparison.tsx)
    - [src/components/animations/WinnerReveal.tsx](src/components/animations/WinnerReveal.tsx)
    - [src/components/animations/Confetti.tsx](src/components/animations/Confetti.tsx)
  - Pantallas principales:
    - [GameDisplay](src/components/GameDisplay.tsx)
    - [TimerDisplay](src/components/BigTimerDisplay.tsx)
  - Roles / Control:
    - [ADMIN-Controller](src/components/roles/ADMIN/ScoreController.tsx)
    - [ADMIN-Dashboard](src/components/roles/ADMIN/AdminDashboard.tsx)
    - [SCOREKEAPER-Controller](src/components/roles/SCOREKEEPER/ScorekeeperController.tsx)
    - [Blue-Referee](src/components/roles/referee/BLUE/BlueReferee.tsx)
    - [Red-Referee](src/components/roles/referee/RED/RedReferee.tsx)
    - [Head-Referee](src/components/roles/referee/HEAD/HeadReferee.tsx)

- Backend: Node.js + Express + Socket.IO
  - Servidor principal y API: [src/server/server.js](src/server/server.js)
  - Lanzamiento local del servidor: [start-server.js](start-server.js)
  - Configuración de proyecto y dependencias: [package.json](package.json)

- Tipos / contratos compartidos:
  - [`MatchState`](src/types/index.ts)
  - [`AnimationMessage`](src/types/index.ts)
  - (Ver [src/types/index.ts](src/types/index.ts) para definiciones completas)

- Socket / utilidades:
  - Cliente socket: [src/lib/socket](src/lib/socket) (archivo exporta `socket`)
  - BroadcastChannel usado para sincronizar presentación: canal `team-presentation` (ver [src/components/animations/ControlPanel.tsx](src/components/animations/ControlPanel.tsx) y [src/components/BigTimerDisplay.tsx](src/components/BigTimerDisplay.tsx))

---

## Instalación rápida

Requisitos:
- Node.js 18+ (recomendado)
- npm

Pasos:

1. Instalar dependencias:
   ```sh
   npm install
   ```
2. Ejecutar en modo desarrollo / local:

   - El script arranca la app (Astro/Vite) y el servidor Express/Socket.IO. El servidor suele mostrar la IP local y el puerto (por defecto Astro en 4321).
3. Correr el sistema:
   ```sh
   node start-server.js
   ```
   - Revisa package.json para scripts disponibles.
---

## Desarrollo y ejecución (detalles)

- Desarrollo cliente: Astro + Vite; cambios se recargan en caliente.
- Desarrollo servidor: Express escucha eventos de Socket.IO y persiste en LowDB.
   - Ver implementación de rutas y eventos en server.js.
- Animaciones y control de presentaciones:
   - El panel de control envía AnimationMessage vía BroadcastChannel o Socket para iniciar/ reset de animaciones.
   - Ventana de presentación usa PresentacionScreen.tsx.
- Sonidos y assets:
   - Archivos en sounds y img. La pantalla reproduce audios en puntos claves (inicio teleop, inicio endgame, fin de partido).
- Autenticación:
   - Basada en JWT + bcrypt (ver llamadas desde componentes y servidores en server.js y frontend que guarda token en localStorage).
---

## Rutas / Páginas importantes

- [Main Scoreboard (pantalla del público)](src/components/GameDisplay.tsx)

- [Score Controller (ADMIN panel)](src/components/roles/ADMIN/ScoreController.tsx)

- [Presentation window (pantalla de presentacion de equipos antes del match)](src/components/animations/PresentacionScreen.tsx)

- [Admin Dashboard (pantalla solo para el Administrador)](src/components/roles/ADMIN/AdminDashboard.tsx)

- [Documentación API](src/server/swagger.yaml)
---
## API y eventos en tiempo real

API REST (implementadas en `server.js`, revisar el archivo para detalles):

- GET /api/ — estado general
- GET /api/match — estado del partido actual
- GET /api/matches — historial
- GET /api/users — usuarios
- Otros endpoints para management y configuración

Eventos Socket.IO (emitidos desde servidor y escuchados por clientes):

- `matchUpdate` — envía estado completo del partido
- `updateScore` — petición para actualizar puntaje
- `updateTimer` — sincroniza temporizador (start/pause/update)
- `resetMatch` — reinicia y guarda en historial
- `loadNextMatch` — carga siguiente partido
- Eventos relacionados a animaciones y presentación (consultar server.js y componentes de control)
---

## Tipos y contratos importantes

- `MatchState` — estructura principal del estado del partido (equipos, puntuaciones detalladas, tiempo, flags de visibilidad).
- `AnimationMessage` — contrato para mensajes de animación entre control y presentación.
- `FullScore`— interfaz interna usada en los controladores para puntuaciones detalladas
---

## Buenas prácticas y recomendaciones para eventos

- Ejecutar en una máquina con red estable conectada a la red local del evento.
- Probar la ventana de presentación y permisos de popup antes del evento (el panel usa window.open para crear la ventana de presentación: ver src/components/animations/ControlPanel.tsx).
- Hacer pruebas de audio en la pantalla principal y verificar que los navegadores permitan reproducir audio (botón "Enable Audio" presente en src/components/GameDisplay.tsx).
- Mantener copias de seguridad del archivo de base de datos JSON generado por LowDB (ubicación configurada en src/server/server.js).
- Para despliegues más robustos, sustituir LowDB por una base de datos centralizada (Postgres/Mongo) y alojar el servidor en una máquina dedicada.
---

## Cómo contribuir

- Mantener tipado consistente: usar `MatchState` y tipos compartidos.
- Abrir issues y PRs en el repositorio (si se sincroniza a remoto).
- Probar localmente cambios en animaciones y control antes de usarlos en producción del evento.
- Si se modifica la persistencia, migrar y documentar la estructura de datos en `server.js`.
---

## Credenciales por defecto (solo desarrollo)

- Usuario administrador (desarrollo): `admin` / `admin`
Cambiar credenciales en despliegues reales.
---

## Licencia temporal — Uso exclusivo "Hyper Hurdle 2026"

Uso exclusivo para el evento "Hyper Hurdle 2026". Ver [LICENSE](./LICENSE) para más detalles.

## Contacto
[Escribeme](mailto:isanchezv.dev@gmail.com)