const express     = require('express');
const cors        = require('cors');
require('dotenv').config();

const crearTablas       = require('./db/tablas');
const rutasProductos    = require('./routes/productos');
const rutasVentas       = require('./routes/ventas');

const app  = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    mensaje:  '🏥 Farmacia API v3.0',
    estado:   'ok',
    rutas: {
      productos: '/api/productos',
      ventas:    '/api/ventas',
      resumen:   '/api/ventas/resumen'
    }
  });
});

// Rutas de la API
app.use('/api/productos', rutasProductos);
app.use('/api/ventas',    rutasVentas);

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  await crearTablas();
});