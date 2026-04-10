# Soledad Conecta

Despliegue en linea:

- [Soledad Conecta en Netlify]([https://69c2d0792f6d23c178e284af--soledad-conecta.netlify.app/](https://soledad-conecta.netlify.app/))

Soledad Conecta es una vitrina digital para emprendimientos locales. El proyecto combina un frontend en React + Vite con un backend en Express, e integra autenticacion, postulacion de emprendedores, gestion administrativa, microtiendas, productos, PQRS, calificaciones y metricas.

## Resumen del sistema

Actualmente el proyecto incluye:

- portal publico con buscador y detalle de microtiendas
- login por roles
- postulacion de emprendedores
- panel administrador
- panel emprendedor
- gestion de categorias, microtiendas y productos
- PQRS
- calificaciones y comentarios
- metricas institucionales

## Stack principal

### Frontend

- React 19
- Vite
- React Router
- Axios

### Backend

- Node.js
- Express
- persistencia actual en JSON para demostracion

## Rutas principales

- `/` portal publico
- `/login` acceso y postulacion
- `/panel-admin` panel del administrador
- `/panel-emprendedor` panel del emprendedor
- `/interaccion` contacto y PQR's
- `/calificaciones` opiniones y valoraciones
- `/microtiendas/:id` detalle publico de una tienda

## Credenciales demo

- admin: `admin@demo.com` / `123456`
- emprendedor demo: `emprendedor@demo.com` / `123456`

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

## Despliegue

Configuracion recomendada:

- frontend en Netlify
- backend en Railway
- volumen persistente en Railway para el archivo JSON

Resumen rapido:

1. desplegar primero el backend en Railway
2. configurar `CLIENT_URL` en backend
3. configurar `VITE_API_URL` en Netlify
4. desplegar frontend

Guia completa:

- [MANUAL-DESPLIEGUE.md](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\MANUAL-DESPLIEGUE.md)

## Documentacion

- manual tecnico completo: [MANUAL-TECNICO.md](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\MANUAL-TECNICO.md)
- manual de despliegue: [MANUAL-DESPLIEGUE.md](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\MANUAL-DESPLIEGUE.md)
- backend: [backend/README.md](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\README.md)

## Nota

La documentacion extensa se mantiene separada a proposito:

- `README.md` como entrada rapida al proyecto
- `MANUAL-TECNICO.md` como referencia funcional y arquitectonica
- `MANUAL-DESPLIEGUE.md` como guia operativa de publicacion
