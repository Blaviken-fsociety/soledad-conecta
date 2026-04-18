# Soledad Conecta

Soledad Conecta es una plataforma web para visibilizar emprendimientos locales mediante microtiendas digitales, catálogo de productos, reseñas, PQRS y paneles de gestión para administrador y emprendedores.

Despliegue de referencia:

- [Frontend en Netlify](https://soledad-conecta.netlify.app/)

## Estado actual

El repositorio ya incluye:

- portal público con marketplace y detalle de microtiendas
- autenticación por roles
- panel del administrador
- panel del emprendedor
- métricas institucionales para admin
- métricas individuales para emprendedores
- reseñas visibles desde microtienda y desde el perfil del emprendedor
- paginación clásica del marketplace
- galería de hasta 5 imágenes por producto
- PQRS y flujo de revisión administrativa
- generación de reportes analíticos en CSV y Excel

## Stack principal

### Frontend

- React 19
- Vite
- React Router
- Axios
- Recharts
- Tailwind CSS

### Backend

- Node.js
- Express
- persistencia actual en JSON para demo

## Rutas principales del frontend

- `/` inicio público
- `/marketplace` vitrina paginada de microtiendas
- `/negocio/:id` detalle de microtienda y vista previa de productos
- `/comentarios` módulo público de reseñas
- `/contacto` contacto y PQRS
- `/login` acceso y postulaciones
- `/dashboard` panel del emprendedor
- `/admin` panel del administrador

## Funcionalidades destacadas

### Administrador

- gestión de usuarios y solicitudes de emprendedores
- gestión de categorías
- revisión de microtiendas, productos y reseñas
- consulta y atención de PQRS
- tablero `Admin -> Métricas` con KPIs, donut, líneas, rankings y exportación

### Emprendedor

- creación y edición de su microtienda
- CRUD de productos
- carga de hasta 5 imágenes por producto
- vista previa enriquecida de producto
- panel propio de métricas con visitas, productos más vistos y promedio de calificación
- sección paginada de reseñas dentro del perfil

### Marketplace y experiencia pública

- búsqueda por texto
- filtro por categoría
- paginación de 9 microtiendas por página
- vista previa de producto con imagen principal, miniaturas, precio, stock y nombre de la microtienda
- contadores automáticos de visitas a microtiendas y productos

## API principal

Base URL local:

```text
http://localhost:4000/api
```

Módulos disponibles:

- `/auth`
- `/usuarios`
- `/categorias`
- `/microtiendas`
- `/productos`
- `/calificaciones`
- `/pqrs`
- `/metricas`

## Persistencia actual

El proyecto funciona hoy y debe operar con persistencia JSON:

- `backend/src/data/database.json`

## Variables de entorno

### Frontend

```env
VITE_API_URL=http://localhost:4000/api
```

### Backend

```env
PORT=4000
CLIENT_URL=http://localhost:5173
AUTH_TOKEN_SECRET=coloca-un-secreto-seguro-aqui
DATA_FILE=src/data/database.json
```

## Ejecución local

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Credenciales demo

- admin: `admin@demo.com` / `123456`
- emprendedor demo: `emprendedor@demo.com` / `1234567`

## Documentación

- guía técnica completa: `MANUAL-TECNICO.md`
- guía de despliegue: `MANUAL-DESPLIEGUE.md`
- documentación del backend: `backend/README.md`

## Notas importantes

- los datos demo visibles en producción se limpiaron para evitar microtiendas de prueba como `ccerdos`, `example` o `tienda demo`
- el backend mantiene compatibilidad con la arquitectura por capas existente
- toda la información funcional del sistema se lee y escribe desde `backend/src/data/database.json`
