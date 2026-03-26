const jwt    = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'celifarma_secret_2024';

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. Inicia sesión.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.usuario = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Sesión expirada. Inicia sesión nuevamente.' });
  }
}

function soloAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo el administrador puede realizar esta acción.' });
  }
  next();
}

module.exports = { verificarToken, soloAdmin };