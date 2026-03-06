# Fútbol — Organizá tu partido

SPA para crear y unirse a partidos de fútbol. Primera versión con **datos mock** en el frontend; arquitectura preparada para conectar con una API REST.

## Stack

- **Vue 3** (Composition API) + **Vite**
- **Tailwind CSS**
- **Pinia** (estado global)
- **Vue Router**
- **Leaflet** (mapas interactivos con OpenStreetMap, sin API key)

## Cómo correr el proyecto

```bash
npm install
npm run dev
```

Abrí `http://localhost:5173`. Los mapas funcionan sin configuración adicional.

## Estructura del proyecto

```
src/
├── components/     # Componentes reutilizables
├── pages/          # Vistas y modales (Home, CreateMatchModal, etc.)
├── stores/         # Pinia (auth, match, ui)
├── services/       # Capa de datos (mock; luego HTTP)
├── mock/           # Datos de prueba
├── types/          # Modelos y constantes
├── utils/          # teamBalancer, ratingAverage, geo
└── router/
```

## Arquitectura

- **UI:** componentes y páginas solo presentan datos y disparan acciones.
- **Estado:** Pinia stores (auth, match, ui).
- **Datos:** toda lectura/escritura pasa por `services/` (Promises que simulan HTTP).
- **Lógica de negocio:** en services y en utils (p. ej. balanceador de equipos).

Para conectar un backend real: reemplazá el contenido de cada función en `services/` por llamadas `fetch()` o axios a tu API, manteniendo las mismas firmas y tipos.

## Flujos principales

1. **Crear partido:** modal con tipo, fecha, hora, nivel, lugar, mapa (pin).
2. **Listado:** grid de cards con filtros laterales y scroll.
3. **Detalle:** modal con jugadores, mapa, Anotarme/Bajarme (oculto si el partido ya pasó), equipos balanceados.
4. **Valoración:** solo el creador puede calificar participantes tras partidos finalizados; puntajes dinámicos.
5. **Usuarios:** lista de jugadores registrados con botón Contactar (preparado para inbox futuro).
6. **Perfil:** modal con avatar, posición, reputación por categorías.
7. **Login:** simulado (usuario mock por defecto).

## Diseño

Ver `docs/DESIGN-SYSTEM-FIGMA.md` para guía de diseño (Figma, tokens, componentes).

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — build producción
- `npm run preview` — previsualizar build
