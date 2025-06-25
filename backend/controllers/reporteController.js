// src/controllers/reporteController.js
// src/controllers/reporteController.js
import db from '../database.js'; // Importa el pool de conexiones a la base de datos

// NOTA: Las funciones 'obtenerReportes', 'generarReporteDiario', 'eliminarReporte'
// que ya tenías se mantienen y se adaptan a 'mysql2/promise'.
// Las nuevas funciones para el panel de reportes son 'getPedidosPagadosReport' y 'getVentasPorFechaReport'.

// --- Funciones que ya tenías (adaptadas a mysql2/promise) ---

// Obtener todos los reportes de la tabla 'reporte' (si usas esa tabla para reportes pre-generados)
export const obtenerReportes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reporte ORDER BY fecha DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener reportes de la tabla "reporte":', err);
    res.status(500).json({ error: 'Error interno del servidor al obtener reportes.' });
  }
};

// Crear un nuevo reporte (basado en pagos y pedidos) y guardarlo en la tabla 'reporte'
export const generarReporteDiario = async (req, res) => {
  const { fecha } = req.body; // Se espera la fecha en formato 'YYYY-MM-DD'

  if (!fecha) {
    return res.status(400).json({ mensaje: 'La fecha es obligatoria para generar el reporte.' });
  }

  try {
    // Calcular total ventas y total pedidos del día desde la tabla 'pedidos'
    const queryVentas = `
      SELECT 
        COUNT(id) AS total_pedidos,
        SUM(total) AS total_ventas
      FROM pedidos
      WHERE DATE(fecha_pedido) = ? AND estado = 'pagado';
    `;
    const [resultVentas] = await db.query(queryVentas, [fecha]);
    
    // Si no hay ventas para esa fecha, los resultados pueden ser null o 0
    const total_pedidos = resultVentas[0].total_pedidos || 0;
    const total_ventas = resultVentas[0].total_ventas || 0;

    // Insertar/Actualizar en la tabla 'reporte'
    const insertQuery = `
      INSERT INTO reporte (fecha, total_ventas, total_pedidos)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE total_ventas = VALUES(total_ventas), total_pedidos = VALUES(total_pedidos);
      -- NOTA: 'ON DUPLICATE KEY UPDATE' es sintaxis específica de MySQL.
      -- Si usas otra DB, la lógica para UPSERT (INSERT OR UPDATE) sería diferente.
    `;
    await db.query(insertQuery, [fecha, total_ventas, total_pedidos]);

    res.status(201).json({ mensaje: 'Reporte diario generado/actualizado correctamente.' });

  } catch (err) {
    console.error('Error al generar el reporte diario:', err);
    res.status(500).json({ error: 'Error interno del servidor al generar el reporte diario.' });
  }
};

// Eliminar un reporte
export const eliminarReporte = async (req, res) => {
  const { id } = req.params; // ID del reporte en la tabla 'reporte'

  try {
    const [result] = await db.query('DELETE FROM reporte WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Reporte no encontrado.' });
    }
    res.status(200).json({ mensaje: 'Reporte eliminado correctamente.' });
  } catch (err) {
    console.error('Error al eliminar el reporte:', err);
    res.status(500).json({ error: 'Error interno del servidor al eliminar el reporte.' });
  }
};

// --- Nuevas funciones para el Panel de Reportes del Frontend ---

/**
 * Obtiene el reporte de pedidos pagados en un rango de fechas.
 * Endpoint: /api/reporte/pedidos-pagados?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getPedidosPagadosReport = async (req, res) => {
  const { startDate, endDate } = req.query; // Fechas del frontend (YYYY-MM-DD)

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Se requieren las fechas de inicio (startDate) y fin (endDate).' });
  }

  try {
    // Consulta para obtener pedidos pagados, uniendo con la tabla de usuarios para el nombre
    const query = `
      SELECT 
        p.id AS id,
        p.fecha_pedido AS fecha,
        p.total AS total,
        p.estado AS estado,
        -- p.metodo_pago AS metodo, -- Columna 'metodo_pago' comentada/eliminada si no existe en la tabla 'pedidos'
        u.nombre AS usuario -- Nombre del usuario desde la tabla 'usuarios'
      FROM pedidos p
      JOIN usuarios u ON p.usuario_id = u.id -- Unir por usuario_id en pedidos y id en usuarios
      WHERE p.estado = 'pagado'
      AND DATE(p.fecha_pedido) BETWEEN ? AND ?
      ORDER BY p.fecha_pedido ASC;
    `;
    const [rows] = await db.query(query, [startDate, endDate]);

    // Formatear los datos para el frontend
    const formattedData = rows.map(row => ({
      ...row,
      fecha: new Date(row.fecha).toISOString().split('T')[0], // Formato YYYY-MM-DD
      total: parseFloat(row.total) // Asegura que el total sea un número flotante
    }));

    res.status(200).json(formattedData);

  } catch (error) {
    console.error('Error al obtener reporte de pedidos pagados:', error);
    res.status(500).json({ message: 'Error interno del servidor al generar reporte de pedidos pagados.' });
  }
};

/**
 * Obtiene el reporte de ventas totales agrupadas por fecha en un rango.
 * Endpoint: /api/reporte/ventas-por-fecha?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getVentasPorFechaReport = async (req, res) => {
  const { startDate, endDate } = req.query; // Fechas del frontend (YYYY-MM-DD)

  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Se requieren las fechas de inicio (startDate) y fin (endDate).' });
  }

  try {
    // Consulta para sumar los totales de pedidos pagados por día
    const query = `
      SELECT 
        DATE(fecha_pedido) AS fecha_venta,
        SUM(total) AS total_diario
      FROM pedidos
      WHERE estado = 'pagado'
      AND DATE(fecha_pedido) BETWEEN ? AND ?
      GROUP BY DATE(fecha_pedido)
      ORDER BY fecha_venta ASC;
    `;
    const [rows] = await db.query(query, [startDate, endDate]);

    const labels = []; // Fechas para el eje X del gráfico
    const data = [];    // Totales de ventas para el eje Y del gráfico
    let totalGeneral = 0; // Suma de todas las ventas en el rango

    rows.forEach(row => {
      labels.push(row.fecha_venta.toISOString().split('T')[0]); // Formato YYYY-MM-DD
      const dailyTotal = parseFloat(row.total_diario);
      data.push(dailyTotal);
      totalGeneral += dailyTotal;
    });

    res.status(200).json({ labels, data, totalGeneral });

  } catch (error) {
    console.error('Error al obtener reporte de ventas por fecha:', error);
    res.status(500).json({ message: 'Error interno del servidor al generar reporte de ventas por fecha.' });
  }
};