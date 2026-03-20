const express    = require('express');
const router     = express.Router();
const pool       = require('../db/conexion');

// ── GET /api/productos — obtener todos ──
router.get('/', async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT * FROM productos ORDER BY id ASC'
    );
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/productos/:id — obtener uno ──
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query(
      'SELECT * FROM productos WHERE id = $1', [id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST /api/productos — crear nuevo ──
router.post('/', async (req, res) => {
  try {
    const nombre         = req.body.nombre;
    const categoria      = req.body.categoria;
    const precio         = req.body.precio;
    const stock_actual   = req.body.stock_actual  || 0;
    const stock_minimo   = req.body.stock_minimo  || 0;
    const unidad         = req.body.unidad;
    const codigo_barras  = req.body.codigo_barras || null;

    // Validaciones
    if (!nombre || !categoria || !precio || !unidad) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (precio <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }

    const resultado = await pool.query(
      `INSERT INTO productos (codigo_barras, nombre, categoria, precio, stock_actual, stock_minimo, unidad)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [codigo_barras, nombre, categoria, precio, stock_actual, stock_minimo, unidad]
    );

    res.status(201).json({
      mensaje:  'Producto registrado correctamente',
      producto: resultado.rows[0]
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un producto con ese nombre o código de barras' });
    }
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/productos/:id — actualizar ──
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const nombre        = req.body.nombre;
    const categoria     = req.body.categoria;
    const precio        = req.body.precio;
    const stock_actual  = req.body.stock_actual;
    const stock_minimo  = req.body.stock_minimo;
    const unidad        = req.body.unidad;
    const codigo_barras = req.body.codigo_barras || null;

    const resultado = await pool.query(
      `UPDATE productos
       SET codigo_barras=$1, nombre=$2, categoria=$3, precio=$4,
           stock_actual=$5, stock_minimo=$6, unidad=$7
       WHERE id=$8
       RETURNING *`,
      [codigo_barras, nombre, categoria, precio, stock_actual, stock_minimo, unidad, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({
      mensaje:  'Producto actualizado correctamente',
      producto: resultado.rows[0]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /api/productos/:id — eliminar ──
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM productos WHERE id = $1', [id]);
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ── GET /api/productos/barras/:codigo — buscar por código de barras ──
router.get('/barras/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;
    const resultado  = await pool.query(
      'SELECT * FROM productos WHERE codigo_barras = $1', [codigo]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado con ese código de barras'
      });
    }

    res.json(resultado.rows[0]);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;