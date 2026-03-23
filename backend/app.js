const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./src/config/db');

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 PRUEBA DE CONEXIÓN A DB
db.query('SELECT 1')
  .then(() => console.log('DB conectada'))
  .catch(err => console.error('Error DB:', err));

// 🔹 RUTA BASE
app.get('/', (req, res) => {
  res.send('API funcionando');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});