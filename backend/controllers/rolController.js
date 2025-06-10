// controllers/rolController.js
import db from '../database.js';

// Obtener todos los roles
export const obtenerRoles = (req, res) => {
  db.query('SELECT * FROM roles', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener roles', error: err });
    res.json(results);
  });
};

// Obtener un rol por ID
export const obtenerRolPorId = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM roles WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener rol', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Rol no encontrado' });
    res.json(results[0]);
  });
};

// Crear un nuevo rol
export const crearRol = (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ message: 'El nombre del rol es obligatorio' });

  db.query('INSERT INTO roles (nombre) VALUES (?)', [nombre], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al crear rol', error: err });
    res.status(201).json({ message: 'Rol creado correctamente' });
  });
};

// Actualizar un rol
export const actualizarRol = (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ message: 'El nombre del rol es obligatorio' });

  db.query('UPDATE roles SET nombre = ? WHERE id = ?', [nombre, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar rol', error: err });
    res.json({ message: 'Rol actualizado correctamente' });
  });
};

// Eliminar un rol
export const eliminarRol = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM roles WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar rol', error: err });
    res.json({ message: 'Rol eliminado correctamente' });
  });
};
