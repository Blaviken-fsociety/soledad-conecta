# Manual Técnico

## Soledad Conecta

Soledad Conecta es una plataforma full stack para la promoción de microemprendimientos locales. El sistema combina un frontend en React + Vite con un backend en Node.js + Express y hoy funciona con persistencia JSON para demo, dejando listo un esquema MySQL para evolución posterior.

## 1. Objetivo del sistema

Centralizar en una sola plataforma:

- marketplace institucional de emprendimientos
- microtiendas con catálogo de productos
- autenticación y control de acceso por rol
- panel administrativo
- panel individual para emprendedores
- sistema de reseñas
- PQRS
- métricas y analítica de uso

## 2. Arquitectura general

### Frontend

- React 19
- Vite
- React Router
- Axios
- Recharts
- Tailwind CSS

Responsabilidades:

- portal público
- marketplace paginado
- detalle de microtienda
- vista previa de productos
- dashboard de emprendedor
- dashboard de administrador

### Backend

- Node.js
- Express
- arquitectura por capas
- persistencia JSON actual
- esquema MySQL documentado para escenarios productivos

Responsabilidades:

- autenticación
- autorización por roles
- validaciones de negocio
- CRUD de usuarios, microtiendas y productos
- revisión administrativa
- métricas agregadas
- exportación de reportes

## 3. Estructura real del proyecto

### Frontend

```text
src/app/
  assets/
  components/
    charts/
  data/
  pages/
    admin/Metricas/
  services/
  utils/
```

Archivos funcionales relevantes:

- `src/app/AppRouter.jsx`
- `src/app/pages/HomePage.jsx`
- `src/app/pages/MarketplacePage.jsx`
- `src/app/pages/BusinessDetailPageReal.jsx`
- `src/app/pages/EntrepreneurDashboard.jsx`
- `src/app/pages/AdminDashboard.jsx`
- `src/app/services/metricasService.js`
- `src/app/components/charts/*`

### Backend

```text
backend/src/
  config/
  controllers/
  data/
  middlewares/
  models/
  routes/
  services/
  utils/
```

Archivos funcionales relevantes:

- `backend/src/app.js`
- `backend/src/routes/index.js`
- `backend/src/routes/metricasRoutes.js`
- `backend/src/controllers/metricasController.js`
- `backend/src/services/metricasService.js`
- `backend/src/utils/jsonDb.js`

## 4. Rutas actuales del frontend

- `/` home público
- `/marketplace` listado público de microtiendas
- `/negocio/:id` microtienda pública
- `/comentarios` módulo de calificaciones
- `/contacto` contacto y PQRS
- `/login` autenticación y postulaciones
- `/dashboard` panel del emprendedor
- `/admin` panel del administrador

## 5. Roles y permisos

### Administrador

- gestiona usuarios y categorías
- revisa microtiendas, productos y reseñas
- consulta y gestiona PQRS
- accede a métricas globales y reportes

### Emprendedor

- administra su microtienda
- crea, edita y elimina productos
- consulta sus métricas individuales
- consulta todas las reseñas recibidas desde su perfil

### Público

- navega el marketplace
- consulta microtiendas
- abre vista previa de productos
- registra reseñas
- envía PQRS

## 6. Módulos funcionales

### 6.1 Marketplace

Características:

- búsqueda por texto
- filtro por categoría
- paginación clásica
- máximo 9 emprendimientos por página
- navegación con anterior, siguiente y número activo

Backend relacionado:

- `GET /api/microtiendas?page=1&limit=9`

### 6.2 Microtienda pública

Características:

- datos generales del negocio
- productos aprobados visibles
- reseñas aprobadas visibles
- registro de visita analítica al entrar

### 6.3 Vista previa de producto

Características:

- modal superpuesto
- imagen principal ampliada
- miniaturas seleccionables
- precio, stock, nombre y descripción completa
- nombre de la microtienda
- registro automático de visualización del producto

### 6.4 Panel del emprendedor

Características:

- resumen del negocio
- métricas individuales
- gestión de productos
- perfil de la microtienda
- sección de reseñas paginadas

