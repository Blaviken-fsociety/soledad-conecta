# Backend Soledad Conecta

Backend Express para la demo de Soledad Conecta.

## Stack

- Node.js
- Express
- CORS
- dotenv
- persistencia JSON

## Persistencia

La persistencia por defecto usa [src/data/database.json](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\backend\src\data\database.json).

El acceso al archivo se hace desde [src/utils/jsonDb.js](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\backend\src\utils\jsonDb.js).

## Variables de entorno

```env
PORT=4000
CLIENT_URL=http://localhost:5173
AUTH_TOKEN_SECRET=coloca-un-secreto-seguro-aqui
DATA_FILE=src/data/database.json
```

## Instalacion local

```bash
npm install
npm run dev
```

Produccion:

```bash
npm start
```

## Credenciales base

- Admin: `admin@demo.com` / `123456`
- Emprendedor demo: `emprendedor@demo.com` / `123456`

## Funcionalidades backend

- login por rol
- postulacion de emprendedores
- aprobacion de emprendedores por admin
- cambio de contrasena del propio usuario
- CRUD de usuarios
- CRUD de categorias
- CRUD de microtiendas
- CRUD de productos
- revision de microtiendas, productos y calificaciones
- PQRS
- metricas

## Notas de demo

- las contrasenas nuevas pueden guardarse en texto plano para la muestra
- las imagenes se almacenan como base64 dentro del JSON
- esto no es un enfoque de produccion

## Railway

Para Railway:

1. crea un servicio desde este repo
2. configura `Root Directory = backend`
3. usa `npm start`
4. define `CLIENT_URL`
5. define `AUTH_TOKEN_SECRET`
6. si quieres persistencia real en la demo, monta un volumen y usa una ruta dentro de `/app`

Ejemplo recomendado:

```env
DATA_FILE=storage/database.json
```

Si montas el volumen en `/app/storage`, esa ruta relativa quedara persistida.
