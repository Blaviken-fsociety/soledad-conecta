# Manual Tecnico

## Soledad Conecta

Despliegue:

- [Soledad Conecta en Netlify](https://69c2d0792f6d23c178e284af--soledad-conecta.netlify.app/)

Soledad Conecta es una plataforma full stack orientada a la promocion de emprendimientos locales mediante una vitrina empresarial digital. El proyecto evoluciono desde una base cliente-servidor con MySQL planificado hacia una version demostrativa funcional con frontend en React + Vite y backend en Node.js + Express con persistencia en JSON.

Este documento fusiona el manual tecnico antiguo y el nuevo estado del sistema, preservando la informacion funcional relevante, la arquitectura original, el estado real del backend actual y las rutas/modulos ya implementados.

## 1. Objetivo del sistema

El sistema busca centralizar:

- visualizacion publica de emprendimientos
- navegacion por categorias
- busqueda por palabras clave
- acceso privado para administradores y emprendedores
- postulacion y aprobacion de emprendedores
- gestion de microtiendas
- gestion de productos
- visualizacion de metricas institucionales
- interaccion con usuarios por contacto, PQR's, calificaciones y comentarios

## 2. Arquitectura general

La solucion esta dividida en dos capas principales:

### Frontend

- tecnologia: React 19 + Vite
- ubicacion: raiz del proyecto
- responsabilidad:
  - interfaz publica
  - flujo de login
  - postulacion de emprendedores
  - panel administrativo
  - panel del emprendedor
  - navegacion entre modulos

### Backend

- tecnologia: Node.js + Express
- ubicacion: [`backend`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend)
- responsabilidad:
  - exponer API REST
  - autenticar usuarios
  - administrar postulaciones
  - gestionar categorias
  - gestionar microtiendas y productos
  - registrar PQRS
  - registrar calificaciones
  - calcular metricas

## 3. Evolucion tecnica del proyecto

### Arquitectura objetivo inicial

La primera definicion tecnica contemplaba:

- backend con Express
- MySQL como base de datos principal
- comunicacion REST con JSON
- separacion por capas:
  - config
  - routes
  - controllers
  - services
  - models
  - middlewares

### Estado funcional actual

El sistema hoy opera en modo demo funcional con:

- frontend conectado al backend por `axios`
- persistencia local en JSON
- autenticacion real contra backend
- token propio firmado
- control de acceso por rol
- modulos CRUD y de aprobacion funcionando sobre archivo JSON

Observacion:

- MySQL sigue siendo parte del diseno objetivo institucional
- la persistencia activa en el estado actual del repositorio es JSON, no MySQL

## 4. Estructura del proyecto

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
│   │   ├── Login.jsx
│   │   └── MicrostoreDetail.jsx
│   ├── utils/
│   │   └── session.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
├── vite.config.js
├── README.md
└── MANUAL-TECNICO.md
```

### Backend

```text
backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── jsonStore.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── metricController.js
│   │   ├── microtiendaController.js
│   │   ├── pqrsController.js
│   │   ├── productController.js
│   │   ├── ratingController.js
│   │   └── userController.js
│   ├── data/
│   │   └── database.json
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── notFoundHandler.js
│   ├── models/
│   │   ├── categoryModel.js
│   │   ├── metricModel.js
│   │   ├── microtiendaModel.js
│   │   ├── pqrsModel.js
│   │   ├── productModel.js
│   │   ├── ratingModel.js
│   │   └── userModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── index.js
│   │   ├── metricRoutes.js
│   │   ├── microtiendaRoutes.js
│   │   ├── pqrsRoutes.js
│   │   ├── productRoutes.js
│   │   ├── ratingRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── categoryService.js
│   │   ├── metricService.js
│   │   ├── microtiendaService.js
│   │   ├── pqrsService.js
│   │   ├── productService.js
│   │   ├── ratingService.js
│   │   └── userService.js
│   ├── utils/
│   │   ├── httpError.js
│   │   ├── jsonDb.js
│   │   ├── password.js
│   │   └── token.js
│   └── app.js
├── .env.example
├── package.json
└── server.js
```

## 5. Stack tecnico

### Frontend

- React
- React Router DOM
- Vite
- Axios
- CSS plano modular por componentes y paginas

### Backend

- Node.js
- Express
- cors
- dotenv
- persistencia local en JSON

### Base de datos objetivo

- MySQL
- esquema previsto: `vitrina_empresarial`

### Persistencia actual de demo

- archivo JSON local en [`backend/src/data/database.json`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\src\data\database.json)

## 6. Persistencia actual

La persistencia activa usa:

- [`backend/src/data/database.json`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\src\data\database.json)
- [`backend/src/utils/jsonDb.js`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\src\utils\jsonDb.js)

Colecciones principales:

- `roles`
- `usuarios`
- `categorias`
- `microtiendas`
- `productos`
- `calificaciones`
- `pqrs`
- `metricas`

Adicionalmente, el helper `jsonDb.js` ya incluye logica para:

- crear un JSON vacio si no existe
- sembrar datos base si el archivo externo esta vacio
- facilitar despliegue en Railway con volumen persistente

## 7. Modulos del sistema

## 7.1 Home publico

Archivo principal: [`src/pages/Home.jsx`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\pages\Home.jsx)

Funciones actuales:

- navbar con logo institucional
- buscador en navbar
- filtro por categorias desde lista desplegable
- listado dinamico de emprendimientos
- carruseles visuales en portada
- acceso a login
- acceso a contacto y PQR's
- acceso a calificaciones y comentarios
- footer institucional full width

Fuente de datos visuales:

- [`src/data/marketplaceData.js`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\data\marketplaceData.js)

## 7.2 Detalle publico de tienda

Archivo principal: [`src/pages/MicrostoreDetail.jsx`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\pages\MicrostoreDetail.jsx)

Funciones actuales:

- visualizacion del negocio
- descripcion
- datos de contacto
- productos aprobados visibles

## 7.3 Login y control de acceso

Archivo principal: [`src/pages/Login.jsx`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\pages\Login.jsx)

Funciones actuales:

- selector de acceso por rol
- login admin y emprendedor
- inicio con tecla Enter
- formulario de postulacion del emprendedor
- validacion real contra backend
- redireccion por rol a panel privado

Utilidades relacionadas:

- [`src/utils/session.js`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\utils\session.js)

## 7.4 Panel administrador

Archivo principal: [`src/pages/AdminPanel.jsx`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\pages\AdminPanel.jsx)

Funciones actuales:

- revision de postulaciones de emprendedores
- aprobacion administrativa
- generacion y visualizacion de contrasena de acceso para demo
- CRUD de usuarios
- CRUD de categorias
- revision de microtiendas
- revision de productos
- revision de calificaciones
- consulta de PQRS
- panel de metricas institucionales
- boton de `Logout`

## 7.5 Panel emprendedor

Archivo principal: [`src/pages/EntrepreneurPanel.jsx`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\pages\EntrepreneurPanel.jsx)

Funciones actuales:

- cambio obligatorio de contrasena en el primer acceso
- CRUD de microtienda
- carga de logo
- CRUD de productos
- carga de imagenes de productos
- modificacion de precios
- control de inventario
- visualizacion de estados de aprobacion
- metricas del negocio
- boton de `Logout`

## 7.6 Contacto y PQR's

Archivo principal: [`src/pages/Interaction.jsx`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\pages\Interaction.jsx)

Funciones actuales:

- botones de contacto directo por WhatsApp
- envio real de PQRS al backend
- campos minimos:
  - nombre
  - correo electronico
  - tipo de solicitud
  - mensaje

## 7.7 Calificaciones y comentarios

Archivo principal: [`src/pages/Feedback.jsx`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\pages\Feedback.jsx)

Funciones actuales:

- registro de calificaciones
- comentarios
- datos personales obligatorios
- promedio de calificacion por emprendimiento
- revision administrativa previa a publicacion

## 7.8 Footer institucional

Componente: [`src/components/SiteFooter.jsx`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\components\SiteFooter.jsx)

Elementos incluidos:

- logo Soledad Conecta
- logo Nova Evolutions
- logo Alcaldia de Soledad
- logo CUC
- bloques institucionales y de aliados
- franja inferior legal

## 8. Flujo de usuarios

### Emprendedores

1. diligencian solicitud desde login
2. quedan en estado `PENDIENTE`
3. el administrador revisa la solicitud
4. al aprobarla se genera una contrasena
5. el emprendedor inicia sesion
6. en el primer acceso debe cambiar contrasena
7. luego puede administrar microtienda y productos

### Administrador

Tiene acceso completo a:

- postulaciones
- usuarios
- categorias
- revisiones
- PQRS
- metricas

## 9. Backend disponible

El backend actual ya no se limita a microtiendas. Ahora expone modulos separados para autenticacion, usuarios, categorias, microtiendas, productos, PQRS, calificaciones y metricas.

Archivos clave:

- [`backend/src/app.js`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\src\app.js)
- [`backend/src/routes/index.js`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\src\routes\index.js)
- [`backend/src/utils/jsonDb.js`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\src\utils\jsonDb.js)
- [`backend/src/middlewares/authMiddleware.js`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\src\middlewares\authMiddleware.js)

### API principal

Modulos:

- `/api/auth`
- `/api/usuarios`
- `/api/categorias`
- `/api/microtiendas`
- `/api/productos`
- `/api/pqrs`
- `/api/calificaciones`
- `/api/metricas`

### Caracteristicas backend

- arquitectura por capas
- persistencia JSON para demo
- autenticacion real
- control de acceso por rol
- cambio de contrasena en primer acceso
- CRUD administrativo y empresarial
- manejo centralizado de errores

## 10. Base de datos objetivo

Base de datos institucional prevista:

- `vitrina_empresarial`

Tablas contempladas en el diseno funcional:

- `rol`
- `usuario`
- `categoria`
- `microtienda`
- `producto`
- `calificacion`
- `pqrs`
- `metrica`

Observacion:

- la conexion completa a MySQL hace parte del diseño original
- el repositorio actualmente ejecuta una persistencia JSON para demostracion y despliegue simple

## 11. Rutas frontend

- `/` -> Home publico
- `/login` -> acceso por rol y postulacion
- `/panel-admin` -> panel administrador
- `/panel-emprendedor` -> panel emprendedor
- `/interaccion` -> contacto y PQR's
- `/calificaciones` -> calificaciones y comentarios
- `/microtiendas/:id` -> detalle publico de una tienda

## 12. Credenciales de demostracion

### Administrador

- correo: `admin@demo.com`
- contrasena: `123456`

### Emprendedor demo

- correo: `emprendedor@demo.com`
- contrasena: `123456`

Nota importante:

- las contrasenas nuevas de esta demo pueden quedar visibles para facilitar la muestra funcional
- esto es solo para demostracion y no aplica a produccion

## 13. Seguridad actual

La seguridad actual esta orientada a demostracion:

- token propio firmado por HMAC
- control de acceso por rol
- cambio obligatorio de contrasena en primer acceso
- compatibilidad con contrasenas antiguas hasheadas

Advertencia:

- las contrasenas visibles o en texto plano son inseguras para produccion

## 14. Imagenes y recursos graficos

Ubicacion:

- [`src/assets/soledad-logo.png`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\assets\soledad-logo.png)
- [`src/assets/nova-logo.png`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\assets\nova-logo.png)
- [`src/assets/alcaldia-logo.png`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\assets\alcaldia-logo.png)
- [`src/assets/cuc-logo.png`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\src\assets\cuc-logo.png)
- [`public/nova-favicon.png`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\public\nova-favicon.png)

## 15. Variables de entorno

### Frontend

Archivo de referencia:

- [`.env.example`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\.env.example)

Variables:

```env
VITE_API_URL=http://localhost:4000/api
```

### Backend

Archivo de referencia:

- [`backend/.env.example`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\.env.example)

Variables:

```env
PORT=4000
CLIENT_URL=http://localhost:5173
AUTH_TOKEN_SECRET=coloca-un-secreto-seguro-aqui
DATA_FILE=src/data/database.json
```

## 16. Como ejecutar el proyecto

### Frontend

Desde la raiz del proyecto:

```bash
npm install
npm run dev
```

Por defecto Vite usa:

- `http://localhost:5173`

### Backend

Desde la carpeta [`backend`](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend):

```bash
npm install
npm run dev
```

Por defecto Express usa:

- `http://localhost:4000`

## 17. Estado actual del sistema

### Implementado

- autenticacion real contra backend
- postulacion de emprendedores
- aprobacion administrativa con generacion automatica de contrasena
- cambio obligatorio de contrasena
- CRUD administrativo de usuarios y categorias
- CRUD de microtienda y productos para emprendedores
- revision administrativa de microtiendas, productos y calificaciones
- envio real de PQRS
- persistencia de calificaciones
- carga de imagenes para logo y productos en formato base64
- detalle publico por tienda
- metricas dinamicas calculadas desde el JSON
- frontend conectado con `axios`
- branding institucional y footer full width

### Pendiente

- migracion completa a MySQL si se decide abandonar la persistencia JSON
- endurecimiento de seguridad para produccion
- almacenamiento externo de imagenes
- pipeline de despliegue automatizado
- pruebas automatizadas
- validaciones adicionales de formularios

## 18. Riesgos y consideraciones tecnicas

- la persistencia en JSON es util para demo pero limitada para escalabilidad
- guardar imagenes en base64 dentro del JSON no es recomendable en produccion
- el manejo de contrasenas visibles se debe eliminar antes de un entorno real
- el entorno local puede presentar bloqueo de `vite build` por restriccion `spawn EPERM`

## 19. Documentacion adicional

- [README.md](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\README.md)
- [MANUAL-DESPLIEGUE.md](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\MANUAL-DESPLIEGUE.md)
- [backend/README.md](C:\Users\JULIO\OneDrive\Desktop\soledad-conecta\backend\README.md)

## 20. Recomendaciones para la siguiente fase

1. Definir si el proyecto seguira en JSON para demo o migrara completamente a MySQL.
2. Implementar hashing estricto de contrasenas para todos los usuarios.
3. Migrar imagenes a almacenamiento externo o carpeta administrada.
4. Agregar pruebas para autenticacion, PQRS, productos y calificaciones.
5. Conectar despliegue automatizado para frontend y backend.
6. Documentar casos de uso y flujos administrativos con mayor detalle.
