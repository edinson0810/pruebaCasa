import db from '../database.js'; // Asegúrate de que esta ruta a tu configuración de base de datos sea correcta

// Obtener pedidos pendientes para la vista de cocina
export const obtenerPedidosPendientes = async (req, res) => {
    try {
        const pedidosQuery = `
            SELECT
                p.id AS pedido_id,
                p.usuario_id,
                p.mesa_id,
                p.fecha_pedido,
                p.estado, -- <--- USAMOS EL CAMPO 'estado' DIRECTAMENTE DE LA TABLA 'pedidos'
                p.total,
                p.observaciones,
                u.nombre AS usuario, -- Usamos 'nombre' de la tabla 'usuarios'
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'menu_id', dpd.menu_id,
                        'cantidad', dpd.cantidad,
                        'precio_unitario', dpd.precio_unitario,
                        'menu_item_nombre', m.nombre -- Usamos 'nombre' de la tabla 'menu'
                    )
                    ORDER BY dpd.menu_id
                    SEPARATOR '|||'
                ) AS items_json
            FROM
                pedidos p
            JOIN
                detalle_pedido dpd ON p.id = dpd.pedido_id -- Usamos 'detalle_pedido'
            JOIN
                menu m ON dpd.menu_id = m.id -- Usamos 'menu' para los ítems del menú
            JOIN
                usuarios u ON p.usuario_id = u.id -- Usamos 'usuarios'
            WHERE
                p.estado = 'pendiente' -- <--- FILTRAMOS POR 'estado' DIRECTAMENTE DE LA TABLA 'pedidos'
            GROUP BY
                p.id, p.usuario_id, p.mesa_id, p.fecha_pedido, p.estado, p.total, p.observaciones, u.nombre
            ORDER BY
                p.fecha_pedido ASC;
        `;

        const [pedidosRows] = await db.execute(pedidosQuery); // db.execute para mysql2/promise

        const pedidosFormateados = pedidosRows.map(row => {
            const items = row.items_json ?
                row.items_json.split('|||').map(itemStr => JSON.parse(itemStr)) :
                [];
            return {
                pedido_id: row.pedido_id,
                usuario_id: row.usuario_id,
                usuario: row.usuario,
                mesa_id: row.mesa_id,
                fecha_pedido: row.fecha_pedido,
                estado: row.estado,
                total: row.total,
                observaciones: row.observaciones,
                items: items
            };
        });

        res.json(pedidosFormateados);
    } catch (error) {
        console.error("Error al obtener pedidos pendientes para cocina:", error);
        res.status(500).json({ message: "Error interno del servidor al obtener pedidos pendientes.", error: error.message });
    }
};

// Marcar pedido como "listo"
export const marcarPedidoListo = async (req, res) => {
    const { pedido_id } = req.params;
    const { estado } = req.body; // El frontend enviará { estado: 'listo' }

    if (estado !== 'listo') {
        return res.status(400).json({ message: "Solo se permite cambiar el estado a 'listo' desde esta interfaz de cocina." });
    }

    try {
        // Actualizar el estado DIRECTAMENTE EN LA TABLA 'pedidos'
        const updateQuery = `
            UPDATE pedidos
            SET estado = ?
            WHERE id = ? AND estado = 'pendiente'; -- Asegúrate de que solo se actualice si estaba pendiente
        `;
        const [result] = await db.execute(updateQuery, [estado, pedido_id]); // db.execute

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado o ya no está en estado "pendiente".' });
        }

        res.json({ message: `Pedido ${pedido_id} marcado como listo.` });
    } catch (error) {
        console.error(`Error al actualizar el estado del pedido ${pedido_id}:`, error);
        res.status(500).json({ message: "Error interno del servidor al actualizar el estado del pedido.", error: error.message });
    }
};