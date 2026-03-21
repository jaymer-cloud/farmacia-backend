const PDFDocument = require('pdfkit');

function generarComprobantePDF(venta, res) {
  const doc = new PDFDocument({
    size:    [226, 400],
    margins: { top: 20, bottom: 20, left: 20, right: 20 }
  });

  // Configurar headers para descarga
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=boleta-${venta.id}.pdf`);
  doc.pipe(res);

  const verde  = '#2d6a4f';
  const gris   = '#6b7280';
  const negro  = '#1a1a1a';
  const ancho  = 186;
  let   y      = 20;

  // ── Logo y nombre ──
  try {
    var path = require('path');
    var logoPath = path.join(__dirname, 'logo.png');
    doc.image(logoPath, 20, y, { width: 50, align: 'center' });
    y += 58;
  } catch(e) {
    y += 10;
  }

  doc.fontSize(11).fillColor(verde).font('Helvetica-Bold')
     .text('BOTICA Celifarma', 20, y, { align: 'center', width: ancho });
  y += 14;

  doc.fontSize(7).fillColor(gris).font('Helvetica')
     .text('RUC: 10479593677', 20, y, { align: 'center', width: ancho });
  y += 10;

  doc.text('Av. Mariscal Castilla N° 5013 - Huanta', 20, y, { align: 'center', width: ancho });
  y += 10;

  doc.text('Tel: 914775818', 20, y, { align: 'center', width: ancho });
  y += 14;

  // ── Línea divisoria ──
  doc.moveTo(20, y).lineTo(206, y).dash(3, { space: 3 }).stroke(gris);
  y += 10;

  // ── Tipo de comprobante ──
  doc.fontSize(9).fillColor(negro).font('Helvetica-Bold')
     .text('BOLETA DE VENTA', 20, y, { align: 'center', width: ancho });
  y += 12;

  doc.fontSize(7).fillColor(gris).font('Helvetica')
     .text(`N° B001-${String(venta.id).padStart(6, '0')}`, 20, y, { align: 'center', width: ancho });
  y += 14;

  // ── Línea divisoria ──
  doc.moveTo(20, y).lineTo(206, y).dash(3, { space: 3 }).stroke(gris);
  y += 10;

  // ── Datos de la venta ──
  const fecha = new Date(venta.fecha).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  doc.fontSize(7).fillColor(negro).font('Helvetica');

  doc.text('Fecha:', 20, y).text(fecha, 80, y);
  y += 11;

  doc.text('Cajero:', 20, y).text(venta.cajero || 'Cajero', 80, y);
  y += 11;

  doc.text('Cliente:', 20, y).text('Consumidor final', 80, y);
  y += 14;

  // ── Línea divisoria ──
  doc.moveTo(20, y).lineTo(206, y).dash(3, { space: 3 }).stroke(gris);
  y += 10;

  // ── Encabezado tabla ──
  doc.fontSize(7).fillColor(gris).font('Helvetica-Bold');
  doc.text('Producto',   20, y);
  doc.text('Cant.',     120, y, { width: 20, align: 'right' });
  doc.text('P.Unit',    142, y, { width: 28, align: 'right' });
  doc.text('Total',     172, y, { width: 34, align: 'right' });
  y += 10;

  doc.moveTo(20, y).lineTo(206, y).stroke(gris);
  y += 6;

  // ── Fila del producto ──
  doc.fontSize(7).fillColor(negro).font('Helvetica');

  var nombreProducto = venta.nombre_producto || '';
  if (nombreProducto.length > 18) {
    nombreProducto = nombreProducto.substring(0, 18) + '...';
  }

  doc.text(nombreProducto,                          20, y, { width: 96 });
  doc.text(String(venta.cantidad),                 120, y, { width: 20, align: 'right' });
  doc.text('S/ ' + parseFloat(venta.precio_unit).toFixed(2), 142, y, { width: 28, align: 'right' });
  doc.text('S/ ' + parseFloat(venta.total).toFixed(2),       172, y, { width: 34, align: 'right' });
  y += 16;

  doc.moveTo(20, y).lineTo(206, y).stroke(gris);
  y += 10;

  // ── Totales ──
  var subtotal = parseFloat(venta.total);
  var igv      = subtotal * 0.18;
  var total    = subtotal;

  doc.fontSize(7).fillColor(gris).font('Helvetica');
  doc.text('Subtotal:', 20, y, { width: 130 });
  doc.text('S/ ' + (subtotal / 1.18).toFixed(2), 152, y, { width: 54, align: 'right' });
  y += 11;

  doc.text('IGV (18%):', 20, y, { width: 130 });
  doc.text('S/ ' + (subtotal - subtotal / 1.18).toFixed(2), 152, y, { width: 54, align: 'right' });
  y += 11;

  // Total destacado
  doc.fontSize(9).fillColor(verde).font('Helvetica-Bold');
  doc.text('TOTAL:', 20, y, { width: 130 });
  doc.text('S/ ' + total.toFixed(2), 152, y, { width: 54, align: 'right' });
  y += 18;

  // ── Línea divisoria ──
  doc.moveTo(20, y).lineTo(206, y).dash(3, { space: 3 }).stroke(gris);
  y += 12;

  // ── Pie del comprobante ──
  doc.fontSize(7).fillColor(gris).font('Helvetica')
     .text('¡Gracias por su compra!', 20, y, { align: 'center', width: ancho });
  y += 10;

  doc.text('Conserve este comprobante', 20, y, { align: 'center', width: ancho });
  y += 10;

  doc.fontSize(6).text('Documento generado electrónicamente', 20, y, { align: 'center', width: ancho });

  doc.end();
}

module.exports = generarComprobantePDF;