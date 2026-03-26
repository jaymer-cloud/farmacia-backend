const express  = require('express');
const cors     = require('cors');
require('dotenv').config();

const crearTablas    = require('./db/tablas');
const rutasProductos = require('./routes/productos');
const rutasVentas    = require('./routes/ventas');
const rutasAuth      = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: '🏥 BOTICA Celifarma API v4.0', estado: 'ok' });
});

// Rutas públicas
app.use('/api/auth',     rutasAuth);
app.use('/api/ventas',   rutasVentas);
app.use('/api/productos', rutasProductos);

app.listen(PORT, async () => {
  console.log(`✅ Servidor Celifarma corriendo en http://localhost:${PORT}`);
  await crearTablas();
});