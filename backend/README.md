# Backend Soledad Conecta

Backend Express de Soledad Conecta. Expone la API REST que soporta autenticación, usuarios, microtiendas, productos, reseñas, PQRS y métricas administrativas y de emprendedores.

## Stack

- Node.js
- Express
- CORS
- dotenv
- persistencia JSON para demo

## Arquitectura

La API mantiene una separación por capas:

- `src/routes`
- `src/controllers`
- `src/services`
- `src/models`
- `src/middlewares`
- `src/utils`

## Persistencia

Persistencia activa en demo:

- `src/data/database.json`

Utilidades de lectura y escritura:

- `src/utils/jsonDb.js`

Esquema relacional documentado:

- `sql/schema.sql`

Tablas relevantes del esquema actual:

- `usuario`
- `categoria`
- `microtienda`
- `producto`
- `producto_imagen`
- `calificacion`
- `pqrs`
- `microtienda_views`
- `product_views`

## Variables de entorno

```env
PORT=4000
CLIENT_URL=http://localhost:5173
AUTH_TOKEN_SECRET=coloca-un-secreto-seguro-aqui
DATA_FILE=src/data/database.json
```

## Instalación local

```bash
npm install
npm run dev
```

Producción:

```bash
npm start
```

## Endpoints

Base URL local:

```text
http://localhost:4000/api
```

### Auth

- `POST /auth/login`

### Usuarios

- `POST /usuarios/solicitudes-emprendedor`
- `POST /usuarios/solicitudes-cambio-password`
- `PATCH /usuarios/me/password`
- `GET /usuarios`
- `POST /usuarios`
- `PUT /usuarios/:id`
- `DELETE /usuarios/:id`

### Categorías

- `GET /categorias`
- `POST /categorias`
- `PUT /categorias/:id`
- `DELETE /categorias/:id`

### Microtiendas

- `GET /microtiendas`
- `GET /microtiendas/:id`
- `GET /microtiendas/mine`
- `GET /microtiendas/revision/lista`
- `POST /microtiendas`
- `PUT /microtiendas/:id`
- `PATCH /microtiendas/:id/revision`
- `DELETE /microtiendas/:id`

Notas:

- `GET /microtiendas` ahora soporta `page`, `limit`, `search` y `categoria`
- cuando no se envía paginación, conserva el comportamiento compatible anterior

### Productos

- `GET /productos`
- `GET /productos/mine`
- `GET /productos/revision/lista`
- `POST /productos`
- `PUT /productos/:id`
- `PATCH /productos/:id/revision`
- `DELETE /productos/:id`

Notas:

- los productos soportan hasta 5 imágenes
- el backend valida el máximo de imágenes y mantiene la primera como imagen principal

### Calificaciones

- `GET /calificaciones`
- `GET /calificaciones/resumen`
- `GET /calificaciones/revision/lista`
- `GET /calificaciones/mis-resenas`
- `POST /calificaciones`
- `PATCH /calificaciones/:id/revision`
- `DELETE /calificaciones/:id`

### PQRS

- `POST /pqrs`
- `GET /pqrs`
- `PATCH /pqrs/:id/estado`
- `DELETE /pqrs/:id`

### Métricas

- `GET /metricas/publicas`
- `GET /metricas/admin`
- `GET /metricas/admin/analitica`
- `GET /metricas/admin/reportes`
- `GET /metricas/emprendedor`
- `POST /metricas/visitas/microtienda`
- `POST /metricas/visitas/producto`
- `PATCH /metricas/visitas/microtienda/:viewId/permanencia`
- `PATCH /metricas/visitas/producto/:viewId/permanencia`

## Roles y permisos

### Admin

- acceso total a usuarios, categorías, revisiones, PQRS y métricas institucionales

### Entrepreneur

- acceso a su microtienda
- acceso a sus productos
- acceso a sus métricas individuales
- acceso a todas las reseñas de su negocio

### Público

- acceso a marketplace, detalle de microtiendas, calificaciones públicas y PQRS

## Métricas implementadas

### Admin

- total de microtiendas activas
- total de productos
- usuarios activos
- productos más visitados
- microtiendas más visitadas
- tiempo promedio de permanencia
- crecimiento semanal o mensual
- reportes CSV y Excel

### Emprendedor

- total de visitas a su microtienda
- visualizaciones de productos
- productos más vistos
- cantidad de reseñas recibidas
- promedio de calificación
- actividad semanal

## Datos demo y limpieza

Se eliminaron registros de prueba no institucionales como:

- `ccerdos`
- `example`
- `tienda demo`

La limpieza también contempla relaciones derivadas:

- productos asociados
- reseñas vinculadas
- registros analíticos asociados

## Consideraciones

- el backend no rompe las APIs existentes y añade nuevas capacidades de forma compatible
- la persistencia JSON sigue siendo útil para demostración, pero no es la estrategia final recomendada para producción
