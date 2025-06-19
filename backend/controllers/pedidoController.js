// backend/controllers/pedidoController.js (VERSIÓN FINAL para MySQL/MariaDB)

import mysql from 'mysql2/promise'; // para poder usar beginTransaction/commit/rollback correctamente
import db from '../database.js';     // conexión básica para consultas simples


// Nota: Eliminamos queryAsync aquí porque db.execute ya devuelve promesas y es más directo.

// Obtener todos los pedidos
export const obtenerPedidos = async (req, res) => {
    try {
        const [pedidosRows] = await db.execute(`
            SELECT
                p.id,
                p.usuario_id,
                u.nombre AS nombre_usuario, -- Cambié de 'nombre_mesero' a 'nombre_usuario' y asumí 'nombre' en tabla 'usuarios'
                p.mesa_id,
                m.numero_mesa AS numero_mesa,
                p.fecha_pedido,
                p.estado,
                p.total
            FROM
                pedidos p
            JOIN
                usuarios u ON p.usuario_id = u.id
            JOIN
                mesas m ON p.mesa_id = m.id
            ORDER BY p.fecha_pedido DESC;
        `);

        // Para cada pedido, obtener sus detalles
        for (const pedido of pedidosRows) {
            const [detallesRows] = await db.execute(`
                SELECT
                    dp.menu_id,
                    me.nombre AS producto_nombre,
                    dp.cantidad,
                    dp.precio_unitario
                FROM
                    detalle_pedido dp
                JOIN
                    menu me ON dp.menu_id = me.id
                WHERE dp.pedido_id = ?;
            `, [pedido.id]); // Usar ? para MySQL
            pedido.detalles = detallesRows;
            // El total ya lo recuperamos de la tabla, pero podemos recalcularlo si queremos asegurar
            // pedido.total = detallesRows.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
        }

        res.json(pedidosRows);
    } catch (err) {
        console.error('Error al obtener pedidos:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener pedidos', error: err.message });
    }
};

// Obtener un pedido por ID
export const obtenerPedidoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const [pedidoRows] = await db.execute(`
            SELECT
                p.id,
                p.usuario_id,
                u.nombre AS nombre_usuario, -- Cambié a u.nombre
                p.mesa_id,
                m.numero_mesa AS numero_mesa,
                p.fecha_pedido,
                p.estado,
                p.total
            FROM
                pedidos p
            JOIN
                usuarios u ON p.usuario_id = u.id
            JOIN
                mesas m ON p.mesa_id = m.id
            WHERE p.id = ?;
        `, [id]); // Usar ? para MySQL

        if (pedidoRows.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado' });
        }
        const pedido = pedidoRows[0];

        const [detallesRows] = await db.execute(`
            SELECT
                dp.id,
                dp.menu_id,
                me.nombre AS producto_nombre,
                dp.cantidad,
                dp.precio_unitario
            FROM
                detalle_pedido dp
            JOIN
                menu me ON dp.menu_id = me.id
            WHERE dp.pedido_id = ?;
        `, [id]); // Usar ? para MySQL

        pedido.detalles = detallesRows;
        // El total ya lo recuperamos, pero podemos recalcularlo si queremos asegurar
        // pedido.total = detallesRows.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);

        res.json(pedido);
    } catch (err) {
        console.error('Error al obtener pedido por ID:', err);
        res.status(500).json({ message: 'Error interno del servidor al obtener pedido', error: err.message });
    }
};

// Crear un nuevo pedido
export const crearPedido = async (req, res) => {
  const { usuario_id, mesa_id, estado, items } = req.body;

  if (!usuario_id || !mesa_id || !items || items.length === 0) {
    return res.status(400).json({ message: 'Faltan datos obligatorios para crear el pedido.' });
  }

  let connection;
  try {
    // Usamos mysql2/promise para crear una nueva conexión temporal (no pool)
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Yamir081015',
      database: 'restaurant_system'
    });

    await connection.beginTransaction();

    let totalPedido = 0;
    for (const item of items) {
      const cantidad = parseFloat(item.cantidad);
      const precioUnitario = parseFloat(item.precio_unitario);

      if (isNaN(cantidad) || isNaN(precioUnitario)) {
        throw new Error(`Datos inválidos para producto con menu_id ${item.menu_id}`);
      }

      totalPedido += cantidad * precioUnitario;
    }

    // Insertar el pedido principal
    const [pedidoResult] = await connection.execute(
      `INSERT INTO pedidos (usuario_id, mesa_id, estado, fecha_pedido, total) VALUES (?, ?, ?, NOW(), ?)`,
      [usuario_id, mesa_id, estado || 'pendiente', totalPedido]
    );

    const pedidoId = pedidoResult.insertId;

    // Insertar los ítems del pedido
    for (const item of items) {
      await connection.execute(
        `INSERT INTO detalle_pedido (pedido_id, menu_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)`,
        [pedidoId, item.menu_id, item.cantidad, item.precio_unitario]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Pedido creado exitosamente', pedidoId });

  } catch (error) {
    if (connection) await connection.rollback();
    // console.error('❌ Error al crear pedido:', error.message);
    //  console.error('❌ Stack trace:', error.stack); 
    // res.status(500).json({ message: 'Error interno del servidor al crear pedido', error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};


// Actualizar un pedido
export const actualizarPedido = async (req, res) => {
    const { id } = req.params;
    const { usuario_id, mesa_id, estado, total } = req.body; // Añadir 'total' si se puede actualizar desde fuera

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
    if (total !== undefined) { // Permite actualizar el total si se envía
        updateFields.push('total = ?');
        updateValues.push(total);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron campos para actualizar.' });
    }

    const sql = `UPDATE pedidos SET ${updateFields.join(', ')} WHERE id = ?`;
    updateValues.push(id);

    try {
        const [result] = await db.execute(sql, updateValues);
        if (result.affectedRows === 0) { // affectedRows para MySQL
            return res.status(404).json({ message: 'Pedido no encontrado para actualizar' });
        }
        res.json({ message: 'Pedido actualizado exitosamente' });
    } catch (err) {
        console.error('Error al actualizar pedido:', err);
        res.status(500).json({ message: 'Error interno del servidor al actualizar pedido', error: err.message });
    }
};


// Eliminar un pedido
export const eliminarPedido = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute('DELETE FROM pedidos WHERE id = ?', [id]);
        if (result.affectedRows === 0) { // affectedRows para MySQL
            return res.status(404).json({ message: 'Pedido no encontrado para eliminar' });
        }
        res.json({ message: 'Pedido eliminado exitosamente' });
    } catch (err) {
        console.error('Error al eliminar pedido:', err);
        res.status(500).json({ message: 'Error interno del servidor al eliminar pedido', error: err.message });
    }
};