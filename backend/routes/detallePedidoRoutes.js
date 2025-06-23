// src/routes/detallePedidoRoutes.js
// Este archivo define las rutas para las operaciones relacionadas con detalle_pedido,
// y ahora incluye la ruta para obtener pedidos 'listos'.

import express from 'express';
// Importa la función obtenerPedidosListos desde el controlador adecuado
import { obtenerPedidosListos } from '../controllers/detallePedidoController.js'; 

const router = express.Router();

// Define la ruta GET para obtener los pedidos con estado 'listo'
// Este endpoint se alcanzará como /api/detalles/listos
router.get('/listos', obtenerPedidosListos); 

// **Nota:** Si tu archivo detallePedidoRoutes.js contenía otras rutas CRUD para detalle_pedido
// (ej. '/', '/:id'), DEBERÍAN AGREGARSE AQUÍ JUNTO A la ruta '/listos'.
// Por ejemplo:
/*
import { crearDetalle, actualizarDetalle, eliminarDetalle, obtenerDetalles, obtenerDetallesPorPedido } from '../controllers/detallePedidoController.js';
router.get('/', obtenerDetalles); // Para obtener todos los detalles
router.get('/:pedido_id', obtenerDetallesPorPedido); // Para obtener detalles de un pedido específico
router.post('/', crearDetalle);
router.put('/:id', actualizarDetalle);
router.delete('/:id', eliminarDetalle);
*/

export default router;