// controllers/menuController.js
import db from '../database.js'; // Asegúrate de que esté usando createPool con mysql2/promise

// Obtener todos los productos del menú
export const obtenerMenu = async (req, res) => {
    try {
        const [rows] = await db.execute(`
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
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener menú:', err);
        res.status(500).json({ message: 'Error al obtener el menú', error: err.message });
    }
};

// Crear un nuevo producto del menú
export const crearProducto = async (req, res) => {
    const { nombre, descripcion, precio, categoria } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({ message: 'Nombre y precio son obligatorios' });
    }

    try {
        await db.execute(
            'INSERT INTO menu (nombre, descripcion, precio, categoria_id) VALUES (?, ?, ?, ?)',
            [nombre, descripcion, precio, categoria]
        );
        res.status(201).json({ message: 'Producto agregado correctamente' });
    } catch (err) {
        console.error('Error al crear producto:', err);
        res.status(500).json({ message: 'Error al crear producto en la base de datos', error: err.message });
    }
};

// Obtener un producto por ID
export const obtenerProductoPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.execute(`
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
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error al obtener producto por ID:', err);
        res.status(500).json({ message: 'Error al obtener producto', error: err.message });
    }
};

// Actualizar un producto del menú
export const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({ message: 'Nombre y precio son obligatorios' });
    }

    try {
        const [result] = await db.execute(
            'UPDATE menu SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ? WHERE id = ?',
            [nombre, descripcion, precio, categoria, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado para actualizar' });
        }

        res.json({ message: 'Producto actualizado correctamente' });
    } catch (err) {
        console.error('Error al actualizar producto:', err);
        res.status(500).json({ message: 'Error al actualizar producto', error: err.message });
    }
};

// Eliminar un producto del menú
export const eliminarProducto = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.execute('DELETE FROM menu WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado para eliminar' });
        }

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
        console.error('Error al eliminar producto:', err);
        res.status(500).json({ message: 'Error al eliminar producto', error: err.message });
    }
};
