# front-openprojects-webnova

Frontend React de **OpenProjects.WebNova** — ranking de proyectos estilo "Mundial de Clicks" con votación en tiempo real (SSE).

## Stack
- Vite + React 18/19
- Tailwind CSS (sistema de diseño "Terminal Brutalist" — JetBrains Mono, blanco/negro)
- react-router
- Lucide React (iconos) + SVGs de marca (GitHub, Instagram, X, TikTok, etc.)
- `fetch` nativo + `EventSource` nativo para el stream en vivo

## Configuración

Copia `.env.example` a `.env` y ajusta los valores:

```
VITE_API_BASE_URL=http://localhost:8000
```

No hay `VITE_COMMUNITY_TOKEN` ni `VITE_ADMIN_TOKEN`: los tokens se ingresan en runtime y se mantienen solo en memoria de la pestaña.

- **Token de comunidad** → campo password en `/enviar-proyecto`, se envía como header `X-Community-Token`.
- **`X-Admin-Token`** → campo password en `/admin`, se envía en cada request del panel.

Nunca se persisten en `localStorage`/`sessionStorage` ni van en el bundle.

## Inicio rápido

```bash
npm install
npm run dev
```

## Rutas
- `/` — inicio: hero con efecto máquina de escribir, dashboard de stats en vivo y top 6 del ranking
- `/proyectos` — directorio completo (búsqueda + filtros + modal de detalle)
- `/comunidad` — creador, redes y cómo obtener tu token de comunidad
- `/enviar-proyecto` — formulario de publicación (multipart, un solo request)
- `/admin` — panel de moderación (aprobación/rechazo/desactivación)

## Notas de la API
- `GET /api/projects` se llama una sola vez; los likes en vivo llegan por `GET /api/stream` (SSE).
- `POST /api/projects/{id}/like` agrupa clics con debounce de 800ms y manda `credentials: "include"` para la cookie `visitor_id`.