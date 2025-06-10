import db from '../database.js';

// Registrar un nuevo pago
export const registrarPago = (req, res) => {
  const { pedido_id, metodo_pago, total } = req.body;

  db.query(
    'INSERT INTO pagos (pedido_id, metodo_pago, total, fecha_pago) VALUES (?, ?, ?, NOW())',
    [pedido_id, metodo_pago, total],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Pago registrado correctamente' });
    }
  );
};

// Listar todos los pagos registrados
export const listarPagos = (req, res) => {
  db.query(
    `SELECT pagos.*, u.nombre AS cliente
     FROM pagos
     JOIN pedidos ON pagos.pedido_id = pedidos.id
     JOIN usuarios u ON pedidos.usuario_id = u.id`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};

// Listar pedidos que aún no han sido pagados
export const listarPedidosSinPagar = (req, res) => {
  db.query(
    `SELECT pedidos.id AS pedido_id, u.nombre AS cliente, pedidos.fecha
     FROM pedidos
     JOIN usuarios u ON pedidos.usuario_id = u.id
     WHERE pedidos.id NOT IN (SELECT pedido_id FROM pagos)`,
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
};
