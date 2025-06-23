// src/controllers/detallePedidoController.js
import db from '../database.js'; 

export const obtenerPedidosListos = async (req, res) => { // ¡Añadimos 'async' aquí!
    const query = `
        SELECT
            p.id AS pedido_id,
            p.usuario_id,
            p.mesa_id,
            p.fecha_pedido,
            p.estado,
            p.total,
            p.observaciones,
            u.nombre AS usuario, 
            GROUP_CONCAT(
                JSON_OBJECT(
                    'menu_id', dpd.menu_id,
                    'cantidad', dpd.cantidad,
                    'precio_unitario', dpd.precio_unitario,
                    'menu_item_nombre', m.nombre
                )
                ORDER BY dpd.menu_id
                SEPARATOR '|||'
            ) AS items_json
        FROM
            pedidos p
        JOIN
            detalle_pedido dpd ON p.id = dpd.pedido_id
        JOIN
            menu m ON dpd.menu_id = m.id
        JOIN
            usuarios u ON p.usuario_id = u.id
        WHERE
            p.estado = 'listo'
        GROUP BY
            p.id, p.usuario_id, p.mesa_id, p.fecha_pedido, p.estado, p.total, p.observaciones, u.nombre
        ORDER BY
            p.fecha_pedido ASC;
    `;

    try { // Usamos 'try/catch' para manejar errores de la promesa
        const [pedidosRows] = await db.query(query); // ¡Cambiamos a 'await' y desestructuramos!

        // Formatea los resultados (esta parte está bien)
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
    } catch (err) { // Capturamos el error de la promesa
        console.error("Error al obtener pedidos listos:", err);
        return res.status(500).json({ message: "Error interno del servidor al obtener pedidos listos.", error: err.message });
    }
};

// ... (otras funciones si las tienes en este controlador) ...