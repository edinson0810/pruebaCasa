import db from '../database.js';

// Obtener todos los detalles
export const obtenerDetalles = (req, res) => {
  db.query('SELECT * FROM detalle_pedido', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Obtener detalles por pedido_id
export const obtenerDetallesPorPedido = (req, res) => {
  const { pedido_id } = req.params;
  db.query('SELECT * FROM detalle_pedido WHERE pedido_id = ?', [pedido_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Crear un nuevo detalle
export const crearDetalle = (req, res) => {
  const { pedido_id, menu_id, cantidad, precio_unitario } = req.body;

  if (!pedido_id || !menu_id || !cantidad || !precio_unitario) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  db.query(
    'INSERT INTO detalle_pedido (pedido_id, menu_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
    [pedido_id, menu_id, cantidad, precio_unitario],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Detalle registrado', id: result.insertId });
    }
  );
};

// Actualizar detalle
export const actualizarDetalle = (req, res) => {
  const { id } = req.params;
  const { pedido_id, menu_id, cantidad, precio_unitario } = req.body;

  db.query(
    'UPDATE detalle_pedido SET pedido_id = ?, menu_id = ?, cantidad = ?, precio_unitario = ? WHERE id = ?',
    [pedido_id, producto_id, cantidad, precio_unitario, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Detalle actualizado' });
    }
  );
};

// Eliminar detalle
export const eliminarDetalle = (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM detalle_pedido WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Detalle eliminado' });
  });
};
