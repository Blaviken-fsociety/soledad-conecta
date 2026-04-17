import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultFilePath = path.resolve(__dirname, '../data/database.json');
const filePath = process.env.DATA_FILE
  ? path.resolve(process.cwd(), process.env.DATA_FILE)
  : defaultFilePath;

const createEmptyDb = () => ({
  roles: [],
  usuarios: [],
  categorias: [],
  microtiendas: [],
  productos: [],
  calificaciones: [],
  pqrs: [],
  metricas: [],
  microtienda_views: [],
  product_views: [],
});

const isDatabaseEmpty = (data) => {
  return [
    data.roles,
    data.usuarios,
    data.categorias,
    data.microtiendas,
    data.productos,
    data.calificaciones,
    data.pqrs,
  ].every((collection) => Array.isArray(collection) && collection.length === 0);
};

const getSeedData = async () => {
  if (filePath === defaultFilePath) {
    return createEmptyDb();
  }

  try {
    const rawSeed = await fs.readFile(defaultFilePath, 'utf8');
    return JSON.parse(rawSeed);
  } catch {
    return createEmptyDb();
  }
};

const ensureFile = async () => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  try {
    await fs.access(filePath);
  } catch {
    const seedData = await getSeedData();
    await fs.writeFile(filePath, JSON.stringify(seedData, null, 2), 'utf8');
  }
};

export const readData = async () => {
  await ensureFile();
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (filePath !== defaultFilePath && isDatabaseEmpty(parsed)) {
    const seedData = await getSeedData();
    await fs.writeFile(filePath, JSON.stringify(seedData, null, 2), 'utf8');
    return seedData;
  }

  return parsed;
};

export const writeData = async (data) => {
  await ensureFile();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  return data;
};

export const updateData = async (updater) => {
  const current = await readData();
  const next = await updater(current);
  await writeData(next);
  return next;
};

export const getNextId = (items, fieldName) => {
  const max = items.reduce((highest, item) => {
    return Math.max(highest, Number(item[fieldName] || 0));
  }, 0);

  return max + 1;
};
