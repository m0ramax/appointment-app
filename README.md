# Tu Cita — Frontend

Frontend del sistema de agendamiento Tu Cita. Construido con Astro + React + Tailwind, deployado en Vercel.

## Stack

- **Astro 5** — framework principal
- **React** — componentes interactivos
- **Tailwind CSS** — estilos
- **Axios** — llamadas a la API

## Desarrollo local

```bash
npm install
npm run dev       # http://localhost:4321
npm run build
npm run preview
```

## Variables de entorno

```
PUBLIC_API_URL=http://localhost:3000
```

## Estructura

```
src/
├── components/     — Componentes React (auth, appointments, layout, work-schedule)
├── config/         — Configuración global (APP_NAME, etc.)
├── layouts/        — Layout base con navegación y tema
├── lib/api/        — Servicios HTTP (auth, appointments, work-schedule)
├── pages/          — Rutas Astro
└── styles/         — CSS global y variables de tema (dark/light)
```
