# Backend Soledad Conecta

## Instalacion

1. Copia `.env.example` a `.env`.
2. Crea la base de datos ejecutando el script `sql/schema.sql` en MySQL.
3. Instala dependencias con `npm install`.
4. Ejecuta el servidor con `npm run dev`.

## Variables de entorno

```env
PORT=4000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vitrina_empresarial
DB_USER=root
DB_PASSWORD=123456
AUTH_TOKEN_SECRET=coloca-un-secreto-seguro-aqui
```

## Credenciales iniciales

- Admin: `admin@demo.com` / `123456`
- Emprendedor: `emprendedor@demo.com` / `123456`

## Endpoints base

- `GET /api`
- `GET /api/microtiendas`
- `GET /api/microtiendas/:id`
- `POST /api/auth/login`
- `GET /api/usuarios`
- `POST /api/usuarios`
