import db from '../database.js';

// Obtener pedidos pendientes (desde estado_pedido)
export const obtenerPedidosPendientes = (req, res) => {
  db.query(
    `SELECT ep.id, ep.pedido_id, ep.estado, ep.fecha_actualizacion, u.nombre AS usuario 
     FROM estado_pedido ep 
     JOIN pedidos p ON ep.pedido_id = p.id
     JOIN usuarios u ON p.usuario_id = u.id
     WHERE ep.estado = 'pendiente'`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

// Marcar pedido como "listo"
export const marcarPedidoListo = (req, res) => {
  const { pedido_id } = req.params;

  db.query(
    `UPDATE estado_pedido 
     SET estado = 'listo', fecha_actualizacion = NOW() 
     WHERE pedido_id = ?`,
    [pedido_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Pedido no encontrado o ya actualizado' });
      }

      res.json({ message: 'Pedido marcado como listo' });
    }
  );
};
