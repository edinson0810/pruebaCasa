// controllers/menuController.js
import db from '../database.js';

// Obtener todos los productos del menú
export const obtenerMenu = (req, res) => {
  db.query('SELECT * FROM menu', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener el menú', error: err });
    res.json(results);
  });
};

// Obtener un producto del menú por ID
export const obtenerProductoPorId = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM menu WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener el producto', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(results[0]);
  });
};

// Crear un nuevo producto
export const crearProducto = (req, res) => {
  const { nombre, descripcion, precio, categoria } = req.body;
  if (!nombre || !precio) return res.status(400).json({ message: 'Nombre y precio son obligatorios' });

  db.query(
    'INSERT INTO menu (nombre, descripcion, precio, categoria) VALUES (?, ?, ?, ?)',
    [nombre, descripcion, precio, categoria],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error al crear producto', error: err });
      res.status(201).json({ message: 'Producto agregado correctamente' });
    }
  );
};

// Actualizar un producto del menú
export const actualizarProducto = (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, categoria } = req.body;
  if (!nombre || !precio) return res.status(400).json({ message: 'Nombre y precio son obligatorios' });

  db.query(
    'UPDATE menu SET nombre = ?, descripcion = ?, precio = ?, categoria = ? WHERE id = ?',
    [nombre, descripcion, precio, categoria, id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error al actualizar producto', error: err });
      res.json({ message: 'Producto actualizado correctamente' });
    }
  );
};

// Eliminar un producto del menú
export const eliminarProducto = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM menu WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar producto', error: err });
    res.json({ message: 'Producto eliminado correctamente' });
  });
};
