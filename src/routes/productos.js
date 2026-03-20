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
    const { nombre, categoria, precio, stock_actual, stock_minimo, unidad } = req.body;

    // Validaciones
    if (!nombre || !categoria || !precio || !unidad) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (precio <= 0) {
      return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }

    const resultado = await pool.query(
      `INSERT INTO productos (nombre, categoria, precio, stock_actual, stock_minimo, unidad)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nombre, categoria, precio, stock_actual || 0, stock_minimo || 0, unidad]
    );

    res.status(201).json({
      mensaje:  'Producto registrado correctamente',
      producto: resultado.rows[0]
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un producto con ese nombre' });
    }
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /api/productos/:id — actualizar ──
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, precio, stock_actual, stock_minimo, unidad } = req.body;

    const resultado = await pool.query(
      `UPDATE productos
       SET nombre=$1, categoria=$2, precio=$3,
           stock_actual=$4, stock_minimo=$5, unidad=$6
       WHERE id=$7
       RETURNING *`,
      [nombre, categoria, precio, stock_actual, stock_minimo, unidad, id]
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

module.exports = router;