Métricas incluidas:

- total de visitas a su microtienda
- visualizaciones de productos
- productos más vistos
- cantidad de reseñas recibidas
- promedio de calificación
- actividad semanal

### 6.5 Panel del administrador

Características:

- gestión operativa
- métricas institucionales
- reportes analíticos

Indicadores incluidos:

- total de microtiendas activas
- total de productos registrados
- usuarios activos
- productos más visitados
- microtiendas más visitadas
- tiempo promedio de permanencia
- crecimiento semanal o mensual

Visualizaciones incluidas:

- tarjetas KPI
- donut por categoría
- línea de actividad
- ranking de productos
- ranking de microtiendas

### 6.6 Reseñas

Características:

- visibles públicamente en la microtienda cuando están aprobadas
- visibles de forma completa para el emprendedor en su perfil
- visibles para revisión desde el panel admin

Campos mostrados:

- usuario
- calificación
- comentario
- fecha

### 6.7 Productos con múltiples imágenes

Regla actual:

- máximo 5 imágenes por producto

Cobertura funcional:

- formulario de creación
- formulario de edición
- almacenamiento JSON como arreglo de imágenes
- esquema MySQL mediante tabla `producto_imagen`
- galería visual y selector de miniaturas en la vista previa

## 7. Analítica y métricas

### Fuentes de datos

La analítica se alimenta con eventos registrados por el sistema:

- visitas a microtienda
- vistas de producto
- permanencia por sesión
- reseñas y calificaciones
- catálogo de microtiendas y productos

### Colecciones activas en JSON

- `roles`
- `usuarios`
- `categorias`
- `microtiendas`
- `productos`
- `calificaciones`
- `pqrs`
- `metricas`
- `microtienda_views`
- `product_views`

### Tablas previstas en MySQL

- `microtienda`
- `producto`
- `producto_imagen`
- `calificacion`
- `pqrs`
- `microtienda_views`
- `product_views`

## 8. API disponible

Base URL:

```text
http://localhost:4000/api
```

Módulos:

- `/auth`
- `/usuarios`
- `/categorias`
- `/microtiendas`
- `/productos`
- `/calificaciones`
- `/pqrs`
- `/metricas`

Endpoints destacados:

- `POST /auth/login`
- `GET /microtiendas`
- `GET /microtiendas/mine`
- `GET /productos/mine`
- `GET /calificaciones/mis-resenas`
- `GET /metricas/admin`
- `GET /metricas/admin/analitica`
- `GET /metricas/admin/reportes`
- `GET /metricas/emprendedor`
- `POST /metricas/visitas/microtienda`
- `POST /metricas/visitas/producto`

## 9. Persistencia actual y evolución prevista

### Estado actual

- persistencia JSON en `backend/src/data/database.json`
- lectura y escritura controladas desde `backend/src/utils/jsonDb.js`

### Evolución prevista

- migración de persistencia a MySQL
- externalización de imágenes
- reportes PDF si el proyecto lo requiere
- métricas avanzadas por rango, cohortes o conversión

## 10. Validaciones relevantes

- control por rol en endpoints privados
- validación de categorías activas
- validación de pertenencia entre emprendedor y su microtienda
- validación de pertenencia entre emprendedor y sus productos
- validación del máximo de 5 imágenes por producto
- compatibilidad hacia atrás en la consulta pública de microtiendas sin paginación

## 11. Datos demo y limpieza aplicada

Para mejorar la presentación institucional del sistema, se eliminaron registros demo no deseados como:

- `ccerdos`
- `example`
- `tienda demo`

También se limpian sus relaciones asociadas cuando aplica:

- productos
- reseñas
- visualizaciones analíticas

## 12. Ejecución local

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

## 13. Variables de entorno

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

## 14. Riesgos y consideraciones

- JSON funciona bien para demo, pero no para alta concurrencia
- guardar imágenes en base64 incrementa el tamaño del archivo de datos
- antes de una salida productiva conviene migrar a almacenamiento externo y base de datos real
- la arquitectura actual ya está preparada para seguir ampliando el módulo de métricas sin romper la base existente
