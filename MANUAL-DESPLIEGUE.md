# Manual de Despliegue

## Soledad Conecta con Netlify y Railway

Este manual deja el despliegue de la demo con:

- frontend en Netlify
- backend en Railway
- persistencia JSON usando un volumen en Railway

## 1. Antes de desplegar

Verifica que el proyecto ya funcione localmente:

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

## 2. Despliegue del backend en Railway

### 2.1 Crear el servicio

1. entra a Railway
2. crea un proyecto nuevo desde GitHub
3. selecciona este repositorio
4. abre el servicio importado
5. en `Settings`, configura `Root Directory` con `backend`

Esto aplica al caso de monorepo aislado, que es justamente la estructura de este proyecto.

### 2.2 Variables del backend

En Railway agrega estas variables:

```env
PORT=4000
CLIENT_URL=https://TU-SITIO.netlify.app
AUTH_TOKEN_SECRET=un-secreto-largo-y-propio
DATA_FILE=storage/database.json
```

Nota:

- `CLIENT_URL` debe ser la URL final de Netlify
- `DATA_FILE=storage/database.json` funciona bien si el volumen se monta en `/app/storage`

### 2.3 Crear volumen para persistencia

Para no perder el JSON en cada redeploy:

1. en Railway, crea un `Volume`
2. conéctalo al servicio backend
3. usa como `Mount Path` esta ruta:

```text
/app/storage
```

Con eso, el archivo real quedará persistido en:

```text
/app/storage/database.json
```

Como el backend ya usa `DATA_FILE=storage/database.json`, la aplicación lo resolverá correctamente dentro de `/app`.

### 2.4 Comando de inicio

El backend ya está listo para arrancar con:

```bash
npm start
```

Eso sale de [backend/package.json](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\backend\package.json).

### 2.5 Probar el backend desplegado

Cuando Railway publique el servicio, abre:

```text
https://TU-BACKEND.up.railway.app/api/microtiendas
```

Si responde JSON, el backend ya está arriba.

## 3. Despliegue del frontend en Netlify

### 3.1 Crear sitio

1. entra a Netlify
2. importa el repositorio desde GitHub
3. usa esta configuracion:

```text
Build command: npm run build
Publish directory: dist
```

Eso ya coincide con [netlify.toml](C:\Users\DarkVigore\Documents\GitHub\soledad-conecta\netlify.toml).

### 3.2 Variable del frontend

Agrega esta variable en Netlify:

```env
VITE_API_URL=https://TU-BACKEND.up.railway.app/api
```

## 4. Orden recomendado de despliegue

1. despliega primero Railway
2. copia la URL publica del backend
3. configura `VITE_API_URL` en Netlify
4. despliega Netlify
5. vuelve a Railway y actualiza `CLIENT_URL` con la URL final de Netlify

## 5. Verificacion final

Cuando ambos estén arriba, prueba:

1. abrir el home
2. entrar al login
3. enviar una solicitud de emprendedor
4. entrar como admin
5. aprobar la solicitud
6. iniciar sesion como emprendedor
7. cambiar la contrasena en primer acceso
8. crear microtienda
9. crear producto
10. aprobarlo desde admin

## 6. Notas importantes para demo

- el volumen de Railway es importante si no quieres perder datos
- la persistencia sigue siendo un JSON, no una base de datos real
- las imagenes en base64 hacen crecer el archivo rapidamente
- las contrasenas visibles en JSON son solo para demo

## 7. Fuentes oficiales

- [Railway monorepos](https://docs.railway.com/guides/monorepo)
- [Railway volumes](https://docs.railway.com/develop/volumes)
- [Netlify environment variables](https://docs.netlify.com/environment-variables/get-started/)
- [Netlify redirects and rewrites](https://docs.netlify.com/routing/redirects/)
