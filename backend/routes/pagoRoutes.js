// src/routes/pagoRoutes.js
import express from 'express';
import {
    registrarPago,
    listarPagos,
    listarPedidosSinPagar, // Puedes mantener esta si la usas en otro lugar
    obtenerPedidosPendientesParaPagar, // ¡NUEVO! Importa la función para el panel de pagos
    marcarPedidoComoPagado // ¡NUEVO! Importa la función para marcar como pagado
} from '../controllers/pagoController.js';

const router = express.Router();

// Ruta para registrar un nuevo pago (POST /api/pago/)
router.post('/', registrarPago);

// Ruta para listar todos los pagos registrados (GET /api/pago/)
router.get('/', listarPagos);

// Ruta para listar pedidos que aún no han sido pagados (GET /api/pago/sin-pagar)
// He cambiado el endpoint para que sea más claro y no choque con el de 'pendientes' del panel
router.get('/sin-pagar', listarPedidosSinPagar); 

// ¡NUEVA RUTA para el panel de procesamiento de pagos!
// Esta ruta es la que tu frontend está llamando para obtener pedidos pendientes: GET /api/pago/pendientes
router.get('/pendientes', obtenerPedidosPendientesParaPagar);

// ¡NUEVA RUTA para marcar un pedido como pagado!
// Esta ruta es la que tu frontend está llamando: PATCH /api/pago/:id/pagado
router.patch('/:id/pagado', marcarPedidoComoPagado);

export default router;
