// src/controllers/pagoController.js
import db from '../database.js'; // Asegúrate de que esta ruta a tu conexión de BD sea correcta

// --- FUNCIONES EXISTENTES ADAPTADAS A ASYNC/AWAIT ---

// Registrar un nuevo pago
export const registrarPago = async (req, res) => {
    const { pedido_id, metodo_pago, total } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO pagos (pedido_id, metodo_pago, total, fecha_pago) VALUES (?, ?, ?, NOW())',
            [pedido_id, metodo_pago, total]
        );
        res.status(201).json({ message: 'Pago registrado correctamente', id: result.insertId });
    } catch (err) {
        console.error("Error al registrar pago:", err);
        res.status(500).json({ error: err.message });
    }
};

// Listar todos los pagos registrados
export const listarPagos = async (req, res) => {
    try {
        const [results] = await db.query(
            `SELECT pagos.*, u.nombre AS cliente, p.estado AS estado_pedido
             FROM pagos
             JOIN pedidos p ON pagos.pedido_id = p.id
             JOIN usuarios u ON p.usuario_id = u.id` // Asumo que quieres el estado del pedido en la lista de pagos
        );
        res.json(results);
    } catch (err) {
        console.error("Error al listar pagos:", err);
        res.status(500).json({ error: err.message });
    }
};

// Listar pedidos que aún no han sido pagados
// Esta función la adaptaremos para 'obtenerPedidosPendientesParaPagar' más abajo
export const listarPedidosSinPagar = async (req, res) => {
    try {
        const [results] = await db.query(
            `SELECT p.id AS pedido_id, u.nombre AS cliente, p.fecha_pedido, p.total, p.estado
             FROM pedidos p
             JOIN usuarios u ON p.usuario_id = u.id
             WHERE p.id NOT IN (SELECT pedido_id FROM pagos)`
        );
        res.json(results);
    } catch (err) {
        console.error("Error al listar pedidos sin pagar:", err);
        res.status(500).json({ error: err.message });
    }
};

// --- NUEVAS FUNCIONES PARA EL PANEL DE PROCESAMIENTO DE PAGOS ---

/**
 * Obtiene todos los pedidos con estado 'listo' que aún no han sido marcados como 'pagado'.
 * Incluye detalles del usuario y los ítems del pedido.
 */
export const obtenerPedidosPendientesParaPagar = async (req, res) => {
    const query = `
        SELECT
            p.id AS pedido_id,
            p.usuario_id,
            u.nombre AS usuario,
            p.mesa_id,
            p.fecha_pedido,
            p.estado,
            p.total,
            p.observaciones,
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
            p.estado = 'listo' -- Consideramos "listo" como pendiente de pago
            AND p.estado != 'pagado' -- Aseguramos que no estén ya pagados (si implementas un cambio a 'pagado')
        GROUP BY
            p.id, p.usuario_id, u.nombre, p.mesa_id, p.fecha_pedido, p.estado, p.total, p.observaciones
        ORDER BY
            p.fecha_pedido ASC;
    `;

    try {
        const [pedidosRows] = await db.query(query);

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
    } catch (err) {
        console.error("Error al obtener pedidos pendientes para pagar:", err);
        res.status(500).json({ message: "Error interno del servidor al obtener pedidos pendientes de pago.", error: err.message });
    }
};

/**
 * Actualiza el estado de un pedido a 'pagado'.
 */
export const marcarPedidoComoPagado = async (req, res) => {
    const { id } = req.params; // Obtenemos el ID del pedido de los parámetros de la URL
    // No necesitamos req.body.estado porque siempre lo estableceremos a 'pagado'

    try {
        const [result] = await db.query(
            'UPDATE pedidos SET estado = ? WHERE id = ?',
            ['pagado', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado o ya pagado.' });
        }

        res.json({ message: `Pedido ${id} marcado como pagado exitosamente.` });
    } catch (err) {
        console.error(`Error al marcar pedido ${id} como pagado:`, err);
        res.status(500).json({ message: "Error interno del servidor al marcar pedido como pagado.", error: err.message });
    }
};