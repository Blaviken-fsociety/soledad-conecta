# Manual Tecnico

## Soledad Conecta

Despliegue:

- [Soledad Conecta en Netlify](https://69c2d0792f6d23c178e284af--soledad-conecta.netlify.app/)

Soledad Conecta es una plataforma full stack orientada a la promocion de emprendimientos locales mediante una vitrina empresarial digital. El proyecto se encuentra organizado bajo una arquitectura cliente servidor con frontend en React + Vite y backend en Node.js + Express, con integracion prevista hacia MySQL.

Este documento describe el estado tecnico actual del sistema, su estructura, modulos implementados en interfaz, backend disponible, rutas principales, configuracion y recomendaciones de continuidad.

## 1. Objetivo del sistema

El sistema busca centralizar:

- visualizacion publica de emprendimientos,
- navegacion por categorias,
- busqueda por palabras clave,
- acceso privado para administradores y emprendedores,
- gestion de microtiendas,
- visualizacion de metricas institucionales,
- interaccion con usuarios por contacto, PQR's, calificaciones y comentarios.

## 2. Arquitectura general

La solucion esta dividida en dos capas principales:

### Frontend

- tecnologia: React 19 + Vite
- ubicacion: raiz del proyecto
- responsabilidad:
  - interfaz publica,
  - flujo de login,
  - panel administrativo,
  - panel del emprendedor,
  - navegacion entre modulos.

### Backend

- tecnologia: Node.js + Express
- ubicacion: [`backend`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend)
- responsabilidad:
  - exponer API REST,
  - gestionar conexion a MySQL,
  - entregar datos de microtiendas,
  - centralizar validaciones y manejo de errores.

## 3. Estructura del proyecto

### Frontend

```text
soledad-conecta/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── BrandLogo.jsx
│   │   ├── ShopCard.jsx
│   │   └── SiteFooter.jsx
│   ├── data/
│   │   ├── dashboardData.js
│   │   └── marketplaceData.js
│   ├── pages/
│   │   ├── AdminPanel.jsx
│   │   ├── EntrepreneurPanel.jsx
│   │   ├── Feedback.jsx
│   │   ├── Home.jsx
│   │   ├── Interaction.jsx
│   │   └── Login.jsx
│   ├── utils/
│   │   └── session.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

### Backend

```text
backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── microtiendaController.js
│   ├── middlewares/
│   │   ├── errorHandler.js
│   │   └── notFoundHandler.js
│   ├── models/
│   │   └── microtiendaModel.js
│   ├── routes/
│   │   ├── index.js
│   │   └── microtiendaRoutes.js
│   ├── services/
│   │   └── microtiendaService.js
│   └── app.js
├── .env.example
├── package.json
└── server.js
```

## 4. Stack tecnico

### Frontend

- React
- React Router DOM
- Vite
- Axios
- CSS plano modular por componentes y paginas

### Backend

- Node.js
- Express
- mysql2
- dotenv
- cors

### Base de datos

- MySQL
- esquema previsto: `vitrina_empresarial`

## 5. Modulos del sistema

## 5.1 Home publico

Archivo principal: [`src/pages/Home.jsx`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\pages\Home.jsx)

Funciones actuales:

- navbar con logo institucional,
- buscador en navbar con lupa,
- filtro por categoria desde lista desplegable,
- listado dinamico de emprendimientos,
- acceso a login,
- acceso a contacto y PQR's,
- acceso a calificaciones y comentarios,
- footer institucional full width.

Fuente de datos:

- [`src/data/marketplaceData.js`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\data\marketplaceData.js)

## 5.2 Login y control de acceso

Archivo principal: [`src/pages/Login.jsx`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\pages\Login.jsx)

Funciones actuales:

- selector de acceso por rol:
  - administrador,
  - emprendedor.
- validacion de credenciales demo,
- persistencia simple de sesion en `localStorage`,
- redireccion por rol a panel privado.

Utilidad de sesion:

- [`src/utils/session.js`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\utils\session.js)

## 5.3 Panel administrador

Archivo principal: [`src/pages/AdminPanel.jsx`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\pages\AdminPanel.jsx)

Funciones actuales:

- gestion visual de usuarios,
- visualizacion de categorias del sistema,
- panel de metricas institucionales,
- boton de `Logout`,
- proteccion por rol usando sesion local.

## 5.4 Panel emprendedor

Archivo principal: [`src/pages/EntrepreneurPanel.jsx`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\pages\EntrepreneurPanel.jsx)

Funciones actuales:

- vista de microtienda empresarial,
- ficha del negocio,
- productos y servicios,
- metricas institucionales,
- boton de `Logout`,
- proteccion por rol usando sesion local.

## 5.5 Contacto y PQR's

Archivo principal: [`src/pages/Interaction.jsx`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\pages\Interaction.jsx)

Funciones actuales:

- botones de contacto directo por WhatsApp,
- formulario visual de PQR's,
- campos minimos:
  - nombre,
  - correo electronico,
  - tipo de solicitud,
  - mensaje.

## 5.6 Calificaciones y comentarios

Archivo principal: [`src/pages/Feedback.jsx`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\pages\Feedback.jsx)

Funciones actuales:

- promedio de calificacion por emprendimiento,
- comentarios de ejemplo,
- formulario visual para registrar valoracion.

## 5.7 Footer institucional

Componente: [`src/components/SiteFooter.jsx`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\components\SiteFooter.jsx)

Elementos incluidos:

- logo Soledad Conecta,
- logo Nova Evolutions,
- logo Alcaldia de Soledad,
- logo CUC,
- bloques de exploracion y aliados,
- franja inferior legal/institucional.

## 6. Backend disponible

El backend implementado actualmente expone un modulo base de microtiendas.

Archivos clave:

- [`backend/src/app.js`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\src\app.js)
- [`backend/src/config/db.js`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\src\config\db.js)
- [`backend/src/routes/microtiendaRoutes.js`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\src\routes\microtiendaRoutes.js)
- [`backend/src/controllers/microtiendaController.js`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\src\controllers\microtiendaController.js)
- [`backend/src/services/microtiendaService.js`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\src\services\microtiendaService.js)
- [`backend/src/models/microtiendaModel.js`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\src\models\microtiendaModel.js)

### Endpoints disponibles

- `GET /api`
- `GET /api/microtiendas`
- `GET /api/microtiendas/:id`

### Caracteristicas backend

- pool de conexiones MySQL,
- estructura por capas,
- validacion de `id`,
- manejo centralizado de errores,
- respuesta JSON uniforme.

## 7. Base de datos

Base de datos objetivo:

- `vitrina_empresarial`

Tablas contempladas en el diseño funcional:

- `rol`
- `usuario`
- `categoria`
- `microtienda`
- `producto`
- `calificacion`
- `pqrs`
- `metrica`

Observacion:

El frontend actual usa datos de demostracion en memoria para representar el comportamiento del sistema. La conexion funcional completa entre frontend y MySQL aun no ha sido finalizada.

## 8. Rutas frontend

- `/` -> Home publico
- `/login` -> acceso por rol
- `/panel-admin` -> panel administrador
- `/panel-emprendedor` -> panel emprendedor
- `/interaccion` -> contacto y PQR's
- `/calificaciones` -> calificaciones y comentarios

## 9. Credenciales de demostracion

### Administrador

- correo: `admin@demo.com`
- contrasena: `123456`

### Emprendedor

- correo: `emprendedor@demo.com`
- contrasena: `123456`

Nota:

Estas credenciales son de simulacion en frontend. No existe aun autenticacion real con backend ni cifrado de sesiones.

## 10. Logos y recursos graficos

Ubicacion:

- [`src/assets/soledad-logo.png`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\assets\soledad-logo.png)
- [`src/assets/nova-logo.png`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\assets\nova-logo.png)
- [`src/assets/alcaldia-logo.png`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\assets\alcaldia-logo.png)
- [`src/assets/cuc-logo.png`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\assets\cuc-logo.png)

## 11. Como ejecutar el proyecto

## 11.1 Frontend

Desde la raiz del proyecto:

```bash
npm install
npm run dev
```

Por defecto Vite usa:

- `http://localhost:5173`

## 11.2 Backend

Desde la carpeta [`backend`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend):

```bash
npm install
npm run dev
```

Por defecto Express usa:

- `http://localhost:4000`

## 11.3 Variables de entorno backend

Archivo de referencia:

- [`backend/.env.example`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\.env.example)

Variables:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vitrina_empresarial
DB_USER=root
DB_PASSWORD=123456
```

## 12. Estado actual del sistema

### Implementado

- estructura base de frontend y backend,
- navegacion entre modulos,
- login simulado por roles,
- paneles separados por rol,
- modulo publico con busqueda y categorias,
- modulo de contacto y PQR's,
- modulo de calificaciones y comentarios,
- footer institucional full width,
- backend base de microtiendas.

### Pendiente

- autenticacion real con backend,
- persistencia real de usuarios,
- CRUD completo de categorias,
- CRUD real de microtienda y productos,
- envio real de PQR's,
- persistencia real de calificaciones,
- metricas dinamicas desde base de datos,
- proxy frontend-backend y consumo real con axios.

## 13. Riesgos y consideraciones tecnicas

- la sesion actual se maneja solo con `localStorage`,
- las credenciales actuales son de demostracion,
- los modulos visuales no persisten datos aun,
- el entorno local actual ha presentado bloqueo para `vite build` por restriccion `spawn EPERM`,
- el README original del template fue reemplazado por este manual tecnico.

## 14. Recomendaciones para la siguiente fase

1. Implementar autenticacion privada en backend para administrador y emprendedor.
2. Conectar `Home` al endpoint real de microtiendas.
3. Persistir categorias desde modulo administrador.
4. Persistir productos e informacion de microtienda desde panel emprendedor.
5. Persistir PQRS, calificaciones y metricas en MySQL.
6. Incorporar validacion de formularios y control de acceso mas robusto.
