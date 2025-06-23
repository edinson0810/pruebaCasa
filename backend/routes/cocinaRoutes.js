import express from 'express';
import { obtenerPedidosPendientes, marcarPedidoListo } from '../controllers/cocinaController.js';

const router = express.Router();

router.get('/pendientes-cocina', obtenerPedidosPendientes);
router.put('/:pedido_id/estado', marcarPedidoListo);

export default router;
