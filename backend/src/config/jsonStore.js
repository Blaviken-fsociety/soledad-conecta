import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { hashPassword } from '../utils/password.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '../../data');
const dataFile = path.join(dataDir, 'database.json');

const seedState = {
  roles: [
    { id_rol: 1, nombre: 'ADMINISTRADOR' },
    { id_rol: 2, nombre: 'EMPRENDEDOR' },
  ],
  users: [
    {
      id_usuario: 1,
      nombre: 'Admin',
      correo: 'admin@demo.com',
      password: hashPassword('123456'),
      estado: true,
      fecha_creacion: '2026-04-04T00:00:00.000Z',
      id_rol: 1,
    },
    {
      id_usuario: 2,
      nombre: 'Emprendedor Demo',
      correo: 'emprendedor@demo.com',
      password: hashPassword('123456'),
      estado: true,
      fecha_creacion: '2026-04-04T00:00:00.000Z',
      id_rol: 2,
    },
  ],
  categories: [
    { id_categoria: 1, nombre: 'Moda', descripcion: 'Moda y accesorios', estado: true },
    { id_categoria: 2, nombre: 'Salud y Belleza', descripcion: 'Bienestar y cuidado personal', estado: true },
    { id_categoria: 3, nombre: 'Alimentos', descripcion: 'Comidas y bebidas', estado: true },
    { id_categoria: 4, nombre: 'Servicios', descripcion: 'Servicios profesionales', estado: true },
    { id_categoria: 5, nombre: 'Hogar', descripcion: 'Productos y soluciones para el hogar', estado: true },
    { id_categoria: 6, nombre: 'Restaurantes', descripcion: 'Restaurantes y cocina local', estado: true },
  ],
  microtiendas: [
    {
      id_microtienda: 1,
      nombre: 'Tienda Demo',
      descripcion: 'Venta de productos de prueba',
      sector_economico: 'Comercio',
      whatsapp: '3001234567',
      redes_sociales: '@tiendademo',
      estado: true,
      fecha_creacion: '2026-04-04T00:00:00.000Z',
      id_usuario: 2,
      id_categoria: 1,
    },
  ],
  products: [
    {
      id_producto: 1,
      nombre: 'Producto Demo',
      descripcion: 'Descripcion de prueba',
      precio: 50000,
      stock: 10,
      imagen_url: '',
      estado: true,
      fecha_creacion: '2026-04-04T00:00:00.000Z',
      id_microtienda: 1,
      id_categoria: 1,
    },
  ],
  ratings: [],
  pqrs: [],
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const ensureStoreExists = async () => {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(seedState, null, 2), 'utf8');
  }
};

export const readStore = async () => {
  await ensureStoreExists();
  const raw = await fs.readFile(dataFile, 'utf8');
  return JSON.parse(raw);
};

export const writeStore = async (nextState) => {
  await ensureStoreExists();
  await fs.writeFile(dataFile, JSON.stringify(nextState, null, 2), 'utf8');
  return nextState;
};

export const updateStore = async (updater) => {
  const currentState = await readStore();
  const draft = clone(currentState);
  const result = await updater(draft);
  await writeStore(draft);
  return result;
};

export const nextId = (items, key) => {
  const currentMax = items.reduce((max, item) => Math.max(max, Number(item[key]) || 0), 0);
  return currentMax + 1;
};
