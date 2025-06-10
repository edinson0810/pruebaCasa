import db from '../database.js';

// Obtener todos los pedidos
export const obtenerPedidos = (req, res) => {
  db.query('SELECT * FROM pedidos', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Obtener un pedido por ID
export const obtenerPedidoPorId = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM pedidos WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.json(results[0]);
  });
};

// Crear un nuevo pedido
export const crearPedido = (req, res) => {
  const { cliente_id, fecha, estado, total } = req.body;
  if (!cliente_id || !fecha || !estado || !total) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  db.query('INSERT INTO pedidos (cliente_id, fecha, estado, total) VALUES (?, ?, ?, ?)', 
    [cliente_id, fecha, estado, total], 
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Pedido creado', id: result.insertId });
    });
};

// Actualizar un pedido
export const actualizarPedido = (req, res) => {
  const { id } = req.params;
  const { cliente_id, fecha, estado, total } = req.body;

  db.query('UPDATE pedidos SET cliente_id = ?, fecha = ?, estado = ?, total = ? WHERE id = ?', 
    [cliente_id, fecha, estado, total, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Pedido actualizado' });
    });
};

// Eliminar un pedido
export const eliminarPedido = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM pedidos WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Pedido eliminado' });
  });
};
