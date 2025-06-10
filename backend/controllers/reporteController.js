import db from '../database.js';

// Obtener todos los reportes
export const obtenerReportes = (req, res) => {
  db.query('SELECT * FROM reporte ORDER BY fecha DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Crear un nuevo reporte (basado en pagos y pedidos)
export const generarReporteDiario = (req, res) => {
  const { fecha } = req.body;

  // Calcular total ventas y total pedidos del día
  const queryVentas = `
    SELECT 
      COUNT(p.id) AS total_pedidos,
      SUM(p.total) AS total_ventas
    FROM pagos p
    WHERE DATE(p.fecha_pago) = ?
  `;

  db.query(queryVentas, [fecha], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const { total_pedidos, total_ventas } = result[0];

    const insertQuery = `
      INSERT INTO reporte (fecha, total_ventas, total_pedidos)
      VALUES (?, ?, ?)
    `;

    db.query(insertQuery, [fecha, total_ventas || 0, total_pedidos || 0], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ mensaje: 'Reporte generado correctamente' });
    });
  });
};

// Eliminar un reporte (opcional)
export const eliminarReporte = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM reporte WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Reporte eliminado correctamente' });
  });
};
