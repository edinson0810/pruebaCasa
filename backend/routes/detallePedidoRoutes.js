import express from 'express';
import {
  obtenerDetalles,
  obtenerDetallesPorPedido,
  crearDetalle,
  actualizarDetalle,
  eliminarDetalle
} from '../controllers/detallePedidoController.js';

const router = express.Router();

router.get('/', obtenerDetalles);
router.get('/pedido/:pedido_id', obtenerDetallesPorPedido);
router.post('/', crearDetalle);
router.put('/:id', actualizarDetalle);
router.delete('/:id', eliminarDetalle);

export default router;
