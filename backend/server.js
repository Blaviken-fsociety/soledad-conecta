import app from './src/app.js';

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`Backend ejecutándose en http://localhost:${PORT}`);
});
