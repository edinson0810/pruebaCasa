// controllers/menuController.js
// backend/controllers/menuController.js

import db from '../database.js'; // Asegúrate de que la ruta a tu conexión de DB sea correcta

// Función para obtener todos los productos del menú (modificada)
export const obtenerMenu = (req, res) => {
    // Consulta SQL con JOIN para obtener el nombre de la categoría
    const sql = `
        SELECT 
            m.id, 
            m.nombre, 
            m.descripcion, 
            m.precio, 
            m.categoria_id, 
            c.nombre AS categoria_nombre 
        FROM 
            menu m
        JOIN 
            categorias c ON m.categoria_id = c.id;
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error al obtener menú:', err);
            return res.status(500).json({ message: 'Error al obtener el menú', error: err.message });
        }
        res.json(results);
    });
};

// Función para crear un nuevo producto (con mejoras para depuración)
export const crearProducto = (req, res) => {
    const { nombre, descripcion, precio, categoria } = req.body;
    console.log('Datos recibidos en backend:', { nombre, descripcion, precio, categoria });
    if (!nombre || !precio) return res.status(400).json({ message: 'Nombre y precio son obligatorios' });

    db.query(
        'INSERT INTO menu (nombre, descripcion, precio, categoria_id) VALUES (?, ?, ?, ?)',
        [nombre, descripcion, precio, categoria], // 'categoria' del req.body se mapeará a categoria_id
        (err, result) => {
            if (err) {
                console.error('ERROR EN DB (crearProducto):', err); // Loggea el objeto de error completo
                return res.status(500).json({ message: 'Error al crear producto en la base de datos', error: err.message });
            }
            res.status(201).json({ message: 'Producto agregado correctamente' });
        }
    );
};

// Función para obtener un producto por ID
export const obtenerProductoPorId = (req, res) => {
    const { id } = req.params;
    // También podrías hacer un JOIN aquí si necesitas el nombre de la categoría para edición
    const sql = `
        SELECT 
            m.id, 
            m.nombre, 
            m.descripcion, 
            m.precio, 
            m.categoria_id, 
            c.nombre AS categoria_nombre 
        FROM 
            menu m
        JOIN 
            categorias c ON m.categoria_id = c.id
        WHERE m.id = ?;
    `;
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener producto por ID:', err);
            return res.status(500).json({ message: 'Error al obtener producto', error: err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(result[0]);
    });
};


// Función para actualizar un producto del menú
export const actualizarProducto = (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria } = req.body;
    if (!nombre || !precio) return res.status(400).json({ message: 'Nombre y precio son obligatorios' });

    db.query(
        'UPDATE menu SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ? WHERE id = ?',
        [nombre, descripcion, precio, categoria, id], // 'categoria' del req.body se mapeará a categoria_id
        (err, result) => {
            if (err) {
                console.error('ERROR EN DB (actualizarProducto):', err); // Loggea el objeto de error completo
                return res.status(500).json({ message: 'Error al actualizar producto en la base de datos', error: err.message });
            }
            res.json({ message: 'Producto actualizado correctamente' });
        }
    );
};

// Función para eliminar un producto del menú
export const eliminarProducto = (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM menu WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar producto:', err);
            return res.status(500).json({ message: 'Error al eliminar producto', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado para eliminar' });
        }
        res.json({ message: 'Producto eliminado correctamente' });
    });
};
