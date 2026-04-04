# Manual Tecnico

## Soledad Conecta

Este documento describe el estado tecnico actual del sistema despues de la migracion a backend real de demostracion con persistencia en JSON.

## 1. Objetivo del sistema

Soledad Conecta centraliza:

- vitrina publica de emprendimientos
- catalogos por tienda
- login por roles
- postulacion de emprendedores
- aprobacion administrativa
- CRUD de categorias
- CRUD de microtienda y productos
- PQRS
- calificaciones
- metricas dinamicas

## 2. Arquitectura actual

### Frontend

- React 19
- Vite 8
- React Router
- Axios
- CSS plano

Ubicacion: [src](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\src)

### Backend

- Node.js
- Express
- API REST modular
- persistencia basada en JSON

Ubicacion: [backend/src](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\backend\src)

## 3. Persistencia

La persistencia actual usa el archivo [backend/src/data/database.json](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\backend\src\data\database.json).

Se manipula mediante [backend/src/utils/jsonDb.js](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\backend\src\utils\jsonDb.js).

Colecciones principales:

- `roles`
- `usuarios`
- `categorias`
- `microtiendas`
- `productos`
- `calificaciones`
- `pqrs`
- `metricas`

## 4. Modulos funcionales

### 4.1 Portal publico

Archivo principal: [src/pages/Home.jsx](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\src\pages\Home.jsx)

Incluye:

- buscador
- filtro por categorias
- carrusel de emprendimientos
- acceso a PQRS
- acceso a calificaciones
- enlace al detalle de cada tienda

### 4.2 Detalle publico de tienda

Archivo principal: [src/pages/MicrostoreDetail.jsx](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\src\pages\MicrostoreDetail.jsx)

Incluye:

- logo del negocio
- descripcion
- datos de contacto
- catalogo de productos aprobados

### 4.3 Login y postulacion

Archivo principal: [src/pages/Login.jsx](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\src\pages\Login.jsx)

Incluye:

- login admin y emprendedor
- inicio con tecla Enter
- formulario de postulacion del emprendedor

### 4.4 Panel administrador

Archivo principal: [src/pages/AdminPanel.jsx](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\src\pages\AdminPanel.jsx)

Incluye:

- revision de postulaciones de emprendedores
- generacion y visualizacion de contrasenas de acceso para demo
- CRUD de usuarios
- CRUD de categorias
- revision de microtiendas
- revision de productos con imagen
- revision de calificaciones con datos privados
- consulta de PQRS
- metricas institucionales

### 4.5 Panel emprendedor

Archivo principal: [src/pages/EntrepreneurPanel.jsx](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\src\pages\EntrepreneurPanel.jsx)

Incluye:

- cambio obligatorio de contrasena en el primer acceso
- CRUD de microtienda
- carga de logo
- CRUD de productos
- carga de imagenes de productos
- actualizacion de inventario
- eliminacion de productos
- visualizacion de estados `PENDIENTE`, `APROBADO` y `RECHAZADO`
- metricas del negocio

### 4.6 PQRS

Archivo principal: [src/pages/Interaction.jsx](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\src\pages\Interaction.jsx)

Incluye:

- envio real de PQRS al backend
- visualizacion administrativa posterior

### 4.7 Calificaciones

Archivo principal: [src/pages/Feedback.jsx](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\src\pages\Feedback.jsx)

Incluye:

- registro de calificaciones
- datos personales obligatorios
- revision administrativa antes de publicacion

## 5. Flujo de usuarios

### Emprendedores

1. diligencian solicitud desde login
2. quedan `PENDIENTE`
3. admin aprueba
4. se genera contrasena aleatoria
5. emprendedor inicia sesion
6. debe cambiar la contrasena antes de usar el panel

### Administrador

Tiene acceso completo a:

- usuarios
- categorias
- revisiones
- PQRS
- metricas

## 6. Imagenes

Las imagenes se almacenan como `data URL` base64 dentro del JSON.

Campos usados:

- `logo_imagen` en microtiendas
- `imagen_url` en productos

Esto es valido para demo, pero no es recomendable para produccion.

## 7. Seguridad actual

La seguridad esta orientada a demostracion:

- token propio firmado por HMAC
- control de acceso por rol
- contrasenas nuevas visibles para demo
- compatibilidad con contrasenas antiguas hasheadas

Advertencia:

- las contrasenas en texto plano son inseguras para produccion

## 8. API principal

Rutas base: [backend/src/routes/index.js](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\backend\src\routes\index.js)

Modulos:

- `/api/auth`
- `/api/usuarios`
- `/api/categorias`
- `/api/microtiendas`
- `/api/productos`
- `/api/pqrs`
- `/api/calificaciones`
- `/api/metricas`

## 9. Variables de entorno

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

## 10. Ejecucion local

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

## 11. Despliegue actual recomendado

- Netlify para frontend
- Railway para backend
- volumen en Railway para persistencia del JSON

El detalle operativo esta en [MANUAL-DESPLIEGUE.md](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\MANUAL-DESPLIEGUE.md).
