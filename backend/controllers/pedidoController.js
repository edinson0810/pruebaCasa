import db from '../database.js'; // Asegúrate de que la ruta a tu conexión de DB sea correcta

// Helper para ejecutar consultas con promesas (facilita el uso de async/await)
const queryAsync = (sql, values) => {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

// Obtener todos los pedidos (con join para usuario_nombre y detalles resumidos)
export const obtenerPedidos = async (req, res) => {
    try {
        // Obtenemos los pedidos principales
        const pedidos = await queryAsync(`
            SELECT 
                p.id, 
                p.usuario_id, 
                u.nombre_usuario AS nombre_mesero, -- Asumo que 'usuarios' tiene 'nombre_usuario'
                p.mesa_id, 
                m.numero_mesa AS numero_mesa,     -- Asumo que 'mesas' tiene 'numero_mesa'
                p.fecha_pedido, 
                p.estado
            FROM 
                pedidos p
            JOIN 
                usuarios u ON p.usuario_id = u.id
            JOIN 
                mesas m ON p.mesa_id = m.id
            ORDER BY p.fecha_pedido DESC;
        `);

        // Para cada pedido, obtener sus detalles
        for (const pedido of pedidos) {
            const detalles = await queryAsync(`
                SELECT 
                    dp.menu_id, 
                    me.nombre AS producto_nombre, -- Asumo que 'menu' tiene 'nombre'
                    dp.cantidad, 
                    dp.precio_unitario
                FROM 
                    detalle_pedido dp
                JOIN 
                    menu me ON dp.menu_id = me.id
                WHERE dp.pedido_id = ?;
            `, [pedido.id]);
            pedido.detalles = detalles; // Añade los detalles al objeto pedido
            
            // Calcula el total del pedido en el backend
            pedido.total = detalles.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
        }

        res.json(pedidos);
    } catch (err) {
        console.error('Error al obtener pedidos:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener pedidos', error: err.message });
    }
};

// Obtener un pedido por ID (con detalles completos)
export const obtenerPedidoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        // Obtener el pedido principal
        const pedido = await queryAsync(`
            SELECT 
                p.id, 
                p.usuario_id, 
                u.nombre_usuario AS nombre_mesero, 
                p.mesa_id, 
                m.numero_mesa AS numero_mesa, 
                p.fecha_pedido, 
                p.estado
            FROM 
                pedidos p
            JOIN 
                usuarios u ON p.usuario_id = u.id
            JOIN 
                mesas m ON p.mesa_id = m.id
            WHERE p.id = ?;
        `, [id]);

        if (pedido.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }

        // Obtener los detalles del pedido
        const detalles = await queryAsync(`
            SELECT 
                dp.id, -- id del detalle_pedido
                dp.menu_id, 
                me.nombre AS producto_nombre, 
                dp.cantidad, 
                dp.precio_unitario
            FROM 
                detalle_pedido dp
            JOIN 
                menu me ON dp.menu_id = me.id
            WHERE dp.pedido_id = ?;
        `, [id]);

        pedido[0].detalles = detalles; // Añade los detalles al pedido
        pedido[0].total = detalles.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0); // Calcular total

        res.json(pedido[0]);
    } catch (err) {
        console.error('Error al obtener pedido por ID:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener pedido', error: err.message });
    }
};

// Crear un nuevo pedido (¡Ahora incluye detalles de pedido y transacción!)
export const crearPedido = async (req, res) => {
    // req.body debe contener:
    // {
    //   usuario_id: INT,
    //   mesa_id: INT,
    //   estado: STRING (opcional, default 'Pendiente'),
    //   items: [ // Array de objetos para detalle_pedido
    //     { menu_id: INT, cantidad: INT },
    //     { menu_id: INT, cantidad: INT }
    //   ]
    // }
    const { usuario_id, mesa_id, estado = 'Pendiente', items } = req.body; // 'estado' con valor por defecto
    
    // Validaciones
    if (!usuario_id || !mesa_id || !items || items.length === 0) {
        return res.status(400).json({ message: 'Usuario, mesa e ítems del pedido son obligatorios.' });
    }

    // Iniciar una transacción
    try {
        await queryAsync('START TRANSACTION;');

        // 1. Insertar el pedido principal
        const pedidoResult = await queryAsync(
            'INSERT INTO pedidos (usuario_id, mesa_id, estado) VALUES (?, ?, ?)', // 'fecha_pedido' se llenará automáticamente
            [usuario_id, mesa_id, estado]
        );
        const pedidoId = pedidoResult.insertId;

        // 2. Insertar los detalles del pedido
        for (const item of items) {
            // Obtener el precio unitario actual del menú para asegurar consistencia
            const productoMenu = await queryAsync('SELECT precio FROM menu WHERE id = ?', [item.menu_id]);
            if (productoMenu.length === 0) {
                throw new Error(`Producto con ID ${item.menu_id} no encontrado.`);
            }
            const precioUnitario = productoMenu[0].precio;

            await queryAsync(
                'INSERT INTO detalle_pedido (pedido_id, menu_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [pedidoId, item.menu_id, item.cantidad, precioUnitario]
            );
        }

        await queryAsync('COMMIT;'); // Confirmar la transacción
        res.status(201).json({ message: 'Pedido creado exitosamente', id: pedidoId });

    } catch (err) {
        await queryAsync('ROLLBACK;'); // Revertir la transacción si algo falla
        console.error('Error al crear pedido (transacción):', err);
        res.status(500).json({ message: 'Error interno del servidor al crear pedido', error: err.message });
    }
};

// Actualizar un pedido (solo estado, usuario y mesa. Los ítems de detalle_pedido son más complejos de actualizar aquí)
export const actualizarPedido = async (req, res) => {
    const { id } = req.params;
    const { usuario_id, mesa_id, estado } = req.body; // No actualizamos ítems directamente aquí

    // Construir la consulta de forma dinámica para actualizar solo los campos presentes
    let updateFields = [];
    let updateValues = [];

    if (usuario_id !== undefined) {
        updateFields.push('usuario_id = ?');
        updateValues.push(usuario_id);
    }
    if (mesa_id !== undefined) {
        updateFields.push('mesa_id = ?');
        updateValues.push(mesa_id);
    }
    if (estado !== undefined) {
        updateFields.push('estado = ?');
        updateValues.push(estado);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron campos para actualizar.' });
    }

    const sql = `UPDATE pedidos SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(id);

    try {
        const result = await queryAsync(sql, updateValues);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado para actualizar' });
        }
        res.json({ message: 'Pedido actualizado exitosamente' });
    } catch (err) {
        console.error('Error al actualizar pedido:', err);
        res.status(500).json({ message: 'Error interno del servidor al actualizar pedido', error: err.message });
    }
};


// Eliminar un pedido (se eliminarán sus detalles debido a ON DELETE CASCADE)
export const eliminarPedido = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await queryAsync('DELETE FROM pedidos WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado para eliminar' });
        }
        res.json({ message: 'Pedido eliminado exitosamente' });
    } catch (err) {
        console.error('Error al eliminar pedido:', err);
        res.status(500).json({ message: 'Error interno del servidor al eliminar pedido', error: err.message });
    }
};
