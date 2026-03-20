const pool = require('./conexion');

async function crearTablas() {
  try {

    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id             SERIAL PRIMARY KEY,
        nombre         VARCHAR(200) NOT NULL UNIQUE,
        categoria      VARCHAR(100) NOT NULL,
        precio         DECIMAL(10,2) NOT NULL,
        stock_actual   INTEGER NOT NULL DEFAULT 0,
        stock_minimo   INTEGER NOT NULL DEFAULT 0,
        unidad         VARCHAR(50) NOT NULL,
        fecha_registro TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla productos lista');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ventas (
        id              SERIAL PRIMARY KEY,
        id_producto     INTEGER REFERENCES productos(id),
        nombre_producto VARCHAR(200),
        cantidad        INTEGER NOT NULL,
        precio_unit     DECIMAL(10,2) NOT NULL,
        total           DECIMAL(10,2) NOT NULL,
        cajero          VARCHAR(100),
        fecha           TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla ventas lista');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS movimientos (
        id               SERIAL PRIMARY KEY,
        id_producto      INTEGER REFERENCES productos(id),
        nombre_producto  VARCHAR(200),
        tipo             VARCHAR(50),
        cantidad         INTEGER,
        stock_resultante INTEGER,
        observacion      TEXT,
        fecha            TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla movimientos lista');

    console.log('✅ Base de datos lista para usar');

  } catch (error) {
    console.error('❌ Error creando tablas:', error.message);
  }
}

module.exports = crearTablas;