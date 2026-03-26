const pool = require('./conexion');

async function crearTablas() {
  try {

    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id             SERIAL PRIMARY KEY,
        codigo_barras   VARCHAR(50) UNIQUE,
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
// ── Tabla: usuarios ──
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id             SERIAL PRIMARY KEY,
        nombre         VARCHAR(100) NOT NULL,
        email          VARCHAR(150) NOT NULL UNIQUE,
        password       VARCHAR(255) NOT NULL,
        rol            VARCHAR(20)  NOT NULL DEFAULT 'cajero',
        activo         BOOLEAN DEFAULT true,
        fecha_registro TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla usuarios lista');

    // ── Crear admin por defecto ──
    const adminExiste = await pool.query(
      "SELECT id FROM usuarios WHERE email = 'admin@celifarma.com'"
    );
    if (adminExiste.rows.length === 0) {
      const bcrypt   = require('bcryptjs');
      const passHash = await bcrypt.hash('Celifarma2024', 10);
      await pool.query(
        `INSERT INTO usuarios (nombre, email, password, rol)
         VALUES ($1, $2, $3, $4)`,
        ['Administrador', 'admin@celifarma.com', passHash, 'admin']
      );
      console.log('✅ Admin creado: admin@celifarma.com / Celifarma2024');
    }

    console.log('✅ Base de datos lista para usar');

  } catch (error) {
    console.error('❌ Error creando tablas:', error.message);
  }
}

module.exports = crearTablas;