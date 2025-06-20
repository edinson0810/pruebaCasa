// backend/controllers/pedidoController.js (VERSIÓN FINAL para MySQL/MariaDB)
import db from '../database.js'; // Asumo que este es tu archivo de conexión a la base de datos

// Función para obtener todos los pedidos (maneja el error 'Unknown column')
export const obtenerPedidos = async (req, res) => {
    try {
        // Selecciona solo las columnas de la tabla 'pedidos'.
        // Si necesitas el nombre de usuario, asegúrate de que la tabla 'usuarios'
        // tenga una columna llamada 'nombre_usuario' y que la unión sea correcta.
        // Por ahora, para evitar el error, seleccionamos solo de pedidos.
        const [rows] = await db.execute(`
            SELECT p.id, p.usuario_id, p.mesa_id, p.fecha_pedido, p.estado, p.total, p.observaciones
            FROM pedidos p
            ORDER BY p.fecha_pedido DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener pedidos:', err);
        // Si el error original es por columna desconocida, podrías enviar un mensaje más específico.
        res.status(500).json({ message: 'Error interno del servidor al obtener pedidos', error: err.message });
    }
};

// Función para obtener un pedido por ID
export const obtenerPedidoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const [pedidoRows] = await db.execute('SELECT * FROM pedidos WHERE id = ?', [id]);
        if (pedidoRows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        const [detalleRows] = await db.execute('SELECT * FROM detalle_pedido WHERE pedido_id = ?', [id]);

        const pedido = {
            ...pedidoRows[0],
            items: detalleRows
        };
        res.json(pedido);
    } catch (err) {
        console.error('Error al obtener el pedido por ID:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener el pedido', error: err.message });
    }
};

// Función para crear un nuevo pedido con detalle, total y observaciones
export const crearPedido = async (req, res) => {
    // Desestructuramos todos los campos esperados del body, incluyendo 'observaciones'
    const { usuario_id, mesa_id, estado, observaciones, items } = req.body;

    // Validaciones básicas de entrada
    if (!usuario_id || !mesa_id || !items || items.length === 0) {
        return res.status(400).json({ message: 'Faltan datos obligatorios del pedido (usuario_id, mesa_id, o items).' });
    }

    const conn = await db.getConnection(); // Obtiene una conexión del pool
    try {
        await conn.beginTransaction(); // Inicia la transacción

        let calculatedTotal = 0;
        for (const item of items) {
            // Obtener el precio actual del menú para calcular el total en el backend de forma segura
            const [menuItem] = await conn.execute('SELECT precio FROM menu WHERE id = ?', [item.menu_id]);
            if (menuItem.length === 0) {
                await conn.rollback(); // Si no se encuentra el producto, revierte
                return res.status(400).json({ message: `Producto con ID ${item.menu_id} no encontrado en el menú.` });
            }
            const actualPrice = parseFloat(menuItem[0].precio);
            calculatedTotal += item.cantidad * actualPrice;
        }

        const finalTotalToSave = calculatedTotal; // El total calculado por el backend

        // Inserta el pedido principal, incluyendo 'observaciones' y 'total'
        const [pedidoResult] = await conn.execute(
            'INSERT INTO pedidos (usuario_id, mesa_id, estado, observaciones, total, fecha_pedido) VALUES (?, ?, ?, ?, ?, NOW())',
            [usuario_id, mesa_id, estado, observaciones || null, finalTotalToSave] // observaciones puede ser null
        );

        const pedidoId = pedidoResult.insertId;

        // Inserta los detalles del pedido
        for (const item of items) {
            await conn.execute(
                'INSERT INTO detalle_pedido (pedido_id, menu_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [pedidoId, item.menu_id, item.cantidad, item.precio_unitario]
            );
        }

        await conn.commit(); // Confirma la transacción
        res.status(201).json({ message: 'Pedido creado correctamente', pedidoId: pedidoId, total: finalTotalToSave });
    } catch (err) {
        await conn.rollback(); // Revierte si hay algún error
        console.error('Error al crear el pedido:', err);
        res.status(500).json({ message: 'Error al crear el pedido', error: err.message });
    } finally {
        conn.release(); // Libera la conexión de vuelta al pool
    }
};

// Función para actualizar un pedido (pedido + detalle, total y observaciones)
export const actualizarPedido = async (req, res) => {
    const { id } = req.params;
    const { usuario_id, mesa_id, estado, observaciones, items } = req.body;

    if (!usuario_id || !mesa_id || !estado || !items || items.length === 0) {
        return res.status(400).json({ message: 'Faltan datos para actualizar el pedido.' });
    }

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        let calculatedTotal = 0;
        for (const item of items) {
            const [menuItem] = await conn.execute('SELECT precio FROM menu WHERE id = ?', [item.menu_id]);
            if (menuItem.length === 0) {
                await conn.rollback();
                return res.status(400).json({ message: `Producto con ID ${item.menu_id} no encontrado para la actualización.` });
            }
            const actualPrice = parseFloat(menuItem[0].precio);
            calculatedTotal += item.cantidad * actualPrice;
        }
        const finalTotalToSave = calculatedTotal;

        // Actualiza el pedido principal, incluyendo 'observaciones' y 'total'
        await conn.execute(
            'UPDATE pedidos SET usuario_id = ?, mesa_id = ?, estado = ?, observaciones = ?, total = ? WHERE id = ?',
            [usuario_id, mesa_id, estado, observaciones || null, finalTotalToSave, id]
        );

        // Eliminar y reinsertar los detalles del pedido
        await conn.execute('DELETE FROM detalle_pedido WHERE pedido_id = ?', [id]);

        for (const item of items) {
            await conn.execute(
                'INSERT INTO detalle_pedido (pedido_id, menu_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [id, item.menu_id, item.cantidad, item.precio_unitario]
            );
        }

        await conn.commit();
        res.status(200).json({ message: 'Pedido actualizado correctamente', total: finalTotalToSave });
    } catch (err) {
        await conn.rollback();
        console.error('Error al actualizar el pedido:', err);
        res.status(500).json({ message: 'Error al actualizar el pedido', error: err.message });
    } finally {
        conn.release();
    }
};

// Función para eliminar un pedido
export const eliminarPedido = async (req, res) => {
    const { id } = req.params;
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        await conn.execute('DELETE FROM detalle_pedido WHERE pedido_id = ?', [id]);
        const [result] = await conn.execute('DELETE FROM pedidos WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ message: 'Pedido no encontrado para eliminar' });
        }
        await conn.commit();
        res.status(200).json({ message: 'Pedido eliminado correctamente' });
    } catch (err) {
        await conn.rollback();
        console.error('Error al eliminar el pedido:', err);
        res.status(500).json({ message: 'Error al eliminar el pedido', error: err.message });
    } finally {
        conn.release();
    }
};