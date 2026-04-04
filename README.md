# Soledad Conecta

Soledad Conecta es una vitrina digital para emprendimientos locales con frontend en React + Vite y backend en Express. En el estado actual del proyecto, la persistencia funciona con un archivo JSON para facilitar demostraciones y despliegues sencillos.

## Estado actual

El proyecto ya incluye:

- autenticacion real contra backend
- registro de postulaciones de emprendedores
- aprobacion administrativa con generacion automatica de contrasena
- cambio obligatorio de contrasena en el primer ingreso del emprendedor
- CRUD administrativo de usuarios y categorias
- CRUD de microtienda y productos para emprendedores
- revision administrativa de microtiendas, productos y calificaciones
- envio real de PQRS
- persistencia de calificaciones
- carga de imagenes para logo y productos en formato base64
- detalle publico por tienda con catalogo visible
- metricas dinamicas calculadas desde el JSON
- frontend conectado por `axios`

## Arquitectura

### Frontend

- React 19
- Vite
- React Router
- Axios
- ubicacion: raiz del proyecto

### Backend

- Node.js
- Express
- persistencia local en `backend/src/data/database.json`
- ubicacion: [`backend`](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\backend)

## Flujo principal

1. El emprendedor solicita su registro desde `/login`.
2. El administrador revisa la postulacion desde el panel admin.
3. Al aprobarla, el sistema genera una contrasena aleatoria no duplicada.
4. El emprendedor inicia sesion.
5. En el primer acceso debe cambiar su contrasena antes de usar el panel.
6. Luego puede solicitar microtienda, productos y cambios de inventario.
7. El admin revisa y aprueba solo las solicitudes pendientes.

## Rutas frontend

- `/` portal publico
- `/login` acceso y postulacion de emprendedores
- `/panel-admin` panel del administrador
- `/panel-emprendedor` panel del emprendedor
- `/interaccion` PQRS
- `/calificaciones` opiniones y valoraciones
- `/microtiendas/:id` detalle publico de una tienda

## Credenciales demo base

- admin: `admin@demo.com` / `123456`
- emprendedor demo: `emprendedor@demo.com` / `123456`

Nota importante:

- las contrasenas nuevas de esta demo se guardan en texto plano para que el administrador pueda verlas facilmente durante la muestra
- esto es solo para demostracion, no para produccion

## Variables de entorno

### Frontend

Archivo de ejemplo: [.env.example](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\.env.example)

```env
VITE_API_URL=http://localhost:4000/api
```

### Backend

Archivo de ejemplo: [backend/.env.example](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\backend\.env.example)

```env
PORT=4000
CLIENT_URL=http://localhost:5173
AUTH_TOKEN_SECRET=coloca-un-secreto-seguro-aqui
DATA_FILE=src/data/database.json
```

## Ejecucion local

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

## Persistencia actual

La demo usa [backend/src/data/database.json](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\backend\src\data\database.json).

Este archivo almacena:

- usuarios
- categorias
- microtiendas
- productos
- calificaciones
- PQRS

## Documentacion adicional

- manual tecnico: [MANUAL-TECNICO.md](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\MANUAL-TECNICO.md)
- manual de despliegue: [MANUAL-DESPLIEGUE.md](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\MANUAL-DESPLIEGUE.md)
- backend: [backend/README.md](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\backend\README.md)

## Despliegue recomendado para demo

- frontend en Netlify
- backend en Railway
- volumen en Railway para no perder el JSON en redeploy

El paso a paso completo esta en [MANUAL-DESPLIEGUE.md](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\MANUAL-DESPLIEGUE.md).
