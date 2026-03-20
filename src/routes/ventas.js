const express = require('express');
const router  = express.Router();
const pool    = require('../db/conexion');

// ── POST /api/ventas — registrar venta ──
router.post('/', async (req, res) => {
  try {
    const { id_producto, cantidad, cajero } = req.body;

    // Verificar que el producto existe y tiene stock
    const prodResult = await pool.query(
      'SELECT * FROM productos WHERE id = $1', [id_producto]
    );

    if (prodResult.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const producto = prodResult.rows[0];

    if (producto.stock_actual < cantidad) {
      return res.status(400).json({
        error: `Stock insuficiente. Disponible: ${producto.stock_actual}`
      });
    }

    // Calcular total
    const total      = producto.precio * cantidad;
    const nuevoStock = producto.stock_actual - cantidad;

    // Registrar la venta
    const ventaResult = await pool.query(
      `INSERT INTO ventas (id_producto, nombre_producto, cantidad, precio_unit, total, cajero)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id_producto, producto.nombre, cantidad, producto.precio, total, cajero]
    );

    // Descontar el stock
    await pool.query(
      'UPDATE productos SET stock_actual = $1 WHERE id = $2',
      [nuevoStock, id_producto]
    );

    // Registrar en movimientos
    await pool.query(
      `INSERT INTO movimientos (id_producto, nombre_producto, tipo, cantidad, stock_resultante, observacion)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id_producto, producto.nombre, 'VENTA', cantidad, nuevoStock,
       `Venta #${ventaResult.rows[0].id} — Cajero: ${cajero}`]
    );

    // Respuesta
    res.status(201).json({
      mensaje:    'Venta registrada correctamente',
      venta:      ventaResult.rows[0],
      stockNuevo: nuevoStock,
      alerta:     nuevoStock <= producto.stock_minimo
        ? `⚠️ Stock bajo: solo quedan ${nuevoStock} unidades`
        : null
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/ventas — obtener todas las ventas ──
router.get('/', async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    let query  = 'SELECT * FROM ventas';
    let params = [];

    if (desde && hasta) {
      query  += ' WHERE fecha::date >= $1 AND fecha::date <= $2';
      params  = [desde, hasta];
    }

    query += ' ORDER BY fecha DESC';
    const resultado = await pool.query(query, params);
    res.json(resultado.rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /api/ventas/resumen — totales generales ──
router.get('/resumen', async (req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        COUNT(*)                    AS total_ventas,
        COALESCE(SUM(total), 0)    AS total_recaudado,
        COALESCE(SUM(cantidad), 0) AS total_unidades
      FROM ventas
    `);
    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;