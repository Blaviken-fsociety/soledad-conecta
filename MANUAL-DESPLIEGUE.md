# Manual de Despliegue

## Soledad Conecta en Netlify y Railway

Este manual describe el despliegue recomendado del sistema actual:

- frontend en Netlify
- backend en Railway
- persistencia JSON usando volumen en Railway

## 1. Requisitos previos

Antes de desplegar, valida el proyecto en local.

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

## 2. Variables necesarias

### Frontend

```env
VITE_API_URL=https://TU-BACKEND.up.railway.app/api
```

### Backend

```env
PORT=4000
CLIENT_URL=https://TU-SITIO.netlify.app
AUTH_TOKEN_SECRET=un-secreto-largo-y-propio
DATA_FILE=storage/database.json
```

## 3. Despliegue del backend en Railway

### 3.1 Crear el servicio

1. Importa el repositorio desde GitHub.
2. Crea un servicio nuevo usando la carpeta `backend` como `Root Directory`.
3. Usa `npm start` como comando de inicio.

### 3.2 Configurar persistencia

Para conservar la data JSON entre redeploys:

1. Crea un volumen en Railway.
2. Conéctalo al servicio backend.
3. Usa como `Mount Path`:

```text
/app/storage
```

Con esa configuración, `DATA_FILE=storage/database.json` quedará persistido.

### 3.3 Verificación rápida del backend

Prueba estos endpoints una vez desplegado:

- `GET /api/microtiendas`
- `GET /api/categorias`
- `GET /api/metricas/publicas`

## 4. Despliegue del frontend en Netlify

### 4.1 Crear el sitio

Usa esta configuración:

```text
Build command: npm run build
Publish directory: dist
```

### 4.2 Variable del frontend

Configura:

```env
VITE_API_URL=https://TU-BACKEND.up.railway.app/api
```

## 5. Orden recomendado

1. Despliega el backend en Railway.
2. Confirma que responde correctamente.
3. Copia la URL pública del backend.
4. Configura `VITE_API_URL` en Netlify.
5. Despliega el frontend.
6. Vuelve a Railway y ajusta `CLIENT_URL` con la URL final del frontend.

## 6. Checklist funcional posterior al despliegue

Valida al menos lo siguiente:

### Portal público

- carga del home
- navegación al marketplace
- paginación de 9 microtiendas por página
- apertura del detalle de negocio
- apertura de la vista previa de producto con galería

### Emprendedor

- login correcto
- acceso a `/dashboard`
- consulta de métricas individuales
- visualización paginada de reseñas
- creación y edición de productos con hasta 5 imágenes

### Administrador

- login correcto
- acceso a `/admin`
- consulta de `Admin -> Métricas`
- visualización de KPIs y gráficos
- exportación de reportes CSV y Excel

## 7. Notas operativas

- el sistema actual usa JSON como persistencia activa
- el archivo crecerá con imágenes y con eventos analíticos
- para producción institucional conviene migrar a MySQL y almacenamiento externo
- el esquema `backend/sql/schema.sql` ya documenta la estructura objetivo

## 8. Rutas y módulos relevantes para operación

Frontend:

- `/`
- `/marketplace`
- `/negocio/:id`
- `/comentarios`
- `/contacto`
- `/login`
- `/dashboard`
- `/admin`

API:

- `/api/auth`
- `/api/usuarios`
- `/api/categorias`
- `/api/microtiendas`
- `/api/productos`
- `/api/calificaciones`
- `/api/pqrs`
- `/api/metricas`

## 9. Datos demo

Se recomienda desplegar con la base limpia que ya trae el repositorio actualizado. Los registros demo no institucionales como `ccerdos`, `example` y `tienda demo` fueron eliminados.

## 10. Fuentes útiles

- [Netlify Docs](https://docs.netlify.com/)
- [Railway Docs](https://docs.railway.com/)
